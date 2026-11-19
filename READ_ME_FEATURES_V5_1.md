# ConsultTime Features V5.1 — Domino only on role chips

Apply to Ian's development workspace (`C:\Dev\CT-G6-IAN`) after V5.

## Changed
- Restores the **original V4 upward fade/slide** for the large feature cards, with the original short 70 ms stagger per grid column.
- Adds a cascading **left-to-right entrance** for the small Student / Faculty / Admin role labels within each card.
- Makes the role labels' existing red hover-fill sweep in a staggered left-to-right domino sequence instead of all at once.
- Retains V5 dropdown filters, typography, and other styles. Respects reduced-motion preferences.

## Included files
- `src/pages/FeaturesPage.jsx`
- `src/styles/features.css`

## Applying (Windows CMD)
1. Back up those two local files or use a Git diff before overwriting if you made your own changes.
2. Download `ConsultTime-Ian-Features-V5.1-Domino-Chips.zip` into Downloads.
3. From CMD:

```cmd
cd /d C:\Dev\CT-G6-IAN
powershell -NoProfile -Command "Expand-Archive -LiteralPath '%USERPROFILE%\Downloads\ConsultTime-Ian-Features-V5.1-Domino-Chips.zip' -DestinationPath 'C:\Dev\CT-G6-IAN' -Force"
npm run build
git diff --stat
```

4. Refresh localhost > Features; scroll until cards reveal, then hover a card containing multiple roles. Do not commit/push until you approve the UI.

No backend code, database settings, credentials, or font files are included.
