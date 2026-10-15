/* SBC visual homepage: non-destructive enhancement of the existing Sheets-powered site. */
(()=>{
const $=id=>document.getElementById(id);
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rankSections=[['cricket','CRICKET RANKINGS'],['five01','501 RANKINGS'],['mvp-a','A GROUP MVP'],['mvp-b','B GROUP MVP']];
function arrange(){
 const main=document.querySelector('main'),hero=$('home');if(!main||!hero)return;
 $('highlights')?.remove();
 const strip=$('latest-results')||Object.assign(document.createElement('section'),{id:'latest-results',className:'sbc-scoreboard'});
 hero.after(strip);
 // Editorial content leads; detailed data remains available further down the same page.
 let cursor=strip;
 for(const id of ['performers','news','schedule','teams','cricket','five01','mvp-a','mvp-b','players']){const section=$(id);if(section){cursor.after(section);cursor=section}}
 const art=hero.querySelector('.hero-art');if(art){art.src='club-lanes.jpg';art.alt='Shakopee Bullseye Club: Every Dart Counts, two rainbow-lit dart lanes';art.classList.add('sbc-lanes-art')}
 const status=$('data-status');if(status)status.classList.add('sbc-data-status');
 const performers=$('performers');if(performers&&!performers.querySelector('.sbc-editorial-intro')){const p=document.createElement('p');p.className='sbc-editorial-intro';p.textContent='The players making headlines this week.';performers.querySelector('h2')?.after(p)}
 if(!$('rankings-dialog')){const dlg=document.createElement('dialog');dlg.id='rankings-dialog';dlg.className='sbc-rankings-dialog';dlg.innerHTML='<button type="button" class="sbc-rank-close" aria-label="Close full rankings">✕ CLOSE</button><div id="rankings-full"></div>';document.body.append(dlg);dlg.querySelector('button').onclick=()=>dlg.close();dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()})}
 if(!$('sbc-back-top')){const back=document.createElement('a');back.id='sbc-back-top';back.href='#home';back.setAttribute('aria-label','Back to top');back.textContent='↑';document.body.append(back)}
 if(!$('sbc-quicknav')){const nav=document.createElement('nav');nav.id='sbc-quicknav';nav.setAttribute('aria-label','Quick navigation');nav.innerHTML='<a href="#home">HOME</a><a href="#latest-results">RESULTS</a><a href="#teams">STANDINGS</a><a href="#players">PLAYERS</a>';document.body.append(nav)}
}
function scoreboard(){const target=$('latest-results');if(!target)return;
 const schedule=S.schedule.filter(f=>String(f.Phase).toLowerCase()==='regular');const dates=[...new Set(schedule.map(f=>f.Date))].sort();const completed=f=>['A','B','CRICKET'].every(k=>rowsFor(f.FixtureID).some(r=>String(r.ContestType).toUpperCase()===k));
 const last=[...dates].reverse().find(date=>schedule.some(f=>f.Date===date&&rowsFor(f.FixtureID).length));
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Chicago'});
 const date=last||dates.find(d=>d>=today)||dates[dates.length-1];const fixtures=schedule.filter(f=>f.Date===date).slice(0,4);const teams=computed().teams;
 const label=last?'LATEST MATCH RESULTS':'UPCOMING MATCH NIGHT';
 target.innerHTML=`<div class="sbc-score-head"><div><span class="eyebrow">FROM THE OCHE</span><h2>${label}</h2><p>${escapeHtml(date||'Schedule coming soon')}</p></div><a href="#schedule">FULL SCHEDULE & RESULTS ↗</a></div><div class="sbc-score-grid">${fixtures.map(f=>{const rr=rowsFor(f.FixtureID),home=rr.filter(r=>Number(r.HomeLegs)>Number(r.AwayLegs)).length,away=rr.length-home,final=completed(f);return `<article class="sbc-score-tile"><div class="sbc-score-time">${escapeHtml(f.Time||'Time TBD')} · ${escapeHtml(f.Lane||'')}${final?' · FINAL':''}</div><div class="sbc-score-row"><span>${escapeHtml(teams[f.HomeTeamID]?.Name||'TBD')}</span><strong>${rr.length?home:'–'}</strong></div><div class="sbc-score-row"><span>${escapeHtml(teams[f.AwayTeamID]?.Name||'TBD')}</span><strong>${rr.length?away:'–'}</strong></div></article>`}).join('')}</div>`;
}
function rankingsCompact(){for(const [id,title] of rankSections){const section=$(id),table=section?.querySelector('table'),body=$(id+'-body');if(!section||!table||!body)continue;
 const rows=[...body.querySelectorAll('tr')];const real=rows.filter(r=>r.querySelector('.rank-person'));rows.forEach((row,i)=>row.hidden=real.length>3&&i>=3);
 let btn=section.querySelector('.sbc-full-ranking');if(!btn){btn=document.createElement('button');btn.type='button';btn.className='sbc-full-ranking';table.closest('.table-wrap')?.after(btn)}
 btn.textContent=`VIEW FULL ${title} ↗`;btn.hidden=real.length<=3;btn.onclick=()=>{
  const dlg=$('rankings-dialog');const full=$('rankings-full');full.innerHTML='';const heading=document.createElement('h2');heading.textContent=title;full.append(heading);
  const wrap=document.createElement('div');wrap.className='table-wrap';const copy=table.cloneNode(true);copy.querySelectorAll('tr[hidden]').forEach(r=>r.hidden=false);copy.removeAttribute('id');wrap.append(copy);full.append(wrap);dlg.showModal();
 };
 }}
function newsImages(){const cards=[...document.querySelectorAll('#news-grid .news-card')];for(const [i,card] of cards.entries()){
 if(card.querySelector('.sbc-news-photo'))continue;
 const published=S.news.filter(x=>['yes','true','1','published'].includes(String(x.Published||'').toLowerCase())).sort((a,b)=>String(b.Date).localeCompare(String(a.Date)));
 const article=published[i];const url=String(article?.ImageURL||'').trim();const img=document.createElement('img');img.className='sbc-news-photo';img.alt=article?.Title?`Photo for ${article.Title}`:'Shakopee Bullseye Club lanes';img.src=/^(https:\/\/|[\w-]+\.(jpg|jpeg|png|webp)$)/i.test(url)?url:'club-lanes.jpg';img.onerror=()=>{img.src='club-lanes.jpg'};card.prepend(img);
 }}
function refresh(){scoreboard();rankingsCompact();newsImages()}
arrange();const previous=render;render=function(){previous();refresh()};refresh();
// News "view all" rerenders cards outside the main render pipeline.
$('news-grid')?.addEventListener('click',()=>setTimeout(newsImages,0));
$('all-news-toggle')?.addEventListener('click',()=>setTimeout(newsImages,0));
})();
