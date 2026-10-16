/* Shakopee Bullseye Club: team-only Cricket MPR */
(function(){
'use strict';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=v=>{const n=Number(v);return String(v??'').trim()!==''&&Number.isFinite(n)&&n>0?n:null};
function paint(){
 if(typeof S==='undefined'||typeof computed!=='function')return;
 const d=computed(), totals={};
 for(const t of S.teams)totals[t.ID]={team:t,sum:0,count:0,w:0,l:0};
 const fixtures=Object.fromEntries(S.schedule.filter(f=>String(f.Phase).toLowerCase()==='regular').map(f=>[f.FixtureID,f]));
 for(const r of S.results){
   if(String(r.ContestType).toUpperCase()!=='CRICKET')continue;
   const f=fixtures[r.FixtureID];if(!f)continue;
   for(const [id,key] of [[f.HomeTeamID,'HomeMPR'],[f.AwayTeamID,'AwayMPR']]){
     const v=number(r[key]);if(totals[id]&&v!==null){totals[id].sum+=v;totals[id].count++}
   }
 }
 const ranked=Object.values(totals).filter(x=>x.count).map(x=>({...x,mpr:x.sum/x.count})).sort((a,b)=>b.mpr-a.mpr||b.count-a.count||String(a.team.Name).localeCompare(String(b.team.Name)));
 const head=document.getElementById('cricket-head'),body=document.getElementById('cricket-body');
 if(head&&body){
  head.innerHTML='<tr><th>#</th><th>Team</th><th>Season MPR</th><th>Matches Recorded</th></tr>';
  body.innerHTML=ranked.map((x,i)=>`<tr><td class="rank">${i+1}</td><td><button type="button" class="sbc-team-link" data-team="${safe(x.team.ID)}">${safe(x.team.Name)} ›</button></td><td><b>${x.mpr.toFixed(2)}</b></td><td>${x.count}</td></tr>`).join('')||'<tr><td colspan="4">Team MPR appears after Cricket scores are entered.</td></tr>';
  const section=head.closest('section');if(section){
    const eyebrow=section.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='TEAM PERFORMANCE';
    const h2=section.querySelector('h2');if(h2)h2.innerHTML='TEAM CRICKET <span>MPR</span>';
    const hint=section.querySelector('.hint');if(hint)hint.textContent='Highest regular-season team Cricket MPR wins the $20 Cricket prize. Enter HomeMPR and AwayMPR on each Cricket result.';
    const clickHint=section.querySelector('.sbc-click-hint');if(clickHint)clickHint.textContent='↗ Tap a team to view its roster, schedule and results.';
  }
 }
 // Remove individual Cricket ratings from player profiles, including weekly charts.
 const dialog=document.getElementById('profile-detail');
 if(dialog){
   dialog.querySelectorAll('.profile-stats > div, .profile-metrics > div').forEach(el=>{if(/CRICKET MPR/i.test(el.textContent))el.remove()});
   dialog.querySelectorAll('.chart-title').forEach(el=>{if(/Cricket MPR/i.test(el.textContent)){const next=el.nextElementSibling; if(next&&(next.matches('svg')||next.classList.contains('chart-empty')))next.remove();el.remove()}});
 }
 // Weekly awards must not rank individuals on Cricket MPR.
 const performers=document.getElementById('performer-grid');
 if(performers)performers.querySelectorAll('.performer-card').forEach(el=>{if(/Cricket King|Biggest Improvement|MPR gain/i.test(el.textContent))el.remove()});
 // Remove obsolete individual power ranking references if rendered.
 document.querySelectorAll('#power-rankings [data-mpr], #individual-power-rankings [data-mpr]').forEach(el=>el.remove());
}
const rerender=()=>{paint();requestAnimationFrame(paint)};
const original=window.receiveLeagueData;
if(typeof original==='function')window.receiveLeagueData=function(payload){original(payload);if(payload&&!payload.error)rerender()};
document.addEventListener('click',e=>{if(e.target.closest('[data-player],[data-team]'))setTimeout(paint,0)},true);
document.addEventListener('DOMContentLoaded',rerender);
rerender();
})();
