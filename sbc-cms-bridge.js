/* SBC: GitHub-hosted editorial data. No Google Apps Script requests. */
(()=>{'use strict';
const $=id=>document.getElementById(id), esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=x=>Number(x)||0, filled=x=>x!==null&&x!==undefined&&String(x).trim()!=='';
const completed=(h,a)=>filled(h)&&filled(a)&&[[2,0],[2,1],[0,2],[1,2]].some(([x,y])=>number(h)===x&&number(a)===y);
let honors=[];
function standings(){
 const t=Object.fromEntries(S.teams.map(x=>[x.ID,{...x,w:0,l:0,played:0,legs:0,against:0}]));
 const f=Object.fromEntries(S.schedule.map(x=>[x.FixtureID,x]));
 for(const r of S.results){if(!completed(r.HomeLegs,r.AwayLegs))continue;const x=f[r.FixtureID];if(!x||String(x.Phase).toLowerCase()!=='regular')continue;const h=t[x.HomeTeamID],a=t[x.AwayTeamID];if(!h||!a)continue;const hl=number(r.HomeLegs),al=number(r.AwayLegs);for(const [z,won,l,g] of [[h,hl>al,hl,al],[a,al>hl,al,hl]]){z.played++;z.w+=won?1:0;z.l+=won?0:1;z.legs+=l;z.against+=g;}}
 const rows=Object.values(t).sort((a,b)=>b.w-a.w||(b.played?b.w/b.played:0)-(a.played?a.w/a.played:0)||(b.legs-b.against)-(a.legs-a.against)||b.legs-a.legs);
 $('team-head').innerHTML='<tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Win %</th><th>Legs +/−</th><th>Points</th></tr>';
 $('team-body').innerHTML=rows.map((x,i)=>`<tr><td>${i+1}</td><td><button class="sbc-team-link" data-team="${esc(x.ID)}">${esc(x.Name)}</button></td><td>${x.w}</td><td>${x.l}</td><td>${x.played?(100*x.w/x.played).toFixed(1)+'%':'—'}</td><td>${x.legs} / ${x.against}</td><td><b>${x.w}</b></td></tr>`).join('');
}
function ppr(){const latest=new Map();for(const x of S.weeklyStats){const id=String(x.PlayerID),v=Number(x.PPR),w=number(x.Week);if(v>0&&(!latest.has(id)||w>=latest.get(id).week))latest.set(id,{value:v,week:w});}
 for(const p of S.players){const x=latest.get(p.ID);if(x)p.PPR=x.value;}
 const d=computed();const players=S.players.filter(p=>latest.has(p.ID)).sort((a,b)=>latest.get(b.ID).value-latest.get(a.ID).value);
 $('five01-head').innerHTML='<tr><th>#</th><th>Player</th><th>PPR</th><th>Singles W–L</th><th>Team</th></tr>';
 $('five01-body').innerHTML=players.map((p,i)=>`<tr${i>=3?' hidden':''}><td>${i+1}</td><td>${person(p)}</td><td>${latest.get(p.ID).value.toFixed(2)}</td><td>${d.pr[p.ID].w}–${d.pr[p.ID].l}</td><td>${esc(d.teams[p.TeamID]?.Name||'')}</td></tr>`).join('')||'<tr><td colspan="5">No PPR results yet.</td></tr>';
 const b=document.querySelector('#five01 .sbc-full-ranking');if(b)b.hidden=players.length<=3;
}
function weeklyHonors(){const week=Math.max(0,...honors.map(x=>number(x.week)));const h=honors.find(x=>number(x.week)===week);if(!h)return;const d=computed(),cards=[];
 for(const [slot,idKey,writeKey] of [['A','aPlayer','aWriteup'],['B','bPlayer','bWriteup']]){const p=d.players[h[idKey]];if(!p)continue;cards.push(`<article class="performer-card"><div class="eyebrow">${slot} PLAYER OF THE WEEK</div><button data-player="${esc(p.ID)}">${portrait(p)}<h3>${esc(p.Name)}</h3></button><p class="hint">${esc(h[writeKey]||'')}</p></article>`)}
 $('performer-week').textContent='Week '+week+' · Selected by league commissioner';$('performer-grid').innerHTML=cards.join('');
}
function teamMpr(){const d=computed(),fixture=Object.fromEntries(S.schedule.map(f=>[f.FixtureID,f]));const totals=Object.fromEntries(S.teams.map(t=>[t.ID,{sum:0,count:0}]));for(const r of S.results){if(r.ContestType!=='CRICKET')continue;const f=fixture[r.FixtureID];if(!f)continue;for(const [id,key] of [[f.HomeTeamID,'HomeMPR'],[f.AwayTeamID,'AwayMPR']]){const v=Number(r[key]);if(filled(r[key])&&v>0&&totals[id]){totals[id].sum+=v;totals[id].count++;}}}window.SBC_TEAM_MPR=totals;
}
function repaint(){standings();ppr();weeklyHonors();teamMpr();$('cricket').hidden=true;document.querySelectorAll('a[href="#cricket"]').forEach(x=>x.hidden=true);}
Promise.all(['content/results.json','content/news.json','content/honors.json'].map(path=>fetch(path+'?v='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(path+': '+r.status);return r.json();}))).then(([matches,news,h])=>{
 const results=[],stats=[];
 for(const m of matches.matches||[]){for(const [key,type] of [['a','A'],['b','B'],['cricket','CRICKET']]){const h=m[key+'Home'],a=m[key+'Away'];if(!completed(h,a))continue;const row={FixtureID:m.fixture,ContestType:type,HomeLegs:number(h),AwayLegs:number(a)};if(type==='CRICKET'){row.HomeMPR=m.homeMpr??'';row.AwayMPR=m.awayMpr??'';}results.push(row);}
 for(const x of m.ppr||[])if(filled(x.value)&&Number(x.value)>0)stats.push({Week:String(m.week),FixtureID:m.fixture,PlayerID:x.player,PPR:Number(x.value)});
 }
 honors=h.honors||[];
 const base=window.BULLSEYE_STARTER_DATA||{};
 const payload={...base,results,weeklyStats:stats,news:[...(news.articles||[]).map((x,i)=>({ID:x.id||'CMS-'+i,Date:x.date,Title:x.title,Summary:x.summary,Body:x.body,ImageURL:x.image||'',Published:x.published?'Yes':'No'})),...(base.news||[])]};
 receiveLeagueData(payload);repaint();$('data-status').textContent='✓ League results loaded from GitHub';
 const prior=render;render=function(){prior();repaint()};
 document.addEventListener('click',e=>{const btn=e.target.closest('[data-team]');if(!btn)return;requestAnimationFrame(()=>{const dialog=$('profile-dialog'),detail=$('profile-detail');if(!dialog?.open||!detail)return;const s=window.SBC_TEAM_MPR?.[btn.dataset.team];const value=s?.count?(s.sum/s.count).toFixed(2):'—';const el=detail.querySelector('.profile-stats');if(el&&!el.querySelector('.sbc-team-mpr'))el.insertAdjacentHTML('beforeend',`<div class="sbc-team-mpr"><strong>${value}</strong><small>TEAM CRICKET MPR</small></div>`);});});
 }).catch(e=>{$('data-status').textContent='League data files could not load: '+e.message;console.error('SBC data error',e)});
})();
