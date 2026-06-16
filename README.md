# Drive Trip Logger

A small web app for ROVE customers to log driving trips and mark the memorable ones.

## How to run

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000). The API is at [http://localhost:4000](http://localhost:4000).

No `.env` file is required for Docker — defaults are wired in `docker-compose.yml`. To run services locally without Docker, copy `.env.example` to `.env` and start MySQL separately.

To stop: `docker compose down` (add `-v` to reset the database).

## Tech stack

**Frontend:** Next.js 15 (App Router) with React 19 — required by the brief, with server/client separation and a polished component structure.

**Backend:** Express + TypeScript — a focused REST API with Zod validation, kept separate from the frontend so the three-service Docker layout is clear.

**Database:** MySQL — relational data fits trips well, Prisma gives type-safe queries and easy schema management, and MySQL runs reliably in Docker without extra tooling.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List trips (newest first). `?memorable=true` filters. Returns summary stats. |
| POST | `/api/trips` | Create a trip |
| PATCH | `/api/trips/:id` | Update a trip (including memorable toggle) |
| DELETE | `/api/trips/:id` | Delete a trip |

Distance is stored in **kilometers**.

## What I would do next

- **Optimistic UI updates** for star toggle and delete so interactions feel instant without a full refetch.
- **Pagination or virtual scroll** once trip lists grow beyond a few dozen entries.
- **Input polish:** autocomplete for locations, duration auto-calculated from start/end times, and inline edit on the list row.
- **Seed script** with sample trips so reviewers see populated state immediately.

## Known limitations

- No automated tests — I prioritized UX polish and a working Docker setup within the time box.
- Summary stats always reflect **all** trips (not the active filter), which matches how a dashboard typically behaves but is worth confirming with product.
- `datetime-local` inputs use the browser's local timezone; ISO strings are stored in UTC on the server.
- The API runs `prisma db push` on startup for zero-config local setup — fine for a demo, but production would use versioned migrations.

## Project structure

```
rove-drive-logger-web/
├── docker-compose.yml
├── api/
│   └── src/
│       ├── index.ts              # App entrypoint
│       ├── config/               # Environment config
│       ├── controllers/          # HTTP request handlers
│       ├── services/             # Business logic + data access
│       ├── routes/               # Route definitions
│       ├── validators/           # Zod schemas
│       ├── utils/                # Helpers (serialize, db bootstrap)
│       ├── types/                # Shared TypeScript types
│       └── lib/                  # Prisma client
└── web/
    ├── app/                      # Next.js App Router pages
    ├── components/trips/         # Trip UI components
    ├── contexts/                 # React context providers
    ├── hooks/                    # Custom hooks
    ├── services/                 # API client layer
    ├── types/                    # Shared TypeScript types
    ├── utils/                    # Formatting, form helpers, fetch
    └── constants/                # App constants
```
