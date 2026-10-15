/* SBC substitute attribution: load AFTER sbc-scoring-update.js */
(() => {
  'use strict';
  const original = window.computed;
  if (typeof original !== 'function') return;
  const norm = v => String(v ?? '').trim();
  const valid = r => r && [[2,0],[2,1],[0,2],[1,2]].some(
    ([a,b]) => Number(r.HomeLegs)===a && Number(r.AwayLegs)===b
  );
  window.computed = function () {
    const d = original();
    const subs = Array.isArray(S.substitutions) && S.substitutions.length
      ? S.substitutions
      : [{FixtureID:'F01-4',TeamID:'T05',RegularPlayerID:'P09',ActualPlayerID:'SUB-ALLEX'}];
    for (const sub of subs) {
      const fixture = S.schedule.find(f => norm(f.FixtureID)===norm(sub.FixtureID));
      const team = d.teams[norm(sub.TeamID)];
      const player = d.pr[norm(sub.RegularPlayerID)];
      if (!fixture || !team || !player) continue;
      const slot = norm(team.PlayerAID)===norm(sub.RegularPlayerID) ? 'A'
        : norm(team.PlayerBID)===norm(sub.RegularPlayerID) ? 'B' : null;
      const side = norm(fixture.HomeTeamID)===norm(sub.TeamID) ? 'Home'
        : norm(fixture.AwayTeamID)===norm(sub.TeamID) ? 'Away' : null;
      if (!slot || !side) continue;
      const result = S.results.find(r=>norm(r.FixtureID)===norm(sub.FixtureID)
        && norm(r.ContestType).toUpperCase()===slot && valid(r));
      if (!result) continue;
      const mine=Number(result[side+'Legs']);
      const theirs=Number(result[(side==='Home'?'Away':'Home')+'Legs']);
      player.played=Math.max(0,player.played-1);
      player.w=Math.max(0,player.w-Number(mine>theirs));
      player.l=Math.max(0,player.l-Number(mine<theirs));
      player.legs=Math.max(0,player.legs-mine);
      player.against=Math.max(0,player.against-theirs);
    }
    return d;
  };
  const receive=window.receiveLeagueData;
  if(typeof receive==='function') window.receiveLeagueData=function(payload) {
    receive(payload);
    if(payload && !payload.error) {
      render();
      requestAnimationFrame(()=>render());
    }
  };
  if(typeof render==='function') render();
})();
