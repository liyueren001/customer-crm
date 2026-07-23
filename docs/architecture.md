# Architecture — v1

## Status

Draft. Describes the intended architecture for v1 before any application code is written. Written against
the Next.js version actually installed in this repository (`next@16.2.11`); see the note on file conventions
below, since this version renamed a key file convention compared to older Next.js releases.

## Server Components versus Client Components

The App Router defaults every component to a **Server Component** unless it opts into being a **Client
Component** with a `"use client"` directive at the top of the file.

- **Server Components** run only on the server (during rendering, per request). They can read cookies,
  query Supabase directly, and never ship their code or dependencies to the browser bundle. Per
  `AGENTS.md`, this is the default for this project: business logic and data fetching belong here.
- **Client Components** run in the browser and are needed only where interactivity, browser-only APIs, or
  local state are required — for example, a customer form that needs `onChange` handlers, or a search input
  that filters as the user types.

Guideline for this project: pages and layouts start as Server Components. Only the specific interactive
piece (a form, a button with a loading state, a live search box) is extracted into its own small Client
Component. A page should not become a Client Component just because one of its children needs interactivity.

## Supabase Browser and Server Clients

Supabase's SSR helpers require two distinct client instances, and mixing them up is a common source of
security bugs:

- **Browser client**: created in Client Components with the public anon key. It is used only for
  browser-side concerns (e.g. reacting to auth state changes in the UI). It must never be given a
  privileged key.
- **Server client**: created per-request in Server Components, Server Actions, and Route Handlers. It reads
  the user's session from the incoming request's cookies (via Next.js's `cookies()` function) and uses the
  anon key plus the user's own access token — so Postgres RLS policies evaluate `auth.uid()` as that user,
  not as an admin.

Two rules follow directly from this and from `AGENTS.md`:

- The Supabase **service role key** (which bypasses RLS) must never be imported into any file that can end
  up in the browser bundle, and in v1 there is no server-side use case that requires it either — all access
  should go through the regular RLS-protected server client.
- `cookies()` is an asynchronous API in this Next.js version (`const cookieStore = await cookies()`); server
  client setup must account for that rather than assuming the synchronous behavior of older Next.js
  versions.

## Authentication Boundaries

Authentication and authorization are enforced at more than one layer, and no single layer is treated as
sufficient on its own:

1. **Route-level gating**: unauthenticated users must be redirected away from the dashboard and any
   customer routes. In this Next.js version, the file historically named `middleware.ts` has been renamed to
   `proxy.ts` (the `middleware` convention is deprecated as of v16). If route gating is implemented at this
   layer, it belongs in `proxy.ts`, not `middleware.ts`.
2. **Per-request server checks**: every Server Component, Server Action, and Route Handler that touches
   customer data independently verifies there is an authenticated session before doing any work. This is
   required, not optional, because Next.js's own documentation for this version explicitly warns that a
   proxy `matcher` misconfiguration — or a Server Function that moves to a different route — can silently
   remove proxy coverage without touching the code that talks to Supabase. Route-level gating is a
   convenience layer for UX (fast redirects), not the security boundary itself.
3. **Database-level enforcement**: Row Level Security on `customers` (see
   [docs/database.md](./database.md)) is the final, non-bypassable layer. Even if both of the above layers
   had a bug, RLS still prevents cross-user data access.

Session state itself is managed entirely by Supabase Auth via secure, httpOnly cookies; the application does
not implement its own session/token handling.

## Data Validation

All external input (form submissions, Server Action arguments, Route Handler request bodies) is validated on
the server before it is used in a query, regardless of whatever validation also exists in the browser for UX
purposes. Client-side validation is a usability feature; server-side validation is the actual guarantee.

For v1, validation needs are modest (a required `name`, optional `email`/`phone`/`notes` with reasonable
length limits) and can be implemented with plain TypeScript checks in the Server Action layer. Introducing a
schema validation library is not justified by v1's scope; it should be reconsidered if validation rules grow
more complex (see "Unresolved decisions" in
[docs/implementation-plan.md](./implementation-plan.md)).

## Suggested Route and Component Structure

```
app/
  layout.tsx                 # Root layout (existing)
  page.tsx                   # Public landing / redirect to sign-in or dashboard
  (auth)/
    sign-up/page.tsx
    sign-in/page.tsx
  dashboard/
    layout.tsx                # Enforces an authenticated session server-side
    page.tsx                  # Customer list + search entry point
    customers/
      new/page.tsx             # Create form
      [id]/page.tsx            # Edit / delete a single customer
components/
  customers/
    customer-form.tsx          # Client Component (interactive fields)
    customer-list.tsx           # Server Component (renders fetched rows)
    customer-search.tsx         # Client Component (search input)
lib/
  supabase/
    client.ts                 # Browser client factory
    server.ts                 # Server client factory
  customers/
    actions.ts                # Server Actions: create/update/delete
    queries.ts                 # Server-side read helpers
```

This is a starting structure, not a final one — files will be adjusted as milestones in
[docs/implementation-plan.md](./implementation-plan.md) are implemented.

## Why the Application Should Remain a Modular Monolith

v1's entire feature set is a single Next.js application talking to a single Supabase project. There is no
current requirement — from `AGENTS.md` or from
[docs/product-requirements.md](./product-requirements.md) — for independently deployable services, message
queues, or separate data stores:

- A modular monolith (one deployable app, internally organized by feature — auth, customers) keeps the
  system easy to reason about, easy to test end-to-end, and cheap to deploy on Vercel, which matches the
  fixed technology stack.
- Splitting into services now would add operational overhead (network calls, deployment coordination,
  duplicated auth handling) with no corresponding benefit at this scale — a handful of screens and one
  table.
- Keeping business logic in `lib/` modules organized by feature (rather than scattered across route files)
  preserves the *option* to extract a module later, without paying the cost of a distributed system today.

This should be revisited only if a concrete requirement emerges that a single deployable cannot satisfy
(e.g. a genuinely independent scaling or ownership boundary) — not preemptively.
