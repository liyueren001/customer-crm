# Product Requirements — v1

## Status

Draft. Defines the scope of the first shippable version of the Customer CRM. This document intentionally
covers a small slice of functionality; later versions will extend it.

## Target Users

- Individual professionals and small business owners who need a simple place to track their own customers.
- Each user manages only their own data. There is no team, organization, or shared-workspace concept in v1.
- Users are expected to have basic web literacy; no specialized training is assumed.

## Main User Workflow

1. A new user signs up with an email and password.
2. The user signs in and is redirected to a protected dashboard.
3. From the dashboard, the user creates a customer record (name, email, phone, notes).
4. The user views their list of customers and searches it by name.
5. The user opens a customer record to edit or delete it.
6. The user signs out when finished.

## Included Features (v1)

- User sign-up (email + password, via Supabase Auth).
- User sign-in and sign-out.
- A protected dashboard, accessible only to authenticated users.
- Customer creation (name, email, phone number, notes).
- Customer listing, scoped to the signed-in user.
- Customer editing.
- Customer deletion.
- Customer search by name (case-insensitive, partial match).
- User-level data isolation: a user can only ever see or modify their own customer records.

## Explicitly Excluded Features (v1)

- Team accounts, shared customers, or any multi-user collaboration on the same record.
- Roles and permissions beyond "owner".
- Customer import/export (CSV, etc.).
- File or document attachments on a customer record (no Supabase Storage usage yet).
- Activity history, notes threads, or audit trail per customer.
- Email notifications or reminders.
- Password reset / email verification flows beyond what Supabase Auth provides out of the box.
- Social login (OAuth providers).
- Search beyond exact/partial name matching (no fuzzy search, no filters, no search by email/phone).
- Pagination, sorting, or bulk actions on the customer list.
- Mobile app; this is a responsive web application only.

## Functional Requirements

- FR1: A visitor can create an account with an email and password.
- FR2: A registered user can sign in with their email and password.
- FR3: A signed-in user can sign out, ending their session.
- FR4: An unauthenticated visitor cannot access the dashboard or any customer data; they are redirected to sign-in.
- FR5: A signed-in user can create a customer record with a name (required), email (optional), phone number
  (optional), and notes (optional).
- FR6: A signed-in user can view a list of only the customer records they own.
- FR7: A signed-in user can edit any field of a customer record they own.
- FR8: A signed-in user can delete a customer record they own.
- FR9: A signed-in user can search their own customer list by (partial) name.
- FR10: A signed-in user cannot view, edit, or delete a customer record owned by another user, regardless of
  how the request is made (UI, direct API call, or manipulated client input).

## Non-Functional Requirements

- NFR1: All customer data access must be enforced server-side; the UI is not a security boundary.
- NFR2: Row Level Security must be enabled on the `customers` table so authorization is enforced by the
  database itself, not only by application code.
- NFR3: The application must not expose privileged Supabase keys (e.g. the service role key) to the browser.
- NFR4: All user-supplied input must be validated on the server before being persisted.
- NFR5: The application must remain usable on both desktop and mobile screen widths.
- NFR6: All repository content (code, comments, UI text, docs) must be written in English.
- NFR7: The application must be deployable to Vercel with no manual server management.

## Acceptance Criteria

- AC1: A new user can complete sign-up, sign-in, and land on the dashboard without developer intervention.
- AC2: Signing out invalidates the session; reloading a protected page afterward redirects to sign-in.
- AC3: A signed-in user who creates a customer record immediately sees it in their customer list.
- AC4: A signed-in user can edit a customer record and see the updated values persist after a page reload.
- AC5: A signed-in user can delete a customer record and it no longer appears in their list.
- AC6: Searching by a partial, case-insensitive name match returns only matching records owned by the
  current user.
- AC7: With two separate user accounts (A and B), user A cannot see, edit, or delete any customer record
  created by user B, whether attempting this through the UI or by directly calling the underlying data
  access layer with a manipulated request. See [docs/database.md](./database.md) for the required test
  procedure.
- AC8: Attempting to access the dashboard or any customer route while signed out redirects to the sign-in
  page instead of rendering data.
