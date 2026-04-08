# SamenRoute

SamenRoute is a mobile-first shared place-planning web app for people on the go. It helps small groups save places, organize them into lists, plan today’s route, hand navigation off to Google Maps, and keep visit history per list item.

## Product overview

- Save places into lists that belong to the app’s own database.
- Plan a practical route for today from selected list items.
- Track visited and skipped state per `list_place`, not globally per place.
- Keep route plans as snapshots so list ordering stays independent.
- Share lists with `OWNER`, `EDITOR`, and `VIEWER` roles.

## Architecture overview

The app uses a layered structure:

- `src/app`: App Router pages and route handlers.
- `src/components`: mobile-first UI components and navigation.
- `src/lib`: infrastructure concerns such as Prisma, env parsing, auth, request helpers, and validations.
- `src/server/domain`: shared domain enums, types, and authorization policies.
- `src/server/repositories`: all database access boundaries.
- `src/server/services`: use cases, business logic, and Google Maps adapters.
- `prisma`: schema, SQL migration, and seed script.
- `tests/unit`: critical domain and authorization tests.
- `tests/e2e`: core mobile user flows with Playwright.

Business logic is intentionally kept out of React components. UI calls server actions or route handlers, those delegate to services, and services use repositories.

## Route generation strategy

SamenRoute does not fake route optimization. MVP uses an explicit and maintainable ordering strategy:

- Start from the user-selected candidate set.
- Respect the candidate subset the user chose for today.
- Sort primarily by higher `priority`.
- Break ties by `sortOrder`.
- If a start coordinate is present and candidates have coordinates, use a lightweight nearest-first tie-break from the start point.
- Persist the resulting stop order as `route_plan_stops`.

This is practical for MVP, easy to reason about, and clearly replaceable later with a more advanced provider or optimization engine.

## Google Maps adapter boundary

Google Maps is only used for:

- directions URL handoff
- optional place lookup
- optional browser-side map rendering later

The domain does not depend on Google-specific types. Provider-specific logic lives in:

- `src/server/services/google/maps-url.builder.ts`
- `src/server/services/google/maps-adapter.ts`
- `src/server/services/google/place-lookup.adapter.ts`

If a provider changes later, the database and service contracts can stay largely intact.

## Authorization model

- Only signed-in users can access app routes.
- Read access is allowed for owners and shared members.
- Only `OWNER` and `EDITOR` can mutate list content.
- Only `OWNER` can manage members.
- Every mutation path enforces authorization server-side in services and route handlers.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env template:

```bash
cp .env.example .env
```

3. Start PostgreSQL and update `DATABASE_URL`.

4. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:deploy
```

5. Seed demo data:

```bash
npm run prisma:seed
```

6. Start the app:

```bash
npm run dev
```

## Environment variables

Required core variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `APP_BASE_URL`
- `EMAIL_FROM`

Optional auth/provider variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `GITHUB_ID`
- `GITHUB_SECRET`
- `GOOGLE_MAPS_BROWSER_KEY`
- `GOOGLE_MAPS_PLACE_API_KEY`
- `GOOGLE_MAPS_PLACE_API_URL`

If SMTP values are omitted in development, the app stores magic links under `.tmp/emails/` so local Playwright flows can complete real email sign-in without a third-party inbox. Do not use that fallback in production.

## Database and migrations

Commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
```

The initial SQL migration is included in `prisma/migrations/20260403140000_init/migration.sql`.

## Tests

Unit tests:

```bash
npm run test:unit
```

E2E tests:

```bash
npm run test:e2e
```

Full test run:

```bash
npm test
```

Playwright targets a mobile viewport by default.

## Seed data

The seed script creates:

- 2 demo users
- 2 shared lists
- 10+ demo places
- an active route plan example
- visited history entries

Demo users:

- `anna@samenroute.demo`
- `bas@samenroute.demo`

## Security notes

- Secrets are loaded from environment variables only.
- Authorization never trusts the client.
- Sensitive endpoints have a basic server-side rate-limit hook.
- API errors return safe messages.
- Browser Google Maps keys should be restricted by hostname, API scope, and quota.

## Known boundaries

- Map rendering is intentionally not the primary interaction model in MVP.
- Route optimization is deliberately lightweight and documented, not simulated.
- Local development email capture exists only to support real magic-link testing without SMTP.
