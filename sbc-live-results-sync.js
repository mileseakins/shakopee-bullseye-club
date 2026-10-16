/* Normalize live contest names BEFORE legacy renderers receive data. */
(() => {
  'use strict';
  function normalize(payload) {
    if (!payload || payload.error) return payload;
    for (const r of (payload.results || [])) {
      const type = String(r.ContestType || '').trim().toUpperCase();
      if (type === '501_A') r.ContestType = 'A';
      else if (type === '501_B') r.ContestType = 'B';
    }
    const byPlayer = new Map();
    for (const row of (payload.weeklyStats || [])) {
      const id = String(row.PlayerID || '').trim();
      const ppr = Number(row.PPR), week = Number(row.Week) || 0;
      if (!id || !Number.isFinite(ppr) || ppr <= 0) continue;
      const old = byPlayer.get(id);
      if (!old || week >= old.week) byPlayer.set(id, {week,ppr});
    }
    for (const p of (payload.players || [])) {
      const latest = byPlayer.get(String(p.ID || '').trim());
      if (latest) p.PPR = latest.ppr;
    }
    return payload;
  }
  const original = window.receiveLeagueData;
  if (typeof original === 'function') {
    window.receiveLeagueData = function(payload) {
      return original(normalize(payload));
    };
  }
  // Starter data is only a fallback, but keep its contest names consistent too.
  if (typeof S !== 'undefined') normalize({results:S.results,weeklyStats:S.weeklyStats,players:S.players});
})();
