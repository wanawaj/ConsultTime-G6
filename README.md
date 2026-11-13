# ConsultTime — WMSU Consultation Platform

React/Vite frontend with student/faculty/admin portals, a Node.js API, and optional Neon PostgreSQL persistence. The existing landing design, brand colors (`#DC0E0E` to `#FE6244`), WMSU college/program selectors, and live password caption are preserved.

## Development

Requires Node.js 20.19+ (Node 22 recommended). In the project root:

```bash
npm install
npm run dev
```

This keeps the previous **local JSON demo** backend on port `3001`, Vite on port `5173`, and uses the same API proxy as before. No cloud credentials are needed for local demo work. To compile the React client run `npm run build`.

Existing demo logins are **for local development only**: `faculty@consulttime.local`, `faculty2@consulttime.local`, `admin@consulttime.local` with password `DemoPass123!`. These accounts are not seeded into production PostgreSQL.

## Cloud deployment

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for the complete Cloudflare Pages + Render + Neon workflow, including database initialization, staff accounts, first-party session proxy, GitHub branch settings and domain registration.

Quick architecture:

- Cloudflare Pages hosts Vite's `dist/` and runs `functions/api/[[path]].js` to proxy `/api/*`.
- Render runs `npm start` / `backend/server.mjs` with `NODE_ENV=production`, `DATABASE_URL` and `API_PROXY_SECRET`.
- Neon stores users, session hashes and consultation bookings in PostgreSQL.
- Without `DATABASE_URL` in development, the original local JSON backend runs instead.

**Never commit `.env`, `.dev.vars`, database URLs or secrets.** The cloud ZIP contains example variables only. Existing test data in `backend/data/` is intentionally excluded from the ZIP and is not imported into Neon.

## Current application routes

`/` (Home), `/about`, `/features`, `/login`, `/signup`, `/portal` (student/faculty/admin), `/forgot-password` (administrator-assisted recovery; email recovery not built).

**University identity verification, password recovery, audit logging, privacy governance and additional hardening are required before accepting genuine WMSU student records.** This is an infrastructure integration step, not a certified production launch.

See `README_WMSU_SOURCES.md` for college/program sources and catalog limitations.
