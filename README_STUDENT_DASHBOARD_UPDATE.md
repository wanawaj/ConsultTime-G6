# ConsultTime — Student Dashboard UI Redesign (Ian development branch)

This package contains the Student Dashboard implementation based on the React source ZIP shared on 15 November 2026.

## Files in this update

- `src/pages/StudentDashboard.jsx` — new responsive student dashboard with sidebar, overview, faculty directory, booking, unified history, status activity, profile, and a cancellation confirmation dialog.
- `src/styles/student-dashboard.css` — scoped styling using approved red `#DC0E0E` and coral `#FE6244`.
- `src/pages/PortalPage.jsx` — connects the existing backend handlers and data to StudentDashboard for student logins. Preserves the previous staff dashboard for faculty/admin.
- `src/App.jsx` — suppresses the public header/footer *only* while a student views `/portal`, letting the new dashboard use its own navigation. Public pages and faculty/admin still use the existing layout.

## Apply on Windows to the existing Ian clone

1. Make sure you are in `C:\Dev\CT-G6-IAN` and `git status` shows branch `ian` and no pre-existing edits to these files.
2. Extract the ZIP into **C:\Dev\CT-G6-IAN**, choosing to replace matching files and preserve the directory structure (`src\...`). Do **not** extract it into a separate subfolder.
3. Open CMD in `C:\Dev\CT-G6-IAN` and run:

   ```cmd
   git status
   npm run build
   npm run dev
   ```

4. Open the localhost URL printed by Vite. For authenticated local requests, ensure the local backend launched and use a **fictional student test account**. Don't copy your production `.env` into this clone and do not use real student information.
5. Visit `/portal` as a student and inspect all sidebar sections at desktop and mobile widths.
6. Confirm faculty/admin accounts still get their previous dashboard UI. This package does not redesign either staff dashboard.
7. After you review/test the changes and the actual contributors confirm authorship, commit them on `ian`. Avoid pushing directly to production `waj` until tested.

## Working and pending functionality

**Reuses existing frontend API integration:** `GET /faculty`, `GET /slots?facultyId=...`, `GET /appointments`, `POST /appointments`, `PATCH /appointments/:id` with status `Cancelled`. Real appointment counts, faculty records, available dates, and saved statuses come from the backend—no fake demo data.

**Student UI features added:** dashboard overview, appointment summaries, faculty search, functional booking inputs wired to existing API handlers, combined consultation history with search/status filtering, status activity feed based on saved records, read-only profile information, and a cancellation confirmation modal.

**Not yet implemented as backend features:** real OTP/email ownership verification, contact/profile editing, configurable school year, automatic notification delivery, faculty flexible schedule management, admin analytics, duplicate record constraints, and a faculty action for marking consultations Completed. These require separate, secure backend/database work and role-based testing. Status cards show only statuses actually returned by the backend.

## Verification performed on the supplied frontend source

- Checked modified JSX files with the TypeScript JSX syntax parser: no parse errors.
- Checked new stylesheet with `tinycss2`: no parsing errors.
- Full `npm run build` could not be executed in the packaging environment because the uploaded ZIP intentionally lacked `package-lock.json` and `node_modules`; run the build in your existing Ian clone, where `npm ci` previously succeeded.

## Security

This ZIP has no `.env`, database connection string, account password, Git credentials, or backend source files. Do not upload secrets in future ZIPs or commits.
