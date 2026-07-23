<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Project Instructions

## Project Overview

This project is a small customer relationship management application for individual professionals and small businesses.

The first version allows authenticated users to create, view, update, search, and delete their own customer records.

## Fixed Technology Stack

Use the following stack unless explicitly approved otherwise:

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Supabase Authentication
* Supabase PostgreSQL
* Supabase Storage when file storage is required
* Vercel for deployment
* npm for package management

Do not introduce alternative frameworks, databases, authentication systems, ORMs, UI libraries, or package managers without explicit approval.

## Language Policy

All repository content must be written in English.

This includes:

* Source code
* Variable and function names
* Type and interface names
* File and directory names
* Code comments
* JSDoc comments
* User interface text
* Validation and error messages
* Log messages
* Test descriptions
* Documentation
* Git branch names
* Git commit messages
* Pull request titles and descriptions

The user may communicate with the coding agent in Chinese, but all files created or modified in the repository must remain in English.

Never add Chinese text to source files, tests, configuration files, database migrations, or documentation.

## Comment Policy

Do not comment obvious code.

Use comments only to explain:

* A non-obvious technical decision
* A security requirement
* A business rule
* A temporary workaround
* An important limitation

Comments should explain why something is necessary rather than repeat what the code does.

## Architecture Rules

* Use the Next.js App Router.
* Prefer Server Components unless client-side interactivity is required.
* Add `"use client"` only when necessary.
* Keep business logic out of presentation components.
* Keep components small and focused.
* Reuse existing components and utilities.
* Validate all external input.
* Keep secrets and server-only environment variables out of client code.
* Never expose privileged Supabase keys to the browser.
* Never trust a user ID received from the client.
* Enforce record ownership in the database and server-side logic.
* Every customer record must belong to an authenticated user.
* Never disable authentication or authorization to fix an error.

## Database Rules

* Use descriptive snake_case table and column names.
* Use UUID primary keys.
* Include `created_at` and `updated_at` timestamps where appropriate.
* Enable Row Level Security on every user-owned table.
* Test authorization with at least two separate user accounts.
* Never create destructive migrations without explicit approval.
* Never delete production data while debugging.

## Dependency Rules

* Do not install a dependency unless the existing stack cannot reasonably solve the problem.
* Explain why a dependency is required before installing it.
* Do not replace existing dependencies without approval.
* Use npm and commit `package-lock.json`.

## Development Workflow

Before modifying files:

1. Read the relevant existing files.
2. Restate the requested outcome.
3. Propose a short implementation plan.
4. Identify security, data, and compatibility risks.
5. Keep the proposed change focused.

During implementation:

1. Make small and reviewable changes.
2. Do not modify unrelated files.
3. Follow the existing project structure.
4. Do not perform broad refactoring unless explicitly requested.
5. Do not hide errors using unsafe type assertions or disabled checks.

After implementation:

1. Run relevant tests.
2. Run the linter.
3. Run TypeScript checks.
4. Run the production build when practical.
5. Review the final diff.
6. Report all changed files.
7. Report all commands executed.
8. Report required manual verification.
9. Report known risks or incomplete work.

## Common Commands

* Development server: `npm run dev`
* Linting: `npm run lint`
* Production build: `npm run build`

Never claim that a command passed unless it was actually executed successfully.

## Git Rules

* Never commit secrets or `.env.local`.
* Keep commits small and focused.
* Use English Conventional Commit messages.
* Do not rewrite Git history.
* Do not force-push.
* Do not commit automatically unless explicitly requested.

Examples:

* `feat: add customer creation form`
* `fix: enforce customer ownership`
* `docs: add local setup instructions`
* `test: cover customer access policies`
* `chore: configure project tooling`

## Definition of Done

A task is complete only when:

* The requested behavior is implemented.
* The fixed technology stack is followed.
* Authentication and ownership rules are enforced.
* External input is validated where required.
* Relevant checks pass.
* User-facing behavior is manually verified or clearly marked as requiring verification.
* Documentation is updated when setup or behavior changes.
