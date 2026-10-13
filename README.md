# Shakopee Bullseye Club — Website v2

## What is included
Eight requested sections: Schedule/Results, Team Standings, Cricket Rankings, 501 Rankings, A MVP, B MVP, Individual Power Rankings, News. Plus Home, Player Profiles and Playoffs.

## League data
All 16 players and confirmed A/B slots are entered. All 56 regular-season fixtures have been generated for a double round robin on 14 Thursdays (October 15, 2026 through February 4, 2027, excluding Thanksgiving, Christmas and New Year breaks). **The fixture pairings and home/away assignments are generated examples, not an independently verified official schedule.** Check/reorder them to match your real schedule. Times are blank. Three playoff placeholders need teams assigned.

## Import and connect
1. Import `Shakopee_Bullseye_Club_2026-27.xlsx` into Google Sheets. It has Players, Teams, Schedule, Results, News, Awards, Guide.
2. Under **Extensions > Apps Script**, paste `Code.gs`, save, deploy as **Web app**, execute as **Me**, access **Anyone**. This makes the selected six data tabs publicly readable, but not editable. Do not include private information in them.
3. Copy the deployed `/exec` URL into `config.js` (replace empty string).
4. Publish `index.html`, `styles.css`, `app.js`, `config.js`, `starter-data.js` and optionally `images/` to GitHub Pages. On the published site, the spreadsheet feed overrides the bundled demo roster.
5. Alternatively embed the published GitHub Pages URL in Google Sites using Insert > Embed > By URL.

## Weekly editing
- **Results**: enter one row per contest with `FixtureID`, `ContestType` (`A`, `B`, `CRICKET`), `HomeLegs`, `AwayLegs`. Allowed scores: 2–0, 2–1, 0–2, 1–2. Never enter a contest twice for the same fixture.
- **Players**: enter manually calculated season-to-date `PPR` and `MPR`; enter public HTTPS `PortraitURL`, `Sponsor1`, `Sponsor2`. Keep player IDs stable.
- **News**: add rows with `Published` = `Yes` to show them. News text is safely escaped and displayed as plain text.
- **Schedule**: fill times and correct pairings; playoffs must have team IDs once decided.

## Ranking rules
- Team standings: 1 point per winning A 501, B 501, or team cricket contest. Ties: contest win %, leg difference, legs won.
- A/B MVP: 1 point per 501 singles match win. Ties: **legs won, then singles win percentage**. No playoff matches included.
- 501 rankings: PPR descending, only players with a positive manually entered PPR.
- Cricket rankings: MPR descending, only players with a positive manually entered MPR. This is **individual** MPR, not the team cricket record.
- Individual power rankings: provisional 40% normalized PPR + 30% normalized MPR + 30% 501 singles win percentage. Eligible only after both averages and at least one singles match are entered. Normalization uses the highest eligible PPR/MPR in the league. Formula can be adjusted later.
- Playoffs: Phase other than `Regular` displays in the playoff section and is excluded from season standings.

## Preview
Open `index.html` in a browser. Without an Apps Script URL it shows the actual confirmed roster, generated fixtures, and sample welcome news, but no fabricated results or performance averages.
