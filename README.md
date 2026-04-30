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

- Replace the custom session layer with a hardened auth provider if you want social login or enterprise SSO.
- Wire `media-upload` to real presigned S3 URLs.
- Add database-backed translations and notification jobs for email and in-app delivery.
- Add migration SQL for PostGIS enablement in the target PostgreSQL environment if needed.
