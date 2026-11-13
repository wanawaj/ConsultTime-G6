# ConsultTime — Cloudflare Pages + Render + Neon PostgreSQL

This is a **deployment-ready integration scaffold**, **not** a completed live deployment. You must configure your own provider accounts and credentials. Keep WMSU student data out of the public test deployment until the university approves verification, privacy, retention, audit, and recovery policies.

## Architecture

```
Browser → Cloudflare Pages (React and /api/* Function) → Render Node.js API → Neon PostgreSQL
```

The Cloudflare Function (`functions/api/[[path]].js`) forwards `/api/*` to Render. The browser still fetches `/api/login`, `/api/me`, etc. from **its own origin**. Cookies therefore stay first-party. Render accepts application API calls only with the shared `API_PROXY_SECRET` set on the Cloudflare Function and Render; its `/api/health` remains available for health checks. PostgreSQL stores accounts, 24-hour sessions (token hashes), and consultation requests. An SQL unique index prevents simultaneous booking of one active faculty slot.

## 0 — Before deployment (in the project root)

In Windows CMD:

```cmd
npm install
npm run build
```

`npm install` is important because this update adds the PostgreSQL client `pg`. It also updates your **existing** `package-lock.json`. Commit `package.json`, `package-lock.json`, the backend, `functions/`, `public/_routes.json`, and the small UI text updates. Do **not** commit `.env`, `.dev.vars`, `backend/data/`, or any password or connection URL.

Use your **`waj` branch** in both Cloudflare and Render if you are deploying that development branch; do not switch or force-push to `main` without your team's approval.

## 1 — Neon (database first)

1. Open <https://console.neon.tech/> and create a PostgreSQL project/database for ConsultTime.
2. In the Neon console select **Connect**. Copy a **pooled** PostgreSQL connection string (`...-pooler...`), which already includes TLS parameters. Do **not** post it in chat or commit it.
3. Keep this as `DATABASE_URL` for Render. The schema is automatically initialized by the Render backend on startup. For a deliberate migration, you can also use the local command `npm run db:migrate` with a properly configured `.env`. For more involved future migrations, Neon recommends a direct (non-pooled) connection.
4. Neon starts **empty**: local `backend/data/dev-db.json` test accounts and appointments do not automatically transfer. This is intentional to avoid publishing local test/personal data.

Schema: `backend/db/schema.sql` (`ct_users`, `ct_sessions`, `ct_appointments`).

## 2 — Generate a shared API secret

In CMD on your computer, generate a random secret:

```cmd
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep the generated 64-character value privately. Set the **same value** for `API_PROXY_SECRET` in Render and Cloudflare Pages. If you also configure a public Preview environment, use a separate staging Render service, Neon branch/database, and secret so previews cannot write into production. Never place it in any React/Vite variable prefixed `VITE_` (those variables are bundled into public JavaScript).

## 3 — Render (Node.js API second)

1. Open <https://dashboard.render.com/> and choose **New → Web Service**. Connect the GitHub repository `wanawaj/ConsultTime-G6`.
2. Select branch `waj` (or your team's approved deployment branch).
3. Set **Root Directory** to the repository root (leave blank if repository root contains `package.json`). Language: **Node**.
4. **Build Command:** `npm ci` if you've committed the updated lockfile; otherwise `npm install`.
5. **Start Command:** `npm start` (runs `node backend/server.mjs`).
6. Environment variables:

   | Name               | Value                                      |
   | ------------------ | ------------------------------------------ |
   | `NODE_ENV`         | `production`                               |
   | `DATABASE_URL`     | Your **secret Neon pooled PostgreSQL URL** |
   | `API_PROXY_SECRET` | Secret generated in step 2                 |

7. Set **Health Check Path** to `/api/health` and deploy. Render sets `PORT` for you. **Do not manually set `PORT` unless needed.**
8. Visit `https://YOUR-RENDER-SERVICE.onrender.com/api/health` and expect `{"ok":true,"storage":"postgresql"}`. Other API routes called directly should return 403 in production (unless you use the private shared secret).

Render should connect to Neon before you continue.

## 4 — Cloudflare Pages (React site and same-origin API)

1. In Cloudflare dashboard choose **Workers & Pages → Create application → Pages → Import an existing Git repository**. Connect `wanawaj/ConsultTime-G6`.
2. Choose **Production branch** `waj` if that's the branch you want online for testing. The official guide uses `main` as an example, but `waj` is your current branch.
3. Framework preset: **React (Vite)**. **Build Command:** `npm run build`. **Build Output Directory:** `dist`. Root directory: repository root.
4. Configure the **Production** Functions/environment variables (use separate staging API/database credentials for Preview, if you enable it):

   | Name               | Value                                      | Security                           |
   | ------------------ | ------------------------------------------ | ---------------------------------- |
   | `API_ORIGIN`       | `https://YOUR-RENDER-SERVICE.onrender.com` | Public address, but Functions-only |
   | `API_PROXY_SECRET` | Exact same value as Render                 | **Secret**, never `VITE_`          |

5. Deploy using **Git integration** (not dashboard drag-and-drop: your project includes Pages Functions).
6. Test `https://YOUR-PAGES-PROJECT.pages.dev/api/health`. It should reach your Render backend through the Cloudflare Function.
7. Test `/`, `/login`, `/signup`, `/portal`, and navigation to `/about` and `/features`. `public/_routes.json` limits Pages Function invocations to API calls and leaves static React routes alone.

No `VITE_API_URL` is needed: React continues fetching relative `/api/...` paths. After updating Functions variables, **redeploy** so they take effect.

## 5 — Set up the initial faculty/admin accounts privately

Production PostgreSQL **does not contain** the public demo credentials `admin@consulttime.local / DemoPass123!` (or the demo faculty users).

After Render is connected to Neon, on your own computer create a local `.env` from `.env.example` and replace `DATABASE_URL` with your **actual** Neon URL. Do not commit `.env`. Then run:

```cmd
npm install
npm run db:create-staff
```

The script prompts for either `admin` or `faculty`, name, email, and (faculty only) department. It requests a password with **hidden typing** and inserts the account into Neon. Run it once for each legitimate staff member. This is a private command; no browser registration endpoint can create faculty or admin accounts.

Staff should change temporary passwords according to your school's onboarding procedure. A self-service staff invite/reset flow is **not** built yet.

## 6 — Custom domain (after your pages.dev test works)

Cloudflare Pages → your project → **Custom domains → Set up a domain**. Enter the domain or subdomain you own and follow the DNS instructions. For an apex/root domain, Cloudflare requires adding it as a zone and pointing nameservers to Cloudflare. For a subdomain, a CNAME can point to your Pages hostname. **Associate the domain in Pages before manually adding DNS records.**

The Cloudflare proxy automatically works under the custom domain; cookies are issued for whichever frontend hostname the browser uses. Choose one canonical public hostname and redirect other hostnames for a more consistent sign-in experience.

## 7 — Local work continues to work

- `npm run dev` — existing local JSON demo backend + Vite. No Neon required.
- `npm run dev:neon` — reads `.env`, uses Neon PostgreSQL + Vite. Use only for safe test data and never with the live production DB casually.
- `npm run build` — verify Vite client can build.
- `npm run db:migrate` — initialize/check schema using `.env`.
- `npm run db:create-staff` — privately provision staff using `.env`.

These scripts use Node 20.19+ (recommended Node 22) and the built-in `--env-file` option.

## 8 — Verify the complete flow

1. `GET /api/health` through Pages returns `ok` and `postgresql`.
2. Open `/signup`; register a **test** student, including `0000-00000` Student ID format, a listed WMSU college/program, and strong password.
3. Refresh `/portal`: the session should remain signed in. Sign out, sign in again, and verify the account persists.
4. Provision a **test** faculty account with the CLI; book a slot as the test student. Approve it as that faculty; the status persists after refresh/redeploy.
5. Check admin summary using a privately provisioned admin account.
6. Try to book the same active faculty/date/time from two test students; only one must succeed.
7. Verify Pages console/network calls are to `/api/...`, **not** directly to Render or Neon.

## Security/production readiness caveats

This update provides a database-backed deployment _foundation_. It is **not yet approved for real student personal information**. Before campus-wide launch: university identity/email verification; admin/faculty onboarding and password recovery; abuse prevention and persistent rate-limits; access/audit logs and backup/restoration procedures; privacy notices, retention/deletion policy and data-processing review; secure session lifecycle and monitoring; appointment timezone/scheduling policy; and acceptance tests against a real Neon database. Some features shown in the public catalog are still marked **Planned**.

The local JSON mode remains **development-only**. Render must have `NODE_ENV=production`, `DATABASE_URL`, and `API_PROXY_SECRET`. Real Render/Neon/Cloudflare accounts, names and credentials are not included in this ZIP.

## Official references

- Cloudflare Pages build settings: <https://developers.cloudflare.com/pages/configuration/build-configuration/>
- Cloudflare Pages Functions and routing: <https://developers.cloudflare.com/pages/functions/routing/>
- Cloudflare Pages custom domains: <https://developers.cloudflare.com/pages/configuration/custom-domains/>
- Render web services: <https://render.com/docs/web-services>
- Render environment variables: <https://render.com/docs/configure-environment-variables>
- Neon database connection: <https://neon.com/docs/connect/connect-from-any-app>
