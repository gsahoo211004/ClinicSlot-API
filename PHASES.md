# Phase-wise GitHub push guide

Create an **empty public repo** on GitHub (e.g. `ClinicSlot-API`), then push in order. Each phase is one logical commit (or a small series). Tag optional: `v0.1-phase1`, etc.

## Prerequisites

- Node.js 20+
- Docker Desktop (recommended) or local PostgreSQL 16
- Git remote: `git remote add origin https://github.com/gsahoo211004/ClinicSlot-API.git`

---

## Phase 1 — Scaffold and database

**Goal:** Project boots, DB schema exists, health check works.

**Include in commit:**

- `package.json`, `.gitignore`, `.env.example`
- `prisma/schema.prisma`, `prisma/migrations/**`
- `src/server.js`, `src/app.js` (health only is enough for narrative; full app is fine)
- `docker-compose.yml`, `Dockerfile`
- `README.md` (setup section)

**Commands (local):**

```bash
cd ClinicSlot-API
cp .env.example .env
npm install
docker compose up -d db
npm run db:migrate
npm run dev
# curl http://localhost:3000/health
```

**Suggested commit message:** `chore: init Express API with Prisma schema and Docker Postgres`

---

## Phase 2 — Authentication

**Goal:** Register + login with JWT.

**Files:** `src/routes/authRoutes.js`, `src/services/authService.js`, `src/middleware/auth.js`, `src/middleware/validate.js`, wire in `app.js`

**Try:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"you@example.com\",\"password\":\"SecurePass123\"}"
```

**Commit message:** `feat: JWT auth (register/login)`

---

## Phase 3 — Catalog (clinics, doctors, slots)

**Goal:** Read APIs + seed data.

**Files:** `src/routes/catalogRoutes.js`, `src/services/catalogService.js`, `prisma/seed.js`

```bash
npm run db:seed
curl "http://localhost:3000/clinics?city=Bangalore"
# use clinic id from response
curl http://localhost:3000/clinics/<clinicId>/doctors
curl http://localhost:3000/doctors/<doctorId>/slots
```

**Commit message:** `feat: clinic catalog APIs and seed data`

---

## Phase 4 — Appointments (book / cancel)

**Goal:** Transactional booking, no double-book.

**Files:** `src/routes/appointmentRoutes.js`, `src/services/appointmentService.js`

**Commit message:** `feat: appointment booking with Postgres transactions`

---

## Phase 5 — Admin + tests + CI

**Goal:** Admin slot creation, integration tests, GitHub Actions.

**Files:** `src/routes/adminRoutes.js`, `src/services/adminService.js`, `tests/**`, `jest.config.js`, `.github/workflows/ci.yml`

```bash
npm test
```

**Commit message:** `test: integration tests and CI workflow`

---

## Phase 6 — Polish (optional)

- README: architecture diagram, API table, resume bullet
- `LICENSE` (MIT)
- Screenshots or example curl script in `scripts/demo.sh`

**Commit message:** `docs: README and demo script`

---

## Full stack with Docker (all phases)

```bash
docker compose up --build
```

API: `http://localhost:3000` — runs migrations, seed, then server.

## Resume bullet (copy when repo is public)

**ClinicSlot API — Clinic Appointment Booking Service** | [GitHub](https://github.com/gsahoo211004/ClinicSlot-API)  
*Node.js, Express, PostgreSQL, Prisma, JWT, Docker, Jest*

- Built **REST APIs** for clinic/doctor **slot discovery** and **appointment booking** with **PostgreSQL transactions** to prevent double-booking.
- Implemented **JWT authentication**, **Zod** validation, **Docker Compose** deployment, and **integration tests** for core flows.
