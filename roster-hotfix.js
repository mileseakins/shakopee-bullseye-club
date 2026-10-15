/* SBC canonical roster + schedule fix, 2026-10-15. Applied to fallback and live feed. */
(function () {
  'use strict';
  const weekOne = {
    'F01-1': ['6:30 PM','Lane 1','T08','T02','Miles (T8 A) vs Nick (T2 A)','Johnny (T8 B) vs Cole (T2 B)'],
    'F01-2': ['7:45 PM','Lane 1','T06','T04','Jason (T6 A) vs Dave (T4 A)','Stevo (T6 B) vs Jack (T4 B)'],
    'F01-3': ['6:30 PM','Lane 2','T07','T03','Nate (T7 A) vs Brian D. (T3 A)','Paul (T7 B) vs Joe (T3 B)'],
    'F01-4': ['7:45 PM','Lane 2','T01','T05','Eddy (T1 A) vs Heang (T5 A)','Tony (T1 B) vs Brian P. (T5 B)']
  };
  function fix(data) {
    if (!data || typeof data !== 'object') return data;
    const teams = {T01:['Contreras / Pastrana','P11','P02'],T04:['Grandbois / Stocker','P01','P08'],T06:['Larson / Rathsabandith','P07','P12']};
    const players = {P01:['Dave Grandbois','T04','A'],P07:['Jason Larson','T06','A'],P11:['Eddy Contreras','T01','A']};
    (data.players || []).forEach(p => { if (players[p.ID]) { [p.Name,p.TeamID,p.Slot] = players[p.ID]; if(p.ID==='P11') p.PortraitURL=''; } });
    if (Array.isArray(data.players)) data.players.sort((a,b) => {
      const surname=p=>String(p.Name||'').trim().split(/\s+/).pop()||'';
      return surname(a).localeCompare(surname(b),'en',{sensitivity:'base'}) || String(a.Name||'').localeCompare(String(b.Name||''),'en',{sensitivity:'base'});
    });
    (data.teams || []).forEach(t => {if(teams[t.ID]) [t.Name,t.PlayerAID,t.PlayerBID]=teams[t.ID];});
    const a = {T01:'Eddy (T1 A)',T02:'Nick (T2 A)',T03:'Brian D. (T3 A)',T04:'Dave (T4 A)',T05:'Heang (T5 A)',T06:'Jason (T6 A)',T07:'Nate (T7 A)',T08:'Miles (T8 A)'};
    (data.schedule || []).forEach(f => {
      const w=weekOne[String(f.FixtureID||'').trim()];
      if(w){[f.Time,f.Lane,f.HomeTeamID,f.AwayTeamID,f.Game1,f.Game2]=w;f.Date='2026-10-15';f.Week='1';}
      else if(a[f.HomeTeamID]&&a[f.AwayTeamID]) f.Game1=a[f.HomeTeamID]+' vs '+a[f.AwayTeamID];
    });
    if (Array.isArray(data.results)) data.results=data.results.filter(r=>!(String(r.FixtureID).trim()==='F01-1'&&String(r.ContestType).trim().toUpperCase()==='CRICKET'&&Number(r.HomeLegs)===2&&Number(r.AwayLegs)===1));
    return data;
  }
  if(window.BULLSEYE_STARTER_DATA) fix(window.BULLSEYE_STARTER_DATA);
  let receiver;
  Object.defineProperty(window,'receiveLeagueData',{configurable:true,get(){return receiver;},set(fn){receiver=typeof fn==='function'?function(payload){return fn(fix(payload));}:fn;}});
})();
