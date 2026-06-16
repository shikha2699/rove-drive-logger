# Drive Trip Logger — Low-Level PRD

**Product:** Drive Trip Logger  
**Audience:** ROVE customers logging personal driving trips  
**Version:** 1.0 (as built)  
**Last updated:** June 2026

---

## 1. Product overview

### 1.1 Problem

Drivers need a simple way to record where they went, when, how far, and which trips were worth remembering — without spreadsheets or notes apps.

### 1.2 Solution

A single-page web app backed by a REST API and relational database. Users can:

- Create, edit, and delete trips
- Mark trips as memorable (star)
- Filter the list to memorable trips only
- See aggregate stats (total trips, total distance, memorable count)

### 1.3 Success criteria

| Criterion | Target |
|-----------|--------|
| Time to first trip logged | < 60 seconds after `docker compose up` |
| Core CRUD | All operations work without page reload |
| Data persistence | Trips survive container restart (MySQL volume) |
| Mobile usability | Form and list usable on phone-width screens |

### 1.4 Out of scope (v1)

- User authentication / multi-tenant accounts
- Location autocomplete or maps
- Export (CSV, PDF)
- Automated tests
- Production deployment (K8s, CI/CD)

---

## 2. System architecture

### 2.1 Three-service layout

```
┌─────────────┐     HTTP (browser)      ┌─────────────┐
│   Browser   │ ──────────────────────► │  web :3000  │
│             │                         │  Next.js    │
└─────────────┘                         └──────┬──────┘
                                               │ fetch /api/trips
                                               ▼
                                        ┌─────────────┐
                                        │  api :4000  │
                                        │  Express    │
                                        └──────┬──────┘
                                               │ Prisma
                                               ▼
                                        ┌─────────────┐
                                        │  db :3306   │
                                        │  MySQL 8.4  │
                                        └─────────────┘
```

**Why three services instead of a monolith?**

- Clear separation of concerns: UI, business logic, and data each own one layer
- Docker Compose demonstrates a realistic local dev topology
- API can be reused later (mobile app, integrations) without touching the frontend
- Next.js and Express scale and deploy independently

### 2.2 Request flow (example: create trip)

1. User fills modal form → clicks **Add trip**
2. `DriveTripLogger` validates client-side → calls `createTrip(formData)`
3. `web/lib/api.ts` POSTs JSON to `http://localhost:4000/api/trips`
4. Express `tripsRouter` validates with Zod → Prisma `trip.create()`
5. MySQL inserts row → API returns serialized trip (201)
6. Frontend closes modal → refetches trip list + summary

---

## 3. Tech stack — what to use and why

### 3.1 Frontend: Next.js 15 + React 19

| Choice | Why |
|--------|-----|
| **Next.js 15 (App Router)** | Required by brief; file-based routing, production build with standalone output for Docker |
| **React 19** | Ships with Next 15; component model fits modal-heavy CRUD UI |
| **TypeScript** | Shared mental model with API; catches shape mismatches at compile time |
| **Plain CSS (globals.css)** | No extra UI framework; full control over dark theme, modal animations, form styling |
| **No state library** | `useState` + `useEffect` sufficient for single-page CRUD; avoids Redux/Zustand overhead |

**Why not Vue, Svelte, or CRA?** Brief specifies Next.js. CRA is deprecated; Vue/Svelte would diverge from requirements.

### 3.2 Backend: Express 5 + TypeScript

| Choice | Why |
|--------|-----|
| **Express** | Minimal, well-known REST surface; no GraphQL/tRPC complexity for 4 endpoints |
| **TypeScript** | Type-safe route handlers; aligns with Prisma-generated types |
| **Zod** | Runtime validation at API boundary; `.refine()` for cross-field rules (end ≥ start) |
| **CORS enabled** | Browser on `:3000` calls API on `:4000` — different origins require CORS |

**Why not NestJS or Fastify?** Nest adds boilerplate for a 4-route API. Fastify is faster but Express is sufficient and more familiar for small services.

### 3.3 Database: MySQL 8.4 + Prisma

| Choice | Why |
|--------|-----|
| **MySQL** | Relational model fits structured trip records; runs reliably in Docker |
| **Prisma** | Schema-as-code, type-safe queries, `db push` for zero-config local setup |
| **cuid() IDs** | URL-safe, sortable-ish, no UUID hyphen noise in routes |

**Why not PostgreSQL or SQLite?** MySQL was chosen for Docker reliability and team familiarity. SQLite would simplify local dev but doesn't mirror a typical production RDBMS setup.

### 3.4 Infrastructure: Docker Compose

| Choice | Why |
|--------|-----|
| **docker-compose.yml** | One command boots db + api + web |
| **Named volume `mysqldata`** | Data persists across `docker compose down` |
| **db healthcheck** | API waits until MySQL accepts connections before starting |
| **Multi-stage web Dockerfile** | Smaller production image; non-root `nextjs` user |

---

## 4. Database design

### 4.1 Entity: Trip

| Column (DB) | Field (API) | Type | Constraints |
|---------------|-------------|------|-------------|
| `id` | `id` | VARCHAR (cuid) | PK |
| `start_location` | `startLocation` | VARCHAR | NOT NULL, max 200 (app) |
| `end_location` | `endLocation` | VARCHAR | NOT NULL, max 200 (app) |
| `start_time` | `startTime` | DATETIME | NOT NULL, stored UTC |
| `end_time` | `endTime` | DATETIME | NOT NULL, ≥ start_time |
| `distance_km` | `distanceKm` | FLOAT | NOT NULL, > 0 |
| `notes` | `notes` | VARCHAR(500) | NULLABLE |
| `memorable` | `memorable` | BOOLEAN | DEFAULT false |
| `created_at` | `createdAt` | DATETIME | auto |
| `updated_at` | `updatedAt` | DATETIME | auto on change |

**Table name:** `trips` (Prisma `@@map`)

### 4.2 Design decisions

- **Snake_case in DB, camelCase in API** — Prisma `@map` bridges the gap; JSON APIs conventionally use camelCase
- **Distance in kilometers** — product requirement; display and storage use km consistently
- **No user_id** — single-tenant demo; add `userId` FK when auth ships
- **Notes optional, max 500 chars** — enforced in Zod (API) and `maxLength` (form)

### 4.3 Indexes (future)

For v1, list query is `ORDER BY start_time DESC` with no filter index needed at small scale. Add index on `(memorable, start_time)` if list grows past ~1k rows.

---

## 5. Service design (API) — step by step

### 5.1 Step 1: Define the domain model

One aggregate root: **Trip**. No nested entities, no joins. All operations are CRUD on a flat table.

### 5.2 Step 2: Define the API contract

| Method | Path | Body | Response | Status |
|--------|------|------|----------|--------|
| GET | `/health` | — | `{ status: "ok" }` | 200 |
| GET | `/api/trips` | — | `{ trips, summary }` | 200 |
| GET | `/api/trips?memorable=true` | — | filtered list + summary | 200 |
| GET | `/api/trips/:id` | — | Trip | 200 / 404 |
| POST | `/api/trips` | TripInput | Trip | 201 / 400 |
| PATCH | `/api/trips/:id` | Partial TripInput | Trip | 200 / 400 / 404 |
| DELETE | `/api/trips/:id` | — | empty | 204 / 404 |

**Summary object** (always global, not filter-scoped):

```json
{
  "totalTrips": 12,
  "totalDistanceKm": 4820.5,
  "memorableTrips": 3
}
```

### 5.3 Step 3: Layer the API code

```
api/
├── src/
│   ├── index.ts        # App bootstrap, CORS, health, db push retry loop
│   ├── db.ts           # Prisma client singleton
│   ├── validation.ts   # Zod schemas (single source of truth for rules)
│   └── routes/
│       └── trips.ts    # Route handlers only — no business logic elsewhere
└── prisma/
    └── schema.prisma   # DB schema
```

**Why this structure?**

- `validation.ts` is importable and testable in isolation
- `serializeTrip()` normalizes `Date` → ISO string at the boundary
- Routes stay thin: parse → prisma → respond

### 5.4 Step 4: Validation rules (server)

**Create (`tripInputSchema`):**

- `startLocation`, `endLocation`: string, 1–200 chars
- `startTime`, `endTime`: ISO 8601 datetime strings
- `distanceKm`: number > 0
- `notes`: optional, max 500
- `memorable`: optional boolean, default false
- **Refine:** `endTime >= startTime`

**Update (`tripUpdateSchema`):**

- All fields optional
- Same refine when both times provided

### 5.5 Step 5: Error handling

| Scenario | Status | Body |
|----------|--------|------|
| Zod validation fail | 400 | `{ error, details }` |
| Trip not found | 404 | `{ error: "Trip not found" }` |
| DB / unexpected | 500 | `{ error: "Failed to …" }` |

Errors are logged server-side; client sees a short message.

### 5.6 Step 6: Startup and schema sync

On boot, API runs `prisma db push --skip-generate` with up to 30 retries (2s apart) until MySQL is ready.

**Why `db push` and not migrations?**

- Zero-config for reviewers running `docker compose up`
- **Production would use** `prisma migrate deploy` with versioned migration files

### 5.7 Step 7: Environment variables

| Variable | Used by | Example |
|----------|---------|---------|
| `DATABASE_URL` | Prisma | `mysql://root:pass%40word@db:3306/drive_logger` |
| `PORT` | Express | `4000` |

**Note:** Passwords with `@` must be URL-encoded (`%40`) in connection strings.

---

## 6. App design (frontend) — step by step

### 6.1 Step 1: Information architecture

Single route: `/` → `DriveTripLogger` (client component).

No routing library needed. All UI is one screen with overlays:

- **Main view:** header, summary cards, filter, trip list
- **TripModal:** add / edit form
- **DeleteDialog:** confirm delete

### 6.2 Step 2: Component tree

```
page.tsx
└── DriveTripLogger          # state owner, data fetching, handlers
    ├── SummaryCards         # read-only stats
    ├── FilterToggle         # all | memorable
    ├── TripRow (×N)         # list item + actions
    ├── EmptyState           # zero-data CTA
    ├── TripModal
    │   └── TripForm         # controlled form fields
    └── DeleteDialog
```

**Why one state owner?**

- `DriveTripLogger` holds trips, filter, modal state, loading/error
- Children receive props + callbacks — no prop drilling beyond one level
- Refetch after mutate keeps list and summary in sync

### 6.3 Step 3: State model

| State | Type | Purpose |
|-------|------|---------|
| `trips` | `Trip[]` | Current list (filtered server-side) |
| `summary` | `TripSummary` | Dashboard cards |
| `filter` | `"all" \| "memorable"` | Drives `?memorable=true` query |
| `modalOpen`, `modalMode`, `formData` | — | Add/edit flow |
| `deletingTrip` | `Trip \| null` | Delete confirmation |
| `loading`, `saving`, `deleting`, `togglingId` | booleans | UI feedback |
| `error`, `formError` | strings | Global vs form-level errors |

### 6.4 Step 4: API client layer

`web/lib/api.ts`:

- `getApiBase()` — browser uses `NEXT_PUBLIC_API_URL`; server uses `API_URL`
- `request<T>()` — wrapper around `fetch` with JSON + error extraction
- `toApiPayload()` — converts form strings → API types (trim, ISO dates, parse float)

**Why a thin client module?**

- Components never construct URLs or parse errors
- Easy to swap base URL per environment (Docker vs local)

### 6.5 Step 5: Form design

| Field | Input type | Client validation |
|-------|------------|-------------------|
| Start location | text | required, trimmed |
| End location | text | required, trimmed |
| Start time | datetime-local | required |
| End time | datetime-local | required, ≥ start |
| Distance (km) | number (min 0.1, step 0.1) | required, > 0 |
| Notes | textarea | optional, max 500 |
| Memorable | checkbox | — |

**Timezone behavior:** `datetime-local` uses browser local time; `toISOString()` converts to UTC before POST.

### 6.6 Step 6: UI / UX specifications

**Theme:** Dark (`--bg-base: #0c0f14`), accent orange (`#f5a623`), Inter font.

**Layout:**

- Max content width 960px, centered
- Summary cards: 3-column grid (stacks on mobile)
- Trip list: card rows with location, date range, distance, star/edit/delete

**Modal:**

- Mobile: slides up from bottom (`slideUp` animation)
- Desktop: centered scale-in (`scaleIn`)
- Escape key and overlay click close modal
- `body overflow: hidden` while open

**Accessibility:**

- `role="dialog"`, `aria-modal`, `aria-labelledby` on modal
- `role="alert"` on errors
- Icon buttons have `aria-label`
- Focus moves to notes field on validation error (edit flow)

**Form input consistency:**

- All text inputs and datetime inputs share `height: 42px`
- Calendar picker icon inverted for visibility on dark background (`color-scheme: dark`)

### 6.7 Step 7: User flows

**Add trip**

1. Click **Add trip** (header or empty state)
2. Modal opens with empty form
3. Fill fields → **Add trip**
4. Client + server validation
5. On success: modal closes, list refetches

**Edit trip**

1. Click edit icon on row
2. Modal pre-filled via `tripToFormData()`
3. **Save changes** → PATCH → refetch

**Toggle memorable**

1. Click star on row
2. PATCH `{ memorable: !current }` only
3. Refetch (star state + summary update)

**Delete trip**

1. Click delete → confirmation dialog
2. **Delete** → DELETE 204 → refetch

**Filter**

1. Toggle All / Memorable
2. `useEffect` refetches with `?memorable=true`

### 6.8 Step 8: Types and formatting

`web/lib/types.ts` — mirrors API JSON shapes.

`web/lib/format.ts`:

- `formatDateRange()` — human-readable list display
- `toDatetimeLocalValue()` — ISO → `datetime-local` value
- `tripToFormData()` / `emptyFormData()` — form state helpers

---

## 7. Implementation phases (build order)

### Phase 1 — Infrastructure

1. Create `docker-compose.yml` with db, api, web services
2. Configure MySQL volume + healthcheck
3. Wire `DATABASE_URL` with URL-encoded password
4. Verify `docker compose up` brings all three healthy

### Phase 2 — Database + API

1. Write Prisma schema (`Trip` model)
2. Set `url = env("DATABASE_URL")` in schema (not hardcoded localhost)
3. Implement `db.ts` Prisma singleton
4. Implement Zod schemas in `validation.ts`
5. Implement `tripsRouter` with all CRUD routes
6. Add startup `db push` retry loop in `index.ts`
7. Test with `curl` against `:4000`

### Phase 3 — Frontend shell

1. Scaffold Next.js app with App Router
2. Define CSS variables and base layout in `globals.css`
3. Build `DriveTripLogger` shell (header, loading, error banner)
4. Implement `api.ts` client

### Phase 4 — Core features

1. `SummaryCards`, `FilterToggle`, `TripRow`
2. `TripForm` + `TripModal` (add/edit)
3. `DeleteDialog`
4. `EmptyState`
5. Wire all handlers in `DriveTripLogger`

### Phase 5 — Polish

1. Responsive modal (mobile slide-up)
2. Spinner, empty states, error retry
3. Datetime input sizing + calendar icon visibility
4. README with run instructions

---

## 8. Docker configuration reference

### 8.1 Service dependencies

```
db (healthy) → api → web
```

### 8.2 Ports

| Service | Host port | Internal |
|---------|-----------|----------|
| web | 3000 | 3000 |
| api | 4000 | 4000 |
| db | — (not exposed) | 3306 |

DB is only reachable inside the Compose network (`db:3306`). Browser talks to API via published `localhost:4000`.

### 8.3 Web env vars

| Variable | Value (Docker) | Why |
|----------|----------------|-----|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Browser-side fetch from user's machine |
| `API_URL` | `http://localhost:4000` | Server-side fetch (if used) |

---

## 9. Non-functional requirements

| Area | Requirement |
|------|-------------|
| **Performance** | List loads in < 2s on local Docker |
| **Security** | No auth in v1; no secrets in repo (use env) |
| **Reliability** | API retries DB connection 60s on startup |
| **Maintainability** | TypeScript end-to-end; single validation module per layer |
| **Portability** | Runs on macOS/Linux with Docker Desktop |

---

## 10. Known limitations

1. **No automated tests** — manual QA only
2. **Summary stats are global** — not scoped to active filter
3. **`db push` on startup** — not safe for production schema changes
4. **No optimistic UI** — star toggle and delete wait for refetch
5. **No pagination** — all trips loaded at once
6. **Password in compose file** — acceptable for local demo, not for prod

---

## 11. Future enhancements (post-v1)

| Enhancement | Rationale |
|-------------|-----------|
| Optimistic UI updates | Instant star/delete feedback |
| Pagination / virtual scroll | Scale past ~50 trips |
| Location autocomplete | Reduce typos, better UX |
| Auto-calculate distance/duration | Less manual entry |
| Seed script | Populated demo for reviewers |
| Auth (JWT / sessions) | Multi-user production |
| Prisma migrations | Versioned, reversible schema changes |
| E2E tests (Playwright) | Regression safety |

---

## 12. Local development (without Docker)

1. Start MySQL locally on port 3306
2. Copy `.env.example` → `api/.env`:
   ```
   DATABASE_URL=mysql://root:shikha%4026@localhost:3306/drive_logger
   ```
3. `cd api && npm install && npx prisma db push && npm run dev`
4. `cd web && npm install && npm run dev`
5. Open http://localhost:3000

---

## 13. Acceptance checklist

- [ ] `docker compose up --build` starts db, api, web without errors
- [ ] http://localhost:3000 loads the trip logger UI
- [ ] Can add a trip with all required fields
- [ ] Trip appears in list, sorted newest first
- [ ] Summary cards update after add/delete
- [ ] Can edit an existing trip
- [ ] Can delete with confirmation
- [ ] Can star/unstar a trip
- [ ] Memorable filter shows only starred trips
- [ ] Form rejects end time before start time
- [ ] Data persists after `docker compose down` (without `-v`)
