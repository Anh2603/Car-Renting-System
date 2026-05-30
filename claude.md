# Claude context for Car-Renting-System-user

Purpose
- Provide a concise project summary, run instructions, environment variables, database setup, and key API routes so Claude (or any assistant) can answer dev and user questions accurately.

Project overview
- Monorepo-style workspace with two main apps:
  - `car-renting-backend/` — Node.js Express backend (controllers, routes, DB config, payments, auth).
  - `car-renting-frontend/` — React frontend (Vite/CRA-like structure in `src/` with pages and components).

Important paths
- Backend root: `car-renting-backend/`
  - `server.js` — app entry
  - `routes/` — `authRoutes.js`, `carRoutes.js`, `bookingRoutes.js`, `paymentRoutes.js`
  - `controllers/` — request handlers (auth, booking, cars, payments)
  - `config/db.js` — DB connection
  - `database/schema.sql`, `database/seed.sql` — schema and seed data
  - `middleware/authMiddleware.js` — JWT auth guard
- Frontend root: `car-renting-frontend/`
  - `src/pages/` — page components
  - `src/components/` — reusable UI (CarCard, BookingWidget, Navbar, etc.)

Run & dev commands
- Backend (from `car-renting-backend/`):

```bash
npm install
npm start
# or for dev with nodemon if configured:
npm run dev
```

- Frontend (from `car-renting-frontend/`):

```bash
npm install
npm start
```

Environment variables (common)
- `DB_HOST` — database host
- `DB_PORT` — database port (e.g., 3306)
- `DB_USER` — DB username
- `DB_PASSWORD` — DB password
- `DB_NAME` — DB name
- `JWT_SECRET` — secret used to sign JWTs
- `STRIPE_SECRET_KEY` — secret key for Stripe payments (if payments use Stripe)
- `CLIENT_URL` — frontend origin for CORS / redirect

Database setup
- A SQL schema and seed are included at `car-renting-backend/database/schema.sql` and `seed.sql`.
- Typical steps (MySQL example):

```bash
# create database then import
mysql -u <user> -p < database_name < database/schema.sql
mysql -u <user> -p < database_name < database/seed.sql
```

API summary (surface-level)
- Auth: `/api/auth/*` — register, login, token handling
- Cars: `/api/cars/*` — list, details, create/update (admin)
- Bookings: `/api/bookings/*` — create booking, list user bookings
- Payments: `/api/payments/*` — process payments (Stripe or other provider)

Notes for answering questions
- Prefer referring to files listed above for code-level answers (controllers and routes). Use links to precise files when pointing to implementation.
- When suggesting changes, keep scope minimal and consistent with existing patterns (e.g., express controllers, middleware usage).
- If reproducing or suggesting env values or secrets, use placeholders and never include real credentials.

Common troubleshooting
- If server fails to connect to DB, check `config/db.js` and environment variables.
- If CORS issues occur, ensure `CLIENT_URL` and CORS middleware in `server.js` are configured.
- For payment issues, verify `STRIPE_SECRET_KEY` and webhook endpoints (if any).

Authoring / contribution notes
- Tests: none included by default; add unit/integration tests under `car-renting-backend/test/` or `car-renting-frontend/__tests__/` if required.
- Formatting & linting: mirror existing project style; keep changes small and consistent.

Contact
- Use repository files and commit history for authorship and more context.

---
This file is a short, self-contained context for assistants and new contributors to quickly understand and run the project. Update it as the codebase changes.
