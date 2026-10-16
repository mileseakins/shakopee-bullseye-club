/* v10: Do not overwrite team standings. Scoring is handled by sbc-scoring-update.js.
   Previous script incorrectly replaced Points with match W and refreshed every second. */
(()=>{'use strict';const original=window.receiveLeagueData;
if(typeof original==='function')window.receiveLeagueData=function(data){
const result=original(data);
if(data&&!data.error)requestAnimationFrame(()=>{
const el=document.getElementById('latest-results');
if(el&&typeof S!=='undefined'&&typeof rowsFor==='function'&&typeof computed==='function'){
const d=computed(),fixtures=S.schedule.filter(f=>String(f.Phase).toLowerCase()==='regular');
const scored=fixtures.filter(f=>rowsFor(f.FixtureID).length);
const date=(scored.length?scored:fixtures).map(f=>f.Date).sort().pop();
const group=fixtures.filter(f=>f.Date===date).slice(0,4);
const safe=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
el.innerHTML='<div class="sbc-score-head"><div><span class="eyebrow">FROM THE OCHE</span><h2>LATEST MATCH RESULTS</h2><p>'+safe(date)+'</p></div><a href="#schedule">FULL SCHEDULE & RESULTS ↗</a></div><div class="sbc-score-grid">'+group.map(f=>{const rows=rowsFor(f.FixtureID),h=rows.filter(r=>Number(r.HomeLegs)>Number(r.AwayLegs)).length,a=rows.filter(r=>Number(r.HomeLegs)<Number(r.AwayLegs)).length,done=['A','B','CRICKET'].every(k=>rows.some(r=>String(r.ContestType).toUpperCase()===k));return '<article class="sbc-score-tile"><div class="sbc-score-time">'+safe(f.Time)+' · '+safe(f.Lane)+(done?' · FINAL':'')+'</div><div class="sbc-score-row"><span>'+safe(d.teams[f.HomeTeamID]?.Name)+'</span><strong>'+(rows.length?h:'–')+'</strong></div><div class="sbc-score-row"><span>'+safe(d.teams[f.AwayTeamID]?.Name)+'</span><strong>'+(rows.length?a:'–')+'</strong></div></article>'}).join('')+'</div>';
}
});return result};
})();