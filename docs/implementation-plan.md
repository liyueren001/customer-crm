# Implementation Plan — v1

## Status

Draft. Sequences the work described in [docs/product-requirements.md](./product-requirements.md),
[docs/database.md](./database.md), and [docs/architecture.md](./architecture.md) into small, reviewable
milestones. No milestone below has been implemented yet; this document only plans the work.

Each milestone is intended to be small enough to land as its own focused change, per `AGENTS.md`'s
instruction to keep commits small and avoid unrelated modifications.

Automated checks referenced below (`npm run lint`, `npm run build`, `tsc`) already exist in this repository;
no new tooling is proposed at this stage.

---

## Milestone 1 — Supabase Project and Environment Wiring

**Scope**: Create/connect the Supabase project, add the Supabase client dependency, and wire up environment
variables. No UI or business logic yet.

**Files likely to change**:
- `package.json` / `package-lock.json` (add `@supabase/supabase-js` and `@supabase/ssr`)
- `.env.local` (not committed) and a new `.env.example`
- `lib/supabase/client.ts`, `lib/supabase/server.ts`

**Security risks**:
- Accidentally exposing the service role key to the client bundle. Mitigation: only ever reference
  `NEXT_PUBLIC_*` variables in browser-loaded code; the service role key (if ever added later) must stay
  server-only and unused in v1.
- Committing real secrets in `.env.example` or `.env.local`. Mitigation: `.env.example` contains placeholder
  values only; `.env.local` stays gitignored (already covered by the existing `.gitignore`).

**Acceptance criteria**:
- The app can create both a browser Supabase client and a server Supabase client without runtime errors.
- No privileged key is referenced anywhere under a Client Component or `lib/supabase/client.ts`.

**Required automated checks**: `npm run lint`, `npm run build`.

**Required manual verification**:
- Confirm in the built output / browser devtools that only the anon key and project URL are present in any
  client-side bundle.

---

## Milestone 2 — Sign-Up, Sign-In, Sign-Out

**Scope**: Implement the authentication flows using Supabase Auth (email + password). No customer data yet.

**Files likely to change**:
- `app/(auth)/sign-up/page.tsx`, `app/(auth)/sign-in/page.tsx`
- `lib/auth/actions.ts` (Server Actions for sign-up/sign-in/sign-out)
- Small Client Components for the auth forms

**Security risks**:
- Leaking auth errors that reveal whether an email is registered (user enumeration). Mitigation: use generic
  error messaging where practical, consistent with Supabase Auth's default behavior.
- Handling the session insecurely (e.g. storing tokens in `localStorage`). Mitigation: rely on Supabase's
  SSR cookie-based session handling exclusively, per [docs/architecture.md](./architecture.md).

**Acceptance criteria**: FR1, FR2, FR3 from the product requirements are satisfied.

**Required automated checks**: `npm run lint`, `tsc --noEmit` (or the project's existing type-check path),
`npm run build`.

**Required manual verification**:
- Manually sign up, sign in, and sign out once each in a real browser.
- Confirm signing out clears the session (a protected page is no longer reachable without signing in again).

---

## Milestone 3 — Protected Dashboard Shell

**Scope**: Add a dashboard route that only renders for authenticated users, with no customer functionality
yet beyond a placeholder.

**Files likely to change**:
- `app/dashboard/layout.tsx` (server-side session check)
- Possibly `proxy.ts` at the project root, if route-level redirect gating is added (see
  [docs/architecture.md](./architecture.md) for why this file is named `proxy.ts`, not `middleware.ts`, in
  this Next.js version)

**Security risks**:
- Relying only on a `proxy.ts` matcher for protection. Mitigation: per
  [docs/architecture.md](./architecture.md), `app/dashboard/layout.tsx` must independently verify the
  session server-side regardless of any proxy-level gating.
- Redirect loops or open redirects if the sign-in redirect target is taken from unvalidated user input.
  Mitigation: redirect target is a fixed, known route, not derived from a query parameter.

**Acceptance criteria**: FR4, AC8 from the product requirements are satisfied.

**Required automated checks**: `npm run lint`, `npm run build`.

**Required manual verification**:
- While signed out, attempt to load the dashboard URL directly and confirm a redirect to sign-in.
- While signed in, confirm the dashboard renders.

---

## Milestone 4 — `customers` Table and Row Level Security

**Scope**: Add the database migration for the `customers` table and its RLS policies, exactly as specified
in [docs/database.md](./database.md). This is the first milestone that creates a migration; none exist yet.

**Files likely to change**:
- A new SQL migration file (location determined by the Supabase CLI/project conventions in use)

**Security risks**:
- Forgetting `with check` on the `UPDATE` policy, which would allow a user to reassign `owner_id` to another
  user's ID. Mitigation: policy is written and reviewed exactly as specified in
  [docs/database.md](./database.md).
- Enabling RLS but leaving a permissive default policy in place. Mitigation: verify only the four intended
  policies exist after migration.

**Acceptance criteria**:
- The `customers` table exists with the exact columns specified in [docs/database.md](./database.md).
- RLS is enabled, and exactly the four specified policies exist.

**Required automated checks**: Supabase migration apply/lint step (whatever the project's Supabase tooling
provides); no application code changes to lint/build in this milestone.

**Required manual verification**:
- Using two test accounts directly against the database (e.g. via the Supabase SQL editor with each user's
  JWT, or equivalent), confirm one user's queries cannot read or write another user's rows, following the
  procedure in [docs/database.md](./database.md).

---

## Milestone 5 — Customer Creation

**Scope**: A form on the dashboard to create a customer record, owned by the current session's user.

**Files likely to change**:
- `app/dashboard/customers/new/page.tsx`
- `components/customers/customer-form.tsx`
- `lib/customers/actions.ts` (`createCustomer` Server Action)

**Security risks**:
- Accepting an `owner_id` from the client form. Mitigation: the Server Action derives `owner_id` solely from
  the authenticated session, per [docs/database.md](./database.md); it is never a form field.
- Missing server-side validation on `name` (required) and lengths of optional fields. Mitigation: validate in
  the Server Action before insert, independent of any client-side form validation.

**Acceptance criteria**: FR5, AC3 from the product requirements are satisfied.

**Required automated checks**: `npm run lint`, `tsc --noEmit`, `npm run build`.

**Required manual verification**:
- Create a customer as user A; confirm it appears only for user A (cross-check with user B once Milestone 6
  is available, or via direct query against Milestone 4's RLS setup).

---

## Milestone 6 — Customer Listing

**Scope**: Display the signed-in user's customer records on the dashboard.

**Files likely to change**:
- `app/dashboard/page.tsx`
- `components/customers/customer-list.tsx`
- `lib/customers/queries.ts` (`listCustomers` scoped read)

**Security risks**:
- Querying `customers` without an explicit owner filter and relying on RLS alone to hide other users' rows.
  Mitigation: application code still filters by the session's user ID explicitly, so behavior is correct and
  auditable even before considering RLS as the backstop (defense in depth, per
  [docs/architecture.md](./architecture.md)).

**Acceptance criteria**: FR6 from the product requirements are satisfied.

**Required automated checks**: `npm run lint`, `npm run build`.

**Required manual verification**:
- With two accounts (A and B), confirm each sees only their own records, per the two-account test procedure
  in [docs/database.md](./database.md).

---

## Milestone 7 — Customer Editing

**Scope**: Allow a user to edit a customer record they own.

**Files likely to change**:
- `app/dashboard/customers/[id]/page.tsx`
- `components/customers/customer-form.tsx` (reused for edit)
- `lib/customers/actions.ts` (`updateCustomer` Server Action)

**Security risks**:
- Trusting a customer `id` from the client without confirming ownership server-side before or during the
  update. Mitigation: the update query is scoped by both `id` and the session's owner ID (and backed by the
  RLS `UPDATE` policy from Milestone 4), so a request for another user's `id` affects zero rows instead of
  succeeding.

**Acceptance criteria**: FR7, AC4 from the product requirements are satisfied.

**Required automated checks**: `npm run lint`, `tsc --noEmit`, `npm run build`.

**Required manual verification**:
- As user B, attempt to load/edit user A's customer `id` directly by URL and confirm it fails, per
  [docs/database.md](./database.md).

---

## Milestone 8 — Customer Deletion

**Scope**: Allow a user to delete a customer record they own.

**Files likely to change**:
- `components/customers/customer-list.tsx` or `app/dashboard/customers/[id]/page.tsx` (delete control)
- `lib/customers/actions.ts` (`deleteCustomer` Server Action)

**Security risks**:
- Same class of risk as Milestone 7: a delete request for another user's `id` must affect zero rows, not
  silently succeed or error in a way that leaks whether the record exists.

**Acceptance criteria**: FR8, AC5 from the product requirements are satisfied.

**Required automated checks**: `npm run lint`, `npm run build`.

**Required manual verification**:
- As user B, attempt to delete user A's customer `id` and confirm it fails and A's record still exists.

---

## Milestone 9 — Customer Name Search

**Scope**: Add a search input on the dashboard that filters the current user's customer list by (partial,
case-insensitive) name.

**Files likely to change**:
- `components/customers/customer-search.tsx` (Client Component)
- `lib/customers/queries.ts` (extend `listCustomers` with an optional name filter)

**Security risks**:
- Building the search query with unsanitized string concatenation. Mitigation: use parameterized queries /
  the Supabase query builder's filter methods rather than manual SQL string building, to avoid SQL
  injection.
- Search accidentally bypassing the owner scope (e.g. a query that filters by name but forgets the owner
  clause). Mitigation: the owner filter and the name filter are both required clauses on the same query, not
  applied in separate, skippable steps.

**Acceptance criteria**: FR9, AC6 from the product requirements are satisfied.

**Required automated checks**: `npm run lint`, `npm run build`.

**Required manual verification**:
- As user A, search for a name that only matches user B's data and confirm zero results.
- As user A, search for a partial match of A's own data and confirm the expected subset is returned.

---

## Milestone 10 — End-to-End Authorization Hardening Pass

**Scope**: No new features. A dedicated pass to re-verify user-level data isolation across every feature
built in Milestones 2–9, using the two-account procedure in [docs/database.md](./database.md), and to close
any gaps found.

**Files likely to change**: Unpredictable — whatever fixes emerge from testing (expected to be small, if any,
given each prior milestone already required its own manual verification).

**Security risks**: This milestone exists specifically to catch anything the per-milestone checks missed,
such as an interaction between features (e.g. search combined with edit) that wasn't exercised in isolation.

**Acceptance criteria**: AC7 from the product requirements is satisfied across the full feature set, not just
individual features.

**Required automated checks**: `npm run lint`, `tsc --noEmit`, `npm run build`.

**Required manual verification**:
- Full run-through of the two-account test procedure from [docs/database.md](./database.md) across sign-up,
  create, list, search, edit, and delete.

---

## Unresolved Decisions

See the corresponding list in this document's companion sections; the following are open questions not
settled by this documentation pass and should be resolved before or during the relevant milestone:

- Exact Supabase project provisioning approach (manual dashboard setup vs. Supabase CLI-managed
  migrations) — affects Milestone 1 and Milestone 4's file locations.
- Whether email/phone fields need format validation beyond "reasonable length" in v1, or whether that is
  deferred — affects Milestone 5.
- Whether a schema validation library is warranted, or plain TypeScript checks remain sufficient — see
  [docs/architecture.md](./architecture.md).
- Exact visual design / component library usage (shadcn/ui components to install) is not yet decided beyond
  "use shadcn/ui per the fixed stack" — affects Milestones 2, 3, 5, 6, 9.
