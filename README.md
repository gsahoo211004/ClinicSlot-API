# ClinicSlot API

REST backend for **clinic appointment slot booking** — built with **Node.js**, **Express**, and **PostgreSQL**. Designed as a portfolio service aligned with healthcare platforms (search clinics → doctors → open slots → book/cancel).

## Features

- JWT **register / login** (patients; seeded **admin** for slot creation)
- **Clinics** list with city filter and pagination
- **Doctors** per clinic, **open slots** per doctor (date range + pagination)
- **Book** appointment with a DB **transaction** (prevents double-booking)
- **Cancel** appointment and release slot
- **Docker Compose** (Postgres + API)
- **Jest + supertest** integration tests
- GitHub Actions CI
- **React (Vite) web UI** for login, booking, and appointments

## Web UI (React)

Browser demo client in [`frontend/`](./frontend/).

**Terminal 1 — API** (embedded Postgres if you do not have Docker/local DB):

```bash
npm run run:local
```

**Terminal 2 — UI:**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173** — sign in with seeded patient `patient@example.com` / `PatientPass123!`, search city **Bangalore**, book a slot, then check **My appointments**.

Set `CORS_ORIGIN=http://localhost:5173` on the API (default in `.env.example`).

## Architecture

```text
Client → Express routes → Services → Prisma → PostgreSQL
                ↓
         JWT middleware / Zod validation
```

Future split (documented for interviews): `auth-service`, `catalog-service`, `booking-service` behind an API gateway.

## Quick start (Docker)

```bash
git clone https://github.com/gsahoo211004/ClinicSlot-API.git
cd ClinicSlot-API
docker compose up --build
```

- Health: `GET http://localhost:3000/health`
- Seed prints demo credentials in the container logs.

## Local development

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run db:migrate
npm run db:seed
npm run dev
```

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness |
| POST | `/auth/register` | No | Create patient account |
| POST | `/auth/login` | No | JWT login |
| GET | `/clinics?city=&page=&limit=` | No | List clinics |
| GET | `/clinics/:clinicId/doctors` | No | Doctors at clinic |
| GET | `/doctors/:doctorId/slots?from=&to=` | No | Open slots |
| GET | `/appointments/me` | Bearer | My appointments |
| POST | `/appointments` | Bearer | Book `{ "slotId": "uuid" }` |
| PATCH | `/appointments/:id/cancel` | Bearer | Cancel booking |
| POST | `/admin/slots` | Admin Bearer | Create slot |

### Example flow

```bash
# Login as seeded patient (after npm run db:seed)
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"PatientPass123!"}'

# List Bangalore clinics, pick doctorId and slotId from responses
curl "http://localhost:3000/clinics?city=Bangalore"

curl -X POST http://localhost:3000/appointments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"slotId":"<uuid>"}'
```

Default seed accounts (override via env in `prisma/seed.js`):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@clinicslot.local` | `AdminPass123!` |
| Patient | `patient@example.com` | `PatientPass123!` |

## Tests

Requires Postgres (same `DATABASE_URL` as `.env`):

```bash
npm run db:migrate
npm test
```

## Phase-wise GitHub pushes

See [PHASES.md](./PHASES.md) for commit-by-commit guidance if you publish the repo incrementally.

## Tech stack

- Node.js 20, Express 4
- PostgreSQL 16, Prisma ORM
- bcryptjs, jsonwebtoken, Zod
- Jest, supertest, Docker

## License

MIT
