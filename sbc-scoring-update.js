/* SBC scoring and rankings update — 2026-10-15 */
(() => {
 'use strict';
 const txt=v=>String(v??'').trim();
 const html=v=>txt(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const numeric=v=>Number(v)||0;
 const eligible=r=>txt(r.HomeLegs)!==''&&txt(r.AwayLegs)!==''&&[[2,0],[2,1],[0,2],[1,2]].some(([a,b])=>a===numeric(r.HomeLegs)&&b===numeric(r.AwayLegs));
 const originalComputed=window.computed;
 window.computed=function(){
   const d=originalComputed();
   const teamIds=Object.keys(d.tr);
   for(const id of teamIds){Object.assign(d.tr[id],{w:0,l:0,played:0,points:0,legs:0,against:0});}
   const fixtures=S.schedule.filter(f=>txt(f.Phase).toLowerCase()==='regular');
   for(const f of fixtures){
     const h=d.tr[f.HomeTeamID],a=d.tr[f.AwayTeamID];if(!h||!a)continue;
     const contests=['A','B','CRICKET'].map(type=>S.results.find(r=>txt(r.FixtureID)===txt(f.FixtureID)&&txt(r.ContestType).toUpperCase()===type&&eligible(r)));
     let hp=0,ap=0,hl=0,al=0;
     for(const r of contests){if(!r)continue;const x=numeric(r.HomeLegs),y=numeric(r.AwayLegs);hl+=x;al+=y;if(x>y)hp++;else ap++;}
     // Contest points and leg totals accumulate even while a fixture is in progress.
     h.points+=hp;a.points+=ap;h.legs+=hl;h.against+=al;a.legs+=al;a.against+=hl;
     // Match W/L is final only after A, B and Cricket have all been recorded.
     if(contests.every(Boolean)) {h.played++;a.played++;if(hp>ap){h.w++;a.l++;}else if(ap>hp){a.w++;h.l++;}}
   }
   return d;
 };
 const rate=p=>p.played?(100*p.w/p.played).toFixed(1)+'%':'—';
 const rankPerson=p=>`<button class="rank-person" data-player="${html(p.ID)}">${portrait(p)}<span>${html(p.Name)}</span></button>`;
 function paint(){
   const d=window.computed();
   const th=document.getElementById('team-head'),tb=document.getElementById('team-body');
   if(th&&tb){
     th.innerHTML='<tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Points</th><th>Legs +/−</th><th>Win %</th></tr>';
     const ts=Object.values(d.tr).sort((a,b)=>b.w-a.w||b.points-a.points||(b.legs-b.against)-(a.legs-a.against)||b.legs-a.legs||txt(a.Name).localeCompare(txt(b.Name)));
     tb.innerHTML=ts.map((t,i)=>`<tr><td class="rank">${i+1}</td><td><button type="button" class="sbc-team-link" data-team="${html(t.ID)}"><span>${html(t.Name)} <b aria-hidden="true">›</b></span><small>Roster · Stats · Schedule</small></button></td><td>${t.w}</td><td>${t.l}</td><td><b>${t.points}</b></td><td>${t.legs} / ${t.against}</td><td>${rate(t)}</td></tr>`).join('');
   }
   for(const [id,field] of [['five01','PPR'],['cricket','MPR']]){
     const head=document.getElementById(id+'-head'),body=document.getElementById(id+'-body');if(!head||!body)continue;
     head.innerHTML=`<tr><th>#</th><th>Player</th><th>${field}</th><th>Singles W–L</th><th>Team</th></tr>`;
     const ranked=Object.values(d.pr).filter(p=>txt(p[field])!==''&&Number(p[field])>0).sort((a,b)=>Number(b[field])-Number(a[field])||b.w-a.w||txt(a.Name).localeCompare(txt(b.Name)));
     body.innerHTML=ranked.map((p,i)=>`<tr${i>=3?' hidden':''}><td class="rank">${i+1}</td><td>${rankPerson(p)}</td><td>${Number(p[field]).toFixed(2)}</td><td>${p.w}–${p.l}</td><td>${html(d.teams[p.TeamID]?.Name||'')}</td></tr>`).join('')||'<tr><td colspan="5">No rankings yet.</td></tr>';
     const button=document.querySelector('#'+id+' .sbc-full-ranking');if(button){button.hidden=ranked.length<=3;}
   }
 }
 const original=window.receiveLeagueData;
 if(typeof original==='function')window.receiveLeagueData=function(payload){original(payload);if(payload&&!payload.error){paint();requestAnimationFrame(paint);}};
 // The existing redesign and score sync scripts are already initialized at this point.
 if(typeof render==='function'){render();paint();}
})();
