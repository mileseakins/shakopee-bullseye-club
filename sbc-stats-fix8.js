/* SBC v9 - authoritative ranking/profile display, independent of script load order */
(()=>{
'use strict';
const ppr={'P03':63.015,'P15':63.085,'P16':50.84,'P04':43.19,'P05':59,'P13':50,'P06':45.155,'P14':39.965};
const cricket={'F01-1':[2.55,2.085],'F01-3':[1.96,1.46]};
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let busy=false;
function cleanProfile(){
 const root=document.getElementById('profile-detail');if(!root)return;
 root.querySelectorAll('.profile-stats>div,.profile-metrics>div').forEach(el=>{if(/cricket\s*mpr/i.test(el.textContent))el.remove()});
 root.querySelectorAll('.chart-title').forEach(el=>{if(/cricket\s*mpr/i.test(el.textContent)){let n=el.nextElementSibling;if(n&&(n.matches('svg')||n.classList.contains('chart-empty')))n.remove();el.remove()}});
}
function update(){
 if(busy||typeof S==='undefined'||!S.players?.length)return;
 busy=true;
 try{
 const d=typeof computed==='function'?computed():null;
 const playerMap=Object.fromEntries(S.players.map(p=>[p.ID,p]));
 const teamMap=Object.fromEntries(S.teams.map(t=>[t.ID,t]));
 const latest={};
 for(const r of S.weeklyStats||[]){const v=Number(r.PPR),w=Number(r.Week)||0;if(v>0&&(!latest[r.PlayerID]||w>=latest[r.PlayerID].w))latest[r.PlayerID]={w,v};}
 const rows=Object.entries({...ppr,...Object.fromEntries(Object.entries(latest).map(([k,v])=>[k,v.v]))}).filter(([id,v])=>playerMap[id]&&v>0).sort((a,b)=>b[1]-a[1]);
 for(const [id,v] of rows)playerMap[id].PPR=v;
 const ph=document.getElementById('five01-head'),pb=document.getElementById('five01-body');
 if(ph&&pb){
 const html=rows.map(([id,v],i)=>{const p=playerMap[id],r=d?.pr?.[id];return `<tr><td class="rank">${i+1}</td><td><button class="rank-person" data-player="${E(id)}">${E(p.Name)}</button></td><td>${v.toFixed(2)}</td><td>${r?.w??0}–${r?.l??0}</td><td>${E(teamMap[p.TeamID]?.Name||'')}</td></tr>`}).join('');
 if(pb.innerHTML!==html){ph.innerHTML='<tr><th>#</th><th>Player</th><th>PPR</th><th>Singles W–L</th><th>Team</th></tr>';pb.innerHTML=html||'<tr><td colspan="5">No rankings yet.</td></tr>';}
 }
 const totals={};for(const t of S.teams)totals[t.ID]={team:t,sum:0,count:0};
 const fixtures=Object.fromEntries(S.schedule.map(f=>[f.FixtureID,f]));
 for(const r of S.results){if(String(r.ContestType).toUpperCase()!=='CRICKET')continue;const f=fixtures[r.FixtureID];if(!f||String(f.Phase).toLowerCase()!=='regular')continue;for(const [id,key,i] of [[f.HomeTeamID,'HomeMPR',0],[f.AwayTeamID,'AwayMPR',1]]){const val=String(r[key]??'').trim(),v=val?Number(val):cricket[r.FixtureID]?.[i];if(totals[id]&&Number.isFinite(v)&&v>0){totals[id].sum+=v;totals[id].count++}}}
 const ranked=Object.values(totals).filter(x=>x.count).sort((a,b)=>b.sum/b.count-a.sum/a.count);
 const ch=document.getElementById('cricket-head'),cb=document.getElementById('cricket-body');
 if(ch&&cb){const html=ranked.map((x,i)=>`<tr><td class="rank">${i+1}</td><td><button class="sbc-team-link" data-team="${E(x.team.ID)}">${E(x.team.Name)} ›</button></td><td>${(x.sum/x.count).toFixed(2)}</td><td>${x.count}</td></tr>`).join('');if(cb.innerHTML!==html){ch.innerHTML='<tr><th>#</th><th>Team</th><th>Season MPR</th><th>Matches Recorded</th></tr>';cb.innerHTML=html||'<tr><td colspan="4">No team Cricket results yet.</td></tr>';}}
 const hint=document.querySelector('#cricket .hint');if(hint&&/Enter HomeMPR/.test(hint.textContent))hint.textContent='Highest regular-season team Cricket MPR wins the $20 Cricket prize.';
 
 // Standings use contest points: each A/B/Cricket win is one point.
 const standings=document.getElementById('team-body');
 const standingHead=document.getElementById('team-head');
 if(standings&&standingHead){
   const tt=Object.fromEntries(S.teams.map(t=>[t.ID,{...t,points:0,w:0,l:0,legs:0,against:0,played:0}]));
   const ff=Object.fromEntries(S.schedule.map(f=>[f.FixtureID,f]));
   const by={};
   for(const r of S.results){
     const f=ff[r.FixtureID],k=String(r.ContestType).toUpperCase(),h=Number(r.HomeLegs),a=Number(r.AwayLegs);
     if(!f||String(f.Phase).toLowerCase()!=='regular'||!['A','B','CRICKET'].includes(k)||![[2,0],[0,2],[2,1],[1,2]].some(([x,y])=>x===h&&y===a))continue;
     (by[f.FixtureID]??={})[k]=r;
     if(!tt[f.HomeTeamID]||!tt[f.AwayTeamID])continue;
     tt[f.HomeTeamID].legs+=h;tt[f.HomeTeamID].against+=a;
     tt[f.AwayTeamID].legs+=a;tt[f.AwayTeamID].against+=h;
     tt[h>a?f.HomeTeamID:f.AwayTeamID].points++;
   }
   for(const [id,rr] of Object.entries(by)){if(!['A','B','CRICKET'].every(k=>rr[k]))continue;const f=ff[id],h=tt[f.HomeTeamID],a=tt[f.AwayTeamID];if(!h||!a)continue;h.played++;a.played++;const hw=Object.values(rr).filter(r=>Number(r.HomeLegs)>Number(r.AwayLegs)).length;if(hw>=2){h.w++;a.l++}else{a.w++;h.l++}}
   const ts=Object.values(tt).sort((a,b)=>b.points-a.points||b.w-a.w||a.Name.localeCompare(b.Name));
   standingHead.innerHTML='<tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Points</th><th>Legs +/−</th><th>Win %</th></tr>';
   standings.innerHTML=ts.map((t,i)=>`<tr><td class="rank">${i+1}</td><td><button class="sbc-team-link" data-team="${E(t.ID)}">${E(t.Name)} ›</button></td><td>${t.w}</td><td>${t.l}</td><td><b>${t.points}</b></td><td>${t.legs} / ${t.against}</td><td>${t.played?(100*t.w/t.played).toFixed(1)+'%':'—'}</td></tr>`).join('');
 }
 cleanProfile();
 }catch(err){console.error('SBC stats v9:',err)}finally{busy=false;}
}
const original=window.receiveLeagueData;
if(typeof original==='function')window.receiveLeagueData=function(data){const r=original(data);queueMicrotask(update);return r};
document.addEventListener('click',e=>{if(e.target.closest('[data-player]'))setTimeout(cleanProfile,0)},true);
update();
})();
