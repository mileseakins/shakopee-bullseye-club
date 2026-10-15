/* SBC October 15 roster update. Works with both starter data and live Google Sheets. */
(function () {
  'use strict';
  function fix(data) {
    if (!data || typeof data !== 'object') return data;
    const teams = {T01:['Contreras / Pastrana','P11','P02'],T04:['Grandbois / Stocker','P01','P08'],T06:['Larson / Rathsabandith','P07','P12']};
    const players = {P01:['Dave Grandbois','T04','A'],P07:['Jason Larson','T06','A'],P11:['Eddy Contreras','T01','A']};
    (data.players || []).forEach(p => {
      if (players[p.ID]) { [p.Name,p.TeamID,p.Slot] = players[p.ID]; if (p.ID === 'P11') p.PortraitURL = ''; }
    });
    // Keep player-profile cards alphabetized by surname for starter and live data.
    // This also keeps the order stable for players with the same surname.
    if (Array.isArray(data.players)) data.players.sort((a, b) => {
      const surname = p => String(p.Name || '').trim().split(/\s+/).pop() || '';
      return surname(a).localeCompare(surname(b), 'en', {sensitivity:'base'}) ||
             String(a.Name || '').localeCompare(String(b.Name || ''), 'en', {sensitivity:'base'});
    });
    (data.teams || []).forEach(t => {
      if (teams[t.ID]) [t.Name,t.PlayerAID,t.PlayerBID] = teams[t.ID];
    });
    const a = {T01:'Eddy (T1 A)',T02:'Nick (T2 A)',T03:'Brian D. (T3 A)',T04:'Dave (T4 A)',T05:'Heang (T5 A)',T06:'Jason (T6 A)',T07:'Nate (T7 A)',T08:'Miles (T8 A)'};
    (data.schedule || []).forEach(f => {if (a[f.HomeTeamID] && a[f.AwayTeamID]) f.Game1 = a[f.HomeTeamID] + ' vs ' + a[f.AwayTeamID];});
    // Suppress the pre-season test Cricket score, including when live feed loads.
    if (Array.isArray(data.results)) data.results = data.results.filter(r =>
      !(String(r.FixtureID).trim() === 'F01-1' && String(r.ContestType).trim().toUpperCase() === 'CRICKET' && Number(r.HomeLegs) === 2 && Number(r.AwayLegs) === 1)
    );
    return data;
  }
  if (window.BULLSEYE_STARTER_DATA) fix(window.BULLSEYE_STARTER_DATA);
  // The live Google Apps Script feed is JSONP; intercept it before app.js loads.
  let receiver;
  Object.defineProperty(window, 'receiveLeagueData', {
    configurable:true,
    get() {return receiver;},
    set(fn) {receiver = typeof fn === 'function' ? function(payload) {return fn(fix(payload));} : fn;}
  });
})();
