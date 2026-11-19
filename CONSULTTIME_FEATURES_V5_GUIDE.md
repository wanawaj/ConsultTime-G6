# ConsultTime — Features Page Visual Update V5

UI-only update for the `ian` development workspace.

## Changes
- Replaces bulky role buttons and segmented status buttons with two compact, accessible dropdowns using the existing `SelectField.jsx` component. Search remains available.
- Adds left-to-right staggered reveals to feature cards; falls back to reduced motion automatically.
- Uses a high-contrast serif heading font (`Bodoni Moda`) that closely resembles the uploaded HUOVA reference.
- Uses `Hagrid Text` if you have a **valid web license and font configured**, otherwise falls back to free Google Fonts `DM Sans` for smaller text. This package includes no paid or proprietary font files.
- Applies typography across pages and dashboards using `src/styles/typography.css`.
- Keeps the existing ConsultTime brand colors and all existing feature status data. No backend/database files changed.

## Files overwritten/added
- `src/pages/FeaturesPage.jsx` (overwritten)
- `src/styles/features.css` (overwritten)
- `src/main.jsx` (overwritten)
- `src/styles/typography.css` (new)

## Windows CMD steps

1. Back up your current files **before applying** if there are other uncommitted edits.
2. Download the ZIP into Downloads.
3. Run:

    cd /d C:\Dev\CT-G6-IAN
    powershell -NoProfile -Command "Expand-Archive -LiteralPath '%USERPROFILE%\Downloads\ConsultTime-Ian-Features-V5-Style.zip' -DestinationPath 'C:\Dev\CT-G6-IAN' -Force"
    npm run build
    git status
    npm run dev

4. Refresh the Features page and compare on desktop/mobile. No commit or push is performed by extraction.

## Validation note
- CSS stylesheet parsing checks passed.
- JSX/import structure reviewed. A complete Vite build could **not** run in the packaging environment because installing the project dependencies timed out. Run `npm run build` in your actual development folder.
- For exact licensed Hagrid Text web display, configure your own legitimate Adobe Fonts/Zetafonts web service separately; otherwise the free fallback is shown to other visitors.
