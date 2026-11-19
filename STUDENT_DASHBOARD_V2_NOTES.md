# ConsultTime Student Dashboard — Role-aligned cleanup (Ian branch)

This update is based on the original `ConsultTime-Ian-UI.zip` and the Student Dashboard v1 package shared in the project. It **only** changes the student experience and removes a legacy student form that was unreachable in the shared portal component. Faculty/admin UI, APIs, auth, backend, and credentials are unchanged.

## Features page → Student Dashboard (implemented in existing API/UI)

| Public Features page item | Student screen | Implementation |
| --- | --- | --- |
| Faculty directory | Faculty Directory | Search available faculty and choose a person |
| Consultation requests | Book Consultation | Faculty, date, time, topic, and optional notes; submits through existing API |
| Available time slots | Book Consultation | Date/time selectors populated by the existing slots API |
| Booking conflict protection | Book Consultation | Relies on server-provided slots and server validation; no duplicate UI button |
| Consultation list view | Consultation History | All requests together with search and status filtering |
| Request status tracking | Consultation History, Overview summaries | Saved status values from the appointment API |
| Role-based visibility | Student portal routing | Student gets this workspace; staff use existing portal |

## Changes in V2

- Student sidebar now has just **Overview**, **Faculty Directory**, **Book Consultation**, **Consultation History**, **My Profile**.
- Removed the Activity page and header notification bell, because they displayed the same appointment statuses as Consultation History and could be mistaken for live notifications. The header account chip is now informational, rather than a second My Profile button.
- Removed the Quick Actions panel and the second booking CTA in the sidebar; Overview retains one primary **Book a consultation** CTA.
- Removed redundant success-message Refresh button and the duplicate See History link in the recent list.
- Overview Upcoming and Other Recent Requests now show distinct records: approved future consultations are omitted from the latter.
- Removed the unreachable legacy student booking form from `PortalPage.jsx`, retaining the existing Faculty/Admin page and existing API handlers.
- Changed decorative calendar text from 'Consultation calendar' to 'Your consultation plan', since a real calendar view is still planned.
- No production backend modification or new fake functionality.

## Public Features page items **still planned**, not implemented

Student-relevant planned features: linked follow-up sessions, dedicated appointment calendar, consultation timeline, consultation archive, smart reminders, activity/discussion log, email notifications, and real-time coordination. These are **not** presented as working tools in this package. OTP verification, editable contact information, and academic-year settings also require additional backend work (per the panelist checklist).

## Apply to `C:\Dev\CT-G6-IAN`

1. Keep `waj` unchanged. **Back up or commit any intentional current edits** before overwriting files. This update replaces three specific files: `src/pages/StudentDashboard.jsx`, `src/pages/PortalPage.jsx`, `src/styles/student-dashboard.css`.
2. Download the ZIP and extract into the root of `C:\Dev\CT-G6-IAN` (not a subfolder), allowing replacement of those three files. Keep `backend/server-local.mjs` and your local environment configuration as-is.
3. Run `git status`, `npm run build`, then restart `npm run dev` (Ctrl+C first if running).
4. Visit the Vite local URL as a fictional student and verify five navigation tabs, faculty selection, booking form, filtered request history, cancellation modal, and read-only profile. Confirm staff dashboard still opens for faculty/admin.
5. Review any UI issues and test before committing or pushing to `ian`. The production `waj` branch remains unchanged.

### Verification

The modified JSX files were parsed with TypeScript's JSX parser and the stylesheet with tinycss2; no syntax errors were found. Full Vite build and runtime authentication checks must be performed in the local Ian workspace.
