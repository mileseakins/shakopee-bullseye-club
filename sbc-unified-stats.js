/* SBC unified live stats — 2026-10-16. Reads live Google Sheets only. */
(()=>{
'use strict';
const str=v=>String(v??'').trim();
const esc=v=>str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const n=v=>Number(v)||0;
const type=v=>({'501_A':'A','501_B':'B'}[str(v).toUpperCase()]||str(v).toUpperCase());
const valid=r=>[[2,0],[2,1],[0,2],[1,2]].some(([a,b])=>n(r.HomeLegs)===a&&n(r.AwayLegs)===b&&str(r.HomeLegs)!==''&&str(r.AwayLegs)!=='');
const get=id=>document.getElementById(id);
function normalize(p){
 if(!p||p.error)return p;
 for(const r of p.results||[])r.ContestType=type(r.ContestType);
 const latest=new Map();for(const r of p.weeklyStats||[]){const id=str(r.PlayerID),ppr=Number(r.PPR),week=n(r.Week);if(id&&ppr>0&&(!latest.has(id)||week>=latest.get(id).week))latest.set(id,{ppr,week});}
 for(const p of p.players||[]){const x=latest.get(str(p.ID));if(x)p.PPR=x.ppr;}
 return p;
}
function cricketStats(){const map={};for(const t of S.teams)map[t.ID]={sum:0,count:0};const fixtures=Object.fromEntries(S.schedule.filter(f=>str(f.Phase).toLowerCase()==='regular').map(f=>[f.FixtureID,f]));
 for(const r of S.results){if(type(r.ContestType)!=='CRICKET'||!valid(r))continue;const f=fixtures[r.FixtureID];if(!f)continue;for(const [id,key] of [[f.HomeTeamID,'HomeMPR'],[f.AwayTeamID,'AwayMPR']]){const v=Number(r[key]);if(str(r[key])!==''&&Number.isFinite(v)&&v>0&&map[id]){map[id].sum+=v;map[id].count++;}}}return map;}
function paint(){if(typeof S==='undefined'||!S.teams.length)return;
 const d=computed(),fx=Object.fromEntries(S.schedule.map(f=>[f.FixtureID,f]));
 // Standings: three available points per completed fixture, one for each contest.
 const ts={};for(const t of S.teams)ts[t.ID]={...t,points:0,w:0,l:0,played:0,legs:0,against:0};
 for(const f of S.schedule.filter(f=>str(f.Phase).toLowerCase()==='regular')){const h=ts[f.HomeTeamID],a=ts[f.AwayTeamID];if(!h||!a)continue;const contests=['A','B','CRICKET'].map(k=>S.results.find(r=>str(r.FixtureID)===str(f.FixtureID)&&type(r.ContestType)===k&&valid(r)));let hp=0,ap=0;
 for(const r of contests){if(!r)continue;const hl=n(r.HomeLegs),al=n(r.AwayLegs);h.legs+=hl;h.against+=al;a.legs+=al;a.against+=hl;if(hl>al)hp++;else ap++;}
 h.points+=hp;a.points+=ap;if(contests.every(Boolean)){h.played++;a.played++;if(hp>ap){h.w++;a.l++;}else{a.w++;h.l++;}}}
 const teams=Object.values(ts).sort((a,b)=>b.points-a.points||b.w-a.w||(b.legs-b.against)-(a.legs-a.against)||a.Name.localeCompare(b.Name));
 const th=get('team-head'),tb=get('team-body');if(th&&tb){th.innerHTML='<tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Points</th><th>Legs +/−</th><th>Win %</th></tr>';tb.innerHTML=teams.map((t,i)=>`<tr><td class="rank">${i+1}</td><td><button type="button" class="sbc-team-link" data-team="${esc(t.ID)}">${esc(t.Name)} ›</button></td><td>${t.w}</td><td>${t.l}</td><td><b>${t.points}</b></td><td>${t.legs} / ${t.against}</td><td>${t.played?(100*t.w/t.played).toFixed(1)+'%':'—'}</td></tr>`).join('');}
 // Singles records are calculated from actual results, not from team Cricket legs.
 const pr={};for(const p of S.players)pr[p.ID]={...p,w:0,l:0,legs:0,against:0,played:0};
 for(const r of S.results){if(!valid(r)||!['A','B'].includes(type(r.ContestType)))continue;const f=fx[r.FixtureID];if(!f||str(f.Phase).toLowerCase()!=='regular')continue;const h=d.teams[f.HomeTeamID],a=d.teams[f.AwayTeamID];if(!h||!a)continue;const slot=type(r.ContestType),hid=slot==='A'?h.PlayerAID:h.PlayerBID,aid=slot==='A'?a.PlayerAID:a.PlayerBID;
 // A substitute's legs do not count toward the absent regular player's MVP record.
 for(const [id,forLegs,againstLegs] of [[hid,n(r.HomeLegs),n(r.AwayLegs)],[aid,n(r.AwayLegs),n(r.HomeLegs)]]){const p=pr[id];if(!p)continue;const substitutions=(S.substitutions?.length?S.substitutions:[{FixtureID:'F01-4',RegularPlayerID:'P09',ActualPlayerID:'SUB-ALLEX'}]);const substituted=substitutions.some(s=>str(s.FixtureID)===str(r.FixtureID)&&str(s.RegularPlayerID)===str(id));if(substituted)continue;p.played++;p.w+=Number(forLegs>againstLegs);p.l+=Number(forLegs<againstLegs);p.legs+=forLegs;p.against+=againstLegs;}}
 const latest=new Map();for(const r of S.weeklyStats){const id=str(r.PlayerID),v=Number(r.PPR),week=n(r.Week);if(id&&v>0&&(!latest.has(id)||week>=latest.get(id).week))latest.set(id,{v,week});}
 const ranked=Object.values(pr).map(p=>({...p,PPR:latest.get(p.ID)?.v||Number(p.PPR)||0})).filter(p=>p.PPR>0).sort((a,b)=>b.PPR-a.PPR||a.Name.localeCompare(b.Name));
 const ph=get('five01-head'),pb=get('five01-body');if(ph&&pb){ph.innerHTML='<tr><th>#</th><th>Player</th><th>PPR</th><th>Singles W–L</th><th>Team</th></tr>';pb.innerHTML=ranked.map((p,i)=>`<tr${i>=3?' hidden':''}><td class="rank">${i+1}</td><td><button class="rank-person" data-player="${esc(p.ID)}">${portrait(p)}<span>${esc(p.Name)}</span></button></td><td>${p.PPR.toFixed(2)}</td><td>${p.w}–${p.l}</td><td>${esc(d.teams[p.TeamID]?.Name||'')}</td></tr>`).join('')||'<tr><td colspan="5">No rankings yet.</td></tr>';}
 for(const slot of ['A','B']){const id='mvp-'+slot.toLowerCase(),head=get(id+'-head'),body=get(id+'-body');if(!head||!body)continue;const players=Object.values(pr).filter(p=>str(p.Slot).toUpperCase()===slot).sort((a,b)=>b.w-a.w||b.legs-a.legs||a.Name.localeCompare(b.Name));head.innerHTML='<tr><th>#</th><th>Player</th><th>MVP Pts</th><th>W–L</th><th>Legs Won</th><th>Legs Lost</th><th>Win %</th></tr>';body.innerHTML=players.map((p,i)=>`<tr${i>=3?' hidden':''}><td class="rank">${i+1}</td><td><button class="rank-person" data-player="${esc(p.ID)}">${portrait(p)}<span>${esc(p.Name)}</span></button></td><td><b>${p.w}</b></td><td>${p.w}–${p.l}</td><td>${p.legs}</td><td>${p.against}</td><td>${p.played?(100*p.w/p.played).toFixed(1)+'%':'—'}</td></tr>`).join('');}
 // Refresh compact/full ranking controls from the final authoritative tables.
 for(const id of ['five01','mvp-a','mvp-b']){const section=get(id),body=get(id+'-body'),table=section?.querySelector('table');if(!section||!body||!table)continue;const count=body.querySelectorAll('tr .rank-person').length;let btn=section.querySelector('.sbc-full-ranking');if(!btn){btn=document.createElement('button');btn.type='button';btn.className='sbc-full-ranking';table.closest('.table-wrap')?.after(btn);}btn.hidden=count<=3;btn.textContent='VIEW FULL '+(id==='five01'?'501 RANKINGS':id==='mvp-a'?'A GROUP MVP':'B GROUP MVP')+' ↗';btn.onclick=()=>{const dlg=get('rankings-dialog'),full=get('rankings-full');if(!dlg||!full)return;full.innerHTML='<h2>'+esc(id==='five01'?'501 RANKINGS':id==='mvp-a'?'A GROUP MVP':'B GROUP MVP')+'</h2>';const wrap=document.createElement('div');wrap.className='table-wrap';const copy=table.cloneNode(true);copy.querySelectorAll('tr[hidden]').forEach(r=>r.hidden=false);wrap.append(copy);full.append(wrap);dlg.showModal();};}
 const cricket=get('cricket');if(cricket)cricket.hidden=true;document.querySelectorAll('a[href="#cricket"]').forEach(a=>a.hidden=true);
}
const previous=window.receiveLeagueData;window.receiveLeagueData=function(payload){if(!payload||payload.error)return previous(payload);normalize(payload);const result=previous(payload);paint();requestAnimationFrame(paint);return result;};
// Keep the existing team profile behavior; insert team Cricket MPR into its profile summary.
document.addEventListener('click',event=>{const button=event.target.closest('[data-team]');if(!button)return;requestAnimationFrame(()=>{const detail=get('profile-detail');if(!detail||!get('profile-dialog')?.open)return;const stats=cricketStats()[button.dataset.team],mpr=stats?.count?(stats.sum/stats.count).toFixed(2):'—';const summary=detail.querySelector('.profile-stats');if(summary&&!summary.querySelector('.sbc-team-mpr'))summary.insertAdjacentHTML('beforeend',`<div class="sbc-team-mpr"><strong>${mpr}</strong><small>TEAM CRICKET MPR</small></div>`);});},false);
if(typeof S!=='undefined'&&S.players.length)paint();
})();
