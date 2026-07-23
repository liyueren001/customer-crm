# Database Design — v1

## Status

Draft. Describes the schema and access-control model for v1. No migration files are created by this
document; migrations will be added in a later, separate step (see
[docs/implementation-plan.md](./implementation-plan.md)).

## Scope

v1 introduces a single application table, `customers`, plus reliance on Supabase's built-in `auth.users`
table for identity. No other tables are needed for the features listed in
[docs/product-requirements.md](./product-requirements.md).

## `customers` Table

| Column       | Type          | Constraints                                              |
| ------------ | ------------- | --------------------------------------------------------- |
| `id`         | `uuid`        | Primary key, default `gen_random_uuid()`                  |
| `owner_id`   | `uuid`        | Not null, references `auth.users(id)`, indexed            |
| `name`       | `text`        | Not null                                                   |
| `email`      | `text`        | Nullable                                                   |
| `phone`      | `text`        | Nullable                                                   |
| `notes`      | `text`        | Nullable                                                   |
| `created_at` | `timestamptz` | Not null, default `now()`                                  |
| `updated_at` | `timestamptz` | Not null, default `now()`, updated on every row update      |

Naming follows the project's snake_case convention. `owner_id` is used rather than a generic `user_id` to
make the ownership relationship explicit at the schema level.

Notes on future migration authoring (not part of this document):

- `updated_at` will need a trigger (or equivalent) to refresh automatically on `UPDATE`, since Postgres does
  not do this by default.
- An index on `owner_id` is required for RLS policies and per-user listing to remain performant as the table
  grows.
- A case-insensitive index (e.g. on `lower(name)`) may be worth considering once name search performance is
  measured, but is not required for v1.

## How Customer Ownership Is Enforced

Ownership is enforced at two layers, and both are required — neither is sufficient alone:

1. **Application layer**: every read/write to `customers` goes through server-side code that has access to
   the authenticated Supabase session. The server derives the current user's ID from that session and uses
   it to scope queries (e.g. `select * from customers where owner_id = <session user id>`).
2. **Database layer (Row Level Security)**: the `customers` table has RLS enabled, and each policy checks
   `owner_id = auth.uid()`. Even if application code has a bug and forgets to filter by owner, the database
   itself refuses to return or modify rows that do not belong to the requesting user.

`owner_id` is set exactly once, at insert time, from the authenticated session — never from a value the
client supplies for that field. See below for why.

## Required Row Level Security Policies

RLS must be enabled on `customers`:

```sql
alter table customers enable row level security;
```

The following four policies are required, one per operation, all scoped by `auth.uid()`:

| Policy                | Operation | Condition                                    |
| ---------------------- | --------- | --------------------------------------------- |
| `customers_select_own` | `SELECT`  | `owner_id = auth.uid()`                       |
| `customers_insert_own` | `INSERT`  | `with check (owner_id = auth.uid())`          |
| `customers_update_own` | `UPDATE`  | `using (owner_id = auth.uid())` and `with check (owner_id = auth.uid())` |
| `customers_delete_own` | `DELETE`  | `owner_id = auth.uid()`                       |

Notes:

- The `UPDATE` policy needs both `using` (which rows can be targeted) and `with check` (what the row must
  look like after the update), so a user cannot reassign `owner_id` to someone else's ID to "give away" or
  "steal" a row.
- No policy allows cross-user access under any condition in v1. There is no admin/staff bypass role.
- These policies are the actual source of truth for authorization; the exact SQL will be written in a
  migration file in a later milestone, not in this document.

## Why the Browser Must Not Be Trusted to Provide the Owner User ID

The browser is a fully untrusted environment: any value sent from client-side code — form fields, hidden
inputs, JavaScript variables, request bodies — can be edited by the user before it reaches the server (via
browser dev tools, a proxy, or a direct API call that never goes through the UI at all). If the server ever
accepted a client-supplied `owner_id` (or equivalent "current user" field) and used it to decide which rows
to read or write, any signed-in user could impersonate any other user simply by changing that value.

Instead, the owner must always be derived from the authenticated session, which is established via a signed,
server-verified token that the client cannot forge:

- On the server (Server Components, Server Actions, Route Handlers), the Supabase server client reads the
  session from secure, httpOnly cookies and verifies it against Supabase Auth.
- The resulting user ID (`auth.uid()` in Postgres, or `session.user.id` in application code) is the only
  value ever used to populate or filter `owner_id`.
- Even if a request is crafted to include a different `owner_id`, RLS still evaluates `auth.uid()` from the
  verified session, so the database rejects or silently excludes rows that don't belong to the authenticated
  user.

This is why RLS is not optional: it is the layer that holds even if application code has a bug that trusts
client input somewhere it shouldn't.

## How Authorization Should Be Tested Using Two User Accounts

Because a single-account test cannot reveal a cross-user data leak (there is no other user's data to leak
into), authorization testing for this project requires at least two separate, real accounts:

1. Create account A and account B via normal sign-up.
2. Sign in as A and create at least one customer record.
3. Sign in as B (a separate session — a second browser profile or an incognito window works well) and
   confirm:
   - B's customer list does not include any record created by A.
   - Searching by A's customer's name from B's account returns no results.
4. While signed in as B, attempt to access A's record directly, bypassing the UI:
   - If a record can be reached by ID (e.g. a detail/edit URL containing the customer's `id`), try
     navigating to A's record ID while signed in as B, and confirm it is not returned.
   - Attempt an edit or delete request for A's record ID from B's session and confirm it fails or affects
     zero rows.
5. Repeat step 4 for every mutating operation (edit, delete) and the read path (list, search), since each is
   a distinct code path that could independently forget to scope by owner.
6. Confirm the above by inspecting actual data, not just UI state — e.g. checking row counts in Supabase, not
   only trusting what the frontend renders — since a UI bug could hide data that a direct query would still
   reveal.

This procedure should be repeated whenever a new query or mutation touching `customers` is added, per
[docs/product-requirements.md](./product-requirements.md) AC7.
