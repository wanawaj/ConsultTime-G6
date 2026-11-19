# ConsultTime Student Dashboard V3 — Ian development branch

This ZIP contains changes to the Student Dashboard, a reusable private messaging panel, and the messaging APIs for local JSON development and Neon PostgreSQL. **It has not been merged or deployed.**

## UI and behavior

- **Toasts:** A submission/cancellation/error displays in the upper-right under the dashboard top bar, slides into view, then slides away after about 5 seconds. It has a close (X), and successful consultation actions have a **View** shortcut to History.
- **Hover sidebar:** On desktop, moving the pointer to the **very left edge** reveals the full sidebar; moving away hides it. The menu icon and keyboard focus can also reveal it. Mobile uses a menu button.
- **Overview hero:** Shorter red/coral banner with an actual schedule calendar in its right half rather than the decorative illustration.
- **Calendar:** Week and month modes, today/back/forward, day selection, data from real API consultation records, and browser-private personal event entries with colored labels. Private events **do not sync to the database** and will not follow you between browsers/devices. A consultation opens the History page.
- **Communication:** Bottom-right collapsible campus messaging panel. Students can choose a **registered faculty email**, enter subject/body, add one small attachment, send, and read/reply in threads. Faculty receive and can reply through a compact panel on their **existing portal**. This is **internal messaging**, not Gmail, SMTP, or a standalone email account.
- **Attachments:** PDF, PNG, JPG, TXT, DOCX only; one attachment per message, maximum 350 KB. Stored in the development JSON database or PostgreSQL `ct_messages` table. Downloads are authenticated and served as download-only data. Larger attachments, virus scanning, spam controls and object storage are future work.
- **Other dashboards:** No admin visual changes or faculty management redesign. The faculty messaging dock is the only faculty UI addition.

## Before extracting

1. **Do not extract this ZIP into the `waj` production workspace.** Use `C:\Dev\CT-G6-IAN`, branch `ian`.
2. Save any custom edits on Ian's branch and back up your existing dashboard files before overwriting. This package replaces **11 source files, and adds a guide**. In particular, `backend/server-local.mjs` is replaced and includes the localhost origin fix for both Vite ports 5173 and 5174; inspect any other local changes before overwriting.
3. Never copy `.env` or secrets into a ZIP or Git commit. This ZIP does not contain credential files.
4. Keep `waj` and the production Neon database untouched during initial testing.

## Apply to Ian's workspace

```cmd
cd /d C:\Dev\CT-G6-IAN
powershell -NoProfile -Command "Expand-Archive -LiteralPath '%USERPROFILE%\Downloads\ConsultTime-Ian-Student-V3-Calendar-Messaging.zip' -DestinationPath 'C:\Dev\CT-G6-IAN' -Force"
git status
npm run build
```

After build passes, stop the old development server (Ctrl+C), then run **only one** `npm run dev`, and open the Vite `Local:` URL. If port 3001 is in use, close the previous local ConsultTime server rather than launching multiple servers.

## Local test sequence (fictional data only)

1. Student: sign in, open Overview; interact with week/month, click appointment day, add a browser-private calendar event. Reload and verify your personal event persists on this browser.
2. Student: submit a consultation request; confirm the toast slides in under the top bar, slides away automatically, and **View** navigates to History.
3. Student: open the bottom-right **Message faculty** panel; Compose; choose a registered faculty email from the directory; write Subject/Message; optionally attach a small test TXT/PDF file; Send.
4. Faculty: sign in with a local test faculty account; open **Student messages** at bottom-right, open the message, download attachment, and reply.
5. Student: refresh/open the message panel and verify the faculty reply is visible.
6. Check mobile layout and keyboard navigation. Check the admin portal still loads.

## PostgreSQL migration and production

The new table `ct_messages` is in `backend/db/schema.sql`. `ensureSchema()` applies it when the updated PostgreSQL server starts, provided the database account has schema creation permission. **Do not run this on production Neon yet**. First test against a separate development database, verify storage and authorization, add monitoring/retention/anti-spam/attachment scanning, and complete the WMSU identity/OTP security work. Do not push to the production `waj` branch yet.

## Verification performed here

- Parsed the 4 updated JSX files with TypeScript's JSX parser, no parse errors.
- Parsed the 3 CSS files with PostCSS, no parse errors.
- Ran `node --check` on all modified/new backend `.mjs` files.
- Ran a **local end-to-end Node API test** with a fictional student and seeded faculty account: student registration, faculty login, send with TXT attachment, faculty inbox receipt and download, faculty reply, student reply receipt, unrelated-origin rejection and invalid-recipient rejection **passed**.
- **A full Vite build has NOT been verified in this environment**, because npm package installation stalled. Run `npm run build` in your existing Ian workspace where dependencies are installed, before launching or committing.

No code has been committed or pushed to GitHub by this package.
