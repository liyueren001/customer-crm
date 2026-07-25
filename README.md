# Customer CRM

Customer CRM is a small customer relationship management application for individual professionals and small businesses. Authenticated users can create, view, edit, search, and delete their own customer records, with each user's data isolated from every other user's at the database level.

The application is built on the Next.js App Router with Supabase for authentication and PostgreSQL storage. Customer data access runs on the server, and record ownership is enforced by PostgreSQL Row Level Security.

## Live Demo

[https://customer-crm-ten.vercel.app](https://customer-crm-ten.vercel.app)

## Features

- Email and password sign-up and sign-in
- Email confirmation flow for new accounts
- Sign-out
- Protected dashboard routes that require an authenticated session
- Customer creation
- Customer listing
- Customer editing
- Customer deletion with a confirmation step
- Case-insensitive customer name search
- Server-side pagination
- Per-user data isolation with PostgreSQL Row Level Security
- Server-side input validation with generic, non-revealing error handling
- Responsive interface

## Technology Stack

| Area | Technology | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16.2.11 |
| UI library | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Components | shadcn/ui (Base UI–based, `@base-ui/react`) | ^1.6.0 |
| Icons | lucide-react | ^1.25.0 |
| Authentication | Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`) | ^0.12.3 / ^2.110.8 |
| Database | Supabase PostgreSQL | — |
| Linting | ESLint (`eslint-config-next`) | ^9 |
| Deployment | Vercel | — |
| Version control | Git | — |

Versions are taken from `package.json`. A caret (`^`) reflects the range declared there.

## Architecture and Security

- **Server-side data access.** All customer reads and writes go through server-only code (Server Components, Server Actions, and route handlers in `lib/customers`). Customer data is never queried directly from the browser.
- **Session handling.** Authenticated sessions are managed with the existing Supabase SSR setup (`@supabase/ssr`), which stores the session in secure, httpOnly cookies. The application does not implement its own token or session storage.
- **Ownership enforced in the database.** The `customers` table has Row Level Security enabled, and each policy restricts access to rows where `owner_id` matches the authenticated user. Even if application code had a bug, the database itself refuses cross-user reads and writes.
- **Owner assigned by the database.** The `owner_id` column defaults to `auth.uid()`, so ownership is derived from the verified session rather than from any value supplied by the client. The insert policy's `with check` rejects any attempt to write a different owner.
- **No privileged credentials in the app.** The application uses only the public Supabase project URL and publishable key. The service-role key (which bypasses Row Level Security) is not used anywhere in the application and is never exposed to the browser.
- **Server-side validation.** All external input is validated on the server before it reaches a query. Error messages are intentionally generic so responses do not reveal whether a record exists or belongs to another user.

This project applies defense-in-depth practices, but it is a demonstration application and is not claimed to be completely secure or production-certified. Review and additional hardening are recommended before any real-world use.

## Local Development Setup

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project (see [Database Setup](#database-setup))

### 1. Clone the repository

```bash
git clone https://github.com/liyueren001/customer-crm.git
cd customer-crm
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the local environment file

Copy the example file and fill in your own Supabase values (see [Environment Variables](#environment-variables)).

On Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

On macOS, Linux, or Git Bash:

```bash
cp .env.example .env.local
```

`.env.local` is gitignored and must never be committed.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The application reads the following variables. Use your own Supabase project values in place of the placeholders below.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | The Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The Supabase publishable key. This is a public key that is safe for browser use. |

Example `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Never place the Supabase secret or service-role key in these variables or anywhere in client-loaded code.

## Database Setup

The database schema and its Row Level Security policies are defined as SQL migrations in `supabase/migrations`. The migration creates the `customers` table, its indexes, an `updated_at` trigger, and one Row Level Security policy per operation (select, insert, update, delete), all scoped by `auth.uid()`.

To apply the migrations to a hosted Supabase project using the Supabase CLI (invoked through `npx`, so no global install is required):

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

- `npx supabase login` opens the Supabase authentication flow so the CLI can act on your account.
- `npx supabase link --project-ref <your-project-ref>` connects this repository to your hosted project. Replace `<your-project-ref>` with your own project reference.
- `npx supabase db push` applies the migrations in `supabase/migrations` to the linked project.

Do not commit access tokens, database passwords, project references, or any other credentials.

> Note: A local Supabase stack (`npx supabase start`) is not required to apply migrations to a hosted project and is intentionally omitted here, since it depends on Docker.

## Available npm Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `next dev` | Start the development server. |
| `build` | `next build` | Create a production build. |
| `start` | `next start` | Serve the production build. |
| `lint` | `eslint` | Run ESLint. |

## Project Structure

```
app/
  (auth)/                 # Sign-in and sign-up routes
  auth/confirm/           # Email confirmation route handler
  dashboard/              # Protected dashboard (session required)
    customers/            # Customer list, create, and edit routes
  layout.tsx              # Root layout
  page.tsx                # Public landing page
components/
  auth/                   # Sign-in, sign-up, and sign-out UI
  customers/              # Customer table, form, pagination, delete control
  layout/                 # Header and navigation
  ui/                     # shadcn/ui components
lib/
  auth/                   # Session helpers and auth Server Actions
  customers/              # Server Actions, queries, and validation
  supabase/               # Browser client, server client, and proxy session refresh
supabase/
  migrations/             # SQL schema and Row Level Security policies
  config.toml             # Supabase CLI configuration
docs/                     # Architecture, database, and planning notes
proxy.ts                  # Route-level session refresh (this Next.js version replaces middleware.ts)
```

## Deployment

The application is designed to deploy on Vercel.

1. Import the GitHub repository into Vercel.
2. Set the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the Vercel project settings.
3. Deploy. Vercel builds the project with `next build` and serves it automatically.

For authentication and the email confirmation flow to work in production, the hosted Supabase project must be configured appropriately:

- Add the production domain to the Supabase Authentication URL Configuration (site URL and allowed redirect URLs) so confirmation links resolve to the deployed application.
- Enable email confirmation and configure an SMTP provider in the hosted Supabase project so confirmation emails are delivered. Email confirmation behavior is not guaranteed by default and depends on the project's own configuration.

## Future Improvements

The following are planned ideas, not existing features:

- Automated test coverage (unit, integration, and end-to-end).
- A dedicated customer detail view and additional customer fields.
- Customer data export (for example, CSV).
- File attachments or customer avatars using Supabase Storage.
- Sorting and filtering beyond name search.
- Password reset and account management flows.
