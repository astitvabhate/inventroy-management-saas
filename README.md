# Inventory Flow

Inventory Flow is a Next.js 16 inventory SaaS built for production-friendly stock operations. The app now uses:

- `Auth.js` for session-based authentication
- `MongoDB` for application data and auth persistence
- `Cloudinary` for item image uploads
- `zod` for env and mutation validation

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the MongoDB, Auth.js, and Cloudinary values.
3. Optionally add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for password reset emails.
4. Install dependencies with `npm install`.
5. Start the app with `npm run dev`.

## Scripts

- `npm run dev` starts the local app
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without emitting files
- `npm run build` creates a production build

## Product Areas

- Landing page and auth workspace flow
- Dashboard with stock, allocation, and revenue signals
- Inventory catalog and item detail workspace
- Customer directory
- Allocation tracking
- Sales overview

## Notes

- Password reset emails will log reset links to the server console if Resend is not configured.
- Item stock integrity is enforced in server-side MongoDB actions instead of Postgres triggers.
- The legacy Supabase client, middleware, and typed schema have been removed from the app codebase.
