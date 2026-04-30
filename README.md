# Darak

Darak is a full-stack real estate platform for the Algerian market, built as a rentals-first MVP with verified listings, admin moderation, safe messaging, viewing appointments, saved searches, and role-aware dashboards.

## Stack

- Next.js 14 App Router with TypeScript
- Tailwind CSS with shadcn-style UI primitives
- PostgreSQL + Prisma ORM
- PostGIS-ready schema via `Unsupported("geography(Point, 4326)")`
- Custom cookie session auth with role-based middleware
- OpenStreetMap + Leaflet map layer
- S3-compatible upload abstraction

## Product Direction

- Arabic-first with RTL support
- French second, English optional
- Algeria-specific city and DZD pricing focus
- Rentals first, then sales and property management expansion

## Demo Accounts

- Admin: `admin@darak.dz` / `Admin12345`
- Owner: `owner@darak.dz` / `Owner12345`
- Agent: `agent@darak.dz` / `Agent12345`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Seed demo data:

```bash
npm run prisma:seed
```

5. Start the app:

```bash
npm run dev
```

6. Open `http://localhost:3000`

## Key Routes

- `/ar` landing page
- `/ar/search` listings search with list/map tabs
- `/ar/listing/[slug]` listing details
- `/ar/dashboard` owner or agent workspace
- `/ar/dashboard/listings/new` add listing wizard
- `/ar/admin` admin operations

## API Surface

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/users`
- `GET /api/profiles`
- `GET /api/verification-profiles`
- `GET|POST /api/properties`
- `GET|POST /api/listings`
- `POST /api/media-upload`
- `GET|POST /api/saved-listings`
- `GET|POST /api/saved-searches`
- `GET|POST /api/appointments`
- `GET|POST /api/leads`
- `GET|POST /api/messages/conversations`
- `POST /api/messages`
- `GET|POST /api/reports`
- `GET|POST /api/admin/moderation`
- `GET /api/analytics`

## Folder Notes

- `app/[locale]` locale-aware pages for Arabic, French, and English
- `app/api` route handlers
- `components` UI, cards, layouts, forms, maps
- `lib` helpers, demo content, auth, Prisma, i18n
- `prisma` schema and seed script

## Production Notes

## Deployment

This project is a full-stack Next.js app. The frontend pages and backend API routes deploy together in one service. PostgreSQL must be hosted separately.

### Required environment variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_SECRET="long-random-secret"
APP_URL="https://your-domain.com"
RESEND_API_KEY="optional-for-real-email-verification"
EMAIL_FROM="Darak <noreply@your-domain.com>"
```

If `RESEND_API_KEY` is missing, verification links are written to `.temp/email-outbox.log`, which is only useful locally.

### Vercel

1. Create a hosted PostgreSQL database.
2. Add the environment variables above in Vercel.
3. Deploy the repository. Vercel uses `npm run vercel-build`.
4. After the first deploy, run this once from your machine against the production database:

```bash
npx prisma db push
```

### Render or Docker hosting

The repo includes `Dockerfile` and `render.yaml`. The Docker startup command runs:

```bash
npx prisma db push && npm run start
```

So the production database schema is pushed when the container starts.

### Production notes

- Use a long unique `AUTH_SECRET`; never keep `change-this-secret` in production.
- Use hosted PostgreSQL, not `localhost`.
- Configure `APP_URL` to the final live domain so email verification links work.
- Configure `RESEND_API_KEY` and `EMAIL_FROM` for real email verification.
- Wire `media-upload` to real S3-compatible storage before storing large user uploads.
