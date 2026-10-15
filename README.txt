SBC SUBSTITUTE SCORING FIX - OCTOBER 15, 2026

1. Upload sbc-substitute-fix.js to the ROOT of your GitHub repository.
2. Edit index.html. Immediately AFTER the existing script tag loading
   sbc-scoring-update.js, add:
   <script src="sbc-substitute-fix.js?v=20261015"></script>
3. Commit both changes and reload your site (hard refresh if necessary).

This prevents Heang Pao (P09) from being credited with Allex Ege's
501 singles result in fixture F01-4. Team 5's contest results still count.
The public schedule/roster still shows Heang.

The existing site does not have a public substitute profile for Allex.
Allex's PPR/MPR can be recorded using SUB-ALLEX in Weekly Stats, but
the current website does not display substitute-only rankings.
Future substitutes require the JSONP Apps Script feed to include
the Substitutions tab; until then this patch handles the known Week 1 sub.

This ZIP does not automatically install itself to GitHub.
