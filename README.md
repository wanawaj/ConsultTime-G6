# ConsultTime — Fresh Standalone Project

A **NEW, separate ConsultTime source-code project**, inspired by the uploaded SOMS reference's page organization, responsive header, roomy page sizing, footer layout, scroll animations, and progressive sign-up flow. Its visual identity uses the ConsultTime red `#DC0E0E` and gradients, NOT the SOMS branding.

The project is **self-contained**. It does not require any existing ConsultTime source files and does not touch the earlier GitHub repository.

## Requirements

- **Node.js 20+** and npm.
- Windows, macOS, or Linux.

## Get started

1. Extract `ConsultTime_Features_Organized_By_Role.zip`.
2. In VS Code, use **File > Open Folder** and choose `ConsultTime_Features_Organized_By_Role`.
3. Open a terminal in that folder.
4. Install dependencies, then run development servers:

```bash
npm install
npm run dev
```

5. Open **http://localhost:5173**.

`npm run dev` starts both the Vite frontend on port **5173** and a Node API on port **3001**. Vite proxies `/api` requests to the local backend. The server automatically creates a local JSON database at `backend/data/dev-db.json` when first launched.

If port 3001 is already in use, stop that process before starting the app. If the frontend cannot reach the API, check both processes' terminal output.

## SOMS-matched page spacing (updated)

This revision fixes the wide blank margins visible on desktop monitors. The **shared public and dashboard container** now uses the same responsive measurement as the latest SOMS reference:

- Maximum inner content width: `1600px` (previously `1200px`)
- Left/right viewport gutters: `clamp(18px, 3vw, 42px)` (previously `clamp(22px, 4vw, 40px)`)
- Header, hero, sections, feature cards, footer, and dashboard content all use `.ct-container` and align on the same content edges.
- The wider **sign-up form card remains unchanged** from the previous ZIP.
- ConsultTime's red gradient and all functional backend code are unchanged.

At a `1536px` browser viewport, the content begins roughly `42px` from each side rather than `168px`. At `1920px`, the shared content width is capped at `1600px`.

If you have already installed the previous ZIP, you can also copy only `src/styles/theme.css` and `src/styles/site.css` from this revision into your project, then refresh the page. No reinstall or database reset is required for this purely visual update.

## Page flow

- `/` — Home, professional two-column hero, animated benefit sections, 3-step consultation workflow.
- `/about` — About Us page.
- `/features` — Features page.
- `/signup` — spacious two-step responsive student account creation page.
- `/login` — role-aware login.
- `/portal` — Student, Faculty or Administrator dashboard (depends on account role).
- `/forgot-password` — informational page; no recovery emails are sent.

Navigation is linked between pages and works on desktop and mobile. The public pages share the same header/footer.

## Working local-demo interactions

- Student sign-up (hashed password) and sign-in.
- Sign-in for the included faculty/admin test accounts.
- Faculty list and reservable time slots (weekday slots in the next few weeks).
- Students can create, monitor and cancel consultation requests.
- Faculty can approve or decline incoming requests.
- Administrators can view all requests and overall counts, and can approve/decline pending requests.
- Local data persistence via `backend/data/dev-db.json`.
- HttpOnly session cookies; server checks authenticated roles before accepting changes.

### Demo login credentials

| Role    | Email                        | Password       |
| ------- | ---------------------------- | -------------- |
| Faculty | `faculty@consulttime.local`  | `DemoPass123!` |
| Faculty | `faculty2@consulttime.local` | `DemoPass123!` |
| Admin   | `admin@consulttime.local`    | `DemoPass123!` |

Create student accounts via `/signup`. Demo accounts are **for local development only** and should NEVER be deployed publicly as-is.

## Hero image

If you have the original ConsultTime homepage image from the prior design, add it here:

`public/consulttime-hero.jpg`

The hero shows an original UI-style illustration if this image is absent. Because the latest ConsultTime source assets were not available in this conversation, the earlier hero photo cannot be automatically included.

## Folder overview

```text
ConsultTime_Complete_New_Project/
  backend/
    server.mjs           # Node local development API
    data/                # generated JSON database (ignored by git)
  scripts/
    dev.mjs              # starts frontend + backend together
  public/
  src/
    components/          # header, footer, UI components
    context/             # React auth session context
    pages/               # Home, About, Features, Signup, Portal, etc.
    services/            # API client
    styles/              # red theme, typography and responsive layout
    App.jsx
    main.jsx
  index.html
  package.json
  vite.config.js
```

## Scope and limitations

**This is a functional local prototype, not a production-ready school management system.**

The JSON file provides basic persistence, not a transactional multi-user database. Authentication, auditing, validation, permissions, account enrollment, credentials management, email verification, rate limits, monitoring, CSRF defenses, backup/recovery, TLS deployment and university privacy requirements need a security review and a real backend before collecting authentic student records or deploying publicly. Scheduled slots are currently predefined; they are not yet editable faculty availability calendars. `npm run build` produces the frontend only; the Node API must still run separately when deploying.

Most importantly: **this ZIP is completely separate from the older ConsultTime-G6 and the SOMS project.** Use it as a new starting point, not as a patch over the existing repo.

## Features page — categorized, role-filtered catalog

The `/features` page now contains 25 consultation-focused capabilities organized into:

1. **Plan & book consultations**
2. **Organize your workflow**
3. **Communicate & collaborate**
4. **Control & analyze**

Visitors can browse **All features / Students / Faculty / Administrators**, filter the feature stage (**All / In the demo / Planned**), and search by keyword. Filters, result counts, and empty states work without a backend request. The page reuses the existing 1600px SOMS-matched container and ConsultTime red gradient.

**Important:** "In the demo" means that functionality is actually supported by the included local backend; "Planned" means a proposed enhancement inspired by the uploaded examples. Planned ideas (such as calendar and Kanban views, recurring office hours, real-time collaboration, email/SMS, analytics charts, and automated reminders) are **not implemented yet**. The feature catalog communicates these ideas without misrepresenting them as live. Existing sign-in, registration, backend, homepage, header, and footer are unchanged.

### For updating an existing project

To update the earlier standalone project without replacing its local database, copy only:

- `src/pages/FeaturesPage.jsx`
- `src/styles/features.css` (new file)
- `src/components/Icon.jsx`

Do not overwrite `backend/data/dev-db.json`. For a fresh setup, extract this entire ZIP in a new folder and run `npm install` then `npm run dev`.

## November 2026 UI refinements

- Features catalog toolbar: Search and All/In the demo/Planned come first, then results/reset, then role tabs.
- Removed the '25 consultation-focused ideas' callout next to the catalog heading.
- Clicking a role tab smoothly scrolls to the first filtered feature section (or an empty-results message); reduced-motion settings are respected.
- Student/Faculty/Admin chips on feature cards have a red sliding-fill hover animation inspired by the supplied SOMS screen recording. Clicking them also filters by role.
- On About Us, 'Better planning' and 'Easier connections' badges float gently like the other hero badges.
- Original colors, responsive content width, footer, sign-up sizing, and local backend logic are retained.

## UI update — Dropdowns and Feature-Card Hover (Nov 13, 2026)

- Student sign-up Program/Course and Year Level menus, and Student Portal Faculty/Date/Time menus now use the same red-accented, scrollable custom dropdown. The controlled values and backend API requests are unchanged. Keyboard navigation: Arrow keys, Home/End, Enter/Space, Escape, Tab, plus click-away dismissal.
- Feature-card Student/Faculty/Admin role labels are now **non-clickable text badges**. Hover anywhere over a feature card to animate **all** of its role labels; they no longer filter, scroll or navigate. The separate Browse by User Role controls still filter and scroll to feature sections.
- Existing ConsultTime red gradient, SOMS-derived width/gutters, auth card sizing, navigation, footer, and floating animations remain unchanged.
