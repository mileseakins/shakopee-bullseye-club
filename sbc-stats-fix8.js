/* SBC stats fix 8: use weekly PPR and team-only Cricket MPR */
(()=>{
const txt=x=>String(x??'').trim();
const esc=x=>txt(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fallback={'F01-1':[2.55,2.085],'F01-3':[1.96,1.46]};
function paint(){
 if(typeof S==='undefined'||!S.players?.length)return;
 const latest={};
 for(const r of S.weeklyStats||[]){const id=txt(r.PlayerID),v=Number(r.PPR),w=Number(r.Week)||0;if(id&&v>0&&(!latest[id]||w>=latest[id].w))latest[id]={w,v};}
 for(const p of S.players){if(latest[p.ID])p.PPR=latest[p.ID].v;}
 const d=computed();const ph=document.getElementById('five01-head'),pb=document.getElementById('five01-body');
 if(ph&&pb){const ps=Object.values(d.pr).map(p=>({...p,PPR:latest[p.ID]?.v||Number(p.PPR)||0})).filter(p=>p.PPR>0).sort((a,b)=>b.PPR-a.PPR);ph.innerHTML='<tr><th>#</th><th>Player</th><th>PPR</th><th>Singles W–L</th><th>Team</th></tr>';pb.innerHTML=ps.map((p,i)=>`<tr${i>=3?' hidden':''}><td class="rank">${i+1}</td><td><button class="rank-person" data-player="${esc(p.ID)}">${portrait(p)}<span>${esc(p.Name)}</span></button></td><td>${p.PPR.toFixed(2)}</td><td>${p.w}–${p.l}</td><td>${esc(d.teams[p.TeamID]?.Name||'')}</td></tr>`).join('')||'<tr><td colspan="5">No rankings yet.</td></tr>';const b=document.querySelector('#five01 .sbc-full-ranking');if(b)b.hidden=ps.length<=3;}
 const sums={};for(const t of S.teams)sums[t.ID]={t,sum:0,count:0};const fixtures=Object.fromEntries(S.schedule.map(f=>[f.FixtureID,f]));
 for(const r of S.results){if(txt(r.ContestType).toUpperCase()!=='CRICKET')continue;const f=fixtures[r.FixtureID];if(!f||txt(f.Phase).toLowerCase()!=='regular')continue;for(const [id,key,i] of [[f.HomeTeamID,'HomeMPR',0],[f.AwayTeamID,'AwayMPR',1]]){const entered=txt(r[key]),v=entered?Number(entered):fallback[r.FixtureID]?.[i];if(sums[id]&&Number.isFinite(v)&&v>0){sums[id].sum+=v;sums[id].count++;}}}
 const ch=document.getElementById('cricket-head'),cb=document.getElementById('cricket-body');if(ch&&cb){const ts=Object.values(sums).filter(x=>x.count).sort((a,b)=>b.sum/b.count-a.sum/a.count);ch.innerHTML='<tr><th>#</th><th>Team</th><th>Season MPR</th><th>Matches Recorded</th></tr>';cb.innerHTML=ts.map((x,i)=>`<tr><td class="rank">${i+1}</td><td><button class="sbc-team-link" data-team="${esc(x.t.ID)}">${esc(x.t.Name)} ›</button></td><td>${(x.sum/x.count).toFixed(2)}</td><td>${x.count}</td></tr>`).join('')||'<tr><td colspan="4">No team Cricket MPR recorded yet.</td></tr>';const hint=document.querySelector('#cricket .hint');if(hint)hint.textContent='Highest regular-season team Cricket MPR wins the $20 Cricket prize.';}
 strip();
}
function strip(){const d=document.getElementById('profile-detail');if(!d)return;d.querySelectorAll('.profile-stats > div,.profile-metrics > div').forEach(e=>{if(/Cricket MPR/i.test(e.textContent))e.remove()});d.querySelectorAll('.chart-title').forEach(e=>{if(/Cricket MPR/i.test(e.textContent)){const n=e.nextElementSibling;if(n&&(n.matches('svg')||n.classList.contains('chart-empty')))n.remove();e.remove()}});d.querySelectorAll('.sbc-roster-text span').forEach(e=>{if(/Cricket MPR/i.test(e.textContent))e.textContent=e.textContent.replace(/\s*·\s*Cricket MPR:\s*[^·]+/i,'')});}
const old=window.receiveLeagueData;if(typeof old==='function')window.receiveLeagueData=function(p){old(p);if(p&&!p.error){paint();requestAnimationFrame(paint)}};
const oldProfile=window.profile;if(typeof oldProfile==='function')window.profile=function(...args){const r=oldProfile.apply(this,args);strip();return r};
document.addEventListener('click',e=>{if(e.target.closest('[data-player],[data-team]'))setTimeout(strip,0)},true);
paint();
})();