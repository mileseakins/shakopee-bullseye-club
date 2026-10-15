/* SBC team profiles enhancement — works with existing app.js and Google Sheets data */
(()=>{
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\"':'&quot;'}[c]));
const get=id=>document.getElementById(id);
const value=x=>x!==''&&x!=null&&Number(x)>0?Number(x).toFixed(2):'—';
const matchRows=id=>rowsFor(id);
function openTeam(id){
 const d=computed(),t=d.teams[id];if(!t)return;
 const r=d.tr[id],roster=[t.PlayerAID,t.PlayerBID].map((pid,i)=>{
  const p=d.players[pid];if(!p)return '';
  const s=d.pr[pid];return `<button type="button" class="sbc-roster-person" data-player="${e(p.ID)}">${portrait(p)}<span class="sbc-roster-text"><strong>${e(p.Name)}</strong><small>${i?'B':'A'} PLAYER</small><span>501 PPR: ${value(p.PPR)} · Cricket MPR: ${value(p.MPR)}</span><span>501 singles: ${s.w}–${s.l}</span></span><span class="sbc-arrow">›</span></button>`;
 }).join('');
 const games=S.schedule.filter(f=>f.HomeTeamID===id||f.AwayTeamID===id).sort((a,b)=>String(a.Date).localeCompare(String(b.Date))||String(a.Time).localeCompare(String(b.Time)));
 function status(f){const rows=matchRows(f.FixtureID),complete=['A','B','CRICKET'].every(k=>rows.some(x=>String(x.ContestType).toUpperCase()===k));const won=rows.filter(x=>(Number(x.HomeLegs)>Number(x.AwayLegs))===(f.HomeTeamID===id)).length;return {complete,won,lost:rows.length-won,partial:rows.length>0}}
 const next=games.find(f=>!status(f).complete&&String(f.Date)>=new Date().toLocaleDateString('en-CA',{timeZone:'America/Chicago'}));
 const schedule=games.map(f=>{const other=d.teams[f.HomeTeamID===id?f.AwayTeamID:f.HomeTeamID];const s=status(f);const label=s.complete?`${s.won>s.lost?'W':'L'} ${s.won}–${s.lost}`:s.partial?'In progress':'Upcoming';return `<tr><td>${e(f.Date)}<small>${e(f.Time||'Time TBD')}</small></td><td>${e(other?.Name||'TBD')}<small>${e(f.Lane||'')}</small></td><td class="${s.complete?(s.won>s.lost?'sbc-win':'sbc-loss'):''}">${e(label)}</td></tr>`}).join('');
 const opponent=next?d.teams[next.HomeTeamID===id?next.AwayTeamID:next.HomeTeamID]:null;
 get('profile-detail').innerHTML=`<div class="eyebrow">TEAM PROFILE</div><h2>${e(t.Name)}</h2><div class="profile-stats"><div><strong>${r.w}–${r.l}</strong><small>CONTEST W–L</small></div><div><strong>${r.played?(100*r.w/r.played).toFixed(1)+'%':'—'}</strong><small>WIN PERCENTAGE</small></div></div>${next?`<div class="sbc-next"><strong>NEXT MATCH</strong><div>${e(next.Date)} · ${e(next.Time||'TBD')} · ${e(next.Lane||'')}</div><div>vs ${e(opponent?.Name||'TBD')}</div></div>`:''}<h3 class="subhead">Team roster & stats</h3><div class="sbc-roster">${roster}</div><h3 class="subhead">Full schedule & results</h3><div class="sbc-schedule-scroll"><table class="sbc-schedule"><thead><tr><th>Date / Time</th><th>Opponent</th><th>Result</th></tr></thead><tbody>${schedule||'<tr><td colspan="3">Schedule pending.</td></tr>'}</tbody></table></div>`;
 get('profile-dialog').showModal();
}
function enhance(){
 const body=get('team-body');if(body){const ids=Object.values(computed().tr).sort((a,b)=>b.w-a.w||(b.played?b.w/b.played:0)-(a.played?a.w/a.played:0)||(b.legs-b.against)-(a.legs-a.against)||b.legs-a.legs||a.Name.localeCompare(b.Name)).map(t=>t.ID);[...body.querySelectorAll('tr')].forEach((tr,i)=>{const cell=tr.cells[1],id=ids[i];if(!cell||!id||cell.querySelector('[data-team]'))return;const label=cell.textContent;cell.innerHTML=`<button type="button" class="sbc-team-link" data-team="${e(id)}"><span>${e(label)} <b aria-hidden="true">›</b></span><small>Roster · Stats · Schedule</small></button>`})}
 for(const id of ['team','cricket','five01','mvp-a','mvp-b']){const head=get(id+'-head');const section=head?.closest('section');if(!section||section.querySelector('.sbc-click-hint'))continue;const hint=document.createElement('p');hint.className='sbc-click-hint';hint.textContent=id==='team'?'↗ Tap a team for its roster, player stats, schedule and results.':'↗ Tap a player to view their full profile and stats.';section.querySelector('.table-wrap')?.before(hint)}
}
document.addEventListener('click',event=>{const team=event.target.closest('[data-team]');if(team){event.preventDefault();openTeam(team.dataset.team)}},true);
const originalRender=render;render=function(){originalRender();enhance()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
})();
