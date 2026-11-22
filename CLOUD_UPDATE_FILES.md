# Install this cloud integration into your existing CT-G6-F project

**Recommended: use the Changed Files ZIP, not the full snapshot.** Your GitHub branch includes an extra `HeroShowcase.jsx` that isn't in the last full project ZIP used as our reference. The patch adds/updates only the files below, so existing committed changes remain intact.

1. Make a backup or Git commit of your current working tree.
2. Extract the changed-files ZIP into your existing `CT-G6-F` project root, preserving folders. Compare `.gitignore` and `README.md` if you have edited them yourself.
3. In Windows CMD, run `npm install` to add `pg` and update your **existing package-lock.json**. Run `npm run build` to test. Commit the updated lock file as well as the new files.
4. Read `DEPLOYMENT_GUIDE.md` in the patch for the steps in **Neon → Render → Cloudflare → Domain** order.
5. Do not commit or share real `.env` files or your Neon database URL. The `backend/data/` directory remains on your computer; don't upload it.

Only `backend/server.mjs` is redirected: it loads the original JSON-backed implementation in `backend/server-local.mjs` for your normal local `npm run dev`, and the PostgreSQL implementation when `DATABASE_URL` is configured. The login, signup, dashboard and booking endpoints keep their existing paths.

**No live provider resources are created by these files.** Database connectivity must be checked once you have Neon credentials and the provider dashboards configured.
