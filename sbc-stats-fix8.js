/* SBC v10: four focused fixes, based on the verified Google Sheet */
(()=>{
'use strict';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C=s=>String(s??'').trim(), N=x=>Number(x)||0;
const knownCricket={'F01-1':[2.55,2.085],'F01-3':[1.96,1.46]};
const verifiedPPR={'P03':63.015,'P15':63.085,'P16':50.84,'P04':43.19,'P05':59,'P13':50,'P06':45.155,'P14':39.965};
let drawing=false;
function normalize(){
 for(const r of S.results||[]){if(C(r.ContestType).toUpperCase()==='501_A')r.ContestType='A';if(C(r.ContestType).toUpperCase()==='501_B')r.ContestType='B'}
}
function scores(){
 const teams=Object.fromEntries(S.teams.map(t=>[t.ID,{...t,points:0,w:0,l:0,played:0,legs:0,against:0}]));
 const fixtures=Object.fromEntries(S.schedule.map(f=>[f.FixtureID,f]));
 const byFixture={};
 for(const r of S.results){const f=fixtures[C(r.FixtureID)],type=C(r.ContestType).toUpperCase();if(!f||C(f.Phase).toLowerCase()!=='regular'||!['A','B','CRICKET'].includes(type)||![[2,0],[0,2],[2,1],[1,2]].some(([a,b])=>a===N(r.HomeLegs)&&b===N(r.AwayLegs)))continue;
 (byFixture[f.FixtureID]??={})[type]=r;
 const h=teams[f.HomeTeamID],a=teams[f.AwayTeamID];if(!h||!a)continue;
 h.legs+=N(r.HomeLegs);h.against+=N(r.AwayLegs);a.legs+=N(r.AwayLegs);a.against+=N(r.HomeLegs);
 if(N(r.HomeLegs)>N(r.AwayLegs))h.points++;else a.points++;
 }
 for(const [id,contests] of Object.entries(byFixture)){if(!['A','B','CRICKET'].every(k=>contests[k]))continue;const f=fixtures[id],h=teams[f.HomeTeamID],a=teams[f.AwayTeamID];if(!h||!a)continue;h.played++;a.played++;if(Object.values(contests).filter(r=>N(r.HomeLegs)>N(r.AwayLegs)).length>=2){h.w++;a.l++}else{a.w++;h.l++}}
 return teams;
}
function patch(){
 if(drawing||typeof S==='undefined'||!S.players?.length)return;drawing=true;
 try{
 normalize();
 const teams=scores(),players=Object.fromEntries(S.players.map(p=>[p.ID,p]));
 const d=typeof computed==='function'?computed():null;
 // Standings: one point per winning contest, 3 possible per fixture.
 const tb=document.getElementById('team-body'),th=document.getElementById('team-head');
 if(tb&&th){const ranked=Object.values(teams).sort((a,b)=>b.points-a.points||b.w-a.w||(b.legs-b.against)-(a.legs-a.against)||C(a.Name).localeCompare(C(b.Name)));
 th.innerHTML='<tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Points</th><th>Legs +/−</th><th>Win %</th></tr>';
 tb.innerHTML=ranked.map((t,i)=>`<tr><td class="rank">${i+1}</td><td><button class="sbc-team-link" data-team="${E(t.ID)}">${E(t.Name)} ›</button></td><td>${t.w}</td><td>${t.l}</td><td><b>${t.points}</b></td><td>${t.legs} / ${t.against}</td><td>${t.played?(100*t.w/t.played).toFixed(1)+'%':'—'}</td></tr>`).join('');
 }
 // Completed schedule: each 501 contest and Cricket appear separately.
 const card=window.fixtureCard;
 if(typeof card==='function'&&!card._sbc10){
 const newCard=function(f){const rows=(S.results||[]).filter(r=>C(r.FixtureID)===C(f.FixtureID)),types=['A','B','CRICKET'],complete=types.every(k=>rows.some(r=>C(r.ContestType).toUpperCase()===k)),h=rows.filter(r=>N(r.HomeLegs)>N(r.AwayLegs)).length,a=rows.filter(r=>N(r.HomeLegs)<N(r.AwayLegs)).length;
 const home=S.teams.find(t=>t.ID===f.HomeTeamID),away=S.teams.find(t=>t.ID===f.AwayTeamID);
 return `<article class="fixture"><div class="fixture-top"><span>${E(f.Date)} · ${E(f.Time||'Time TBD')} · ${E(f.Lane||'')}</span><span>${complete?'FINAL':E(f.Status||'Scheduled')}</span></div><h3>${E(home?.Name||'TBD')} <span style="color:#ef404b">VS</span> ${E(away?.Name||'TBD')}</h3>${types.map(k=>{const r=rows.find(x=>C(x.ContestType).toUpperCase()===k);return `<div class="scoreline"><span>${k==='CRICKET'?'Team Cricket':k+' Singles 501'}</span><b>${r?N(r.HomeLegs)+' – '+N(r.AwayLegs):'—'}</b></div>`}).join('')}${complete?`<div class="scoreline"><b>CONTEST POINTS</b><b>${h} – ${a}</b></div>`:''}</article>`};
 newCard._sbc10=true;window.fixtureCard=newCard;
 }
 if(typeof showFixtures==='function')showFixtures();
 // PPR from Weekly Stats (with confirmed Week 1 data as fallback).
 const latest={};for(const r of S.weeklyStats||[]){const id=C(r.PlayerID),v=Number(r.PPR),w=N(r.Week);if(id&&v>0&&(!latest[id]||w>=latest[id].w))latest[id]={v,w}}
 const values={...verifiedPPR};for(const [id,x] of Object.entries(latest))values[id]=x.v;
 const ranked=Object.entries(values).filter(([id,v])=>players[id]&&v>0).sort((a,b)=>b[1]-a[1]);
 for(const [id,v] of ranked)players[id].PPR=v;
 const ph=document.getElementById('five01-head'),pb=document.getElementById('five01-body');
 if(ph&&pb){ph.innerHTML='<tr><th>#</th><th>Player</th><th>PPR</th><th>Singles W–L</th><th>Team</th></tr>';pb.innerHTML=ranked.map(([id,v],i)=>{const p=players[id],r=d?.pr?.[id];return `<tr${i>=3?' hidden':''}><td class="rank">${i+1}</td><td><button class="rank-person" data-player="${E(id)}">${typeof portrait==='function'?portrait(p):''}<span>${E(p.Name)}</span></button></td><td>${v.toFixed(2)}</td><td>${r?.w??0}–${r?.l??0}</td><td>${E(teams[p.TeamID]?.Name||'')}</td></tr>`}).join('')||'<tr><td colspan="5">No rankings yet.</td></tr>';const more=document.querySelector('#five01 .sbc-full-ranking');if(more)more.hidden=ranked.length<=3;}
 // Cricket averages: prefer Sheets, fallback for the two verified Week 1 fixtures.
 const sums={};for(const t of S.teams)sums[t.ID]={team:t,sum:0,count:0};
 const fixtures=Object.fromEntries(S.schedule.map(f=>[f.FixtureID,f]));
 for(const r of S.results){if(C(r.ContestType).toUpperCase()!=='CRICKET')continue;const f=fixtures[r.FixtureID];if(!f||C(f.Phase).toLowerCase()!=='regular')continue;for(const [id,key,i] of [[f.HomeTeamID,'HomeMPR',0],[f.AwayTeamID,'AwayMPR',1]]){const raw=C(r[key]),v=raw?Number(raw):knownCricket[r.FixtureID]?.[i];if(sums[id]&&Number.isFinite(v)&&v>0){sums[id].sum+=v;sums[id].count++}}}
 const cr=Object.values(sums).filter(x=>x.count).sort((a,b)=>b.sum/b.count-a.sum/a.count);
 const ch=document.getElementById('cricket-head'),cb=document.getElementById('cricket-body');
 if(ch&&cb){ch.innerHTML='<tr><th>#</th><th>Team</th><th>Season MPR</th><th>Matches Recorded</th></tr>';cb.innerHTML=cr.map((x,i)=>`<tr><td class="rank">${i+1}</td><td><button class="sbc-team-link" data-team="${E(x.team.ID)}">${E(x.team.Name)} ›</button></td><td>${(x.sum/x.count).toFixed(2)}</td><td>${x.count}</td></tr>`).join('')||'<tr><td colspan="4">No team Cricket MPR recorded yet.</td></tr>';}
 const hint=document.querySelector('#cricket .hint');if(hint)hint.textContent='Highest regular-season team Cricket MPR wins the $20 Cricket prize.';
 // Remove individual Cricket MPR from player profiles.
 const profile=document.getElementById('profile-detail');
 if(profile){profile.querySelectorAll('.profile-stats>div,.profile-metrics>div').forEach(el=>{if(/cricket\s*mpr/i.test(el.textContent))el.remove()});profile.querySelectorAll('.chart-title').forEach(el=>{if(/cricket\s*mpr/i.test(el.textContent)){const next=el.nextElementSibling;if(next&&(next.matches('svg')||next.classList.contains('chart-empty')))next.remove();el.remove()}})}
 }catch(err){console.error('SBC v10:',err)}finally{drawing=false}
}
const oldReceive=window.receiveLeagueData;
if(typeof oldReceive==='function')window.receiveLeagueData=function(data){if(data&&!data.error){for(const r of data.results||[]){if(r.ContestType==='501_A')r.ContestType='A';if(r.ContestType==='501_B')r.ContestType='B'}}const result=oldReceive(data);if(data&&!data.error){patch();requestAnimationFrame(patch)}return result};
const oldRender=window.render;if(typeof oldRender==='function')window.render=function(...args){const result=oldRender.apply(this,args);patch();return result};
document.addEventListener('click',e=>{if(e.target.closest('[data-player]'))setTimeout(patch,0)},true);
patch();
})();
