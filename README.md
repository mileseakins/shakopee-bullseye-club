# Shakopee Bullseye Club — starter website

## Files
- `index.html` — homepage and all website sections
- `styles.css` — dark PDC-inspired styling
- `app.js` — player profiles, rankings, fixtures and scoring logic
- `config.js` — paste your Google Apps Script URL here
- `Code.gs` — read-only Google Sheets connector
- `Shakopee_Bullseye_Club_Starter.xlsx` — import into Google Sheets

## Launch in Google Sheets
1. Upload `Shakopee_Bullseye_Club_Starter.xlsx` to Google Drive and open with Google Sheets. Save as a native Google Sheet if prompted.
2. The `Players` and `Teams` tabs contain the 16 named players and eight supplied team pairings. **A/B slots are provisional:** first-listed player is A, second-listed is B. Confirm or swap slots if needed, keeping IDs consistent.
3. Enter the real fixtures in `Schedule`, using the same Team IDs as `Teams` and unique Fixture IDs. Week, Date, Time, Phase, HomeTeamID, AwayTeamID, Status are the exact headers.
4. Enter three rows per completed fixture in `Results`: ContestType `A`, `B`, and `CRICKET`; HomeLegs and AwayLegs must be 2–0, 2–1, 0–2, or 1–2. The website calculates standings from these rows. Do not type final scores for unplayed contests.
5. Enter manual PPR and MPR averages in `Players`. Add HTTPS public image URLs in `PortraitURL` (GitHub-hosted images recommended).
6. In Google Sheets, choose **Extensions → Apps Script**. Replace the default script with `Code.gs`. Save.
7. Choose **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Authorize, deploy, and copy the URL ending in `/exec`.
8. Paste that URL into `config.js` as `window.BULLSEYE_API_URL = 'https://script.google.com/macros/s/.../exec';`.
9. Upload `index.html`, `styles.css`, `app.js`, `config.js`, and any portrait images to a **public GitHub repository**. In **Settings → Pages**, select **Deploy from a branch**, branch `main`, root `/`. Your website will have a free `github.io` address.
10. Visit the site. Update your Google Sheet after league night and refresh the website to see the changes. To refresh automatically, add a reload timer if desired.

## Important scoring definitions
- **Team standings:** each completed A singles, B singles, and team cricket contest gives the winning team **one point**. Sort by total points, contest win percentage, legs differential, legs won. A 2–1 fixture gives the winner 2 points and the loser 1.
- **A/B singles:** only their own 501 best-of-three contest affects their singles W/L and legs.
- **Cricket standings:** team cricket best-of-three results only.
- **PPR/MPR:** manually entered in the Players tab, not inferred from match scores.
- **Incomplete fixtures:** any valid contest contributes to standings even if the other two contests have not been entered. A fixture is marked FINAL only when all three contests are complete.
- **Playoffs:** set Schedule.Phase to `Playoffs` or `Final` to display in the playoffs section; playoff results are displayed separately and excluded from regular-season rankings.
- **Privacy:** the Apps Script feed is publicly readable and returns the contents of the five source tabs. Do not store phone numbers, emails, private notes or other sensitive information there. The spreadsheet itself can remain private.

## Images
Store player portraits in an `images/` folder in the same GitHub repository. Use full public URLs in the Players tab, such as `https://YOURNAME.github.io/YOURREPO/images/player-01.jpg`. Your PDC-style portraits can be used after you provide/export the files.

## Current roster status
All 16 players and eight team pairings are entered. A/B roles are provisional based on the order supplied. Fixture dates and player portraits are still pending.

## Google Sites
You can embed the published GitHub Pages URL in Google Sites with **Insert → Embed → By URL**. Hosting the full site on GitHub Pages provides better navigation and full control over layout.
