/* Dropshot Folks tournaments: registration, fixtures, live scoring, big screen.
   Data (Firestore): tourneys/{tid}, tteams, tcontacts/{teamId}, tmatches, tsecrets/{tid}, tunlocks/{uid}. */

const ADMINS = (window.DSF_ADMINS||[]).map(x=>String(x).toLowerCase());
const WA_GROUP = "https://chat.whatsapp.com/FRZVrxnH0lT6fpqQgjVHVt";
const waLink = t => /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(t?.wa||"") ? t.wa : WA_GROUP;
const LEVELS = ["Beginner","Lower intermediate","Intermediate","Upper intermediate","Advanced"];
const DEFAULT_TERMS = `1. Your place is only confirmed once the entry fee has been received and the organiser has confirmed your team.
2. Entry fees are non-refundable, except if the organiser cancels the event.
3. Both players must arrive and check in 30 minutes before their first match. Teams not ready when called may forfeit.
4. Bring your own racket and non-marking indoor shoes. Shuttles are provided.
5. The referee's decision is final. Respect players, referees and the venue.
6. You play at your own risk. Tell the organiser about any medical condition or injury.
7. Photos and videos may be taken on the day and shared on Dropshot Folks social media.
8. Fixtures, courts and timings may change on the day. All updates go out in the WhatsApp group.`;
// one tap in Organiser sets up the Team Cup (details from the official game format and T&Cs, DF-GF-2026 / DF-TC-2026)
const TEAM_CUP = {name:"Badminton Team Cup", date:"2026-10-18", venue:"Westminster City School", address:"55 Palace Street, London SW1E 5HJ",
  entry:"£22 per person (£88 per team of 4)", info:"Dropshot Folks' first Team Cup! Teams of 4 (2 men, 2 women) play men's, women's and mixed doubles in every tie. 9:00am–4:00pm.\nFree shirts for all registered players.",
  prizes:"Winners: trophy, gold medals, bags and bottles · Runners-up: silver medals, beanies and headbands · 3rd: bronze medals, grip tapes and socks",
  mode:"team", catIds:["TC"], cats:[{id:"TC",name:"Team Cup"}], maxTeams:18, courts:4, startTime:"09:00", matchMins:15, groupSize:3, advance:2, wild:0, bronze:true,
  pointsTo:15, deuce:true, cap:17, bestOf:1, regOpen:false, format:"", directions:"",
  terms:`1. Eligibility. No participants under the age of 18 are permitted to compete. Proof of age may be requested by the Organizer at check-in. Each player may only represent one (1) team in the Event.
2. Registration & Fees. The entry fee is £22 per person. A team's place in the Event is only confirmed once full payment has been received by the Organizer before the registration deadline of 13 October 2026.
3. Refund Policy. Entry fees are strictly non-refundable once registration is complete, regardless of the reason for withdrawal, except where the Event is cancelled in its entirety by the Organizer.
4. Team Changes. Changes to a team's registered players are permitted at any point up to and including the registration deadline of 13 October 2026. No changes to team composition will be accepted after this date.
5. Equipment. Each player is responsible for bringing their own racket. Free shirts will be provided to all registered participants by the Organizer.
6. Code of Conduct. All participants are expected to conduct themselves with good sportsmanship at all times. Any player found to be engaged in fighting or physical altercation of any kind will be disqualified from the Event with immediate effect, and their team's remaining fixtures forfeited.
7. Match Rules. All matches shall be played to 15 points. If the score reaches 14–14, play continues until one team leads by 2 clear points, up to a maximum of 17 points; if the score reaches 17–17, the next point wins the game outright. The Organizer's decision on all matters relating to scoring, eligibility, and disputes shall be final and binding.
8. Liability & Assumption of Risk. Nothing in these Terms & Conditions excludes or limits Dropshot Folks' liability for death or personal injury caused by its own negligence, for fraud, or for any other liability which cannot lawfully be excluded or limited under the laws of England and Wales. Subject to the foregoing, participants acknowledge that badminton involves inherent physical risks (including, without limitation, collision, falls, and muscular strain) and agree to accept such inherent risks, save where injury arises from the Organizer's negligence. To the fullest extent permitted by law, Dropshot Folks accepts no liability for the loss, theft, or damage of personal belongings (including phones, wallets, bags, or other items) brought to the venue, except where such loss or damage is caused by the Organizer's negligence.
9. Amendments. The Organizer reserves the right to amend the schedule, format, or venue arrangements as required. Registered teams will be notified of any material changes in a timely manner.

By registering a team and submitting payment for the Event, the team captain confirms on behalf of all listed players that they have read, understood, and agree to be bound by these Terms & Conditions in full.`};
const bankOf = t => t?.bank && (t.bank.acct || t.bank.sort) ? t.bank : null;
const DISC = {MD:"Men's doubles", WD:"Women's doubles", XD:"Mixed doubles"};
const isTeam = t => t?.mode==="team";
const nPl = t => isTeam(t)?4:2;
const playersOf = x => [x?.p1,x?.p2,x?.p3,x?.p4].filter(Boolean);
function formatTxt(t){
  const r=rules(t);
  if(isTeam(t)){ const adv=Number(t.advance)||2, wild=Number(t.wild)||0;
    return [`Teams of 4: 2 men and 2 women.`,
      `Every tie between two teams is 3 matches: men's doubles, women's doubles and mixed doubles. Win 2 of the 3 to win the tie.`,
      `Group stage: round robin in groups of about ${Number(t.groupSize)||3}.`,
      `Group points: win by 6 or more points = 4, win by 4–5 = 3, win by 1–3 = 1, loss = 0. The margin is the total points across the tie's 3 matches. Level teams are split by points difference, then head-to-head.`,
      `Knockouts: top ${adv} of each group${wild?` plus the best ${wild} third-placed team${wild>1?"s":""}`:""} go through, ranked by points. The top seeds get a bye if the bracket isn't full.${t.bronze!==false?" The final and the bronze medal match are played at the same time.":""}`,
      `Each match: 1 game, ${ruleTxt(r)}${r.deuce&&r.cap<(CAP_FOR[r.to]||0)?`, at ${r.cap-1}–${r.cap-1} the next point wins`:""}.`].join("\n")+(t.format?`\n\n${t.format}`:"") }
  const lines=[
    `Group stage: round robin in groups of about ${Number(t.groupSize)||4}. Top ${Number(t.advance)||2} from each group go through to the knockouts.`,
    `Knockouts: single elimination until the final.`,
    `Each match: ${r.bestOf===1?"1 game":r.bestOf===2?"2 games. At 1–1, the team with more total points wins":"best of 3 games"}, ${ruleTxt(r)}.`,
    `Group places are decided by wins, then points difference, then points scored.`];
  return lines.join("\n")+(t.format?`\n\n${t.format}`:"");
}
const CAT_PRESETS = [["MD","Men's doubles"],["WD","Women's doubles"],["XD","Mixed doubles"]];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nowIso = () => new Date().toISOString();
const ls = { get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}} };
const fmtDate = d => d ? new Date(d+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"}) : "Date to be confirmed";
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from(crypto.getRandomValues(new Uint32Array(6)), n=>CODE_CHARS[n % CODE_CHARS.length]).join("");
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>t.hidden=true,3000) }

/* ---------- state ---------- */
const S = {
  tab: /^#(screen|court=\d+)$/.test(location.hash) ? "screen" : location.hash==="#ref" ? "ref" : ls.get("dsf:ttab","reg"),
  refOnly: location.hash==="#ref",
  tourneys:[], teams:[], matches:[], contacts:{}, secret:null, unlock:null,
  uid:null, isAdmin:false, loaded:false, tid: ls.get("dsf:tid",null),
  cat: null, toss: {}, myTeam: ls.get("dsf:myteam",null), refCourt: ls.get("dsf:refcourt",1), edit:null, scrIdx:0
};
let db=null, auth=null;
const T = () => S.tourneys.find(t=>t.id===S.tid) || [...S.tourneys].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0] || null;
const cats = t => (t?.cats||[]).filter(c=>c && c.id);
const catName = (t,id) => cats(t).find(c=>c.id===id)?.name || id;
const teamsOf = (t,cat) => S.teams.filter(x=>x.tid===t?.id && (!cat || x.cat===cat)).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
const teamById = id => S.teams.find(x=>x.id===id);
const tName = id => id ? (teamById(id)?.name || "Team") : null;
const matchesOf = (t,cat) => S.matches.filter(m=>m.tid===t?.id && (!cat || m.cat===cat)).sort((a,b)=>(a.order??0)-(b.order??0));
const canRef = t => !!t && (S.isAdmin || (S.unlock?.tid===t.id));

/* ---------- scoring rules ---------- */
// points per game 11/15/21; with deuce you must win by 2, up to a cap (11→15, 15→21, 21→30); without deuce first to the target wins
const CAP_FOR = {11:15, 15:21, 21:30};
const rules = t => { const to=[11,15,21].includes(Number(t?.pointsTo))?Number(t.pointsTo):21, deuce=t?.deuce!==false;
  const cap=Number(t?.cap)>to ? Number(t.cap) : (CAP_FOR[to]||to+9);
  return {to, deuce, cap:deuce?cap:to, bestOf:Number(t?.bestOf)||1} };
const ruleTxt = r => `to ${r.to}${r.deuce?`, deuce (win by 2, max ${r.cap})`:", no deuce"}`;
function gameDone(g, r){ const [a,b]=g, hi=Math.max(a,b), lo=Math.min(a,b); return r.deuce ? (hi>=r.cap || (hi>=r.to && hi-lo>=2)) : hi>=r.to }
function gamesWon(m, r){ let a=0,b=0; (m.games||[]).forEach(g=>{ if(gameDone(g,r)) g[0]>g[1]?a++:b++ }); return {a,b} }
function matchWinner(m, r){
  if(r.bestOf===2){
    // always two games; at 1–1 the higher total points wins (if level, the second game's winner)
    const done=(m.games||[]).filter(g=>gameDone(g,r)); if(done.length<2) return null;
    const w=gamesWon(m,r); if(w.a!==w.b) return w.a>w.b?"a":"b";
    const p=done.slice(0,2).reduce((s,g)=>({a:s.a+g[0], b:s.b+g[1]}),{a:0,b:0});
    return p.a!==p.b ? (p.a>p.b?"a":"b") : (done[1][0]>done[1][1]?"a":"b");
  }
  const w=gamesWon(m,r), need=Math.floor(r.bestOf/2)+1; return w.a>=need?"a":w.b>=need?"b":null }
const pts = m => (m.games||[]).reduce((s,g)=>({a:s.a+g[0], b:s.b+g[1]}),{a:0,b:0});
const gamesTxt = m => (m.games||[]).filter(g=>g[0]||g[1]).map(g=>`${g[0]}–${g[1]}`).join(", ");

/* ---------- service: who serves, from which court, who receives ---------- */
// svc[game] = {s: serving team "a"/"b", sp: first server 1/2, rp: first receiver 1/2, won?: toss winner}; seq[game] = rally winners e.g. "aabab"
const otherSide = x => x==="a"?"b":"a";
function svcState(m, gi){
  const sv=(m.svc||[])[gi]; if(!sv || sv.skip || !sv.s) return null;
  const pos={}; pos[sv.s]={R:sv.sp, L:3-sv.sp}; pos[otherSide(sv.s)]={R:sv.rp, L:3-sv.rp};
  let serving=sv.s; const sc={a:0,b:0};
  for(const ch of String((m.seq||[])[gi]||"")){ if(ch!=="a"&&ch!=="b") continue; sc[ch]++;
    if(ch===serving){ const p=pos[ch]; pos[ch]={R:p.L, L:p.R} } else serving=ch }   // servers swap courts only when their side wins the rally
  const court = sc[serving]%2===0 ? "R" : "L";
  return {serving, court, server:pos[serving][court], receiver:pos[otherSide(serving)][court]};
}
const pName = (teamId, i) => { const x=teamById(teamId); return x && !x.p3 ? (i===1?x.p1:x.p2) : `Player ${i}` };
// who's on court: the pair, or for a Team Cup match its discipline
const pairTxt = (m, tm) => m?.disc ? DISC[m.disc] : tm ? `${tm.p1} & ${tm.p2}` : "";
const stageTxt = m => (m.stage==="ko" ? (m.roundName||"Knockout") : `Group ${m.group}`) + (m.disc?` · ${DISC[m.disc]}`:"");

/* ---------- knockout: teams come from winners of earlier matches ---------- */
function groupDone(t, cat, G){ const g=matchesOf(t,cat).filter(m=>m.stage==="group" && m.group===G); return g.length>0 && g.every(m=>m.status==="done") }
function sideTeam(m, side){
  if(m[side]) return m[side];
  const src=m.src?.[side];
  if(src){ const t=S.tourneys.find(x=>x.id===m.tid); if(!t) return null;
    if(src.seed) return qualifiers(t,m.cat)?.[src.seed-1] || null;
    return groupDone(t,m.cat,src.g) ? (standings(t,m.cat,src.g)[src.p-1]?.id||null) : null }
  const from=m.from?.[side==="a"?0:1]; if(!from) return null;
  const f=S.matches.find(x=>x.id===from); if(!f) return null;
  return m.fromLose ? loserTeam(f) : winnerTeam(f);
}
function winnerTeam(m){
  if(m.bye) return sideTeam(m, m.winner || ((m.a||m.src?.a)?"a":"b"));
  if(m.tie){ const w=tieResult(m.tie).winner; return w ? sideTeam(m,w) : null }
  if(m.status!=="done" || !m.winner) return null;
  return sideTeam(m, m.winner);
}
function loserTeam(m){
  if(m.bye) return null;
  const w = m.tie ? tieResult(m.tie).winner : (m.status==="done" ? m.winner : null);
  return w ? sideTeam(m, otherSide(w)) : null;
}
// Team Cup: a tie is 3 matches (MD, WD, XD); 2 wins take it
function tieResult(tie){
  const rs=S.matches.filter(x=>x.tie===tie); let a=0,b=0,pa=0,pb=0,done=0;
  rs.forEach(x=>{ if(x.status==="done" && x.winner){ done++; x.winner==="a"?a++:b++; const p=pts(x); pa+=p.a; pb+=p.b } });
  return {a, b, pa, pb, done, n:rs.length, winner:a>=2?"a":b>=2?"b":null, complete:rs.length>0 && done===rs.length};
}
const tiePts = margin => margin>=6?4 : margin>=4?3 : 1;
// players a match ties up: Team Cup men's and women's doubles can run side by side, mixed needs both
function resOf(m, a, b){
  const sides=[a,b].filter(Boolean); if(!m.disc) return sides;
  return sides.flatMap(x=>m.disc==="MD"?[x+"·M"]:m.disc==="WD"?[x+"·W"]:[x+"·M",x+"·W"]);
}
const isBye = m => !!m.bye;
const PLACE = p => p===1?"Winner":p===2?"Runner-up":p===3?"3rd":`${p}th`;
const shortRound = n => ({"Final":"Final","Semi-finals":"SF","Quarter-finals":"QF","Bronze medal match":"Bronze"})[n] || (n||"").replace("Round of ","R");
// what to show before a knockout slot is decided: "Winner Group A", "Winner QF 2"
function sideLabel(m, side){
  const src=m.src?.[side]; if(src) return src.seed ? `Seed ${src.seed}` : `${PLACE(src.p)} Group ${src.g}`;
  const from=m.from?.[side==="a"?0:1], f=from && S.matches.find(x=>x.id===from);
  return f ? `${m.fromLose?"Loser":"Winner"} ${shortRound(f.roundName)} ${f.slot||""}`.trim() : "To be decided";
}
const sideName = (m, side) => { const id=sideTeam(m,side); return id ? esc(tName(id)) : `<i class="muted">${esc(sideLabel(m,side))}</i>` };

/* ---------- standings ---------- */
function standings(t, cat, group){
  if(isTeam(t)) return teamStandings(t, cat, group);
  const ids=(t.groups?.[cat]?.[group])||[], r=rules(t), row={};
  ids.forEach(id=>row[id]={id, p:0, w:0, l:0, pf:0, pa:0});
  matchesOf(t,cat).filter(m=>m.stage==="group" && m.group===group && m.status==="done" && m.winner).forEach(m=>{
    const p=pts(m), A=row[m.a], B=row[m.b]; if(!A||!B) return;
    A.p++; B.p++; A.pf+=p.a; A.pa+=p.b; B.pf+=p.b; B.pa+=p.a;
    if(m.winner==="a"){ A.w++; B.l++ } else { B.w++; A.l++ }
  });
  const h2h=(x,y)=>{ const m=matchesOf(t,cat).find(m=>m.stage==="group" && m.status==="done" && ((m.a===x&&m.b===y)||(m.a===y&&m.b===x))); if(!m) return 0; return (sideTeam(m,m.winner)===x)?-1:1 };
  return Object.values(row).sort((x,y)=>y.w-x.w || (y.pf-y.pa)-(x.pf-x.pa) || y.pf-x.pf || h2h(x.id,y.id) || String(tName(x.id)).localeCompare(tName(y.id)));
}

// Team Cup groups: bonus points by winning margin (total points across the tie)
function teamStandings(t, cat, group){
  const ids=(t.groups?.[cat]?.[group])||[], row={}, res={};
  ids.forEach(id=>row[id]={id, p:0, w:0, l:0, pts:0, pf:0, pa:0});
  const ties=[...new Set(matchesOf(t,cat).filter(m=>m.stage==="group" && m.group===group && m.tie).map(m=>m.tie))];
  ties.forEach(tie=>{ const m=S.matches.find(x=>x.tie===tie), r=tieResult(tie), A=row[m.a], B=row[m.b]; if(!A||!B||!r.complete||!r.winner) return;
    A.p++; B.p++; A.pf+=r.pa; A.pa+=r.pb; B.pf+=r.pb; B.pa+=r.pa;
    const W=r.winner==="a"?A:B, L=r.winner==="a"?B:A, margin=r.winner==="a"?r.pa-r.pb:r.pb-r.pa;
    W.w++; L.l++; W.pts+=tiePts(margin); res[[m.a,m.b].sort().join("|")]=W.id });
  const h2h=(x,y)=>{ const w=res[[x,y].sort().join("|")]; return w===x?-1:w===y?1:0 };
  return Object.values(row).sort((x,y)=>y.pts-x.pts || (y.pf-y.pa)-(x.pf-x.pa) || h2h(x.id,y.id) || y.pf-x.pf || String(tName(x.id)).localeCompare(tName(y.id)));
}
const allGroupsDone = (t, cat) => { const g=t.groups?.[cat]; return !!g && Object.keys(g).every(G=>groupDone(t,cat,G)) };
// everyone through to the knockouts, best first: top places in each group plus the best wildcards
function qualifiers(t, cat){
  if(!allGroupsDone(t,cat)) return null;
  const g=t.groups[cat], adv=Math.max(1,Number(t.advance)||2), wild=Math.max(0,Number(t.wild)||0), rank=(x,y)=>(y.pts??y.w)-(x.pts??x.w) || (y.pf-y.pa)-(x.pf-x.pa) || y.pf-x.pf;
  const tables=Object.keys(g).sort().map(G=>standings(t,cat,G));
  const through=tables.flatMap(tb=>tb.slice(0,adv)), extra=tables.map(tb=>tb[adv]).filter(Boolean).sort(rank).slice(0,wild);
  return [...through, ...extra].sort(rank).map(x=>x.id);
}

/* ---------- fixture generation (organiser) ---------- */
// one match, or for the Team Cup one tie = 3 matches sharing a tie id
function addFixture(batch, t, id, data, plan={}){
  if(!isTeam(t) || data.bye){ batch.set(db.collection("tmatches").doc(id), {...data, ...(plan[id]||{})}); return [id] }
  return Object.keys(DISC).map((d,k)=>{ const mid=`${id}_${d}`; batch.set(db.collection("tmatches").doc(mid), {...data, tie:id, disc:d, order:(data.order??0)*3+k, ...(plan[mid]||{})}); return mid });
}
function roundRobin(ids){
  const list=[...ids]; if(list.length%2) list.push(null);
  const n=list.length, rounds=[];
  for(let r=0;r<n-1;r++){
    const games=[];
    for(let i=0;i<n/2;i++){ const a=list[i], b=list[n-1-i]; if(a&&b) games.push(r%2?[b,a]:[a,b]) }
    rounds.push(games); list.splice(1,0,list.pop());
  }
  return rounds;
}
const shuffle = a => { const x=[...a]; for(let i=x.length-1;i>0;i--){ const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1); [x[i],x[j]]=[x[j],x[i]] } return x };
async function generateGroups(t, cat){
  const ids=teamsOf(t,cat).filter(x=>x.status==="confirmed").map(x=>x.id);
  if(ids.length<2){ toast("Confirm at least 2 teams first"); return }
  const size=Math.max(3, Number(t.groupSize)||(isTeam(t)?3:4)), ng=Math.max(1, Math.round(ids.length/size)), letters="ABCDEFGHIJKLMNOP";
  const groups={}; for(let g=0;g<ng;g++) groups[letters[g]]=[];
  shuffle(ids).forEach((id,i)=>{ const row=Math.floor(i/ng), col=i%ng, g=row%2?ng-1-col:col; groups[letters[g]].push(id) });
  await clearMatches(t, cat);
  const base=matchesOf(t).length ? Math.max(...matchesOf(t).map(m=>m.order||0))+1 : 0;
  const perGroup=Object.entries(groups).map(([G,ids])=>({G, rounds:roundRobin(ids)}));
  const maxR=Math.max(...perGroup.map(x=>x.rounds.length)), batch=db.batch(); let order=base;
  for(let r=0;r<maxR;r++) perGroup.forEach(({G,rounds})=>(rounds[r]||[]).forEach((pair,k)=>{
    const id=`${t.id}_${cat}_${G}${r+1}${String.fromCharCode(97+k)}`;
    addFixture(batch, t, id, {tid:t.id, cat, stage:"group", group:G, round:r+1, a:pair[0], b:pair[1], status:"scheduled", games:[], winner:null, court:0, order:order++, updatedAt:nowIso()});
  }));
  batch.set(db.collection("tourneys").doc(t.id), {groups:{...(t.groups||{}), [cat]:groups}}, {merge:true});
  await batch.commit(); toast(`${catName(t,cat)}: ${ng} group${ng>1?"s":""} and ${order-base} ${isTeam(t)?`ties (${(order-base)*3} matches)`:"matches"} created`);
}
async function clearMatches(t, cat, stage){
  const ms=matchesOf(t,cat).filter(m=>!stage || m.stage===stage);
  for(let i=0;i<ms.length;i+=400){ const b=db.batch(); ms.slice(i,i+400).forEach(m=>b.delete(db.collection("tmatches").doc(m.id))); await b.commit() }
}
const seedOrder = P => { let o=[1]; while(o.length<P){ const n=o.length*2; o=o.flatMap(s=>[s,n+1-s]) } return o };
const roundName = (n) => n===1?"Final":n===2?"Semi-finals":n===4?"Quarter-finals":`Round of ${n*2}`;
async function generateKnockouts(t, cat){
  const groups=t.groups?.[cat]; if(!groups){ toast("Make the groups first"); return }
  // slots point at group places (Winner Group A, Runner-up Group B…) and fill in when each group finishes
  const adv=Math.max(1, Number(t.advance)||2), G=Object.keys(groups).sort(), seeds=[];
  if(isTeam(t)){   // Team Cup: everyone through is ranked overall, top seeds get the byes
    const n=G.reduce((s,g)=>s+Math.min(adv,groups[g].length),0)+Math.min(Math.max(0,Number(t.wild)||0), G.filter(g=>groups[g].length>adv).length);
    for(let k=1;k<=n;k++) seeds.push({seed:k});
  } else
  for(let k=0;k<adv;k++) seeds.push(...G.filter(g=>groups[g].length>k).map(g=>({g, p:k+1})));
  if(seeds.length<2){ toast("Not enough teams go through for a knockout"); return }
  const keepPlan=Object.fromEntries(matchesOf(t,cat).filter(m=>m.stage==="ko" && m.ptime).map(m=>[m.id,{pcourt:m.pcourt, ptime:m.ptime}]));
  await clearMatches(t, cat, "ko");
  let P=1; while(P<seeds.length) P*=2;
  const order=seedOrder(P), batch=db.batch(), base=Math.max(0,...matchesOf(t).map(m=>m.order||0))+1;
  // first-round pairs; then swap opponents so nobody meets a team from their own group
  const grpOf=x=>x?.g ?? x?.seed, pairs=[];
  for(let i=0;i<P;i+=2) pairs.push([seeds[order[i]-1]||null, seeds[order[i+1]-1]||null]);
  for(let i=0;i<pairs.length;i++){ const [a,b]=pairs[i]; if(!a||!b||grpOf(a)!==grpOf(b)) continue;
    for(let j=0;j<pairs.length;j++){ const [c,d]=pairs[j]; if(j===i||!d) continue;
      if(grpOf(a)!==grpOf(d) && grpOf(c)!==grpOf(b)){ pairs[i][1]=d; pairs[j][1]=b; break } } }
  let prev=[], o=base, roundSize=P/2, rnd=1;
  for(let i=0;i<P;i+=2){
    const [a,b]=pairs[i/2], id=`${t.id}_${cat}_K${rnd}_${i/2+1}`;
    const bye=!a||!b;
    prev.push(addFixture(batch, t, id, {tid:t.id, cat, stage:"ko", round:rnd, roundName:roundName(roundSize), slot:i/2+1, a:null, b:null, src:{a:a||null, b:b||null}, bye, status:bye?"done":"scheduled", games:[], winner:bye?(a?"a":"b"):null, court:0, order:bye?-1:o++, updatedAt:nowIso()}, keepPlan)[0]);
  }
  while(prev.length>1){
    rnd++; roundSize/=2; const next=[];
    for(let i=0;i<prev.length;i+=2){ const id=`${t.id}_${cat}_K${rnd}_${i/2+1}`;
      next.push(addFixture(batch, t, id, {tid:t.id, cat, stage:"ko", round:rnd, roundName:roundName(roundSize), slot:i/2+1, a:null, b:null, from:[prev[i],prev[i+1]], status:"scheduled", games:[], winner:null, court:0, order:o++, updatedAt:nowIso()}, keepPlan)[0]) }
    // bronze medal match: the two semi-final losers, alongside the final
    if(next.length===1 && prev.length===2 && isTeam(t) && t.bronze!==false){ const id=`${t.id}_${cat}_K${rnd}_2`;
      addFixture(batch, t, id, {tid:t.id, cat, stage:"ko", round:rnd, roundName:"Bronze medal match", slot:2, a:null, b:null, from:[prev[0],prev[1]], fromLose:true, status:"scheduled", games:[], winner:null, court:0, order:o++, updatedAt:nowIso()}, keepPlan) }
    prev=next;
  }
  await batch.commit(); toast(`${catName(t,cat)}: knockout bracket of ${P} made. Teams fill in as groups finish.`);
}

/* ---------- courts & times (organiser) ---------- */
const hm = (start, mins) => { const [h,m]=String(start||"10:00").split(":").map(Number), x=h*60+m+mins; return `${String(Math.floor(x/60)%24).padStart(2,"0")}:${String(x%60).padStart(2,"0")}` };
async function scheduleAll(t){
  const C=Math.max(1,Number(t.courts)||4), mins=Math.max(5,Number(t.matchMins)||15), ms=matchesOf(t).filter(m=>!m.bye);
  if(!ms.length){ toast("Make the fixtures first"); return }
  const slotOf={}, teamsIn=m=>m.stage==="group"?resOf(m,m.a,m.b):m.tie?resOf(m,m.tie+"a",m.tie+"b"):[];
  const ready=m=>{
    if(m.stage==="group") return 0;
    if(m.src){ const seeded=m.src.a?.seed||m.src.b?.seed, gs=[m.src.a?.g, m.src.b?.g].filter(Boolean), gm=ms.filter(x=>x.stage==="group" && x.cat===m.cat && (seeded || gs.includes(x.group)));
      if(gm.some(x=>slotOf[x.id]==null)) return null; return gm.length?Math.max(...gm.map(x=>slotOf[x.id]))+1:0 }
    if(m.from){ let e=0; for(const id of m.from){ const f=S.matches.find(x=>x.id===id); if(!f) continue;
        const fs=f.tie?ms.filter(x=>x.tie===f.tie):[f];
        const v = f.bye ? ready(f) : fs.every(x=>slotOf[x.id]!=null) ? Math.max(...fs.map(x=>slotOf[x.id]))+1 : null; if(v==null) return null; e=Math.max(e,v) } return e }
    return 0;
  };
  const pending=[...ms].sort((a,b)=>(a.stage==="ko")-(b.stage==="ko") || (a.round||0)-(b.round||0) || (a.order||0)-(b.order||0));
  let slot=0, last=new Set();
  while(pending.length && slot<500){
    const used=new Set(), now=new Set();
    for(let c=1;c<=C;c++){
      const ok=(m,rest)=>{ const r=ready(m); if(r==null||r>slot) return false; const tm=teamsIn(m); return tm.every(x=>!now.has(x)) && (!rest || tm.every(x=>!last.has(x))) };
      let i=pending.findIndex(m=>ok(m,true)); if(i<0) i=pending.findIndex(m=>ok(m,false)); if(i<0) break;
      const m=pending.splice(i,1)[0]; slotOf[m.id]=slot; m._c=c; teamsIn(m).forEach(x=>now.add(x));
    }
    last=now; slot++;
  }
  for(let i=0;i<ms.length;i+=400){ const b=db.batch();
    ms.slice(i,i+400).forEach(m=>{ if(slotOf[m.id]!=null) b.update(db.collection("tmatches").doc(m.id),{pcourt:m._c, ptime:hm(t.startTime,slotOf[m.id]*mins)}) }); await b.commit() }
  toast(`Courts and times set: ${slot} rounds of ${mins} min on ${C} court${C>1?"s":""}, finishing about ${hm(t.startTime,slot*mins)}`);
}

/* ---------- court queue ---------- */
const playing = t => new Set(matchesOf(t).filter(m=>m.status==="live").flatMap(m=>resOf(m,sideTeam(m,"a"),sideTeam(m,"b"))));
function upNext(t, limit=8){
  const busy=playing(t);
  return matchesOf(t).filter(m=>m.status==="scheduled" && !isBye(m)).filter(m=>{ const a=sideTeam(m,"a"), b=sideTeam(m,"b"); return a && b && resOf(m,a,b).every(x=>!busy.has(x)) })
    .sort((x,y)=>String(x.ptime||"99").localeCompare(String(y.ptime||"99")) || (x.order||0)-(y.order||0)).slice(0,limit);
}
const liveOn = (t,c) => matchesOf(t).find(m=>m.status==="live" && m.court===c);

/* ---------- small renderers ---------- */
function matchRow(t, m, opts={}){
  const a=sideTeam(m,"a"), b=sideTeam(m,"b"), r=rules(t), w=m.status==="done"?m.winner:null;
  const label = (m.stage==="ko" ? (m.roundName||"Knockout") : `Group ${m.group} · R${m.round}`) + (m.disc?` · ${m.disc}`:"");
  const mid = m.status==="live" ? `<span class="livebadge">Court ${m.court}${m.disc?` · ${m.disc}`:""}</span><span class="sc">${(m.games||[]).map(g=>`${g[0]}–${g[1]}`).slice(-1)[0]||"0–0"}</span>`
    : m.status==="done" ? `<span class="tag">${m.disc?esc(DISC[m.disc]):"Final"}</span><span class="sc">${esc(gamesTxt(m))||(m.bye?"bye":"")}</span>` : `<span class="tag">${esc(label)}</span>${m.ptime?`<span class="when">🕒 ${esc(m.ptime)} · Court ${esc(m.pcourt)}</span>`:"<span>vs</span>"}`;
  return `<div class="m ${m.status==="live"?"live":""}" ${opts.edit?`data-medit="${esc(m.id)}" role="button" tabindex="0" style="cursor:pointer"`:""}>
    <span class="tn ${w==="a"?"win":""} ${opts.me&&a===opts.me?"me":""}">${sideName(m,"a")}</span>
    <span class="mid">${mid}${opts.cat?`<span>${esc(catName(t,m.cat))}</span>`:""}</span>
    <span class="tn r ${w==="b"?"win":""} ${opts.me&&b===opts.me?"me":""}">${sideName(m,"b")}</span>
    ${opts.plan && S.isAdmin && m.status!=="done" && !m.bye ? `<div class="plan"><label>Court <select data-plcourt="${esc(m.id)}" aria-label="Court"><option value="">–</option>${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${Number(m.pcourt)===i+1?"selected":""}>${i+1}</option>`).join("")}</select></label><label>Time <input type="time" data-pltime="${esc(m.id)}" value="${esc(m.ptime||"")}" aria-label="Time"></label></div>` : ""}</div>`;
}
// a list of matches; Team Cup matches sit under their tie with the tie score
function fixList(t, ms, opts={}){
  const seen=new Set();
  return ms.map(m=>{ if(!m.tie) return matchRow(t,m,opts); if(seen.has(m.tie)) return ""; seen.add(m.tie);
    const r=tieResult(m.tie), rs=ms.filter(x=>x.tie===m.tie), mine=opts.me&&(sideTeam(m,"a")===opts.me||sideTeam(m,"b")===opts.me);
    return `<div class="tie ${mine?"me":""}"><div class="tie-h"><span class="${r.winner==="a"?"win":""}">${sideName(m,"a")}</span><b>${r.done?`${r.a}–${r.b}`:"vs"}</b><span class="${r.winner==="b"?"win":""}">${sideName(m,"b")}</span></div>${rs.map(x=>matchRow(t,x,opts)).join("")}</div>` }).join("");
}
function standTable(t, cat, G){
  const adv=Number(t.advance)||2, rows=standings(t,cat,G);
  if(isTeam(t)) return `<div class="tbl"><table class="stand"><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th><th>+/−</th></tr></thead><tbody>
    ${rows.map((x,i)=>`<tr class="${i<adv?"qual":""}"><td>${i+1}</td><td>${esc(tName(x.id))}</td><td>${x.p}</td><td>${x.w}</td><td>${x.l}</td><td><b>${x.pts}</b></td><td>${x.pf-x.pa>0?"+":""}${x.pf-x.pa}</td></tr>`).join("")}
  </tbody></table></div>`;
  return `<div class="tbl"><table class="stand"><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>+/−</th></tr></thead><tbody>
    ${rows.map((x,i)=>`<tr class="${i<adv?"qual":""}"><td>${i+1}</td><td>${esc(tName(x.id))}</td><td>${x.p}</td><td>${x.w}</td><td>${x.l}</td><td>${x.pf-x.pa>0?"+":""}${x.pf-x.pa}</td></tr>`).join("")}
  </tbody></table></div>`;
}
function bracket(t, cat){
  const ko=matchesOf(t,cat).filter(m=>m.stage==="ko" && (!m.disc || m.disc==="MD")); if(!ko.length) return "";
  const rounds=[...new Set(ko.map(m=>m.round))].sort((a,b)=>a-b);
  return `<div class="bracket">${rounds.map(rn=>{ const ms=ko.filter(m=>m.round===rn).sort((a,b)=>a.slot-b.slot);
    return `<div class="bround"><h4>${esc(ms[0]?.roundName||"")}</h4>${ms.map(m=>{ const a=sideTeam(m,"a"), b=sideTeam(m,"b"), tr=m.tie?tieResult(m.tie):null, w=tr?tr.winner:m.status==="done"?m.winner:null;
      const sc=side=>tr ? (tr.done?String(side==="a"?tr.a:tr.b):"") : m.status==="done"&&!m.bye?(m.games||[]).map(g=>side==="a"?g[0]:g[1]).join(" "):"";
      const line=(id,side)=>`<div><span class="${w===side?"win":""} ${id?"":"tbd"}">${id?esc(tName(id)):(m.bye&&!m.src?.[side]&&!m.from?"bye":esc(sideLabel(m,side)))}</span><span>${esc(sc(side))}</span></div>`;
      const live=tr?S.matches.some(x=>x.tie===m.tie&&x.status==="live"):m.status==="live";
      return `<div class="bm ${live?"live":""}">${m.roundName==="Bronze medal match"?`<div class="bt">🥉 Bronze medal match</div>`:""}${m.ptime&&!m.bye&&m.status!=="done"?`<div class="bt">🕒 ${esc(m.ptime)} · Court ${esc(m.pcourt)}</div>`:""}${line(a,"a")}${line(b,"b")}</div>` }).join("")}</div>` }).join("")}</div>`;
}
function courtCard(t, c){
  const m=liveOn(t,c), r=rules(t);
  const fb=`<a class="focusbtn" href="#court=${c}" target="_blank" rel="noopener" title="Open Court ${c} full screen in a new tab">⛶ Focus</a>`;
  if(!m) return `<div class="ct idle"><div class="cn"><span>Court ${c}</span><span>free ${fb}</span></div><div class="muted">Waiting for the next match</div></div>`;
  const g=(m.games||[]).slice(-1)[0]||[0,0], w=gamesWon(m,r), need=Math.floor(r.bestOf/2)+1, sv=svcState(m,Math.max(0,(m.games||[]).length-1));
  const side=(s,i)=>{ const id=sideTeam(m,s), tm=teamById(id), srv=sv&&sv.serving===s;
    const pl=k=>esc(tm?(k===1?tm.p1:tm.p2):""), names=m.disc?esc(DISC[m.disc]):tm?(srv?(sv.server===1?`🏸 ${pl(1)} & ${pl(2)}`:`${pl(1)} & 🏸 ${pl(2)}`):`${pl(1)} & ${pl(2)}`):"";
    return `<div class="row2"><div class="nm">${srv?"🏸 ":""}${esc(tName(id))}<small>${names}</small>${r.bestOf>1?`<span class="gw">${Array.from({length:need},(_,k)=>`<i class="${k<w[s]?"on":""}"></i>`).join("")}</span>`:""}</div><div class="pt">${g[i]}</div></div>` };
  return `<div class="ct"><div class="cn"><span>Court ${c} · ${esc(catName(t,m.cat))}</span><span>${esc(stageTxt(m))} ${fb}</span></div>${side("a",0)}${side("b",1)}</div>`;
}

/* ---------- views ---------- */
function noTourney(){ return `<section class="panel"><h2>Tournaments</h2><div class="empty">No tournament set up yet.${S.isAdmin?" Create one in the Organiser tab.":" Check back soon."}</div></section>` }
function pickBar(t){
  if(S.tourneys.length<2) return "";
  return `<div class="cats">${[...S.tourneys].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).map(x=>`<button data-tid="${esc(x.id)}" aria-pressed="${x.id===t.id}">${esc(x.name||"Tournament")}</button>`).join("")}</div>`;
}
function catBar(t){
  const cs=cats(t); if(!S.cat || !cs.some(c=>c.id===S.cat)) S.cat=cs[0]?.id||null;
  return cs.length>1?`<div class="cats">${cs.map(c=>`<button data-cat="${esc(c.id)}" aria-pressed="${c.id===S.cat}">${esc(c.name)}</button>`).join("")}</div>`:"";
}
function viewReg(){
  const t=T(); if(!t) return noTourney();
  const mine=S.uid?S.teams.filter(x=>x.tid===t.id && x.createdBy===S.uid):[];
  const full=c=>Number(t.maxTeams)>0 && teamsOf(t,c).length>=Number(t.maxTeams);
  const mapQ=[t.venue,t.address].filter(Boolean).join(", "), r=rules(t);
  return `${pickBar(t)}${t.poster?`<section class="panel" style="padding:10px"><img src="${esc(t.poster)}" alt="${esc(t.name||"Tournament")} poster" style="width:100%;max-height:80vh;object-fit:contain;border-radius:16px;display:block"></section>`:""}<section class="panel tinfo">
      <span class="lbl">${esc(fmtDate(t.date))}${t.venue?` · ${esc(t.venue)}`:""}</span>
      <div class="big">${esc(t.name||"Tournament")}</div>
      ${t.info?`<p>${esc(t.info).replace(/\n/g,"<br>")}</p>`:""}
      <div class="row">${cats(t).map(c=>`<span class="chip st-paid">${esc(c.name)} · ${teamsOf(t,c.id).length}${Number(t.maxTeams)?`/${Number(t.maxTeams)}`:""} teams</span>`).join("")}</div>
      ${t.entry?`<p><b>Entry:</b> ${esc(t.entry)}</p>`:""}${t.prizes?`<p><b>Prizes:</b> ${esc(t.prizes)}</p>`:""}
      <p><b>Scoring:</b> ${r.bestOf===1?"1 game":r.bestOf===2?"2 games (total points decide at 1–1)":"best of 3 games"}, ${esc(ruleTxt(r))}.</p>
      <details class="readbox" id="rd-format"><summary>📋 Game format</summary><p>${esc(formatTxt(t)).replace(/\n/g,"<br>")}</p></details>
      <details class="readbox" id="rd-terms"><summary>📜 Terms & conditions</summary><p>${esc(t.terms||DEFAULT_TERMS).replace(/\n/g,"<br>")}</p></details>
      ${mapQ?`<div class="row" style="align-items:flex-start"><a class="btn small" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQ)}" target="_blank" rel="noopener">📍 Directions</a><span style="font-size:.9rem">${esc(mapQ)}${t.directions?`<br><span class="muted">${esc(t.directions).replace(/\n/g,"<br>")}</span>`:""}</span></div>`:""}
    </section>
    <section class="panel"><h2>Register a team</h2>
    ${t.regOpen ? `<form id="regForm" class="regform" novalidate>
        <fieldset><legend>🏸 Team</legend><div class="grid2">
          <label class="f">Category *<select id="rg-cat">${cats(t).map(c=>`<option value="${esc(c.id)}" ${full(c.id)?"disabled":""}>${esc(c.name)}${full(c.id)?" (full)":""}</option>`).join("")}</select></label>
          <label class="f">Team name *<input id="rg-name" maxlength="40" required placeholder="e.g. Net Ninjas"></label></div></fieldset>
        ${Array.from({length:nPl(t)},(_,i)=>i+1).map(n=>`<fieldset><legend>${n===1?"👤 Player 1 · team captain":`👤 Player ${n}`}</legend><div class="grid2">
          <label class="f">Full name *<input id="rg-p${n}" maxlength="60" required autocomplete="${n===1?"name":"off"}" placeholder="First and last name"></label>
          <label class="f">Mobile (WhatsApp) *<input id="rg-ph${n}" type="tel" maxlength="30" required autocomplete="${n===1?"tel":"off"}" placeholder="07…"></label>
          <label class="f">Email${n===1?" *":""}<input id="rg-em${n}" type="email" maxlength="120" ${n===1?'required autocomplete="email"':'autocomplete="off"'} placeholder="name@example.com"></label>
          <label class="f">Playing level *<select id="rg-lv${n}" required><option value="">Choose…</option>${LEVELS.map(l=>`<option>${esc(l)}</option>`).join("")}</select></label>
          <label class="f">Gender *<select id="rg-g${n}" required><option value="">Choose…</option><option>Male</option><option>Female</option><option>Prefer not to say</option></select></label></div></fieldset>`).join("")}
        <fieldset><legend>🚑 Emergency contact</legend><div class="grid2">
          <label class="f">Name *<input id="rg-emname" maxlength="60" required placeholder="Someone not playing"></label>
          <label class="f">Phone *<input id="rg-emphone" type="tel" maxlength="30" required placeholder="07…"></label>
          <label class="f" style="grid-column:1/-1">Anything we should know? (optional)<textarea id="rg-notes" rows="2" maxlength="300" placeholder="Injuries, medical info, arrival time…"></textarea></label></div></fieldset>
        ${(()=>{ const bk=bankOf(t), row=(l,v)=>v?`<div class="bankrow"><span>${l}</span><b>${esc(v)}</b><button type="button" class="btn small ghost" data-copy="${esc(v)}">Copy</button></div>`:"";
          return `<fieldset class="feebox"><legend>💷 Entry fee${t.entry?` · ${esc(t.entry)}`:""}</legend>${bk?`
          <p>Pay by bank transfer <b>before you register</b>. Use your <b>team name</b> as the reference.</p>
          <div class="bank">${row("Account name",bk.name)}${row("Sort code",bk.sort)}${row("Account number",bk.acct)}${bk.note?`<p class="muted" style="margin:4px 0 0">${esc(bk.note)}</p>`:""}</div>
          <label class="f">Name on the bank payment *<input id="rg-payname" maxlength="60" placeholder="Whose account it came from"></label>`:`<p>The organiser will message you about payment after you register.</p>`}</fieldset>` })()}
        <fieldset class="checklist"><legend>✅ Before you register (all required)</legend>
          ${bankOf(t)?`<label class="chk"><input type="checkbox" id="rg-paid"> <span>We've paid the entry fee by bank transfer, with our team name as the reference</span></label>`:""}
          <div class="chkstep"><a class="btn wa small" href="${esc(waLink(t))}" target="_blank" rel="noopener" data-wajoin="1">💬 Join the WhatsApp group</a>
            <label class="chk"><input type="checkbox" id="rg-wa" ${S.waOpened?"":"disabled"}> <span>${isTeam(t)?"All 4 players have":"Both players have"} joined the tournament WhatsApp group for updates${S.waOpened?"":' <span class="muted">(tap Join first)</span>'}</span></label></div>
          <div class="chkstep"><button type="button" class="btn small" data-readopen="format">📋 Read the game format</button>
            <label class="chk"><input type="checkbox" id="rg-fmt" ${S.read?.format?"":"disabled"}> <span>We've read the game format${S.read?.format?"":' <span class="muted">(open it first)</span>'}</span></label></div>
          <div class="chkstep"><button type="button" class="btn small" data-readopen="terms">📜 Read the terms & conditions</button>
            <label class="chk"><input type="checkbox" id="rg-terms" ${S.read?.terms?"":"disabled"}> <span>We agree to the terms & conditions${S.read?.terms?"":' <span class="muted">(open them first)</span>'}</span></label></div>
          <label class="chk"><input type="checkbox" id="rg-ok"> <span>We're happy for the organiser to contact us about this tournament</span></label></fieldset>
        <p class="muted" style="font-size:.85rem">Only the team name and player names are shown publicly. Everything else goes to the organiser only. The organiser confirms each team and will message you about payment.</p>
        <div><button class="btn primary" type="submit">Register team 🏸</button></div>
      </form>` : `<div class="empty">Registration is closed${teamsOf(t).length?" — see the Teams tab for who's in":""}.</div>`}
    </section>
    ${mine.length?`<section class="panel"><h2>Your teams</h2><p class="muted">Not in the WhatsApp group yet? <a href="${esc(waLink(t))}" target="_blank" rel="noopener">Join it here</a>, as that's where all updates go.</p><div class="teamlist">${mine.map(x=>`<div class="team"><span class="lbl">${esc(catName(t,x.cat))}</span><b>${esc(x.name)}</b><span>${esc(x.p1)} & ${esc(x.p2)}</span><span>${x.status==="confirmed"?'<span class="chip st-confirmed">Confirmed</span>':'<span class="chip st-awaiting">Waiting for the organiser</span>'}</span><button class="btn small ghost danger" data-withdraw="${esc(x.id)}">Withdraw</button></div>`).join("")}</div></section>`:""}`;
}
function viewTeams(){
  const t=T(); if(!t) return noTourney();
  return `${pickBar(t)}<section class="panel"><h2>Teams</h2>${catBar(t)}
    ${(()=>{ const ts=teamsOf(t,S.cat); return ts.length?`<p class="muted">${ts.length} team${ts.length>1?"s":""} registered${Number(t.maxTeams)?` of ${Number(t.maxTeams)}`:""} · ${ts.filter(x=>x.status==="confirmed").length} confirmed</p>
      <div class="teamlist">${ts.map((x,i)=>`<div class="team"><span class="lbl">#${i+1}</span><b>${esc(x.name)}</b><span>${esc(playersOf(x).join(x.p3?", ":" & "))}</span><span>${x.status==="confirmed"?'<span class="chip st-confirmed">Confirmed</span>':'<span class="chip st-awaiting">Pending</span>'}</span></div>`).join("")}</div>`:`<div class="empty">No teams yet. Be the first!</div>` })()}
  </section>`;
}
function viewFix(){
  const t=T(); if(!t) return noTourney();
  const all=teamsOf(t).sort((a,b)=>a.name.localeCompare(b.name)), me=S.myTeam && all.find(x=>x.id===S.myTeam);
  const mine = me ? matchesOf(t).filter(m=>!m.bye && (sideTeam(m,"a")===me.id || sideTeam(m,"b")===me.id)).sort((a,b)=>String(a.ptime||"99").localeCompare(String(b.ptime||"99"))||(a.order||0)-(b.order||0)) : [];
  const head=`${pickBar(t)}<section class="panel"><h2>Fixtures & results</h2>
    <label class="f" style="max-width:420px">🔎 Find my team<select id="myTeam" data-myteam="1"><option value="">Choose your team…</option>${all.map(x=>`<option value="${esc(x.id)}" ${x.id===S.myTeam?"selected":""}>${esc(x.name)} · ${esc(catName(t,x.cat))}</option>`).join("")}</select></label>
    ${me?`<div class="mlist">${mine.length?fixList(t,mine,{me:me.id,cat:!isTeam(t)}):`<div class="empty">No matches for ${esc(me.name)} yet.</div>`}</div>`:""}
    ${catBar(t)}</section>${S.isAdmin && matchesOf(t).length ? schedPanel(t) : ""}`;
  const groups=t.groups?.[S.cat], ms=matchesOf(t,S.cat), edit=canRef(t);
  if(!groups && !ms.length) return head+`<section class="panel"><div class="empty">Fixtures appear here once the organiser makes the groups.</div></section>`;
  const ko=bracket(t,S.cat);
  const koList=ms.filter(m=>m.stage==="ko" && !m.bye).sort((a,b)=>a.round-b.round||a.slot-b.slot||(a.order||0)-(b.order||0));
  return head + (ko?`<section class="panel"><h2>Knockouts</h2>${ko}<div class="mlist">${fixList(t,koList,{edit, plan:true})}</div></section>`:"") +
    (groups?`<div class="groups">${Object.keys(groups).sort().map(G=>`<div class="grp"><h3>Group ${G}<span class="muted" style="font-size:.8rem;font-family:var(--body)">top ${Number(t.advance)||2} go through</span></h3>${standTable(t,S.cat,G)}
      <div class="mlist">${fixList(t,ms.filter(m=>m.stage==="group"&&m.group===G),{edit, plan:true})}</div></div>`).join("")}</div>`:"");
}
function viewLive(){
  const t=T(); if(!t) return noTourney();
  const n=Math.max(1,Number(t.courts)||4), nx=upNext(t,6), done=matchesOf(t).filter(m=>m.status==="done"&&!m.bye).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,6);
  return `${pickBar(t)}<section class="panel"><div class="row" style="justify-content:space-between"><div><h2>Live courts</h2><p class="muted">Scores update the moment the referee taps.</p></div><a class="btn small" href="#screen" data-screen="1">📺 Big screen</a></div>
    <div class="courts">${Array.from({length:n},(_,i)=>courtCard(t,i+1)).join("")}</div></section>
    <section class="panel"><h2>Up next</h2>${nx.length?`<div class="mlist">${nx.map(m=>matchRow(t,m,{cat:true})).join("")}</div>`:`<div class="empty">Nothing waiting.</div>`}</section>
    ${done.length?`<section class="panel"><h2>Latest results</h2><div class="mlist">${done.map(m=>matchRow(t,m,{cat:true})).join("")}</div></section>`:""}`;
}

// organiser: courts & times right on the Fixtures tab
function schedPanel(t){
  const has=matchesOf(t).some(m=>m.ptime), last=has?matchesOf(t).filter(m=>m.ptime).map(m=>m.ptime).sort().slice(-1)[0]:"";
  return `<section class="panel"><h2>🕒 Courts & times</h2>
    <div class="row" style="align-items:flex-end">
      <label class="f" style="width:140px">First match<input id="fx-start" type="time" value="${esc(t.startTime||"10:00")}"></label>
      <label class="f" style="width:150px">Minutes per match<input id="fx-mins" type="number" min="5" max="60" value="${esc(t.matchMins||15)}"></label>
      <label class="f" style="width:110px">Courts<input id="fx-courts" type="number" min="1" max="12" value="${esc(t.courts||4)}"></label>
      <button class="btn primary" data-fxsched="1">${has?"Update courts & times":"Assign courts & times"}</button></div>
    <p class="muted" style="font-size:.85rem">Covers every category. Nobody plays twice at once, and knockouts come after their groups${matchesOf(t).some(m=>m.stage==="ko")?"":" (make the knockout bracket first in Organiser → Fixtures so it gets times too)"}. ${has?`Last match at <b>${esc(last)}</b>. `:""}To move one match, tap it below and change its court or time.</p></section>`;
}

/* referee */
function viewRef(){
  const t=T(); if(!t) return noTourney();
  if(!canRef(t)) return `<section class="panel"><h2>${S.refOnly?"🏸 Referee":"Referee"}</h2><p class="muted">Enter the referee code from the organiser. Once it's open on this phone you can start matches on your court and score them live.</p>
    <div class="row" style="max-width:440px;flex-wrap:nowrap"><input id="ref-code" placeholder="Referee code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--mono)"><button class="btn primary" data-refopen="1">Open</button></div></section>`;
  const n=Math.max(1,Number(t.courts)||4), c=Math.min(n,Math.max(1,S.refCourt)), m=liveOn(t,c), r=rules(t);
  const courtPick=`<div class="cats">${Array.from({length:n},(_,i)=>`<button data-refcourt="${i+1}" aria-pressed="${i+1===c}">Court ${i+1}${liveOn(t,i+1)?" 🔴":""}</button>`).join("")}</div>`;
  if(!m){ const nx=upNext(t,30).sort((x,y)=>(x.pcourt===c?0:1)-(y.pcourt===c?0:1)).slice(0,6);
    return `<section class="panel"><h2>Referee · Court ${c}</h2>${courtPick}
      ${nx.length?`<p class="muted">Pick the next match for Court ${c}. The first one is next in line.</p><div class="mlist">${nx.map((x,i)=>`<div style="display:grid;gap:6px">${matchRow(t,x,{cat:true})}<button class="btn ${i?"small":"primary"}" data-start="${esc(x.id)}" data-court="${c}">Start on Court ${c}</button></div>`).join("")}</div>`:`<div class="empty">No matches waiting. 🎉</div>`}
      <div class="row">${S.unlock?`<button class="btn small ghost" data-refexit="1">Close referee mode</button>`:""}${S.refOnly?`<button class="btn small ghost" data-refleave="1">See the full tournament page</button>`:""}</div></section>`;
  }
  const games=m.games?.length?m.games:[[0,0]], g=games[games.length-1], w=gamesWon(m,r), win=matchWinner({games},r), a=sideTeam(m,"a"), b=sideTeam(m,"b"), A=teamById(a), B=teamById(b);
  const gi=games.length-1, needToss=!win && !(m.svc||[])[gi] && g[0]===0 && g[1]===0;
  if(needToss){
    const key=m.id+"#"+gi, prevWin = gi>0 ? (games[gi-1][0]>games[gi-1][1]?"a":"b") : null;
    const d = S.toss[key] ||= {won:null, s:prevWin, sp:null, rp:null};
    const tid = x => x==="a"?a:b, pick=(field,val,label,on)=>`<button type="button" data-toss="${field}" data-v="${val}" aria-pressed="${on}">${esc(label)}</button>`;
    return `<section class="panel refbox"><div class="row" style="justify-content:space-between"><h2>Court ${c} · ${gi?`Game ${gi+1}`:"Toss"}</h2><span class="livebadge">Live</span></div>${courtPick}
      <p class="muted">${esc(tName(a))} vs ${esc(tName(b))} · ${esc(m.disc?DISC[m.disc]:catName(t,m.cat))}${gi?` · ${esc(tName(tid(prevWin)))} won the last game, so they serve first`:""}</p>
      ${gi?"":`<div><span class="lbl">🪙 Who won the toss?</span><div class="cats">${pick("won","a",tName(a),d.won==="a")}${pick("won","b",tName(b),d.won==="b")}</div></div>`}
      <div><span class="lbl">🏸 Serving first</span><div class="cats">${pick("s","a",tName(a),d.s==="a")}${pick("s","b",tName(b),d.s==="b")}</div></div>
      ${d.s?`<div><span class="lbl">Who serves? (${esc(tName(tid(d.s)))})</span><div class="cats">${pick("sp",1,pName(tid(d.s),1),d.sp===1)}${pick("sp",2,pName(tid(d.s),2),d.sp===2)}</div></div>
        <div><span class="lbl">Who receives? (${esc(tName(tid(otherSide(d.s))))})</span><div class="cats">${pick("rp",1,pName(tid(otherSide(d.s)),1),d.rp===1)}${pick("rp",2,pName(tid(otherSide(d.s)),2),d.rp===2)}</div></div>`:""}
      <div class="row"><button class="btn primary" data-svcgo="${esc(m.id)}" ${d.s&&d.sp&&d.rp?"":"disabled"}>Start game ${gi+1} ▶</button><button class="btn small ghost" data-svcskip="${esc(m.id)}">Skip (don't track serve)</button></div>
      ${d.s&&d.sp&&d.rp?"":`<p class="muted">Tap ${[d.s?"":"who's serving first",d.s&&!d.sp?"who serves":"",d.s&&!d.rp?"who receives":""].filter(Boolean).join(", then ")} to unlock Start.</p>`}
      <div class="refctl"><button class="btn small ghost" data-stop="${esc(m.id)}">Stop match (back to queue)</button></div></section>`;
  }
  const sv=svcState(m,gi), tid=x=>x==="a"?a:b;
  const svLine = sv && !win ? `<div class="svc">🏸 <b>${esc(pName(tid(sv.serving),sv.server))}</b> serves from the <b>${sv.court==="R"?"right":"left"}</b> → <b>${esc(pName(tid(otherSide(sv.serving)),sv.receiver))}</b> receives</div>` : "";
  const tag = s => sv && !win && sv.serving===s ? `<span class="svtag">🏸 serving</span>` : "";
  return `<section class="panel refbox"><div class="row" style="justify-content:space-between"><h2>Court ${c} · ${esc(catName(t,m.cat))}</h2><span class="livebadge">Live</span></div>${courtPick}
    <p class="muted">${esc(stageTxt(m))} · Game ${games.length}${r.bestOf===2?` of 2 · games ${w.a}–${w.b}${w.a===1&&w.b===1?" · total points decide":""}`:r.bestOf>1?` of up to ${r.bestOf} · games ${w.a}–${w.b}`:""} · ${esc(ruleTxt(r))}</p>
    ${svLine}
    <div class="refpad">
      <button class="refside" data-pt="a" ${win?"disabled":""}>${tag("a")}<span class="nm">${esc(tName(a))}</span><small>${esc(pairTxt(m,A))}</small><span class="pt">${g[0]}</span><small>Tap for a point</small></button>
      <button class="refside b" data-pt="b" ${win?"disabled":""}>${tag("b")}<span class="nm">${esc(tName(b))}</span><small>${esc(pairTxt(m,B))}</small><span class="pt">${g[1]}</span><small>Tap for a point</small></button>
    </div>
    <div class="refctl">${(m.seq||[])[gi]||gi>0?`<button class="btn small" data-undo="last">↶ Undo last point</button>`:""}${!(m.seq||[]).some(x=>x)?`<button class="btn small" data-undo="a">− ${esc(tName(a))}</button><button class="btn small" data-undo="b">− ${esc(tName(b))}</button>`:""}</div>
    ${games.length>1?`<p class="muted" style="text-align:center">Earlier games: ${esc(games.slice(0,-1).map(x=>`${x[0]}–${x[1]}`).join(", "))}</p>`:""}
    ${win?`<div class="banner ok"><div class="grow"><b>${esc(tName(win==="a"?a:b))} win ${esc(gamesTxt({games}))}${r.bestOf===2&&w.a===w.b?` on total points (${Math.max(pts({games}).a,pts({games}).b)}–${Math.min(pts({games}).a,pts({games}).b)})`:""}.</b> Check the score, then confirm.</div><button class="btn primary" data-finish="${esc(m.id)}">Confirm result ✓</button></div>`:""}
    <div class="refctl"><button class="btn small ghost" data-stop="${esc(m.id)}">Stop match (back to queue)</button></div>
  </section>`;
}

/* organiser */
function viewOrg(){
  if(!S.isAdmin) return `<section class="panel"><h2>Organiser</h2><p class="muted">Sign in with the organiser account to manage tournaments.</p><button class="btn primary" data-signin="1">Sign in with Google</button></section>`;
  const t=T();
  const f=(id,label,val,type="text",extra="")=>`<label class="f">${label}<input id="to-${id}" type="${type}" value="${esc(val??"")}" ${extra}></label>`;
  const preset = S.tourneys.some(x=>x.id==="t20261018-teamcup") ? "" : `<section class="panel"><div class="row" style="justify-content:space-between"><div><h2>🏆 Team Cup · Sun 18 Oct</h2><p class="muted">Sets up the Team Cup with its venue, game format, scoring (to 15, max 17) and terms, ready for the teams.</p></div><button class="btn primary" data-tcpreset="1">Set up the Team Cup</button></div></section>`;
  const form=x=>`<div class="grid2">
      ${f("name","Tournament name",x?.name)}${f("date","Date",x?.date,"date")}${f("venue","Venue",x?.venue)}${f("address","Venue address (for the map)",x?.address,"text",'placeholder="e.g. Lodge Ave, Dagenham RM8 2JR"')}${f("entry","Entry fee (shown to players)",x?.entry)}
      ${f("wa","WhatsApp group link (players must join to register)",x?.wa||WA_GROUP,"url",'placeholder="https://chat.whatsapp.com/…"')}
      <div style="grid-column:1/-1;display:grid;gap:8px"><span class="lbl">💷 Bank details for entry fees (shown on the registration page; teams must pay before registering)</span><div class="grid2">
        ${f("bname","Account name",x?.bank?.name)}${f("bsort","Sort code",x?.bank?.sort,"text",'placeholder="00-00-00" inputmode="numeric"')}${f("bacct","Account number",x?.bank?.acct,"text",'placeholder="12345678" inputmode="numeric"')}${f("bnote","Payment note (optional)",x?.bank?.note,"text",'placeholder="e.g. £40 per team. Use your team name as the reference"')}</div>
        <span class="muted" style="font-size:.82rem">Leave the sort code and account number empty to switch payment off.</span></div>
      <label class="f" style="grid-column:1/-1">Extra game format notes (added under the automatic format)<textarea id="to-format" rows="3" placeholder="e.g. Warm-up 2 minutes, change ends at 11 in the 3rd game…">${esc(x?.format||"")}</textarea></label>
      <label class="f" style="grid-column:1/-1">Terms & conditions (players must agree)<textarea id="to-terms" rows="8">${esc(x?.terms||DEFAULT_TERMS)}</textarea></label>
      <label class="f" style="grid-column:1/-1">Directions & travel tips<textarea id="to-dirs" rows="2" placeholder="Nearest station, buses, parking, which entrance…">${esc(x?.directions||"")}</textarea></label>
      <div style="grid-column:1/-1;display:grid;gap:6px"><span class="lbl">Poster</span>
        ${(S.posterDraft ?? x?.poster) ? `<img src="${esc(S.posterDraft ?? x.poster)}" alt="Poster preview" style="max-width:220px;border-radius:12px;box-shadow:var(--shadow)">` : `<span class="muted" style="font-size:.85rem">No poster yet.</span>`}
        <div class="row"><label class="btn small" for="to-poster">${(S.posterDraft ?? x?.poster)?"Change poster":"Upload poster"}</label><input id="to-poster" type="file" accept="image/*" hidden>${(S.posterDraft ?? x?.poster)?`<button class="btn small ghost danger" data-noposter="1" type="button">Remove</button>`:""}<span class="muted" style="font-size:.82rem">Shrunk automatically. Press Save to publish it.</span></div></div>
      <label class="f" style="grid-column:1/-1">About (shown on the Register tab)<textarea id="to-info" rows="3">${esc(x?.info||"")}</textarea></label>
      ${f("prizes","Prizes",x?.prizes)}${f("max","Max teams per category (0 = no limit)",x?.maxTeams??0,"number",'min="0" max="128"')}
      ${f("courts","Courts",x?.courts??4,"number",'min="1" max="12"')}${f("start","First match starts",x?.startTime||"10:00","time")}${f("mins","Minutes per match (incl. changeover)",x?.matchMins??15,"number",'min="5" max="60"')}${f("gsize","Teams per group",x?.groupSize??4,"number",'min="3" max="8"')}
      ${f("adv","Teams through per group",x?.advance??2,"number",'min="1" max="4"')}<label class="f">Points per game<select id="to-to">${[11,15,21].map(n=>`<option value="${n}" ${Number(x?.pointsTo||21)===n?"selected":""}>${n} points</option>`).join("")}</select></label>
      <label class="f">Deuce<select id="to-deuce"><option value="1" ${x?.deuce!==false?"selected":""}>Deuce on: win by 2 (max 15 / 21 / 30)</option><option value="0" ${x?.deuce===false?"selected":""}>No deuce: first to the points wins</option></select></label>
      <label class="f">Games per match<select id="to-bo">${[[1,"1 game"],[2,"2 games (total points if 1–1)"],[3,"Best of 3"]].map(([n,l])=>`<option value="${n}" ${Number(x?.bestOf||1)===n?"selected":""}>${l}</option>`).join("")}</select></label>
      <label class="f">Tournament type<select id="to-mode"><option value="pairs" ${!isTeam(x)?"selected":""}>Doubles pairs</option><option value="team" ${isTeam(x)?"selected":""}>Team Cup: teams of 4, ties of MD + WD + XD</option></select></label>
      ${f("cap","Deuce max points (0 = standard)",x?.cap??0,"number",'min="0" max="40"')}
      ${f("wild","Team Cup: best 3rd-placed teams also through",x?.wild??0,"number",'min="0" max="8"')}
      <label class="row" style="gap:6px;align-self:end"><input type="checkbox" style="width:auto" id="to-bronze" ${x?.bronze!==false?"checked":""}> Team Cup: bronze medal match</label>
      <div style="grid-column:1/-1"><span class="lbl">Categories (doubles pairs only)</span><div class="row">${CAT_PRESETS.map(([id,nm])=>`<label class="row" style="gap:6px"><input type="checkbox" style="width:auto" id="to-cat-${id}" ${!x||x.catIds?.includes(id)?"checked":""}> ${nm}</label>`).join("")}</div></div>
      <label class="row" style="gap:6px;grid-column:1/-1"><input type="checkbox" style="width:auto" id="to-open" ${x?.regOpen?"checked":""}> Registration open</label>
    </div>`;
  if(!t) return `${preset}<section class="panel"><h2>Create a tournament</h2>${form(null)}<div><button class="btn primary" data-tsave="new">Create tournament</button></div></section>`;
  const tc=teamsOf(t);
  return `${pickBar(t)}${preset}<section class="panel"><details id="org-edit"><summary><b>Tournament details</b> · ${esc(t.name)} · registration ${t.regOpen?"open":"closed"}</summary><div style="display:grid;gap:12px;margin-top:10px">${form(t)}<div class="row"><button class="btn primary" data-tsave="${esc(t.id)}">Save</button><button class="btn small" data-tsave="new">Save as a new tournament</button></div></div></details></section>
    <section class="panel"><h2>Referees & big screen</h2>
      <div class="row code-row"><span class="lbl">Referee code</span>${S.secret?`<b class="code">${esc(S.secret)}</b><button class="btn small" data-copy="${esc(S.secret)}">Copy</button><button class="btn small ghost" data-tcode="1">New code</button>`:`<button class="btn small primary" data-tcode="1">Create code</button>`}</div>
      ${(()=>{ const link="https://dropshotfolks.co.uk/tourney/#ref", msg=`🏸 Referee for ${t.name||"the tournament"}\nOpen: ${link}\n${S.secret?`Code: ${S.secret}\n`:""}Pick your court, tap Start, do the toss, then tap a team for each point.`;
        return `<div class="row"><span class="lbl">Referee link</span><b class="code" style="font-size:.95rem;letter-spacing:0">${esc(link.replace("https://",""))}</b><button class="btn small" data-copy="${esc(link)}">Copy link</button>${S.secret?`<a class="btn small primary" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Send link & code on WhatsApp</a>`:""}</div>` })()}
      <p class="muted" style="font-size:.85rem">Referees open the link on their phone and enter the code. They only see the scoring screen, nothing else. A new code locks out phones using the old one.</p>
      <div class="row"><a class="btn small" href="#screen" data-screen="1">📺 Open big screen</a><span class="muted" style="font-size:.85rem">Put it on the projector and press F for full screen.</span></div></section>
    <section class="panel"><h2>Teams</h2>${catBar(t)}
      ${(()=>{ const ts=teamsOf(t,S.cat); return ts.length?`<div class="row"><span class="muted">${ts.length} registered · ${ts.filter(x=>x.status==="confirmed").length} confirmed</span><button class="btn small" data-confirmall="${esc(S.cat)}">Confirm all</button></div>
        <div class="tbl"><table><thead><tr><th>Team</th><th>Players</th><th>Contact</th><th></th></tr></thead><tbody>${ts.map(x=>{ const c=S.contacts[x.id]||{}; return `<tr><td><b>${esc(x.name)}</b><br>${x.status==="confirmed"?'<span class="chip st-confirmed">Confirmed</span>':'<span class="chip st-awaiting">Pending</span>'}</td><td>${playersOf(x).map(esc).join("<br>")}</td><td style="font-size:.85rem">${esc(c.email||"")}<br>${esc(c.phone||"")}${[2,3,4].map(k=>c["phone"+k]||c["email"+k]?`<br><span class="muted">P${k}:</span> ${esc(c["phone"+k]||"")} ${esc(c["email"+k]||"")}`:"").join("")}${c.lv1?`<br><span class="muted">Levels:</span> ${esc([c.lv1,c.lv2,c.lv3,c.lv4].filter(Boolean).join(" / "))}`:""}${c.g1?`<br><span class="muted">Gender:</span> ${esc([c.g1,c.g2,c.g3,c.g4].filter(Boolean).join(" / "))}`:""}${c.emName?`<br><span class="muted">Emergency:</span> ${esc(c.emName)} ${esc(c.emPhone||"")}`:""}${c.notes?`<br><span class="muted">Notes:</span> ${esc(c.notes)}`:""}${c.paid?`<br>${c.payName?`<span class="muted">Paid as:</span> <b>${esc(c.payName)}</b>`:`<span class="muted">Paid (ticked on the form)</span>`} <span class="chip st-awaiting">Check bank</span>`:""}${c.wa?`<br><span class="chip st-confirmed">In WhatsApp group</span>`:""}</td>
          <td class="row">${x.status==="confirmed"?`<button class="btn small ghost" data-tconfirm="${esc(x.id)}" data-v="pending">Unconfirm</button>`:`<button class="btn small primary" data-tconfirm="${esc(x.id)}" data-v="confirmed">Confirm</button>`}<button class="btn small ghost danger" data-tdel="${esc(x.id)}">Delete</button></td></tr>` }).join("")}</tbody></table></div>`:`<div class="empty">No teams in this category yet.</div>` })()}
      <details id="org-add"><summary>Add a team yourself</summary><div class="grid2" style="margin-top:8px">
        <label class="f">Team name<input id="oa-name" maxlength="40"></label>${Array.from({length:nPl(t)},(_,i)=>`<label class="f">Player ${i+1}<input id="oa-p${i+1}" maxlength="60"></label>`).join("")}
        <div style="align-self:end"><button class="btn small primary" data-oadd="${esc(S.cat||"")}">Add to ${esc(catName(t,S.cat))}</button></div></div></details>
      <div class="row"><label class="btn small" for="imp-file">📥 Import teams from a spreadsheet</label><input id="imp-file" type="file" accept=".xlsx,.csv" hidden>
        <span class="muted" style="font-size:.82rem">Google Form responses (.xlsx or .csv): team name, captain / player names, numbers and emails. Teams marked as paid come in confirmed, the rest as pending. Teams already here are skipped.</span></div>
    </section>
    <section class="panel"><h2>Fixtures · ${esc(catName(t,S.cat))}</h2>
      <p class="muted">${isTeam(t)?`Groups of about ${Number(t.groupSize)||3}. Every tie is men's, women's and mixed doubles. Top ${Number(t.advance)||2} per group${Number(t.wild)?` plus the best ${Number(t.wild)} third-placed`:""} go through, ranked by points, with byes for the top seeds.`:`Groups of about ${Number(t.groupSize)||4}, everyone plays everyone in their group, then the top ${Number(t.advance)||2} of each group go into the knockouts.`} Only confirmed teams are included.</p>
      <div class="row"><button class="btn primary" data-gen="${esc(S.cat||"")}">${t.groups?.[S.cat]?"Re-make groups & round robin":"Make groups & round robin"}</button>
        <button class="btn" data-genko="${esc(S.cat||"")}">${matchesOf(t,S.cat).some(m=>m.stage==="ko")?"Re-make knockout bracket":"Make knockout bracket"}</button>
        ${matchesOf(t,S.cat).length?`<button class="btn small ghost danger" data-clearfix="${esc(S.cat||"")}">Clear fixtures</button>`:""}</div>
      <p class="muted" style="font-size:.85rem">${(()=>{ const g=matchesOf(t,S.cat).filter(m=>m.stage==="group"); return g.length?`Group matches: ${g.filter(m=>m.status==="done").length} of ${g.length} played.`:"" })()} The knockout bracket can be made straight away: its places read "Winner Group A", "Runner-up Group B"… and fill in by themselves when each group finishes. Tap any match in Fixtures to fix its score, court or time.</p>
    </section>
    <section class="panel"><h2>Courts & times · all categories</h2>
      <p class="muted">Gives every match a court and a start time, from ${esc(t.startTime||"10:00")}, ${Number(t.matchMins)||15} minutes per match, on ${Number(t.courts)||4} court${(Number(t.courts)||4)>1?"s":""}. Nobody plays twice at the same time, teams get a rest between matches where possible, and knockouts come after their groups. Change the start time, minutes or courts in Tournament details first.</p>
      <div class="row"><button class="btn primary" data-sched="1">${matchesOf(t).some(m=>m.ptime)?"Re-do courts & times":"Assign courts & times"}</button>${matchesOf(t).some(m=>m.ptime)?`<span class="muted" style="font-size:.85rem">Last match at ${esc(matchesOf(t).filter(m=>m.ptime).map(m=>m.ptime).sort().slice(-1)[0])}.</span>`:""}</div>
    </section>`;
}

/* score editor (organiser or referee) */
function editPanel(){
  const t=T(), m=S.matches.find(x=>x.id===S.edit); if(!t||!m) return "";
  const r=rules(t), games=(m.games?.length?m.games:[[0,0]]).concat(r.bestOf>1&&(m.games||[]).length<r.bestOf?[[0,0]]:[]).slice(0,r.bestOf);
  return `<section class="panel" id="editbox"><h2>${S.isAdmin?"Edit match":"Edit result"}</h2>${matchRow(t,m)}
    <div class="grid2">${games.map((g,i)=>`<div class="scorein"><span class="lbl">Game ${i+1}</span><input type="number" min="0" max="40" id="eg-${i}-a" value="${g[0]}"><span>–</span><input type="number" min="0" max="40" id="eg-${i}-b" value="${g[1]}"></div>`).join("")}</div>
    ${S.isAdmin?`<div class="row"><label class="f" style="width:120px">Court<input id="ep-court" type="number" min="1" max="20" value="${esc(m.pcourt||"")}"></label><label class="f" style="width:140px">Time<input id="ep-time" type="time" value="${esc(m.ptime||"")}"></label><button class="btn small" data-eplan="${esc(m.id)}" style="align-self:end">Save court & time</button></div>`:""}
    <div class="row"><button class="btn primary" data-esave="${esc(m.id)}">Save result</button>${m.status!=="scheduled"?`<button class="btn small ghost danger" data-ereset="${esc(m.id)}">Reset to not played</button>`:""}<button class="btn small ghost" data-eclose="1">Close</button></div></section>`;
}

/* one court, big: for a laptop or TV beside each court (#court=N) */
function viewFocus(c){
  const t=T(); if(!t) return `<div class="scr"><div class="scr-h"><h1>No tournament yet</h1></div></div>`;
  const m=liveOn(t,c), r=rules(t);
  const nextHere = upNext(t,40).find(x=>x.pcourt===c) || upNext(t,1)[0];
  const head=`<div class="scr-h"><img src="../images/logo-mark.png" alt=""><h1>${esc(t.name||"Tournament")}</h1><span class="fc-court">Court ${c}</span><span class="clock" id="clock"></span></div>`;
  const foot=`<div class="scr-f">${nextHere?`<b>Next on Court ${c}:</b> ${nextHere.ptime?`<b>${esc(nextHere.ptime)}</b> `:""}${esc(tName(sideTeam(nextHere,"a")))} vs ${esc(tName(sideTeam(nextHere,"b")))} <span>(${esc(catName(t,nextHere.cat))})</span>`:"<b>dropshotfolks.co.uk/tourney</b> · live scores on your phone"}</div>`;
  if(!m) return `<div class="scr fc">${head}<div class="fc-idle"><div>🏸</div><p>Court ${c} is free</p>${nextHere?`<small>Up next: ${esc(tName(sideTeam(nextHere,"a")))} vs ${esc(tName(sideTeam(nextHere,"b")))}</small>`:""}</div>${foot}</div>`;
  const gi=Math.max(0,(m.games||[]).length-1), g=(m.games||[])[gi]||[0,0], w=gamesWon(m,r), sv=svcState(m,gi), need=r.bestOf===2?2:Math.floor(r.bestOf/2)+1;
  const row=(s,i)=>{ const id=sideTeam(m,s), tm=teamById(id), srv=sv&&sv.serving===s;
    const pl=k=>esc(tm?(k===1?tm.p1:tm.p2):""), who=m.disc?esc(DISC[m.disc]):tm?`${srv&&sv.server===1?"🏸 ":""}${pl(1)} & ${srv&&sv.server===2?"🏸 ":""}${pl(2)}`:"";
    return `<div class="fc-row ${srv?"srv":""} ${s}"><div class="fc-nm"><b>${esc(tName(id))}</b><span>${who}</span>${r.bestOf>1?`<span class="gw">${Array.from({length:need},(_,k)=>`<i class="${k<w[s]?"on":""}"></i>`).join("")}</span>`:""}</div><div class="fc-pt">${g[i]}</div></div>` };
  const svLine = sv ? `🏸 ${esc(pName(sideTeam(m,sv.serving),sv.server))} serves from the ${sv.court==="R"?"right":"left"} → ${esc(pName(sideTeam(m,otherSide(sv.serving)),sv.receiver))}` : "";
  return `<div class="scr fc">${head}
    <div class="fc-main"><div class="fc-meta">${esc(catName(t,m.cat))} · ${esc(stageTxt(m))} · Game ${gi+1}${(m.games||[]).length>1?` · earlier: ${esc((m.games||[]).slice(0,-1).map(x=>`${x[0]}–${x[1]}`).join(", "))}`:""}</div>
      ${row("a",0)}${row("b",1)}${svLine?`<div class="fc-svc">${svLine}</div>`:""}</div>${foot}</div>`;
}

/* big screen */
function viewScreen(){
  const t=T(); if(!t) return `<div class="scr"><div class="scr-h"><h1>No tournament yet</h1></div></div>`;
  const n=Math.max(1,Number(t.courts)||4), nx=upNext(t,5);
  const panels=[];
  cats(t).forEach(c=>{ const g=t.groups?.[c.id]; if(g) Object.keys(g).sort().forEach(G=>panels.push(`<h2>${esc(c.name)} · Group ${G}</h2>${standTable(t,c.id,G)}`));
    const ko=bracket(t,c.id); if(ko) panels.push(`<h2>${esc(c.name)} · Knockouts</h2>${ko}`) });
  const done=matchesOf(t).filter(m=>m.status==="done"&&!m.bye).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,6);
  if(done.length) panels.push(`<h2>Latest results</h2><div class="mlist">${done.map(m=>matchRow(t,m,{cat:true})).join("")}</div>`);
  const side = panels.length ? panels[S.scrIdx % panels.length] : `<h2>Welcome!</h2><p>Fixtures will appear here.</p>`;
  return `<div class="scr"><div class="scr-h"><img src="../images/logo-mark.png" alt=""><h1>${esc(t.name||"Tournament")}</h1><span class="clock" id="clock"></span></div>
    <div class="scr-b"><div class="scr-courts">${Array.from({length:n},(_,i)=>courtCard(t,i+1)).join("")}</div><div class="scr-side scr-fade">${side}</div></div>
    <div class="scr-f">${nx.length?`<b>Up next:</b> ${nx.map(m=>`${m.ptime?`<b>${esc(m.ptime)}</b> C${esc(m.pcourt)} `:""}${esc(tName(sideTeam(m,"a")))} vs ${esc(tName(sideTeam(m,"b")))} <span>(${esc(catName(t,m.cat))})</span>`).join(" · ")}`:"<b>dropshotfolks.co.uk/tourney</b> · scores live on your phone"}</div></div>`;
}

/* ---------- render ---------- */
const TABS = () => [["reg","Register"],["teams","Teams"],["fix","Fixtures"],["live","Live"],["ref","Referee"],...(S.isAdmin?[["org","Organiser"]]:[])];
function render(){
  const keep={}; document.querySelectorAll("#main input[id],#main select[id],#main textarea[id]").forEach(el=>{ if(el.type!=="file") keep[el.id]=el.type==="checkbox"?{c:el.checked}:{v:el.value} });
  const openD=new Set([...document.querySelectorAll("#main details[id][open]")].map(d=>d.id));
  document.body.classList.toggle("screen", S.tab==="screen");
  document.body.classList.toggle("refonly", !!S.refOnly);
  if(S.refOnly) S.tab="ref";
  if(S.tab==="screen"){ const fc=/^#court=(\d+)$/.exec(location.hash); $("#main").innerHTML = fc ? viewFocus(Number(fc[1])) : viewScreen(); tickClock(); return }
  const tabs=TABS(); if(!tabs.some(([k])=>k===S.tab)) S.tab="reg";
  const t=T(), anyLive=t && matchesOf(t).some(m=>m.status==="live");
  $("#tabs").innerHTML=tabs.map(([k,l])=>`<button role="tab" data-tab="${k}" aria-selected="${k===S.tab}">${k==="live"&&anyLive?'<span class="dot pulse"></span>':""}${esc(l)}</button>`).join("");
  $("#who").innerHTML=(S.isAdmin?`<span class="org-flag">Organiser</span>`:`<button class="btn small" data-signin="1" type="button">🔑 Organiser sign in</button>`)+(S.uid && !auth?.currentUser?.isAnonymous?` <button class="btn small" id="signOut" type="button">Sign out</button>`:"");
  const tn=$("#tname"); tn.innerHTML=t?`🏆 <b>${esc(t.name||"Tournament")}</b> · ${esc(fmtDate(t.date))}`:""; tn.hidden=!t;
  const views={reg:viewReg, teams:viewTeams, fix:viewFix, live:viewLive, ref:viewRef, org:viewOrg};
  $("#main").innerHTML = !S.loaded ? `<section class="panel"><div class="empty loading">Loading…</div></section>` : (S.edit?editPanel():"") + views[S.tab]();
  Object.entries(keep).forEach(([id,k])=>{ const el=document.getElementById(id); if(!el) return; if("c" in k) el.checked=k.c; else el.value=k.v });
  document.querySelectorAll("#main details[id]").forEach(d=>{ if(openD.has(d.id)) d.open=true });
}
function tickClock(){ const c=$("#clock"); if(c) c.textContent=new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) }
setInterval(()=>{ if(S.tab==="screen"){ tickClock() } },15000);
setInterval(()=>{ if(S.tab==="screen"){ S.scrIdx++; render() } },12000);
addEventListener("hashchange",()=>{ S.refOnly = location.hash==="#ref";
  S.tab = /^#(screen|court=\d+)$/.test(location.hash) ? "screen" : S.refOnly ? "ref" : (S.tab==="screen"?"live":S.tab); render() });
document.addEventListener("keydown",e=>{ if(S.tab!=="screen") return;
  if(e.key==="f"||e.key==="F") document.documentElement.requestFullscreen?.().catch(()=>{});
  if(e.key==="Escape" && !document.fullscreenElement) location.hash="" });

/* ---------- actions ---------- */
async function ensureSignedIn(){
  if(auth.currentUser) return auth.currentUser;
  const c=await auth.signInAnonymously(); S.uid=c.user.uid; return c.user;
}
async function tryRefUnlock(code){
  const t=T(); if(!t) return;
  try{ await ensureSignedIn(); await db.collection("tunlocks").doc(auth.currentUser.uid).set({tid:t.id, code, at:nowIso()});
    S.unlock={tid:t.id, code}; render(); toast("Referee mode is on for this phone") }
  catch(e){ toast(e?.code==="permission-denied"?"That code doesn't match":e?.code==="auth/operation-not-allowed"?"Referee mode isn't switched on yet":"Couldn't check the code") }
}
// Firestore can't hold arrays of arrays, so each game is stored as {a, b}
const toDb = g => (g||[]).map(x=>({a:x[0]||0, b:x[1]||0}));
const fromDb = g => (g||[]).map(x=>Array.isArray(x)?x:[x?.a||0, x?.b||0]);
const upd = (id, data) => db.collection("tmatches").doc(id).update({...data, ...(data.games?{games:toDb(data.games)}:{}), updatedAt:nowIso()}).catch(e=>toast(e?.code==="permission-denied"?(data.svc?"Couldn't start: the latest Firebase rules aren't published yet. Ask the organiser to publish them.":"Not allowed. Is referee mode still on?"):"Couldn't save. Check your connection."));
async function point(m, side, delta){
  const t=T(), r=rules(t); let games=(m.games?.length?m.games:[[0,0]]).map(g=>[...g]);
  const seq=(m.seq||[]).map(String); while(seq.length<games.length) seq.push("");
  let gi=games.length-1, g=games[gi];
  if(delta<0){
    if(g[0]===0&&g[1]===0&&gi>0){ games.pop(); seq.length=games.length; gi--; g=games[gi] }
    if(side==="last"){ const last=seq[gi].slice(-1); if(!last) return; seq[gi]=seq[gi].slice(0,-1); const i=last==="a"?0:1; if(g[i]>0) g[i]--; }
    else { const i=side==="a"?0:1; if(g[i]>0) g[i]--; const k=seq[gi].lastIndexOf(side); if(k>=0) seq[gi]=seq[gi].slice(0,k)+seq[gi].slice(k+1) }
    return upd(m.id,{games, seq});
  }
  if(matchWinner({games},r)) return;
  g[side==="a"?0:1]++; seq[gi]+=side;
  if(gameDone(g,r) && !matchWinner({games},r)) { games.push([0,0]); seq.push(""); toast(`Game to ${tName(sideTeam(m,side))}! Change ends.`) }
  try{ navigator.vibrate?.(30) }catch{}
  return upd(m.id,{games, seq});
}

document.addEventListener("click", async e=>{
  if(e.target.closest("select,input,.plan")) return;   // court/time pickers inside a match card
  const t0=e.target.closest("button,a,[data-medit]"); if(!t0) return;
  const ds=t0.dataset, t=T();
  if(ds.readopen){ const t2=T(); if(!t2) return; const k=ds.readopen, box=document.createElement("div"); box.className="readmodal"; box.setAttribute("role","dialog"); box.setAttribute("aria-modal","true");
    box.innerHTML=`<div class="readcard"><h2>${k==="format"?"📋 Game format":"📜 Terms & conditions"}</h2><div class="readtxt">${esc(k==="format"?formatTxt(t2):(t2.terms||DEFAULT_TERMS)).replace(/\n/g,"<br>")}</div><button type="button" class="btn primary" data-readdone="${k}">I've read this ✓</button></div>`;
    document.body.appendChild(box); box.querySelector("[data-readdone]").focus(); return }
  if(ds.readdone){ (S.read||={})[ds.readdone]=true; t0.closest(".readmodal")?.remove(); render(); return }
  if(ds.wajoin){ S.waOpened=true; setTimeout(render,300); return }   // let the link open, then unlock the tick box
  if(t0.id==="signOut"){ await auth.signOut(); location.reload(); return }
  if(ds.tab){ S.tab=ds.tab; S.edit=null; ls.set("dsf:ttab",S.tab); if(location.hash) history.replaceState(null,"",location.pathname); render(); scrollTo({top:0}); return }
  if(ds.screen){ e.preventDefault(); location.hash="#screen"; return }
  if(ds.tid){ S.tid=ds.tid; ls.set("dsf:tid",S.tid); render(); return }
  if(ds.cat){ S.cat=ds.cat; render(); return }
  if(ds.copy){ try{ await navigator.clipboard.writeText(ds.copy); toast("Copied") }catch{ toast(ds.copy) } return }
  if(ds.signin){ try{ await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); ls.set("dsf:ttab","org"); location.reload() }catch{ toast("Sign-in didn't finish") } return }
  if(ds.withdraw){ const x=teamById(ds.withdraw); if(!x||!confirm(`Withdraw ${x.name}?`)) return;
    await db.collection("tcontacts").doc(x.id).delete().catch(()=>{}); await db.collection("tteams").doc(x.id).delete().then(()=>toast("Team withdrawn"),()=>toast("Couldn't withdraw")); return }
  // referee
  if(ds.refopen){ const code=($("#ref-code")?.value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,""); if(code.length<4){ toast("Enter the referee code"); return } tryRefUnlock(code); return }
  if(ds.refexit){ try{ await db.collection("tunlocks").doc(auth.currentUser.uid).delete() }catch{} S.unlock=null; render(); return }
  if(ds.refleave){ S.refOnly=false; history.replaceState(null,"",location.pathname); S.tab="live"; render(); return }
  if(ds.refcourt){ S.refCourt=Number(ds.refcourt); ls.set("dsf:refcourt",S.refCourt); render(); return }
  if(ds.start){ const m=S.matches.find(x=>x.id===ds.start); if(!m) return; const c=Number(ds.court); keepAwake();
    if(liveOn(t,c)){ toast(`Court ${c} already has a match`); return }
    await upd(m.id,{status:"live", court:c, games:m.games?.length?m.games:[[0,0]], winner:null}); return }
  if(ds.toss){ const m=liveOn(t,Math.min(Math.max(1,Number(t.courts)||4),S.refCourt)); if(!m) return; const gi=Math.max(0,(m.games||[]).length-1), d=S.toss[m.id+"#"+gi]||(S.toss[m.id+"#"+gi]={});
    const v=ds.toss==="sp"||ds.toss==="rp"?Number(ds.v):ds.v; d[ds.toss]=v; if(ds.toss==="s"){ d.sp=null; d.rp=null } render(); return }
  if(ds.svcgo||ds.svcskip){ const m=S.matches.find(x=>x.id===(ds.svcgo||ds.svcskip)); if(!m) return; const gi=Math.max(0,(m.games||[]).length-1), d=S.toss[m.id+"#"+gi]||{};
    const svc=[...(m.svc||[])]; while(svc.length<gi) svc.push({skip:true});
    svc[gi] = ds.svcskip ? {skip:true} : {s:d.s, sp:d.sp, rp:d.rp, ...(gi===0&&d.won?{won:d.won}:{})};
    const seq=(m.seq||[]).map(String); while(seq.length<=gi) seq.push("");
    await upd(m.id,{svc, seq, games:m.games?.length?m.games:[[0,0]]});
    if(ds.svcgo){ const sv=svcState({svc, seq},gi), tid=x=>x==="a"?sideTeam(m,"a"):sideTeam(m,"b"); toast(`${pName(tid(sv.serving),sv.server)} to serve. Play!`) } return }
  if(ds.pt){ const m=liveOn(t,Math.min(Math.max(1,Number(t.courts)||4),S.refCourt)); if(m) point(m, ds.pt, 1); return }
  if(ds.undo){ const m=liveOn(t,Math.min(Math.max(1,Number(t.courts)||4),S.refCourt)); if(m) point(m, ds.undo, -1); return }
  if(ds.finish){ const m=S.matches.find(x=>x.id===ds.finish), w=matchWinner(m,rules(t)); if(!w) return;
    await upd(m.id,{status:"done", winner:w, games:(m.games||[]).filter(g=>g[0]||g[1])}); toast(`Result saved: ${tName(sideTeam(m,w))} win`); return }
  if(ds.stop){ if(!confirm("Stop this match and put it back in the queue? The score so far is kept.")) return; await upd(ds.stop,{status:"scheduled", court:0}); return }
  if(ds.medit){ if(!canRef(t)) return; S.edit=ds.medit; render(); scrollTo({top:0,behavior:"smooth"}); return }
  if(ds.eclose){ S.edit=null; render(); return }
  if(ds.esave){ const m=S.matches.find(x=>x.id===ds.esave), r=rules(t), games=[];
    for(let i=0;i<r.bestOf;i++){ const a=$(`#eg-${i}-a`), b=$(`#eg-${i}-b`); if(!a) break; const g=[Number(a.value)||0, Number(b.value)||0]; if(g[0]||g[1]) games.push(g) }
    const w=matchWinner({games},r); if(!w){ toast(`That isn't a finished match yet (${r.bestOf===2?"2 games, ":""}games ${ruleTxt(r)})`); return }
    await upd(m.id,{games, winner:w, status:"done", court:0}); S.edit=null; toast("Result saved"); render(); return }
  if(ds.ereset){ await upd(ds.ereset,{games:[], winner:null, status:"scheduled", court:0}); S.edit=null; render(); return }
  // organiser
  if(!S.isAdmin) return;
  if(ds.noposter){ S.posterDraft=""; render(); return }
  if(ds.tsave){ const g=id=>$(`#to-${id}`), team=g("mode").value==="team", catIds=team?["TC"]:CAT_PRESETS.filter(([id])=>g(`cat-${id}`)?.checked).map(([id])=>id);
    if(!g("name").value.trim()){ toast("Give the tournament a name"); return } if(!catIds.length){ toast("Pick at least one category"); return }
    const data={name:g("name").value.trim(), date:g("date").value, venue:g("venue").value.trim(), entry:g("entry").value.trim(), info:g("info").value.trim(), prizes:g("prizes").value.trim(),
      maxTeams:Number(g("max").value)||0, courts:Math.min(12,Math.max(1,Number(g("courts").value)||4)), groupSize:Math.min(8,Math.max(3,Number(g("gsize").value)||4)), advance:Math.min(4,Math.max(1,Number(g("adv").value)||2)),
      pointsTo:Number(g("to").value)||21, deuce:g("deuce").value!=="0", bestOf:Number(g("bo").value)||1, startTime:g("start").value||"10:00", matchMins:Math.min(60,Math.max(5,Number(g("mins").value)||15)),
      address:g("address").value.trim(), directions:g("dirs").value.trim(), format:g("format").value.trim().slice(0,2000), terms:(g("terms").value.trim()||DEFAULT_TERMS).slice(0,5000),
      bank:{name:g("bname").value.trim().slice(0,60), sort:g("bsort").value.trim().slice(0,12), acct:g("bacct").value.trim().slice(0,20), note:g("bnote").value.trim().slice(0,200)}, wa:/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(g("wa").value.trim())?g("wa").value.trim().split("?")[0]:WA_GROUP, ...(S.posterDraft!==undefined?{poster:S.posterDraft}:{}), regOpen:g("open").checked,
      mode:team?"team":"pairs", cap:Math.min(40,Math.max(0,Number(g("cap").value)||0)), wild:Math.min(8,Math.max(0,Number(g("wild").value)||0)), bronze:g("bronze").checked,
      catIds, cats:team?[{id:"TC",name:"Team Cup"}]:CAT_PRESETS.filter(([id])=>catIds.includes(id)).map(([id,name])=>({id,name}))};
    const id = ds.tsave==="new" ? `t${(data.date||nowIso().slice(0,10)).replace(/-/g,"")}-${Date.now().toString(36).slice(-4)}` : ds.tsave;
    await db.collection("tourneys").doc(id).set(data,{merge:true}).then(()=>{ S.tid=id; ls.set("dsf:tid",id); S.posterDraft=undefined; toast("Tournament saved") },()=>toast("Couldn't save")); return }
  if(ds.tcode){ const code=newCode(); await db.collection("tsecrets").doc(t.id).set({code}).then(()=>{ S.secret=code; render(); toast(`Referee code ${code}`) },()=>toast("Couldn't save the code")); return }
  if(ds.tconfirm){ await db.collection("tteams").doc(ds.tconfirm).update({status:ds.v}).catch(()=>toast("Couldn't update")); return }
  if(ds.confirmall){ const b=db.batch(); teamsOf(t,ds.confirmall).filter(x=>x.status!=="confirmed").forEach(x=>b.update(db.collection("tteams").doc(x.id),{status:"confirmed"})); await b.commit(); toast("All confirmed"); return }
  if(ds.tdel){ const x=teamById(ds.tdel); if(!x||!confirm(`Delete ${x.name}?`)) return; await db.collection("tcontacts").doc(x.id).delete().catch(()=>{}); await db.collection("tteams").doc(x.id).delete(); return }
  if(ds.oadd){ const v=id=>($(`#oa-${id}`)?.value||"").trim(), ks=Array.from({length:nPl(t)},(_,i)=>"p"+(i+1)); if(!v("name")||ks.some(k=>!v(k))){ toast(`Add a team name and all ${ks.length} players`); return }
    await db.collection("tteams").add({tid:t.id, cat:ds.oadd, name:v("name"), ...Object.fromEntries(ks.map(k=>[k,v(k)])), createdBy:S.uid, createdAt:nowIso(), status:"confirmed"}); ["name",...ks].forEach(k=>$(`#oa-${k}`).value=""); toast("Team added"); return }
  if(ds.tcpreset){ const id="t20261018-teamcup"; if(S.tourneys.some(x=>x.id===id)){ S.tid=id; ls.set("dsf:tid",id); render(); toast("The Team Cup is already set up"); return }
    await db.collection("tourneys").doc(id).set(TEAM_CUP).then(()=>{ S.tid=id; ls.set("dsf:tid",id); toast("Team Cup set up. Now import the teams.") },()=>toast("Couldn't save")); return }
  if(ds.gen){ if(matchesOf(t,ds.gen).length && !confirm("This replaces all fixtures and results for this category. Carry on?")) return; await generateGroups(t, ds.gen); return }
  if(ds.fxsched){ const start=$("#fx-start").value||"10:00", mins=Math.min(60,Math.max(5,Number($("#fx-mins").value)||15)), courts=Math.min(12,Math.max(1,Number($("#fx-courts").value)||4));
    if(matchesOf(t).some(m=>m.ptime) && !confirm("Re-do the courts and times for every match?")) return;
    await db.collection("tourneys").doc(t.id).set({startTime:start, matchMins:mins, courts},{merge:true});
    await scheduleAll({...t, startTime:start, matchMins:mins, courts}); return }
  if(ds.sched){ if(matchesOf(t).some(m=>m.ptime) && !confirm("Re-do the courts and times for every match?")) return; await scheduleAll(t); return }
  if(ds.eplan){ const c=Number($("#ep-court").value)||0, tm=$("#ep-time").value; await db.collection("tmatches").doc(ds.eplan).update({pcourt:c||null, ptime:tm||null}).then(()=>toast("Court & time saved"),()=>toast("Couldn't save")); return }
  if(ds.genko){
    if(matchesOf(t,ds.genko).some(m=>m.stage==="ko") && !confirm("Replace the current knockout bracket and its results?")) return;
    await generateKnockouts(t, ds.genko); return }
  if(ds.clearfix){ if(!confirm("Delete all fixtures and results for this category?")) return; await clearMatches(t, ds.clearfix);
    await db.collection("tourneys").doc(t.id).set({groups:{...(t.groups||{}), [ds.clearfix]:firebase.firestore.FieldValue.delete()}},{merge:true}); toast("Fixtures cleared"); return }
});
// poster: shrink to fit the database (max 1400px, JPEG)
function shrinkImage(file, max=1400){
  return new Promise((res,rej)=>{ const img=new Image(); img.onload=()=>{ const k=Math.min(1,max/Math.max(img.width,img.height)), c=document.createElement("canvas");
    c.width=Math.round(img.width*k); c.height=Math.round(img.height*k); c.getContext("2d").drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(img.src);
    let q=.85, out=c.toDataURL("image/jpeg",q); while(out.length>700000 && q>.4){ q-=.1; out=c.toDataURL("image/jpeg",q) } res(out) }; img.onerror=rej; img.src=URL.createObjectURL(file) });
}
document.addEventListener("change", async e=>{
  const pc=e.target.dataset?.plcourt, pt=e.target.dataset?.pltime;
  if((pc||pt) && S.isAdmin){ const id=pc||pt, data=pc?{pcourt:Number(e.target.value)||null}:{ptime:e.target.value||null};
    await db.collection("tmatches").doc(id).update(data).then(()=>toast(pc?`Court ${e.target.value||"cleared"}`:`Time ${e.target.value||"cleared"}`),()=>toast("Couldn't save")); return }
  if(e.target.id==="imp-file" && e.target.files?.[0] && S.isAdmin){ const f=e.target.files[0]; e.target.value="";
    try{ const list=teamsFromRows(await readSheet(f)); if(!list.length){ toast("No teams found. Is there a 'Team Name' column?"); return } await importTeams(T(), list) }
    catch(err){ console.error(err); toast("Couldn't read that file. Save it as .xlsx or .csv and try again.") } return }
  if(e.target.id==="myTeam"){ S.myTeam=e.target.value||null; ls.set("dsf:myteam",S.myTeam); render(); return }
  if(e.target.id!=="to-poster" || !e.target.files?.[0]) return;
  try{ S.posterDraft=await shrinkImage(e.target.files[0]); render(); toast("Poster ready. Press Save to publish it.") }catch{ toast("Couldn't read that image") }
});
document.addEventListener("submit", async e=>{
  if(e.target.id!=="regForm") return; e.preventDefault();
  const t=T(), v=id=>($(`#rg-${id}`)?.value||"").trim(), cat=v("cat"), emailOk=x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x), phoneOk=x=>(x.match(/\d/g)||[]).length>=10;
  const N=nPl(t), ns=Array.from({length:N},(_,i)=>i+1);
  const miss=[["name","the team name"], ...ns.flatMap(n=>[["p"+n,`player ${n}'s name`],["ph"+n,`player ${n}'s mobile`],...(n===1?[["em1","player 1's email"]]:[]),["lv"+n,`player ${n}'s level`],["g"+n,`player ${n}'s gender`]]),
    ["emname","the emergency contact name"],["emphone","the emergency contact phone"]].find(([k])=>!v(k));
  const bad=(id,msg)=>{ toast(msg); const el=$(`#rg-${id}`); el?.focus(); el?.scrollIntoView({block:"center",behavior:"smooth"}); };
  if(miss) return bad(miss[0],`Please add ${miss[1]}`);
  if(!emailOk(v("em1"))) return bad("em1","Check player 1's email");
  for(const n of ns.slice(1)) if(v("em"+n) && !emailOk(v("em"+n))) return bad("em"+n,`Check player ${n}'s email`);
  if(isTeam(t) && (ns.filter(n=>v("g"+n)==="Male").length!==2 || ns.filter(n=>v("g"+n)==="Female").length!==2)) return bad("g1","A Team Cup team needs 2 men and 2 women");
  for(const k of [...ns.map(n=>"ph"+n),"emphone"]) if(!phoneOk(v(k))) return bad(k,"Check that phone number. It needs at least 10 digits");
  if(bankOf(t) && !v("payname")) return bad("payname","Add the name on the bank payment");
  if(bankOf(t) && !$("#rg-paid")?.checked) return bad("paid","Pay the entry fee first and tick to confirm. It's required");
  if(!$("#rg-wa")?.checked) return bad("wa", S.waOpened?`Tick to confirm ${isTeam(t)?"all 4":"both"} players joined the WhatsApp group`:"Join the WhatsApp group first. It's required");
  if(!$("#rg-fmt")?.checked) return bad("fmt", S.read?.format?"Tick to confirm you've read the game format":"Read the game format first. It's required");
  if(!$("#rg-terms")?.checked) return bad("terms", S.read?.terms?"Tick to agree to the terms & conditions":"Read the terms & conditions first. They're required");
  if(!$("#rg-ok")?.checked) return bad("ok","Tick the box to say the organiser can contact you");
  const btn=e.target.querySelector("button[type=submit]"); btn.disabled=true;
  try{
    const u=await ensureSignedIn();
    const ref=db.collection("tteams").doc();
    await ref.set({tid:t.id, cat, name:v("name"), ...Object.fromEntries(ns.map(n=>["p"+n,v("p"+n)])), createdBy:u.uid, createdAt:nowIso(), status:"pending"});
    await db.collection("tcontacts").doc(ref.id).set({email:v("em1"), phone:v("ph1"), ...Object.fromEntries(ns.slice(1).flatMap(n=>[["email"+n,v("em"+n)],["phone"+n,v("ph"+n)]])), ...Object.fromEntries(ns.flatMap(n=>[["lv"+n,v("lv"+n)],["g"+n,v("g"+n)]])),
      emName:v("emname"), emPhone:v("emphone"), notes:v("notes"), wa:true, agreed:true, ...(bankOf(t)?{paid:true, payName:v("payname")}:{}), createdBy:u.uid});
    const nm=v("name"); $("#regForm")?.reset(); S.waOpened=false; S.read={}; render();   // the form may have been redrawn while saving
    toast(`${nm||"Team"} registered! 🎉`); burst();
  }catch(err){ toast(err?.code==="permission-denied"?"Registration is closed or that category is full":err?.code==="auth/operation-not-allowed"?"Registration isn't switched on yet":"Couldn't register. Check your connection.") }
  btn.disabled=false;
});
/* ---------- import teams from a Google Form spreadsheet (.xlsx or .csv) ---------- */
async function unzip(buf, want){
  const dv=new DataView(buf.buffer, buf.byteOffset, buf.byteLength); let e=buf.length-22; while(e>=0 && dv.getUint32(e,true)!==0x06054b50) e--; if(e<0) throw new Error("not a zip");
  const n=dv.getUint16(e+10,true), out={}; let p=dv.getUint32(e+16,true);
  for(let i=0;i<n;i++){ const method=dv.getUint16(p+10,true), csize=dv.getUint32(p+20,true), nl=dv.getUint16(p+28,true), xl=dv.getUint16(p+30,true), cl=dv.getUint16(p+32,true), off=dv.getUint32(p+42,true);
    const name=new TextDecoder().decode(buf.subarray(p+46,p+46+nl)); p+=46+nl+xl+cl; if(!want.test(name)) continue;
    const start=off+30+dv.getUint16(off+26,true)+dv.getUint16(off+28,true), data=buf.subarray(start,start+csize);
    const raw = method===0 ? data : new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
    out[name]=new TextDecoder().decode(raw) }
  return out;
}
function parseCSV(txt){
  const rows=[]; let row=[], cell="", q=false;
  for(let i=0;i<txt.length;i++){ const ch=txt[i];
    if(q){ if(ch==='"'){ if(txt[i+1]==='"'){ cell+='"'; i++ } else q=false } else cell+=ch }
    else if(ch==='"') q=true; else if(ch===","){ row.push(cell); cell="" } else if(ch==="\n"||ch==="\r"){ if(ch==="\r"&&txt[i+1]==="\n") i++; row.push(cell); rows.push(row); row=[]; cell="" } else cell+=ch }
  if(cell||row.length){ row.push(cell); rows.push(row) } return rows;
}
async function readSheet(file){
  const buf=new Uint8Array(await file.arrayBuffer());
  if(/\.csv$/i.test(file.name)) return parseCSV(new TextDecoder().decode(buf));
  const files=await unzip(buf, /^xl\/(sharedStrings|worksheets\/sheet\d+)\.xml$/), xml=k=>files[k]?new DOMParser().parseFromString(files[k],"application/xml"):null;
  const ss=xml("xl/sharedStrings.xml"), strings=ss?[...ss.getElementsByTagName("si")].map(si=>[...si.getElementsByTagName("t")].map(x=>x.textContent).join("")):[];
  const sheet=Object.keys(files).filter(k=>k.includes("worksheets")).sort((a,b)=>parseInt(a.match(/\d+/))-parseInt(b.match(/\d+/)))[0], doc=xml(sheet); if(!doc) throw new Error("no sheet");
  return [...doc.getElementsByTagName("row")].map(r=>{ const row=[];
    for(const c of r.getElementsByTagName("c")){ const col=[...(c.getAttribute("r")||"A").replace(/\d+/g,"")].reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0)-1, tp=c.getAttribute("t"), v=c.getElementsByTagName("v")[0]?.textContent;
      row[col] = tp==="s" ? (strings[Number(v)]??"") : tp==="inlineStr" ? [...c.getElementsByTagName("t")].map(x=>x.textContent).join("") : (v??"") }
    return Array.from(row,x=>x??"") });
}
// match Google Form headers like "Captain's Name", "Player 2 Contact Number", "Player  4 Email"
function teamsFromRows(rows){
  const hi=rows.findIndex(r=>r.some(c=>/team\s*name/i.test(c))); if(hi<0) return [];
  const H=rows[hi].map(h=>String(h).toLowerCase().replace(/\s+/g," ").trim()), cols=re=>H.map((h,i)=>re.test(h)?i:-1).filter(i=>i>=0);
  const pick=(r,re)=>{ for(const i of cols(re)){ const v=String(r[i]??"").trim(); if(v) return v } return "" };
  const who=k=>k===1?"(captain'?s?|player ?1)":`player ?${k}`;
  return rows.slice(hi+1).map(r=>{ const o={name:pick(r,/team ?name/)};
    for(let k=1;k<=4;k++){ o["p"+k]=pick(r,new RegExp(`^${who(k)}'?s? (full )?name`)); o["ph"+k]=pick(r,new RegExp(`^${who(k)}.*(number|phone|mobile)`)); o["em"+k]=pick(r,new RegExp(`^${who(k)}.*e-?mail`)); o["g"+k]=pick(r,new RegExp(`^${who(k)}.*gender`)) }
    o.paid=/done|paid|yes/i.test(pick(r,/payment|paid/)); o.wa=/done|yes|joined/i.test(pick(r,/whatsapp/)); o.agreed=!!pick(r,/term/);
    return o }).filter(o=>o.name && o.p1);
}
async function importTeams(t, list){
  if(!t) return;
  const have=new Set(teamsOf(t).map(x=>x.name.trim().toLowerCase())), add=list.filter(o=>!have.has(o.name.trim().toLowerCase()));
  if(!add.length){ toast("Those teams are already in"); return }
  if(!confirm(`Add ${add.length} team${add.length>1?"s":""} to ${t.name}?${list.length>add.length?` (${list.length-add.length} already in)`:""}\n\n${add.map(o=>`• ${o.name.trim()}${o.paid?"":"  (payment not ticked, so pending)"}`).join("\n")}`)) return;
  const cat=isTeam(t)?"TC":(S.cat||cats(t)[0]?.id), cut=(v,k)=>String(v||"").trim().slice(0,k), base=Date.now(); let n=0;
  for(const [i,o] of add.entries()){
    try{ const ref=db.collection("tteams").doc();
      await ref.set({tid:t.id, cat, name:cut(o.name,40), ...Object.fromEntries(Array.from({length:nPl(t)},(_,k)=>["p"+(k+1),cut(o["p"+(k+1)],60)])), createdBy:S.uid, createdAt:new Date(base+i).toISOString(), status:o.paid?"confirmed":"pending"});
      await db.collection("tcontacts").doc(ref.id).set({email:cut(o.em1,120), phone:cut(o.ph1,30), ...Object.fromEntries([2,3,4].flatMap(k=>[["email"+k,cut(o["em"+k],120)],["phone"+k,cut(o["ph"+k],30)]])),
        ...Object.fromEntries([1,2,3,4].filter(k=>o["g"+k]).map(k=>["g"+k,cut(o["g"+k],30)])), paid:o.paid, wa:o.wa, agreed:o.agreed, createdBy:S.uid});
      n++ }catch(err){ console.error(err) } }
  toast(n===add.length?`${n} team${n>1?"s":""} added 🎉`:`${n} of ${add.length} added. Check the Firebase rules are published.`);
}

function burst(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el=document.createElement("div"); el.className="burst"; el.setAttribute("aria-hidden","true");
  el.innerHTML=Array.from({length:26},(_,k)=>`<span style="left:${Math.random()*100}%;animation-delay:${(Math.random()*.5).toFixed(2)}s">${["🏸","🎉","🏆","✨"][k%4]}</span>`).join("");
  document.body.append(el); setTimeout(()=>el.remove(),4000);
}

// stop the referee's phone going to sleep mid-match
let wakeLock=null;
async function keepAwake(){ try{ if("wakeLock" in navigator && !wakeLock){ wakeLock=await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release",()=>{ wakeLock=null }) } }catch{} }
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible" && S.tab==="ref" && S.unlock) keepAwake() });

/* ---------- stay up to date: reload when a newer version is published ---------- */
const APP_VERSION = (document.currentScript?.src.match(/[?&]v=(\d+)/)||[])[1] || "";
async function checkVersion(){
  try{ const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"}); if(!r.ok) return; const {v}=await r.json();
    if(!v || !APP_VERSION || v===APP_VERSION) return;
    const busy = S.tab==="ref" || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||"");
    if(busy) toast("A new version is ready. Reload the page when you can."); else location.reload() }catch{}
}
setTimeout(checkVersion, 4000); setInterval(checkVersion, 120000);

/* ---------- start ---------- */
(async function start(){
  render();
  if(!window.FIREBASE_CONFIG?.apiKey){ $("#main").innerHTML=`<section class="panel"><div class="empty">Firebase isn't configured.</div></section>`; return }
  firebase.initializeApp(window.FIREBASE_CONFIG); db=firebase.firestore(); auth=firebase.auth();
  if(window.FIREBASE_EMULATOR){ auth.useEmulator("http://127.0.0.1:9099"); db.useEmulator("127.0.0.1",8080) }
  await new Promise(res=>{ let first=true; auth.onAuthStateChanged(u=>{
    S.uid=u?.uid||null; S.isAdmin=!!u && u.emailVerified && ADMINS.includes(String(u.email||"").toLowerCase());
    if(first){ first=false; res() } else render() }) });
  const first={tourneys:1,tteams:1,tmatches:1}, once=k=>{ if(first[k]){ delete first[k]; if(!Object.keys(first).length) S.loaded=true } render() };
  const listen=(coll,cb)=>db.collection(coll).onSnapshot(s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))), ()=>toast("Live updates stopped. Reload the page."));
  listen("tourneys", d=>{ S.tourneys=d; once("tourneys") });
  listen("tteams", d=>{ S.teams=d; once("tteams") });
  listen("tmatches", d=>{ S.matches=d.map(m=>({...m, games:fromDb(m.games)})); once("tmatches") });
  if(S.isAdmin){
    listen("tcontacts", d=>{ S.contacts=Object.fromEntries(d.map(x=>[x.id,x])); render() });
    const watchSecret=()=>{ const t=T(); if(t) db.collection("tsecrets").doc(t.id).get().then(d=>{ S.secret=d.exists?d.data().code:null; render() }).catch(()=>{}) };
    setTimeout(watchSecret,800);
  }
  auth.onAuthStateChanged(u=>{ if(u) db.collection("tunlocks").doc(u.uid).onSnapshot(d=>{ S.unlock=d.exists?d.data():null; render() },()=>{}) });
})();
