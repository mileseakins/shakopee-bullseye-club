SBC GITHUB-HOSTED EDITOR — STAGING BUILD, NOT VERIFIED FOR LIVE DEPLOYMENT

This package changes the data source from Google Apps Script to three JSON files in GitHub:
content/results.json, content/news.json, content/honors.json.
It also adds .pages.yml for Pages CMS (https://pagescms.org).

IMPORTANT: Do not delete any existing repository files. Do not upload to the live branch until Pages CMS setup and the full website are tested on a staging branch. This package is a candidate build, not a verified live fix.

The supplied October 15 data includes only the two fixtures for which we have confirmed scores (F01-1, F01-3) and eight recorded individual PPRs. Other fixtures remain blank. Cricket MPRs are blank until entered; no values are invented. Google Sheets is NOT modified or deleted.

TO STAGE:
1. Create a staging branch in GitHub.
2. Upload these files, preserving the content/ folder and .pages.yml at the repository root.
3. Open the staging site and check all scores, standings, rankings, news, player portraits, and team profiles.
4. Configure Pages CMS for this GitHub repository. Verify its editor fields and permissions before relying on it.
5. Only after verification, merge the staging branch into the live branch.

NOTE: Pages CMS does not automatically write back to Google Sheets. Maintain the historical spreadsheet separately.
