/* SBC live result normalization: 501_A / 501_B -> A / B for all legacy renderers. */
(() => {
  'use strict';
  function sync() {
    if (typeof S === 'undefined') return;
    for (const r of (S.results || [])) {
      const type = String(r.ContestType || '').trim().toUpperCase();
      if (type === '501_A') r.ContestType = 'A';
      if (type === '501_B') r.ContestType = 'B';
    }
    // Weekly Stats is the source of the current player 501 ratings.
    const byPlayer = new Map();
    for (const r of (S.weeklyStats || [])) {
      const pid = String(r.PlayerID || '').trim();
      const ppr = Number(r.PPR);
      const week = Number(r.Week) || 0;
      if (!pid || !Number.isFinite(ppr) || ppr <= 0) continue;
      const previous = byPlayer.get(pid);
      if (!previous || week >= previous.week) byPlayer.set(pid, { week, ppr });
    }
    for (const p of (S.players || [])) {
      const latest = byPlayer.get(String(p.ID || '').trim());
      if (latest) p.PPR = latest.ppr;
    }
  }
  function repaint() {
    sync();
    if (typeof render === 'function') render();
    if (typeof showFixtures === 'function') showFixtures();
  }
  const original = window.receiveLeagueData;
  if (typeof original === 'function') {
    window.receiveLeagueData = function(payload) {
      original(payload);
      if (payload && !payload.error) {
        repaint();
        requestAnimationFrame(repaint);
      }
    };
  }
  repaint();
})();
