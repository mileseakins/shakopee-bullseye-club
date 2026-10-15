/* SBC live standings display sync, v20261015c.
   Keeps scoreboard, team standings, and MVP tables in sync with the live Sheet. */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n = v => Number(v) || 0;
  const pct = p => p.played ? (100 * p.w / p.played).toFixed(1) + '%' : '—';
  const name = p => p?.Name || 'Unknown';
  const clean = v => String(v ?? '').trim();
  let lastSignature = null;
  function sync() {
    if (typeof S === 'undefined' || typeof computed !== 'function' || !S.players?.length) return;
    const d = computed();
    const teams = Object.values(d.tr).sort((a,b) => b.w-a.w || (b.played ? b.w/b.played : 0)-(a.played ? a.w/a.played : 0) || (b.legs-b.against)-(a.legs-a.against) || b.legs-a.legs || name(a).localeCompare(name(b)));
    const tb = document.getElementById('team-body');
    if (tb) tb.innerHTML = teams.map((t,i) => `<tr><td class="rank">${i+1}</td><td><button type="button" class="sbc-team-link" data-team="${esc(t.ID)}"><span>${esc(name(t))} <b aria-hidden="true">›</b></span><small>Roster · Stats · Schedule</small></button></td><td>${t.w}</td><td>${t.l}</td><td>${pct(t)}</td><td>${t.legs} / ${t.against}</td><td><b>${t.w}</b></td></tr>`).join('');
    const players = Object.values(d.pr);
    for (const slot of ['A','B']) {
      const ranked = players.filter(p => clean(p.Slot).toUpperCase()===slot).sort((a,b) => b.w-a.w || b.legs-a.legs || (b.played ? b.w/b.played : 0)-(a.played ? a.w/a.played : 0) || name(a).localeCompare(name(b)));
      const body = document.getElementById(`mvp-${slot.toLowerCase()}-body`);
      if (!body) continue;
      body.innerHTML = ranked.map((p,i) => `<tr${i>=3?' hidden':''}><td class="rank">${i+1}</td><td><button class="rank-person" data-player="${esc(p.ID)}">${typeof portrait==='function'?portrait(p):''}<span>${esc(name(p))}</span></button></td><td><b>${p.w}</b></td><td>${p.w}–${p.l}</td><td>${p.legs}</td><td>${pct(p)}</td></tr>`).join('');
      const btn = document.querySelector(`#mvp-${slot.toLowerCase()} .sbc-full-ranking`);
      if (btn) btn.hidden = ranked.length <= 3;
    }
    const score = document.getElementById('latest-results');
    if (score && Array.isArray(S.schedule)) {
      const regular = S.schedule.filter(f => clean(f.Phase).toLowerCase()==='regular');
      const dates = [...new Set(regular.map(f=>clean(f.Date)))].sort();
      const scoredDate = [...dates].reverse().find(date => regular.some(f=>clean(f.Date)===date && rowsFor(f.FixtureID).length));
      const today = new Date().toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
      const date = scoredDate || dates.find(date=>date>=today) || dates[dates.length-1];
      const fixtures = regular.filter(f=>clean(f.Date)===date).slice(0,4);
      score.innerHTML = `<div class="sbc-score-head"><div><span class="eyebrow">FROM THE OCHE</span><h2>${scoredDate?'LATEST MATCH RESULTS':'UPCOMING MATCH NIGHT'}</h2><p>${esc(date||'Schedule coming soon')}</p></div><a href="#schedule">FULL SCHEDULE & RESULTS ↗</a></div><div class="sbc-score-grid">${fixtures.map(f=>{const rows=rowsFor(f.FixtureID);const home=rows.filter(r=>n(r.HomeLegs)>n(r.AwayLegs)).length;const away=rows.length-home;const final=['A','B','CRICKET'].every(k=>rows.some(r=>clean(r.ContestType).toUpperCase()===k));return `<article class="sbc-score-tile"><div class="sbc-score-time">${esc(f.Time||'Time TBD')} · ${esc(f.Lane||'')}${final?' · FINAL':rows.length?' · IN PROGRESS':''}</div><div class="sbc-score-row"><span>${esc(name(d.teams[f.HomeTeamID]))}</span><strong>${rows.length?home:'–'}</strong></div><div class="sbc-score-row"><span>${esc(name(d.teams[f.AwayTeamID]))}</span><strong>${rows.length?away:'–'}</strong></div></article>`}).join('')}</div>`;
    }
  }
  function check(force=false) {
    if (typeof S==='undefined') return;
    const signature=JSON.stringify([S.results,S.schedule?.length,S.players?.length]);
    if (force || signature!==lastSignature) {lastSignature=signature;sync();}
  }
  // The Google JSONP response is asynchronous; sync on receipt and guard against
  // render-order races in the existing visual enhancement scripts.
  const original=window.receiveLeagueData;
  if (typeof original==='function') window.receiveLeagueData=function(payload){original(payload);check(true);requestAnimationFrame(()=>check(true));};
  document.addEventListener('DOMContentLoaded',()=>check(true));
  check(true);
  setInterval(()=>check(),1000);
})();
