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
const NET_PLAY = {address:"Barking Sporthouse and Gym, Mayesbrook Park, Lodge Ave, Dagenham RM8 2JR", entry:"£30 per player · £27 early bird until 30 Oct",
  info:"Men's, women's and mixed doubles, all levels, 18+. Saturday 21 November, 12:00–18:00.\n12:00 check-in at the Tournament Desk · 12:15 warm-up and briefing · 12:30 group stage · 15:40 quarter-finals · 16:25 semi-finals · 17:00 finals and 3rd-place play-offs · 17:30 prize-giving.\nSpectators £2 on the door. Registration closes 18 November or when a category fills.",
  maxTeams:24, courts:5, startTime:"12:30", matchMins:12, groupSize:3, advance:1, koSize:8, wild:0, bronze:true, pointsTo:15, deuce:true, cap:17, bestOf:1,
  stageRules:{ko:{pointsTo:21, cap:23, bestOf:1}, final:{pointsTo:11, cap:15, bestOf:3}},
  format:`Rally-point scoring. Ends change at 8 in games to 15, 11 in games to 21 and 6 in games to 11. No mid-game interval.
2 minutes of warm-up before every round. Teams must be on court within 5 minutes of being called, or it's a walkover (15–0).
Groups are drawn by software. Quarter-finals: A v H, B v G, C v F, D v E.
Feather shuttles provided. Every match has an umpire. Partner changes allowed until 14 November with the organiser's approval.`,
  terms:`By registering for Net Play, each player agrees to these terms. "Organiser" means Dropshot Folks, run by Anamika Srivastava as a sole trader.
1. Entry and eligibility. Entry is open to players aged 18 or over on the day of the event, of any playing level. Each player may enter one category only. A team is confirmed only once both partners have registered and paid. Places are allocated first come, first served, up to 24 teams per category; later entries go on a waiting list. The organiser may refuse an entry without giving a reason, with a full refund.
2. Fees and payment. Entry is £30 per player, or £27 per player if paid by 30 October 2026. Registration closes on 18 November 2026, or earlier if a category fills. Spectator entry is £2 per person, paid on the door. Fees cover court hire, shuttles, officials and the prize fund.
3. Withdrawals, refunds and substitutions. Entry fees are non-refundable if a player or team withdraws; instead, the place can be passed to a replacement player or team. A team may replace a partner free of charge up to one week before the event (by 14 November 2026), with the organiser's approval and if the new player meets the eligibility rules. If the organiser cancels the event, all entry fees are refunded in full. If the event is moved, players can transfer to the new date or take a full refund. The organiser is not responsible for travel, accommodation or other costs players incur.
4. Format and rulings. The competition follows the Net Play Game Format and the BWF Laws of Badminton. The organiser may change the format, schedule, groups or number of teams on the day to keep the event on time; any change is announced at the Tournament Desk and in the WhatsApp group. The Tournament Referee's decision on any match or rules question is final. Free play courts are offered only when time allows and are not guaranteed.
5. Prizes. Prizes are £200, £150 and £100 per team for 1st, 2nd and 3rd in each category. If a category has fewer than 12 teams, the organiser may reduce that category's prizes in proportion to the teams entered, announced before play starts. Prizes are paid by bank transfer within 7 days. Winners must give bank details within 14 days, or the prize is forfeited. A team disqualified for misconduct forfeits any prize.
6. Conduct. Players and spectators must treat everyone at the event with respect. Abusive, violent, discriminatory or unsafe behaviour will lead to removal from the venue and disqualification, without a refund. Everyone must follow Barking Sporthouse and Gym's venue rules and staff instructions. Alcohol and drugs are not allowed on court; anyone who appears under the influence may be refused play.
7. Health, safety and liability. Badminton carries a risk of injury. Players take part at their own risk and should only play if fit to do so. Players must tell the organiser about any condition that may affect their safety on court. The organiser holds public liability insurance; this does not cover personal accident, and players are advised to hold their own sports insurance. The organiser is not liable for injury, loss or damage except where caused by its negligence, or where the law does not allow liability to be limited. The organiser is not responsible for lost or stolen personal belongings. First aid is available at the Tournament Desk.
8. Spectators and children. Spectators under 16 must be accompanied by a responsible adult at all times. Children must stay off court areas and away from play during matches. The accompanying adult is responsible for the child's safety and behaviour.
9. Photography and filming. A photographer and videographer will be at the event. Photos and video may be used on Dropshot Folks' Instagram (@dropshotfolks), website, and promotional material. Anyone who does not want to be filmed or photographed should tell the Tournament Desk at check-in and will be given a marker to wear.
10. Personal data. Registration details (name, email, phone number and category) are used only to run the event and send updates, including via the WhatsApp tournament group. Data is handled under UK GDPR and not shared with third parties or sponsors without consent. Players can ask for their data to be deleted after the event by emailing info@dropshotfolks.co.uk.
11. General. The organiser may update these terms before the event; registered players will be told of any material change. These terms are governed by the laws of England and Wales. Questions: info@dropshotfolks.co.uk or +44 7824 991029.`};
// official details the organiser can apply with one tap: create = make a new tournament, otherwise merge into the matching one
const PRESETS = [
  {key:"teamcup", title:"🏆 Team Cup · Sun 18 Oct", text:"Sets up the Team Cup with its venue, game format, scoring (to 15, max 17) and terms, ready for the teams.", btn:"Set up the Team Cup", find:()=>S.tourneys.find(x=>x.id==="t20261018-teamcup"), create:{id:"t20261018-teamcup", data:()=>TEAM_CUP}},
  {key:"netplay", title:"🏸 Net Play · Sat 21 Nov", text:"Adds the official Net Play format to your Net Play tournament: groups of 3 with winners through, 8-team knockout with a 3rd-place play-off, scoring by round (15 / 21 / best of 3 to 11), 5 courts from 12:30, and the official terms. Name, teams, bank details and registration stay as they are.", btn:"Apply the Net Play details", find:()=>S.tourneys.find(x=>x.date==="2026-11-21"), merge:()=>NET_PLAY},
];
// Team Cup entries from the Google Form (names only: they're public on the Teams tab; contact details stay in the form)
const TEAM_CUP_TEAMS = [
  ["Idli n Appam attack","Preshecan Muhunthan"], ["Woking Smashers","Varun KP"], ["East London Smashers","Preeta"], ["Banana Squad","Vicky"],
  ["The Fourmidables","Matthew","Milan","Bahee","Nikhila"], ["Shuttle Warriors","Ling","Nakorn Pinsiranon","Pawan Gurung","Keerthi Maddineni"],
  ["BC2","Cameron Sin","Rebecca Yang","Michael Lieu","Anju lama"], ["Net Gains","Imran Hoque","Clare Walsh","Sara Bel Houla","Rahul Singh"],
  ["GODSHUTTLER","Ayestain","Vinotha","Pooja","Moiz"]];
const bankOf = t => t?.bank && (t.bank.acct || t.bank.sort) ? t.bank : null;
// a Team Cup tie: men's, women's and two mixed doubles (XD = mixed 1: man 1 + woman 1, XD2 = mixed 2: man 2 + woman 2)
const DISC = {MD:"Men's doubles", WD:"Women's doubles", XD:"Mixed doubles 1", XD2:"Mixed doubles 2"};
const isTeam = t => t?.mode==="team";
const nPl = t => isTeam(t)?4:2;
const playersOf = x => [x?.p1,x?.p2,x?.p3,x?.p4].filter(Boolean);
function formatTxt(t){
  const r=rules(t);
  if(isTeam(t)){ const adv=Number(t.advance)||2, wild=Number(t.wild)||0;
    return [`Teams of 4: 2 men and 2 women.`,
      `Every tie between two teams is 4 matches: men's doubles, women's doubles and two mixed doubles. Win 3 of the 4 to win the tie; at 2–2 the team with more total points wins.`,
      `Group stage: round robin in groups of about ${Number(t.groupSize)||3}.`,
      `Group points: win by 6 or more points = 4, win by 4–5 = 3, win by 1–3 = 1, loss = 0. The margin is the total points across the tie's 4 matches. Level teams are split by points difference, then head-to-head.`,
      `Knockouts: top ${adv} of each group${wild?` plus the best ${wild} third-placed team${wild>1?"s":""}`:""} go through, ranked by points. The top seeds get a bye if the bracket isn't full.${t.bronze!==false?" The final and the bronze medal match are played at the same time.":""}`,
      `Each match: 1 game, ${ruleTxt(r)}${r.deuce&&r.cap<(CAP_FOR[r.to]||0)?`, at ${r.cap-1}–${r.cap-1} the next point wins`:""}.`].join("\n")+(t.format?`\n\n${t.format}`:"") }
  const adv=Number(t.advance)||2, ko=rules(t,{stage:"ko"}), fin=rules(t,{stage:"ko",roundName:"Final"}), same=(x,y)=>ruleTxt(x)===ruleTxt(y);
  const lines=[
    `Group stage: round robin in groups of about ${Number(t.groupSize)||4}. ${adv===1?"The group winner goes":`The top ${adv} from each group go`} through to the knockouts${Number(t.koSize)>0?`, and the best ${adv===1?"runners-up":"teams in the next place"} fill any spare places up to ${Number(t.koSize)}`:""}.`,
    `Knockouts: single elimination until the final${bronzeOn(t)?", plus a 3rd-place play-off":""}.`,
    `Group matches: ${r.bestOf===1?"1 game ":r.bestOf===2?"2 games (at 1–1, more total points wins) ":""}${ruleTxt({...r,bestOf:1})}.`,
    ...(same(ko,r)?[]:[`Quarter- and semi-finals: ${ko.bestOf===1?"1 game ":""}${ruleTxt(ko)}.`]),
    ...(same(fin,ko)?[]:[`Final${bronzeOn(t)?" and 3rd-place play-off":""}: ${fin.bestOf===1?"1 game ":""}${ruleTxt(fin)}.`]),
    `Group places are decided by wins, then head-to-head, then points difference, then points scored.`];
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
  uid:null, isAdmin:false, loaded:false, tid: new URLSearchParams(location.search).get("t") || ls.get("dsf:tid",null),
  cat: null, toss: {}, newT:false, otab: ls.get("dsf:otab","details"), editTeam:null, addTeam:false, myTeam: ls.get("dsf:myteam",null), refCourt: ls.get("dsf:refcourt",1), edit:null, scrIdx:0
};
let db=null, auth=null;
const T = () => S.tourneys.find(t=>t.id===S.tid) || nextTourney() || null;
// the soonest tournament that hasn't finished yet, else the most recent
function nextTourney(){ const today=new Date(Date.now()-864e5).toISOString().slice(0,10), by=[...S.tourneys].sort((a,b)=>String(a.date||"9").localeCompare(String(b.date||"9")));
  return by.find(t=>String(t.date||"9")>=today) || by[by.length-1] }
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
// knockout rounds can have their own scoring: t.stageRules = {ko:{pointsTo,cap,bestOf}, final:{…}} (final = final & 3rd-place play-off)
const isFinalRound = m => m?.roundName==="Final" || m?.roundName==="Bronze medal match";
const rules = (t, m) => { const st=m?.stage==="ko" ? t?.stageRules?.[isFinalRound(m)?"final":"ko"] : null; if(st) t={...t, ...Object.fromEntries(Object.entries(st).filter(([,v])=>Number(v)>0))};
  const to=[11,15,21].includes(Number(t?.pointsTo))?Number(t.pointsTo):21, deuce=t?.deuce!==false;
  const cap=Number(t?.cap)>to ? Number(t.cap) : (CAP_FOR[to]||to+9);
  return {to, deuce, cap:deuce?cap:to, bestOf:Number(t?.bestOf)||1} };
const ruleTxt = r => `${r.bestOf===3?"best of 3 games ":r.bestOf===2?"2 games ":""}to ${r.to}${r.deuce?`, deuce (win by 2, max ${r.cap})`:", no deuce"}`;
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
    if(src.wild) return wildTeams(t,m.cat)?.[src.wild-1] || null;
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
  const need=Math.floor(rs.length/2)+1, complete=rs.length>0 && done===rs.length;
  // most matches won; level (2–2) on matches → more total points; still level → whoever won the last mixed doubles
  const level=complete && a===b, last=rs.find(x=>x.disc==="XD2")||rs[rs.length-1];
  const winner = a>=need?"a" : b>=need?"b" : level ? (pa!==pb ? (pa>pb?"a":"b") : last?.winner||null) : null;
  return {a, b, pa, pb, done, n:rs.length, winner, complete, onPoints:level && !!winner};
}
const bronzeOn = t => t?.bronze===true || (isTeam(t) && t?.bronze!==false);
// how many extra teams (best of the next place down) join the knockouts
function nWild(t, groups){ const adv=Math.max(1,Number(t.advance)||2), G=Object.values(groups||{}), spare=G.filter(g=>g.length>adv).length;
  const w = Number(t.koSize)>0 ? Number(t.koSize)-G.reduce((s,g)=>s+Math.min(adv,g.length),0) : Number(t.wild)||0;
  return Math.max(0, Math.min(spare, w)) }
const tiePts = margin => margin>=6?4 : margin>=4?3 : 1;
// players a match ties up: Team Cup men's and women's doubles can run side by side, mixed needs both
function resOf(m, a, b){
  const sides=[a,b].filter(Boolean); if(!m.disc) return sides;
  // players each match uses: MD both men, WD both women, mixed 1 man 1 + woman 1, mixed 2 man 2 + woman 2
  const who={MD:["M1","M2"], WD:["W1","W2"], XD:["M1","W1"], XD2:["M2","W2"]}[m.disc]||[];
  return sides.flatMap(x=>who.map(p=>x+"·"+p));
}
const isBye = m => !!m.bye;
const PLACE = p => p===1?"Winner":p===2?"Runner-up":p===3?"3rd":`${p}th`;
const shortRound = n => ({"Final":"Final","Semi-finals":"SF","Quarter-finals":"QF","Bronze medal match":"3rd place"})[n] || (n||"").replace("Round of ","R");
// what to show before a knockout slot is decided: "Winner Group A", "Winner QF 2"
function sideLabel(m, side){
  const src=m.src?.[side]; if(src){ const t=S.tourneys.find(x=>x.id===m.tid), adv=Number(t?.advance)||2;
    return src.seed ? `Seed ${src.seed}` : src.wild ? `Best ${adv===1?"runner-up":PLACE(adv+1)} ${src.wild}` : `${PLACE(src.p)} Group ${src.g}` }
  const from=m.from?.[side==="a"?0:1], f=from && S.matches.find(x=>x.id===from);
  if(f?.bye) return sideLabel(f, f.src?.a||f.a ? "a" : "b");
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
  return Object.values(row).sort((x,y)=>y.w-x.w || h2h(x.id,y.id) || (y.pf-y.pa)-(x.pf-x.pa) || y.pf-x.pf || String(tName(x.id)).localeCompare(tName(y.id)));
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
  const g=t.groups[cat], adv=Math.max(1,Number(t.advance)||2), wild=nWild(t,g), rank=(x,y)=>(y.pts??y.w)-(x.pts??x.w) || (y.pf-y.pa)-(x.pf-x.pa) || y.pf-x.pf;
  const tables=Object.keys(g).sort().map(G=>standings(t,cat,G));
  const through=tables.flatMap(tb=>tb.slice(0,adv)), extra=tables.map(tb=>tb[adv]).filter(Boolean).sort(rank).slice(0,wild);
  return [...through, ...extra].sort(rank).map(x=>x.id);
}
// doubles events: the best teams in the next place down (e.g. best runners-up), best first
function wildTeams(t, cat){
  if(!allGroupsDone(t,cat)) return null;
  const g=t.groups[cat], adv=Math.max(1,Number(t.advance)||2);
  return Object.keys(g).sort().map(G=>standings(t,cat,G)[adv]).filter(Boolean).sort((x,y)=>y.w-x.w || (y.pf-y.pa)-(x.pf-x.pa) || y.pf-x.pf).slice(0,nWild(t,g)).map(x=>x.id);
}

/* ---------- fixture generation (organiser) ---------- */
// one match, or for the Team Cup one tie = 3 matches sharing a tie id
function addFixture(batch, t, id, data, plan={}){
  if(!isTeam(t) || data.bye){ batch.set(db.collection("tmatches").doc(id), {...data, ...(plan[id]||{})}); return [id] }
  return Object.keys(DISC).map((d,k)=>{ const mid=`${id}_${d}`; batch.set(db.collection("tmatches").doc(mid), {...data, tie:id, disc:d, order:(data.order??0)*4+k, ...(plan[mid]||{})}); return mid });
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
  await batch.commit(); toast(`${catName(t,cat)}: ${ng} group${ng>1?"s":""} and ${order-base} ${isTeam(t)?`ties (${(order-base)*4} matches)`:"matches"} created`);
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
    const n=G.reduce((s,g)=>s+Math.min(adv,groups[g].length),0)+nWild(t,groups);
    for(let k=1;k<=n;k++) seeds.push({seed:k});
  } else
  { for(let k=0;k<adv;k++) seeds.push(...G.filter(g=>groups[g].length>k).map(g=>({g, p:k+1})));
    for(let k=1;k<=nWild(t,groups);k++) seeds.push({wild:k}) }
  if(seeds.length<2){ toast("Not enough teams go through for a knockout"); return }
  const keepPlan=Object.fromEntries(matchesOf(t,cat).filter(m=>m.stage==="ko" && m.pcourt).map(m=>[m.id,{pcourt:m.pcourt, ptime:m.ptime||null, pnum:m.pnum??null, pslot:m.pslot??null}]));
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
    if(next.length===1 && prev.length===2 && bronzeOn(t)){ const id=`${t.id}_${cat}_K${rnd}_2`;
      addFixture(batch, t, id, {tid:t.id, cat, stage:"ko", round:rnd, roundName:"Bronze medal match", slot:2, a:null, b:null, from:[prev[0],prev[1]], fromLose:true, status:"scheduled", games:[], winner:null, court:0, order:o++, updatedAt:nowIso()}, keepPlan) }
    prev=next;
  }
  await batch.commit(); toast(`${catName(t,cat)}: knockout bracket of ${P} made. Teams fill in as groups finish.`);
}

/* ---------- courts & order of play (organiser) ---------- */
// matches run on points, not the clock: each gets a court and a place in that court's queue (pnum); clock times only if switched on
const clockOn = t => t?.timed!==false;
const ordinal = n => n+(["th","st","nd","rd"][(n%100-20)%10]||["th","st","nd","rd"][n%100]||"th");
const planOrder = m => [Number(m.pnum)||999, Number(m.pslot)||999, String(m.ptime||"99")];
const byPlan = (x,y) => { const a=planOrder(x), b=planOrder(y); return a[0]-b[0] || a[1]-b[1] || a[2].localeCompare(b[2]) || (x.order||0)-(y.order||0) };
function planTxt(m, short){
  const t=S.tourneys.find(x=>x.id===m.tid); if(!m.pcourt) return "";
  if(clockOn(t) && m.ptime) return short ? `${m.ptime} C${m.pcourt}` : `🕒 ${m.ptime} · Court ${m.pcourt}`;
  if(clockOn(t) && m.pnum) return short ? `C${m.pcourt}` : `Court ${m.pcourt}`;
  return short ? `C${m.pcourt}${m.pnum?` #${m.pnum}`:""}` : `Court ${m.pcourt}${m.pnum?` · ${ordinal(Number(m.pnum))} on court`:""}`;
}
const hm = (start, mins) => { const [h,m]=String(start||"10:00").split(":").map(Number), x=h*60+m+mins; return `${String(Math.floor(x/60)%24).padStart(2,"0")}:${String(x%60).padStart(2,"0")}` };
async function scheduleAll(t){
  const C=Math.max(1,Number(t.courts)||4), mins=Math.max(5,Number(t.matchMins)||15), ms=matchesOf(t).filter(m=>!m.bye);
  if(!ms.length){ toast("Make the fixtures first"); return }
  const slotOf={}, teamsIn=m=>m.stage==="group"?resOf(m,m.a,m.b):m.tie?resOf(m,m.tie+"a",m.tie+"b"):[];
  const ready=m=>{
    if(m.stage==="group") return 0;
    if(m.src){ const seeded=m.src.a?.seed||m.src.b?.seed||m.src.a?.wild||m.src.b?.wild, gs=[m.src.a?.g, m.src.b?.g].filter(Boolean), gm=ms.filter(x=>x.stage==="group" && x.cat===m.cat && (seeded || gs.includes(x.group)));
      if(gm.some(x=>slotOf[x.id]==null)) return null; return gm.length?Math.max(...gm.map(x=>slotOf[x.id]))+1:0 }
    if(m.from){ let e=0; for(const id of m.from){ const f=S.matches.find(x=>x.id===id); if(!f) continue;
        const fs=f.tie?ms.filter(x=>x.tie===f.tie):[f];
        const v = f.bye ? ready(f) : fs.every(x=>slotOf[x.id]!=null) ? Math.max(...fs.map(x=>slotOf[x.id]))+1 : null; if(v==null) return null; e=Math.max(e,v) } return e }
    return 0;
  };
  const pending=[...ms].sort((a,b)=>(a.stage==="ko")-(b.stage==="ko") || (a.round||0)-(b.round||0) || (a.order||0)-(b.order||0));
  let slot=0, last=new Set(); const perCourt={};
  while(pending.length && slot<500){
    const used=new Set(), now=new Set();
    for(let c=1;c<=C;c++){
      const ok=(m,rest)=>{ const r=ready(m); if(r==null||r>slot) return false; const tm=teamsIn(m); return tm.every(x=>!now.has(x)) && (!rest || tm.every(x=>!last.has(x))) };
      let i=pending.findIndex(m=>ok(m,true)); if(i<0) i=pending.findIndex(m=>ok(m,false)); if(i<0) break;
      const m=pending.splice(i,1)[0]; slotOf[m.id]=slot; m._c=c; m._n=(perCourt[c]=(perCourt[c]||0)+1); teamsIn(m).forEach(x=>now.add(x));
    }
    last=now; slot++;
  }
  for(let i=0;i<ms.length;i+=400){ const b=db.batch();
    ms.slice(i,i+400).forEach(m=>{ if(slotOf[m.id]!=null) b.update(db.collection("tmatches").doc(m.id),{pcourt:m._c, pslot:slotOf[m.id], pnum:m._n, ptime:clockOn(t)?hm(t.startTime,slotOf[m.id]*mins):null}) }); await b.commit() }
  toast(clockOn(t) ? `Courts and times set: ${slot} rounds of ${mins} min on ${C} court${C>1?"s":""}, finishing about ${hm(t.startTime,slot*mins)}` : `Courts and order of play set on ${C} court${C>1?"s":""}: about ${slot} matches per court`);
}

/* ---------- court queue ---------- */
const playing = t => new Set(matchesOf(t).filter(m=>m.status==="live").flatMap(m=>resOf(m,sideTeam(m,"a"),sideTeam(m,"b"))));
function upNext(t, limit=8){
  const busy=playing(t);
  return matchesOf(t).filter(m=>m.status==="scheduled" && !isBye(m)).filter(m=>{ const a=sideTeam(m,"a"), b=sideTeam(m,"b"); return a && b && resOf(m,a,b).every(x=>!busy.has(x)) })
    .sort(byPlan).slice(0,limit);
}
const liveOn = (t,c) => matchesOf(t).find(m=>m.status==="live" && m.court===c);

/* ---------- small renderers ---------- */
function matchRow(t, m, opts={}){
  const a=sideTeam(m,"a"), b=sideTeam(m,"b"), r=rules(t,m), w=m.status==="done"?m.winner:null;
  const label = (m.stage==="ko" ? (m.roundName||"Knockout") : `Group ${m.group} · R${m.round}`) + (m.disc?` · ${m.disc}`:"");
  const mid = m.status==="live" ? `<span class="livebadge">Court ${m.court}${m.disc?` · ${m.disc}`:""}</span><span class="sc">${(m.games||[]).map(g=>`${g[0]}–${g[1]}`).slice(-1)[0]||"0–0"}</span>`
    : m.status==="done" ? `<span class="tag">${m.disc?esc(DISC[m.disc]):"Final"}</span><span class="sc">${esc(gamesTxt(m))||(m.bye?"bye":"")}</span>` : `<span class="tag">${esc(label)}</span>${m.pcourt?`<span class="when">${esc(planTxt(m))}</span>`:"<span>vs</span>"}`;
  return `<div class="m ${m.status==="live"?"live":""}" ${opts.edit?`data-medit="${esc(m.id)}" role="button" tabindex="0" style="cursor:pointer"`:""}>
    <span class="tn ${w==="a"?"win":""} ${opts.me&&a===opts.me?"me":""}">${sideName(m,"a")}</span>
    <span class="mid">${mid}${opts.cat?`<span>${esc(catName(t,m.cat))}</span>`:""}</span>
    <span class="tn r ${w==="b"?"win":""} ${opts.me&&b===opts.me?"me":""}">${sideName(m,"b")}</span>
    ${opts.plan && S.isAdmin && m.status!=="done" && !m.bye ? `<div class="plan">${planPick(t,m)}</div>` : ""}</div>`;
}
// organiser: court and start time (or order) right on a match
const planPick = (t, m) => `<span class="plan"><label>Court <select data-plcourt="${esc(m.id)}" aria-label="Court">${Array.from({length:Math.max(10,Number(t.courts)||4)},(_,i)=>`<option value="${i+1}" ${Number(m.pcourt)===i+1?"selected":""}>${i+1}</option>`).join("")}<option value="" ${m.pcourt?"":"selected"}>–</option></select></label>${clockOn(t)?`<label>🕒 <input type="time" data-pltime="${esc(m.id)}" value="${esc(m.ptime||"")}" aria-label="Start time"></label>`:`<label># <input type="number" min="1" max="99" data-plnum="${esc(m.id)}" value="${esc(m.pnum||"")}" aria-label="Order on court" style="width:4.2em"></label>`}</span>`;
// a list of matches; Team Cup matches sit under their tie with the tie score
function fixList(t, ms, opts={}){
  const seen=new Set();
  return ms.map(m=>{ if(!m.tie) return matchRow(t,m,opts); if(seen.has(m.tie)) return ""; seen.add(m.tie);
    const r=tieResult(m.tie), rs=S.matches.filter(x=>x.tie===m.tie).sort((x,y)=>Object.keys(DISC).indexOf(x.disc)-Object.keys(DISC).indexOf(y.disc));
    const mine=opts.me&&(sideTeam(m,"a")===opts.me||sideTeam(m,"b")===opts.me), stage=m.stage==="ko"?(m.roundName||"Knockout"):`Group ${m.group}`;
    const line=x=>{ const g=(x.games||[]).slice(-1)[0], live=x.status==="live", done=x.status==="done";
      const right = done ? `<b class="${x.winner==="a"?"wa":"wb"}">${esc(gamesTxt(x))}</b>` : live ? `<span class="livebadge">Court ${esc(x.court)}</span> <b>${g?`${g[0]}–${g[1]}`:"0–0"}</b>`
        : opts.plan && S.isAdmin ? planPick(t,x) : `<span class="muted">${esc(planTxt(x))}</span>`;
      return `<div class="rb ${live?"live":""}" ${opts.edit?`data-medit="${esc(x.id)}" role="button" tabindex="0"`:""}><span>${esc(DISC[x.disc]||x.disc)}</span><span>${right}</span></div>` };
    return `<div class="tie ${mine?"me":""}"><div class="tie-s">${esc(stage)}${r.onPoints?" · won on total points":""}</div><div class="tie-h"><span class="${r.winner==="a"?"win":""}">${sideName(m,"a")}</span><b>${r.done?`${r.a}–${r.b}`:"vs"}</b><span class="${r.winner==="b"?"win":""}">${sideName(m,"b")}</span></div>${rs.map(line).join("")}</div>` }).join("");
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
  const card=m=>{ const a=sideTeam(m,"a"), b=sideTeam(m,"b"), tr=m.tie?tieResult(m.tie):null, w=tr?tr.winner:m.status==="done"?m.winner:null;
    const live=tr?S.matches.some(x=>x.tie===m.tie&&x.status==="live"):m.status==="live";
    const sc=side=>tr ? (tr.done?String(side==="a"?tr.a:tr.b):"") : m.status==="done"?(m.games||[]).map(g=>side==="a"?g[0]:g[1]).join(" "):"";
    const line=(id,side)=>`<div class="bl ${w===side?"win":w?"lose":""}"><span class="${id?"":"tbd"}">${id?esc(tName(id)):esc(sideLabel(m,side))}</span><b>${esc(sc(side))}</b></div>`;
    const bronze=m.roundName==="Bronze medal match", top=bronze?`🥉 ${isTeam(t)?"Bronze medal":"3rd place"}`:"";
    const when=live?`<span class="livebadge">Live</span>`:w?`<span class="bdone">Final score</span>`:m.pcourt?`<span>${esc(planTxt(m))}</span>`:"";
    const pick = S.isAdmin && !live && !w && !m.bye ? (m.tie ? `<div class="bpick"><button class="btn small ghost" data-openko="${esc(m.tie)}">✏️ Courts & times</button></div>` : `<div class="bpick">${planPick(t,m)}</div>`) : "";
    return `<div class="bm ${live?"live":""} ${bronze?"bronze":""}">${top||when?`<div class="bt">${top?`<b>${top}</b>`:""}${when}</div>`:""}${line(a,"a")}${line(b,"b")}${pick}</div>` };
  return `<div class="bracket">${rounds.map(rn=>{ const ms=ko.filter(m=>m.round===rn).sort((a,b)=>a.slot-b.slot), real=ms.filter(m=>!m.bye);
    const show=real.length?real:ms, name=(ms.find(m=>m.roundName!=="Bronze medal match")||ms[0])?.roundName||"";
    return `<div class="bround"><h4>${esc(name==="Final"?"🏆 Final":name)}</h4><div class="bcol">${show.map(card).join("")}</div></div>` }).join("")}</div>`;
}
function courtCard(t, c){
  const m=liveOn(t,c), r=rules(t,m);
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
  return `<div class="cats tpicker">${[...S.tourneys].sort((a,b)=>String(a.date||"9").localeCompare(String(b.date||"9"))).map(x=>`<button data-tid="${esc(x.id)}" aria-pressed="${x.id===t.id}">${esc(x.name||"Tournament")}<small>${esc(x.date?new Date(x.date+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"}):"")}</small></button>`).join("")}</div>`;
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
      ${S.isAdmin?`<button class="btn small editbtn" data-goorg="details">✏️ Edit details</button>`:""}<span class="lbl">${esc(fmtDate(t.date))}${t.venue?` · ${esc(t.venue)}`:""}</span>
      <div class="big">${esc(t.name||"Tournament")}</div>
      ${t.info?`<p>${esc(t.info).replace(/\n/g,"<br>")}</p>`:""}
      <div class="row">${cats(t).map(c=>`<span class="chip st-paid">${esc(c.name)} · ${teamsOf(t,c.id).length}${Number(t.maxTeams)?`/${Number(t.maxTeams)}`:""} teams</span>`).join("")}</div>
      ${t.entry?`<p><b>Entry:</b> ${esc(t.entry)}</p>`:""}${t.prizes?`<p><b>Prizes:</b> ${esc(t.prizes)}</p>`:""}
      <p><b>Scoring:</b> ${r.bestOf===1?"1 game ":r.bestOf===2?"2 games (total points decide at 1–1), ":""}${esc(ruleTxt({...r,bestOf:r.bestOf===2?1:r.bestOf}))}${t.stageRules?" in the groups. Knockout rounds are longer: see the game format.":"."}</p>
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
  return `${pickBar(t)}<section class="panel">${S.isAdmin?`<button class="btn small editbtn" data-goorg="teams">✏️ Manage teams</button>`:""}<h2>Teams</h2>${catBar(t)}
    ${(()=>{ const ts=teamsOf(t,S.cat); return ts.length?`<p class="muted">${ts.length} team${ts.length>1?"s":""} registered${Number(t.maxTeams)?` of ${Number(t.maxTeams)}`:""} · ${ts.filter(x=>x.status==="confirmed").length} confirmed</p>
      <div class="teamlist">${ts.map((x,i)=>`<div class="team"><span class="lbl">#${i+1}</span><b>${esc(x.name)}</b><span>${esc(playersOf(x).join(x.p3?", ":" & "))}</span><span>${x.status==="confirmed"?'<span class="chip st-confirmed">Confirmed</span>':'<span class="chip st-awaiting">Pending</span>'}</span></div>`).join("")}</div>`:`<div class="empty">No teams yet. Be the first!</div>` })()}
  </section>`;
}
function viewFix(){
  const t=T(); if(!t) return noTourney();
  const all=teamsOf(t).sort((a,b)=>a.name.localeCompare(b.name)), me=S.myTeam && all.find(x=>x.id===S.myTeam);
  const mine = me ? matchesOf(t).filter(m=>!m.bye && (sideTeam(m,"a")===me.id || sideTeam(m,"b")===me.id)).sort(byPlan) : [];
  const head=`${pickBar(t)}<section class="panel">${S.isAdmin?`<button class="btn small editbtn" data-goorg="fixtures">✏️ Fixture settings</button>`:""}<h2>Fixtures & results</h2>${S.isAdmin&&matchesOf(t).length?`<p class="orghint">✏️ Organiser: tap any match below to change its score, court or order.</p>`:""}
    <label class="f" style="max-width:420px">🔎 Find my team<select id="myTeam" data-myteam="1"><option value="">Choose your team…</option>${all.map(x=>`<option value="${esc(x.id)}" ${x.id===S.myTeam?"selected":""}>${esc(x.name)} · ${esc(catName(t,x.cat))}</option>`).join("")}</select></label>
    ${me?`<div class="mlist">${mine.length?fixList(t,mine,{me:me.id,cat:!isTeam(t)}):`<div class="empty">No matches for ${esc(me.name)} yet.</div>`}</div>`:""}
    ${catBar(t)}</section>${S.isAdmin && matchesOf(t).length ? schedPanel(t) : ""}`;
  const groups=t.groups?.[S.cat], ms=matchesOf(t,S.cat), edit=canRef(t);
  if(!groups && !ms.length) return head+`<section class="panel"><div class="empty">Fixtures appear here once the organiser makes the groups.</div></section>`;
  const hasKo=ms.some(m=>m.stage==="ko"), fx=hasKo && (S.fxTab==="ko" || !groups) ? "ko" : "groups";
  const tabs=`<div class="fxtabs"><button data-fxtab="groups" aria-pressed="${fx==="groups"}">Groups</button><button data-fxtab="ko" aria-pressed="${fx==="ko"}" ${hasKo?"":"disabled"}>Knockouts</button></div>`;
  if(fx==="ko"){ const koList=ms.filter(m=>m.stage==="ko" && !m.bye).sort((a,b)=>a.round-b.round||a.slot-b.slot||(a.order||0)-(b.order||0));
    return head+`<section class="panel">${tabs}${bracket(t,S.cat)}
      <details class="vm" id="vm-${esc(S.cat)}-ko"><summary>${isTeam(t)?"View every knockout match":"View knockout matches"} (${isTeam(t)?new Set(koList.map(m=>m.tie)).size+" ties":koList.length})</summary><div class="mlist">${fixList(t,koList,{edit, plan:true})}</div></details></section>` }
  const adv=Number(t.advance)||2;
  return head+`<section class="panel">${tabs}
    <p class="muted" style="margin:0 0 4px">${adv===1?"The group winner goes":`The top ${adv} in each group go`} through${Number(t.koSize)>0||Number(t.wild)?", plus the best of the rest":""}. Green = going through.</p>
    <div class="groups">${Object.keys(groups||{}).sort().map(G=>{ const gm=ms.filter(m=>m.stage==="group"&&m.group===G), n=isTeam(t)?new Set(gm.map(m=>m.tie)).size:gm.length, played=isTeam(t)?new Set(gm.filter(m=>m.tie&&tieResult(m.tie).complete).map(m=>m.tie)).size:gm.filter(m=>m.status==="done").length;
      return `<div class="grp"><h3>Group ${G}<span class="muted" style="font-size:.8rem;font-family:var(--body)">${played} of ${n} played</span></h3>${standTable(t,S.cat,G)}
        <details class="vm" id="vm-${esc(S.cat)}-${G}"><summary>View all ${n} ${isTeam(t)?"ties":"matches"}</summary><div class="mlist">${fixList(t,gm,{edit, plan:true})}</div></details></div>` }).join("")}</div></section>`;
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
  const has=matchesOf(t).some(m=>m.pcourt), on=clockOn(t), last=on&&has?matchesOf(t).filter(m=>m.ptime).map(m=>m.ptime).sort().slice(-1)[0]:"";
  return `<section class="panel"><h2>🏸 Courts & order of play</h2>
    <div class="row" style="align-items:flex-end">
      <label class="f" style="width:110px">Courts<input id="fx-courts" type="number" min="1" max="12" value="${esc(t.courts||4)}"></label>
      <label class="row" style="gap:6px;align-self:end;flex-wrap:nowrap"><input type="checkbox" style="width:auto" id="fx-timed" ${on?"checked":""}> Show start times</label>
      ${on?`<label class="f" style="width:140px">First match<input id="fx-start" type="time" value="${esc(t.startTime||"10:00")}"></label>
      <label class="f" style="width:150px">Minutes per match<input id="fx-mins" type="number" min="5" max="60" value="${esc(t.matchMins||15)}"></label>`:""}
      <button class="btn primary" data-fxsched="1">${has?`Update courts & ${on?"times":"order"}`:`Assign courts & ${on?"times":"order"}`}</button></div>
    <p class="muted" style="font-size:.85rem">${on?"Each match gets a court and a start time.":"Matches run on points, not the clock: each match gets a court and its place in that court's queue (1st, 2nd, 3rd…). When a court's match finishes, the next one for that court starts."} Covers every category. Nobody plays twice at once, and knockouts come after their groups${matchesOf(t).some(m=>m.stage==="ko")?"":" (make the knockout bracket first in Organiser → Fixtures so it's included)"}. ${last?`Last match at <b>${esc(last)}</b>. `:""}To move one match, change its court or ${on?"time":"order"} right on the match below.</p></section>`;
}

/* referee */
function viewRef(){
  const t=T(); if(!t) return noTourney();
  if(!canRef(t)) return `<section class="panel"><h2>${S.refOnly?"🏸 Referee":"Referee"}</h2><p class="muted">Enter the referee code from the organiser. Once it's open on this phone you can start matches on your court and score them live.</p>
    <div class="row" style="max-width:440px;flex-wrap:nowrap"><input id="ref-code" placeholder="Referee code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--mono)"><button class="btn primary" data-refopen="1">Open</button></div></section>`;
  const n=Math.max(1,Number(t.courts)||4), c=Math.min(n,Math.max(1,S.refCourt)), m=liveOn(t,c), r=rules(t,m);
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
  const ta=(id,label,val,rows=3,ph="")=>`<label class="f" style="grid-column:1/-1">${label}<textarea id="to-${id}" rows="${rows}" placeholder="${esc(ph)}">${esc(val||"")}</textarea></label>`;
  const preset = PRESETS.map(p=>{ const x=p.find(); if(p.create ? x : (!x || x.preset===p.key)) return "";
    return `<section class="panel"><div class="row" style="justify-content:space-between"><div><h2>${p.title}</h2><p class="muted">${p.text}</p></div><button class="btn primary" data-preset="${p.key}">${p.btn}</button></div></section>` }).join("");
  const list = `<section class="panel"><div class="row" style="justify-content:space-between"><h2>Your tournaments</h2><button class="btn primary small" data-tnew="1">➕ New tournament</button></div>
    ${S.tourneys.length?`<div class="tlist">${[...S.tourneys].sort((a,b)=>String(a.date||"9").localeCompare(String(b.date||"9"))).map(x=>`<div class="trow ${x.id===t?.id&&!S.newT?"on":""}"><button class="tpick" data-tid="${esc(x.id)}"><b>${esc(x.name||"Tournament")}</b><span>${esc(fmtDate(x.date))} · ${isTeam(x)?"Team Cup":esc(cats(x).map(c=>c.name).join(", "))} · ${teamsOf(x).length} teams · registration ${x.regOpen?"open":"closed"}</span></button><button class="btn small ghost danger" data-tdelt="${esc(x.id)}" title="Delete tournament">🗑</button></div>`).join("")}</div>`:`<div class="empty">No tournaments yet.</div>`}</section>`;
  // tournament details, in plain groups; rarely-needed settings tucked under "More options"
  const form=x=>`<div class="ogrp"><h3>📝 The basics</h3><div class="grid2">
      ${f("name","Tournament name",x?.name)}${f("date","Date",x?.date,"date")}${f("venue","Venue",x?.venue)}${f("address","Address (for the map)",x?.address,"text",'placeholder="e.g. Lodge Ave, Dagenham RM8 2JR"')}
      ${f("entry","Entry fee",x?.entry,"text",'placeholder="e.g. £25 per player"')}${f("prizes","Prizes",x?.prizes)}
      ${ta("info","About (shown at the top of the Register tab)",x?.info,4)}
      ${ta("dirs","Directions & travel tips",x?.directions,2,"Nearest station, buses, parking, which entrance…")}
      <div style="grid-column:1/-1;display:grid;gap:6px"><span class="lbl">Poster</span>
        ${(S.posterDraft ?? x?.poster) ? `<img src="${esc(S.posterDraft ?? x.poster)}" alt="Poster preview" style="max-width:220px;border-radius:12px;box-shadow:var(--shadow)">` : `<span class="muted" style="font-size:.85rem">No poster yet.</span>`}
        <div class="row"><label class="btn small" for="to-poster">${(S.posterDraft ?? x?.poster)?"Change poster":"Upload poster"}</label><input id="to-poster" type="file" accept="image/*" hidden>${(S.posterDraft ?? x?.poster)?`<button class="btn small ghost danger" data-noposter="1" type="button">Remove</button>`:""}</div></div></div></div>
    <div class="ogrp"><h3>✍️ Registration</h3>
      <label class="switch"><input type="checkbox" id="to-open" ${x?.regOpen?"checked":""}><span>Registration open</span></label>
      <div class="grid2">${f("max","Max teams per category (0 = no limit)",x?.maxTeams??0,"number",'min="0" max="128"')}${f("wa","WhatsApp group link",x?.wa||WA_GROUP,"url",'placeholder="https://chat.whatsapp.com/…"')}</div>
      <span class="lbl">💷 Bank details for entry fees · leave empty to switch payment off</span>
      <div class="grid2">${f("bname","Account name",x?.bank?.name)}${f("bsort","Sort code",x?.bank?.sort,"text",'placeholder="00-00-00" inputmode="numeric"')}${f("bacct","Account number",x?.bank?.acct,"text",'placeholder="12345678" inputmode="numeric"')}${f("bnote","Payment note (optional)",x?.bank?.note,"text",'placeholder="e.g. Use your team name as the reference"')}</div>
      <div class="grid2">${ta("terms","Terms & conditions (players must agree)",x?.terms||DEFAULT_TERMS,6)}</div></div>
    <div class="ogrp"><h3>🏸 Format & scoring</h3><div class="grid2">
      <label class="f">Tournament type<select id="to-mode"><option value="pairs" ${!isTeam(x)?"selected":""}>Doubles pairs</option><option value="team" ${isTeam(x)?"selected":""}>Team Cup: teams of 4 (MD, WD, 2 × XD)</option></select></label>
      ${f("gsize","Teams per group",x?.groupSize??(isTeam(x)?3:4),"number",'min="3" max="8"')}${f("adv","Teams through per group",x?.advance??2,"number",'min="1" max="4"')}
      <label class="f">Points per game<select id="to-to">${[11,15,21].map(n=>`<option value="${n}" ${Number(x?.pointsTo||21)===n?"selected":""}>${n} points</option>`).join("")}</select></label>
      <label class="f">Deuce<select id="to-deuce"><option value="1" ${x?.deuce!==false?"selected":""}>On: win by 2</option><option value="0" ${x?.deuce===false?"selected":""}>Off: first to the points wins</option></select></label>
      <label class="f">Games per match<select id="to-bo">${[[1,"1 game"],[2,"2 games (total points if 1–1)"],[3,"Best of 3"]].map(([n,l])=>`<option value="${n}" ${Number(x?.bestOf||1)===n?"selected":""}>${l}</option>`).join("")}</select></label>
      ${f("courts","Courts",x?.courts??4,"number",'min="1" max="12"')}
      <div style="grid-column:1/-1"><span class="lbl">Categories (doubles pairs only)</span><div class="row">${CAT_PRESETS.map(([id,nm])=>`<label class="row" style="gap:6px"><input type="checkbox" style="width:auto" id="to-cat-${id}" ${!x||x.catIds?.includes(id)?"checked":""}> ${nm}</label>`).join("")}</div></div></div>
      <details class="more"><summary>More options: knockout scoring, deuce limits, 3rd place, extra format notes</summary><div class="grid2" style="margin-top:10px">
        ${f("cap","Deuce max points (0 = standard)",x?.cap??0,"number",'min="0" max="40"')}
        ${f("kosize","Knockout size, filled with best runners-up (0 = off)",x?.koSize??0,"number",'min="0" max="64"')}
        ${f("wild","Team Cup: best 3rd-placed teams also through",x?.wild??0,"number",'min="0" max="8"')}
        <label class="row" style="gap:6px;align-self:end;flex-wrap:nowrap"><input type="checkbox" style="width:auto" id="to-bronze" ${bronzeOn(x||{})?"checked":""}> 3rd-place play-off / bronze match</label>
        ${[["k","Quarter- & semi-finals"],["f","Final & 3rd place"]].map(([k,l])=>{ const sr=x?.stageRules?.[k==="k"?"ko":"final"]||{};
          return `<div class="grid2" style="grid-column:1/-1;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><span class="lbl" style="grid-column:1/-1">${l} scoring</span>
            <label class="f">Points<select id="to-${k}to"><option value="0">Same as groups</option>${[11,15,21].map(n=>`<option value="${n}" ${Number(sr.pointsTo)===n?"selected":""}>${n}</option>`).join("")}</select></label>
            ${f(k+"cap","Deuce max (0 = standard)",sr.cap??0,"number",'min="0" max="40"')}
            <label class="f">Games<select id="to-${k}bo"><option value="0">Same as groups</option>${[[1,"1 game"],[3,"Best of 3"]].map(([n,lb])=>`<option value="${n}" ${Number(sr.bestOf)===n?"selected":""}>${lb}</option>`).join("")}</select></label></div>` }).join("")}
        ${f("start","First match (only if clock times are on)",x?.startTime||"10:00","time")}${f("mins","Minutes per match (only if clock times are on)",x?.matchMins??15,"number",'min="5" max="60"')}
        ${ta("format","Extra game format notes (added under the automatic format)",x?.format,3,"e.g. Warm-up 2 minutes, change ends at 8…")}</div></details></div>`;
  if(!t || S.newT) return `${list}${preset}<section class="panel" id="newt"><h2>New tournament</h2>${form(null)}<div class="savebar"><button class="btn primary" data-tsave="new">Create tournament</button>${t?`<button class="btn small ghost" data-tnewx="1">Cancel</button>`:""}</div></section>`;

  const ot=S.otab||"details", nTeams=teamsOf(t).length;
  const sub=`<div class="osub">${[["details","📝 Details"],["teams",`👥 Teams · ${nTeams}`],["fixtures","🗓 Fixtures"],["refs","📣 Referees & screen"]].map(([k,l])=>`<button data-otab="${k}" aria-pressed="${ot===k}">${l}</button>`).join("")}</div>`;
  const head=`<section class="panel ohead"><div><span class="lbl">Managing</span><h2>${esc(t.name||"Tournament")}</h2><span class="muted">${esc(fmtDate(t.date))} · registration ${t.regOpen?"open":"closed"}</span></div>${sub}</section>`;
  let body="";
  if(ot==="details") body=`<section class="panel">${form(t)}<div class="savebar"><button class="btn primary" data-tsave="${esc(t.id)}">💾 Save changes</button><button class="btn small ghost" data-tsave="new">Save as a new tournament</button></div></section>`;
  if(ot==="refs") body=`
    <section class="panel"><h2>Referees & big screen</h2>
      <div class="row code-row"><span class="lbl">Referee code</span>${S.secret?`<b class="code">${esc(S.secret)}</b><button class="btn small" data-copy="${esc(S.secret)}">Copy</button><button class="btn small ghost" data-tcode="1">New code</button>`:`<button class="btn small primary" data-tcode="1">Create code</button>`}</div>
      ${(()=>{ const link="https://dropshotfolks.co.uk/tourney/#ref", msg=`🏸 Referee for ${t.name||"the tournament"}\nOpen: ${link}\n${S.secret?`Code: ${S.secret}\n`:""}Pick your court, tap Start, do the toss, then tap a team for each point.`;
        return `<div class="row"><span class="lbl">Referee link</span><b class="code" style="font-size:.95rem;letter-spacing:0">${esc(link.replace("https://",""))}</b><button class="btn small" data-copy="${esc(link)}">Copy link</button>${S.secret?`<a class="btn small primary" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Send link & code on WhatsApp</a>`:""}</div>` })()}
      <p class="muted" style="font-size:.85rem">Referees open the link on their phone and enter the code. They only see the scoring screen, nothing else. A new code locks out phones using the old one.</p>
      <div class="row"><a class="btn small" href="#screen" data-screen="1">📺 Open big screen</a><span class="muted" style="font-size:.85rem">Put it on the projector and press F for full screen.</span></div></section>`;
  if(ot==="teams") body=`<section class="panel"><div class="row" style="justify-content:space-between"><h2>Teams</h2><div class="row"><label class="btn small" for="imp-file">📥 Import spreadsheet</label><input id="imp-file" type="file" accept=".xlsx,.csv" hidden><button class="btn small primary" data-oaddopen="1">➕ Add a team</button></div></div>${catBar(t)}
      ${S.addTeam?`<div class="ogrp"><h3>New team · ${esc(catName(t,S.cat))}</h3><div class="grid2"><label class="f">Team name<input id="oa-name" maxlength="40"></label>${Array.from({length:nPl(t)},(_,i)=>`<label class="f">Player ${i+1}<input id="oa-p${i+1}" maxlength="60"></label>`).join("")}</div>
        <div class="row"><button class="btn primary small" data-oadd="${esc(S.cat||"")}">Add team</button><button class="btn small ghost" data-oaddopen="0">Cancel</button></div></div>`:""}
      ${(()=>{ const ts=teamsOf(t,S.cat); if(!ts.length) return `<div class="empty">No teams in this category yet.</div>`;
        return `<div class="row"><span class="muted">${ts.length} teams · ${ts.filter(x=>x.status==="confirmed").length} confirmed</span>${ts.some(x=>x.status!=="confirmed")?`<button class="btn small" data-confirmall="${esc(S.cat)}">Confirm all</button>`:""}</div>
        <div class="otl">${ts.map(x=>teamCard(t,x)).join("")}</div>` })()}
      <p class="muted" style="font-size:.82rem">📥 Import takes Google Form responses (.xlsx or .csv): teams already here get their contact details filled in, new teams are added.</p></section>`;
  if(ot==="fixtures") body=`<section class="panel"><h2>1 · Groups</h2>${catBar(t)}
      <p class="muted">${isTeam(t)?`Groups of about ${Number(t.groupSize)||3}; every tie is men's, women's and two mixed doubles. Top ${Number(t.advance)||2} per group go through.`:`Groups of about ${Number(t.groupSize)||4}; everyone plays everyone in their group. ${Number(t.advance)===1?"The winner":`The top ${Number(t.advance)||2}`} of each group go${Number(t.advance)===1?"es":""} through.`} Only confirmed teams are included. Change group sizes in 📝 Details.</p>
      <div class="row"><button class="btn primary" data-gen="${esc(S.cat||"")}">${t.groups?.[S.cat]?"Re-make groups":"Make groups"}</button>${matchesOf(t,S.cat).length?`<button class="btn small ghost danger" data-clearfix="${esc(S.cat||"")}">Clear all fixtures</button>`:""}</div>
      <p class="muted" style="font-size:.85rem">${(()=>{ const g=matchesOf(t,S.cat).filter(m=>m.stage==="group"); return g.length?`${g.filter(m=>m.status==="done").length} of ${g.length} group matches played.`:"No groups yet." })()}</p></section>
    <section class="panel"><h2>2 · Knockouts</h2><p class="muted">Make it any time: the places read "Winner Group A" and so on, and fill in by themselves as groups finish.</p>
      <button class="btn primary" data-genko="${esc(S.cat||"")}">${matchesOf(t,S.cat).some(m=>m.stage==="ko")?"Re-make knockout bracket":"Make knockout bracket"}</button></section>
    ${schedPanel(t).replace("🏸 Courts & order of play","3 · Courts & order of play")}
    <section class="panel"><h2>4 · Scores & changes</h2><p class="muted">Open the <b>Fixtures</b> tab and tap any match to fix its score, court or order. Referees score live from their phones.</p><button class="btn small" data-tab="fix">Open Fixtures</button></section>`;
  return `${list}${preset}${head}${body}`;
}
// organiser: one team, with an inline editor
function teamCard(t, x){
  const c=S.contacts[x.id]||{}, n=nPl(t);
  if(S.editTeam===x.id) return `<div class="otc editing"><div class="grid2">
      <label class="f">Team name<input id="et-name" maxlength="40" value="${esc(x.name)}"></label>
      ${cats(t).length>1?`<label class="f">Category<select id="et-cat">${cats(t).map(k=>`<option value="${esc(k.id)}" ${k.id===x.cat?"selected":""}>${esc(k.name)}</option>`).join("")}</select></label>`:""}
      ${Array.from({length:n},(_,i)=>`<label class="f">Player ${i+1}${i===0?" (captain)":""}<input id="et-p${i+1}" maxlength="60" value="${esc(x["p"+(i+1)]||"")}"></label>`).join("")}
      <label class="f">Captain's email<input id="et-email" type="email" maxlength="120" value="${esc(c.email||"")}"></label><label class="f">Captain's phone<input id="et-phone" type="tel" maxlength="30" value="${esc(c.phone||"")}"></label></div>
    <div class="row"><button class="btn primary small" data-tsaveteam="${esc(x.id)}">💾 Save</button><button class="btn small ghost" data-tedit="">Cancel</button></div></div>`;
  const more=[...[2,3,4].map(k=>c["phone"+k]||c["email"+k]?`P${k}: ${c["phone"+k]||""} ${c["email"+k]||""}`:""), c.emName?`Emergency: ${c.emName} ${c.emPhone||""}`:"", c.notes?`Notes: ${c.notes}`:""].filter(Boolean);
  return `<div class="otc"><div class="otc-h"><b>${esc(x.name)}</b>${x.status==="confirmed"?'<span class="chip st-confirmed">Confirmed</span>':'<span class="chip st-awaiting">Pending</span>'}${c.paid?`<span class="chip st-awaiting">${c.payName?`Paid as ${esc(c.payName)}`:"Says paid"} · check bank</span>`:""}${c.wa?'<span class="chip st-confirmed">WhatsApp ✓</span>':""}</div>
    <div class="muted">${esc(playersOf(x).join(" · "))}</div>
    ${c.email||c.phone?`<div class="otc-c">${esc([c.email,c.phone].filter(Boolean).join(" · "))}</div>`:""}${more.length?`<details class="otc-m"><summary>More details</summary><div>${more.map(esc).join("<br>")}</div></details>`:""}
    <div class="row"><button class="btn small" data-tedit="${esc(x.id)}">✏️ Edit</button>${x.status==="confirmed"?`<button class="btn small ghost" data-tconfirm="${esc(x.id)}" data-v="pending">Unconfirm</button>`:`<button class="btn small primary" data-tconfirm="${esc(x.id)}" data-v="confirmed">Confirm</button>`}<button class="btn small ghost danger" data-tdel="${esc(x.id)}">Delete</button></div></div>`;
}

/* score editor (organiser or referee) */
function editPanel(){
  const t=T(), m=S.matches.find(x=>x.id===S.edit); if(!t||!m) return "";
  const r=rules(t,m), games=(m.games?.length?m.games:[[0,0]]).concat(r.bestOf>1&&(m.games||[]).length<r.bestOf?[[0,0]]:[]).slice(0,r.bestOf);
  return `<section class="panel" id="editbox"><h2>${S.isAdmin?"Edit match":"Edit result"}</h2>${matchRow(t,m)}
    <div class="grid2">${games.map((g,i)=>`<div class="scorein"><span class="lbl">Game ${i+1}</span><input type="number" min="0" max="40" id="eg-${i}-a" value="${g[0]}"><span>–</span><input type="number" min="0" max="40" id="eg-${i}-b" value="${g[1]}"></div>`).join("")}</div>
    ${S.isAdmin?`<div class="row"><label class="f" style="width:120px">Court<input id="ep-court" type="number" min="1" max="20" value="${esc(m.pcourt||"")}"></label>${clockOn(t)?`<label class="f" style="width:140px">Time<input id="ep-time" type="time" value="${esc(m.ptime||"")}"></label>`:`<label class="f" style="width:140px">Order on court<input id="ep-num" type="number" min="1" max="99" value="${esc(m.pnum||"")}"></label>`}<button class="btn small" data-eplan="${esc(m.id)}" style="align-self:end">Save court & time</button></div>`:""}
    <div class="row"><button class="btn primary" data-esave="${esc(m.id)}">Save result</button>${m.status!=="scheduled"?`<button class="btn small ghost danger" data-ereset="${esc(m.id)}">Reset to not played</button>`:""}<button class="btn small ghost" data-eclose="1">Close</button></div></section>`;
}

/* one court, big: for a laptop or TV beside each court (#court=N) */
function viewFocus(c){
  const t=T(); if(!t) return `<div class="scr"><div class="scr-h"><h1>No tournament yet</h1></div></div>`;
  const m=liveOn(t,c), r=rules(t,m);
  const nextHere = upNext(t,40).find(x=>x.pcourt===c) || upNext(t,1)[0];
  const head=`<div class="scr-h"><img src="../images/logo-mark.png" alt=""><h1>${esc(t.name||"Tournament")}</h1><span class="fc-court">Court ${c}</span><span class="clock" id="clock"></span></div>`;
  const foot=`<div class="scr-f">${nextHere?`<b>Next on Court ${c}:</b> ${esc(tName(sideTeam(nextHere,"a")))} vs ${esc(tName(sideTeam(nextHere,"b")))} <span>(${esc(catName(t,nextHere.cat))})</span>`:"<b>dropshotfolks.co.uk/tourney</b> · live scores on your phone"}</div>`;
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
    <div class="scr-f">${nx.length?`<b>Up next:</b> ${nx.map(m=>`${m.pcourt?`<b>${esc(planTxt(m,true))}</b> `:""}${esc(tName(sideTeam(m,"a")))} vs ${esc(tName(sideTeam(m,"b")))} <span>(${esc(catName(t,m.cat))})</span>`).join(" · ")}`:"<b>dropshotfolks.co.uk/tourney</b> · scores live on your phone"}</div></div>`;
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
  const t=T(), r=rules(t,m); let games=(m.games?.length?m.games:[[0,0]]).map(g=>[...g]);
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
  if(ds.goorg){ S.tab="org"; S.otab=ds.goorg; ls.set("dsf:ttab","org"); ls.set("dsf:otab",S.otab); render(); scrollTo({top:0}); return }
  if(ds.tab){ S.tab=ds.tab; S.edit=null; ls.set("dsf:ttab",S.tab); if(location.hash) history.replaceState(null,"",location.pathname); render(); scrollTo({top:0}); return }
  if(ds.screen){ e.preventDefault(); location.hash="#screen"; return }
  if(ds.tid){ S.tid=ds.tid; S.newT=false; S.cat=null; ls.set("dsf:tid",S.tid); render(); return }
  if(ds.cat){ S.cat=ds.cat; render(); return }
  if(ds.fxtab){ S.fxTab=ds.fxtab; render(); return }
  if(ds.openko){ const d=document.querySelector("details.vm[id$='-ko']"); if(d){ d.open=true; const el=document.querySelector(`[data-medit="${ds.openko}_MD"]`)?.closest(".tie")||d; el.scrollIntoView({behavior:"smooth",block:"center"}); el.classList.add("flash"); setTimeout(()=>el.classList.remove("flash"),1600) } return }
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
  if(ds.finish){ const m=S.matches.find(x=>x.id===ds.finish), w=matchWinner(m,rules(t,m)); if(!w) return;
    await upd(m.id,{status:"done", winner:w, games:(m.games||[]).filter(g=>g[0]||g[1])}); toast(`Result saved: ${tName(sideTeam(m,w))} win`); return }
  if(ds.stop){ if(!confirm("Stop this match and put it back in the queue? The score so far is kept.")) return; await upd(ds.stop,{status:"scheduled", court:0}); return }
  if(ds.medit){ if(!canRef(t)) return; S.edit=ds.medit; render(); scrollTo({top:0,behavior:"smooth"}); return }
  if(ds.eclose){ S.edit=null; render(); return }
  if(ds.esave){ const m=S.matches.find(x=>x.id===ds.esave), r=rules(t,m), games=[];
    for(let i=0;i<r.bestOf;i++){ const a=$(`#eg-${i}-a`), b=$(`#eg-${i}-b`); if(!a) break; const g=[Number(a.value)||0, Number(b.value)||0]; if(g[0]||g[1]) games.push(g) }
    const w=matchWinner({games},r); if(!w){ toast(`That isn't a finished match yet (${ruleTxt(r)})`); return }
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
      koSize:Math.min(64,Math.max(0,Number(g("kosize").value)||0)),
      stageRules:Object.fromEntries([["ko","k"],["final","f"]].map(([key,k])=>[key,{pointsTo:Number(g(k+"to").value)||0, cap:Math.min(40,Math.max(0,Number(g(k+"cap").value)||0)), bestOf:Number(g(k+"bo").value)||0}])),
      mode:team?"team":"pairs", cap:Math.min(40,Math.max(0,Number(g("cap").value)||0)), wild:Math.min(8,Math.max(0,Number(g("wild").value)||0)), bronze:g("bronze").checked,
      catIds, cats:team?[{id:"TC",name:"Team Cup"}]:CAT_PRESETS.filter(([id])=>catIds.includes(id)).map(([id,name])=>({id,name}))};
    const id = ds.tsave==="new" ? `t${(data.date||nowIso().slice(0,10)).replace(/-/g,"")}-${Date.now().toString(36).slice(-4)}` : ds.tsave;
    await db.collection("tourneys").doc(id).set(data,{merge:true}).then(()=>{ S.tid=id; S.newT=false; ls.set("dsf:tid",id); S.posterDraft=undefined; render(); toast("Tournament saved") },()=>toast("Couldn't save")); return }
  if(ds.tcode){ const code=newCode(); await db.collection("tsecrets").doc(t.id).set({code}).then(()=>{ S.secret=code; render(); toast(`Referee code ${code}`) },()=>toast("Couldn't save the code")); return }
  if(ds.tconfirm){ await db.collection("tteams").doc(ds.tconfirm).update({status:ds.v}).catch(()=>toast("Couldn't update")); return }
  if(ds.confirmall){ const b=db.batch(); teamsOf(t,ds.confirmall).filter(x=>x.status!=="confirmed").forEach(x=>b.update(db.collection("tteams").doc(x.id),{status:"confirmed"})); await b.commit(); toast("All confirmed"); return }
  if(ds.tdel){ const x=teamById(ds.tdel); if(!x||!confirm(`Delete ${x.name}?`)) return; await db.collection("tcontacts").doc(x.id).delete().catch(()=>{}); await db.collection("tteams").doc(x.id).delete(); return }
  if(ds.oadd){ const v=id=>($(`#oa-${id}`)?.value||"").trim(), ks=Array.from({length:nPl(t)},(_,i)=>"p"+(i+1)); if(!v("name")||ks.some(k=>!v(k))){ toast(`Add a team name and all ${ks.length} players`); return }
    await db.collection("tteams").add({tid:t.id, cat:ds.oadd, name:v("name"), ...Object.fromEntries(ks.map(k=>[k,v(k)])), createdBy:S.uid, createdAt:nowIso(), status:"confirmed"}); ["name",...ks].forEach(k=>$(`#oa-${k}`).value=""); toast("Team added"); return }
  if(ds.preset){ const p=PRESETS.find(x=>x.key===ds.preset); if(!p) return; const x=p.find();
    if(p.create){ if(x){ S.tid=x.id; render(); return }
      await db.collection("tourneys").doc(p.create.id).set({...p.create.data(), preset:p.key}).then(()=>{ S.tid=p.create.id; S.newT=false; ls.set("dsf:tid",S.tid); toast("Tournament set up. Now add the teams.") },()=>toast("Couldn't save")); return }
    if(!x){ toast("Create that tournament first"); return }
    if(!confirm(`Apply the official details to ${x.name}? Its format, scoring, courts, times and terms are replaced. Name, date, teams, bank details and registration stay the same.`)) return;
    await db.collection("tourneys").doc(x.id).set({...p.merge(), preset:p.key},{merge:true}).then(()=>{ S.tid=x.id; ls.set("dsf:tid",x.id); toast("Details applied") },()=>toast("Couldn't save")); return }
  if(ds.otab){ S.otab=ds.otab; S.editTeam=null; ls.set("dsf:otab",S.otab); render(); return }
  if(ds.oaddopen!=null){ S.addTeam=ds.oaddopen==="1"; render(); if(S.addTeam) $("#oa-name")?.focus(); return }
  if(ds.tedit!=null){ S.editTeam=ds.tedit||null; render(); return }
  if(ds.tsaveteam){ const x=teamById(ds.tsaveteam); if(!x) return; const v=id=>($(`#et-${id}`)?.value||"").trim();
    if(!v("name")||!v("p1")){ toast("The team needs a name and player 1"); return }
    const data={name:v("name").slice(0,40), ...Object.fromEntries(Array.from({length:nPl(t)},(_,i)=>["p"+(i+1),v("p"+(i+1)).slice(0,60)])), ...($("#et-cat")?{cat:v("cat")}:{})};
    try{ await db.collection("tteams").doc(x.id).update(data);
      const c=S.contacts[x.id], cd={email:v("email").slice(0,120), phone:v("phone").slice(0,30)};
      if(c) await db.collection("tcontacts").doc(x.id).update(cd); else if(cd.email||cd.phone) await db.collection("tcontacts").doc(x.id).set({...cd, createdBy:S.uid}).catch(()=>{});
      S.editTeam=null; render(); toast("Team saved ✓") }catch{ toast("Couldn't save the team") } return }
  if(ds.tnew){ S.newT=true; render(); $("#newt")?.scrollIntoView({behavior:"smooth"}); return }
  if(ds.tnewx){ S.newT=false; render(); return }
  if(ds.tdelt){ const x=S.tourneys.find(y=>y.id===ds.tdelt); if(!x) return;
    const typed=prompt(`This deletes ${x.name} with all ${teamsOf(x).length} teams, fixtures and results. It can't be undone.\n\nType DELETE to confirm.`); if(typed!=="DELETE") return;
    try{ const docs=[...matchesOf(x).map(m=>db.collection("tmatches").doc(m.id)), ...teamsOf(x).flatMap(tm=>[db.collection("tcontacts").doc(tm.id), db.collection("tteams").doc(tm.id)]), db.collection("tsecrets").doc(x.id), db.collection("tourneys").doc(x.id)];
      for(let i=0;i<docs.length;i+=400){ const b=db.batch(); docs.slice(i,i+400).forEach(d=>b.delete(d)); await b.commit() }
      if(S.tid===x.id){ S.tid=null; ls.set("dsf:tid",null) } toast(`${x.name} deleted`) }catch{ toast("Couldn't delete it all. Try again.") } return }
  if(ds.gen){ if(matchesOf(t,ds.gen).length && !confirm("This replaces all fixtures and results for this category. Carry on?")) return; await generateGroups(t, ds.gen); return }
  if(ds.fxsched){ const timed=!!$("#fx-timed")?.checked, start=$("#fx-start")?.value||t.startTime||"10:00", mins=Math.min(60,Math.max(5,Number($("#fx-mins")?.value||t.matchMins)||15)), courts=Math.min(12,Math.max(1,Number($("#fx-courts").value)||4));
    if(matchesOf(t).some(m=>m.pcourt) && !confirm("Re-do the court and order for every match?")) return;
    await db.collection("tourneys").doc(t.id).set({startTime:start, matchMins:mins, courts, timed},{merge:true});
    await scheduleAll({...t, startTime:start, matchMins:mins, courts, timed}); return }
  if(ds.sched){ if(matchesOf(t).some(m=>m.pcourt) && !confirm("Re-do the court and order for every match?")) return; await scheduleAll(t); return }
  if(ds.eplan){ const c=Number($("#ep-court").value)||0, tm=$("#ep-time")?.value, n=Number($("#ep-num")?.value)||0; await db.collection("tmatches").doc(ds.eplan).update({pcourt:c||null, ...($("#ep-time")?{ptime:tm||null}:{pnum:n||null, pslot:Math.max(0,n-1)})}).then(()=>toast("Court & time saved"),()=>toast("Couldn't save")); return }
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
  const pc=e.target.dataset?.plcourt, pt=e.target.dataset?.pltime, pn=e.target.dataset?.plnum;
  if((pc||pt||pn) && S.isAdmin){ const id=pc||pt||pn, data=pc?{pcourt:Number(e.target.value)||null}:pt?{ptime:e.target.value||null}:{pnum:Number(e.target.value)||null, pslot:Math.max(0,(Number(e.target.value)||1)-1)};
    await db.collection("tmatches").doc(id).update(data).then(()=>toast(pc?`Court ${e.target.value||"cleared"}`:pt?`Time ${e.target.value||"cleared"}`:`${ordinal(Number(e.target.value)||1)} on its court`),()=>toast("Couldn't save")); return }
  if(e.target.id==="imp-file" && e.target.files?.[0] && S.isAdmin){ const f=e.target.files[0]; e.target.value="";
    try{ const list=teamsFromRows(await readSheet(f)); if(!list.length){ toast("No teams found. Is there a 'Team Name' column?"); return } await importTeams(T(), list) }
    catch(err){ console.error(err); toast("Couldn't read that file. Save it as .xlsx or .csv and try again.") } return }
  if(e.target.id==="fx-timed" && S.isAdmin){ const t=T(); if(t) await db.collection("tourneys").doc(t.id).set({timed:e.target.checked},{merge:true}); return }
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
/* ---------- first organiser visit: set up the Team Cup (teams + fixtures) and the official Net Play details ---------- */
async function autoSetup(){
  if(!S.isAdmin || autoSetup.running || ls.get("dsf:noauto",false)) return; autoSetup.running=true;
  const wait=async ok=>{ for(let i=0;i<60 && !ok();i++) await new Promise(r=>setTimeout(r,250)) };
  try{
    const id="t20261018-teamcup", done=[];
    if(!S.tourneys.some(x=>x.id===id)){
      await db.collection("tourneys").doc(id).set({...TEAM_CUP, preset:"teamcup"});
      const b=db.batch(), base=Date.parse("2026-10-01T00:00:00Z");
      TEAM_CUP_TEAMS.forEach(([name,...pl],i)=>b.set(db.collection("tteams").doc(`${id}-${i+1}`), {tid:id, cat:"TC", name, p1:pl[0]||"", p2:pl[1]||"", p3:pl[2]||"", p4:pl[3]||"", createdBy:S.uid, createdAt:new Date(base+i*1000).toISOString(), status:"confirmed"}));
      await b.commit(); done.push(`Team Cup with ${TEAM_CUP_TEAMS.length} teams`);
    }
    await wait(()=>S.tourneys.some(x=>x.id===id) && teamsOf(S.tourneys.find(x=>x.id===id),"TC").length>=TEAM_CUP_TEAMS.length);
    let tc=S.tourneys.find(x=>x.id===id);
    if(tc && !matchesOf(tc).length && !tc.groups?.TC){
      await generateGroups(tc,"TC"); await wait(()=>S.tourneys.find(x=>x.id===id)?.groups?.TC && matchesOf(tc).length>0);
      tc=S.tourneys.find(x=>x.id===id); await generateKnockouts(tc,"TC"); await wait(()=>matchesOf(tc).some(m=>m.stage==="ko"));
      await scheduleAll(S.tourneys.find(x=>x.id===id)); done.push("its groups, knockouts, courts and times");
    }
    for(const t of S.tourneys.filter(isTeam)){ const ties=[...new Set(matchesOf(t).filter(m=>m.tie).map(m=>m.tie))].filter(tie=>!S.matches.some(m=>m.tie===tie && m.disc==="XD2"));
      if(!ties.length) continue; const b=db.batch();
      ties.forEach(tie=>{ const x=S.matches.find(m=>m.tie===tie && m.disc==="XD")||S.matches.find(m=>m.tie===tie); const {id, games, svc, seq, ...rest}=x;
        b.set(db.collection("tmatches").doc(`${tie}_XD2`), {...rest, disc:"XD2", status:"scheduled", games:[], winner:null, court:0, order:(x.order||0)+0.5, updatedAt:nowIso()}) });
      await b.commit(); await wait(()=>ties.every(tie=>S.matches.some(m=>m.tie===tie && m.disc==="XD2")));
      if(!matchesOf(t).some(m=>m.status!=="scheduled" && !m.bye)) await scheduleAll(S.tourneys.find(x=>x.id===t.id));
      done.push(`second mixed doubles added to ${t.name}`) }
    for(const t0 of S.tourneys){ const ms=matchesOf(t0).filter(m=>!m.bye);
      if(clockOn(t0) && ms.length && ms.some(m=>m.pcourt) && !ms.some(m=>m.ptime) && !ms.some(m=>m.status!=="scheduled")){ await scheduleAll(t0); done.push(`start times for ${t0.name}`) } }
    for(const t of S.tourneys){ const ms=matchesOf(t).filter(m=>m.pcourt && !m.bye && m.pnum==null); if(!ms.length) continue;
      const times=[...new Set(matchesOf(t).filter(m=>m.ptime).map(m=>m.ptime))].sort(), per={};
      const b=db.batch(); [...ms].sort((x,y)=>String(x.ptime||"99").localeCompare(String(y.ptime||"99"))||(x.order||0)-(y.order||0)).forEach(m=>{ per[m.pcourt]=(per[m.pcourt]||0)+1;
        b.update(db.collection("tmatches").doc(m.id),{pnum:per[m.pcourt], pslot:Math.max(0,times.indexOf(m.ptime))}) }); await b.commit() }
    const np=S.tourneys.find(x=>x.date==="2026-11-21");
    if(np && np.preset!=="netplay"){ await db.collection("tourneys").doc(np.id).set({...NET_PLAY, preset:"netplay"},{merge:true}); done.push("the official Net Play details") }
    if(done.length){ S.tid=id; ls.set("dsf:tid",id); render(); toast(`Set up: ${done.join(", ")} ✓`) }
  }catch(e){ console.error(e); toast("Couldn't finish setting up. Reload to try again.") }
  autoSetup.running=false;
}

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
  const key=x=>String(x||"").trim().toLowerCase(), byName=new Map(teamsOf(t).map(x=>[key(x.name),x]));
  const add=list.filter(o=>!byName.has(key(o.name))), fill=list.filter(o=>byName.has(key(o.name)) && !S.contacts[byName.get(key(o.name)).id]);
  if(!add.length && !fill.length){ toast("Those teams and their contact details are already in"); return }
  if(!confirm(`${add.length?`Add ${add.length} team${add.length>1?"s":""} to ${t.name}:\n${add.map(o=>`• ${o.name.trim()}${o.paid?"":"  (payment not ticked, so pending)"}`).join("\n")}\n\n`:""}${fill.length?`Add contact details to ${fill.length} team${fill.length>1?"s":""} already here.`:""}`)) return;
  const cat=isTeam(t)?"TC":(S.cat||cats(t)[0]?.id), cut=(v,k)=>String(v||"").trim().slice(0,k), base=Date.now(); let n=0, nf=0;
  const contact=o=>({email:cut(o.em1,120), phone:cut(o.ph1,30), ...Object.fromEntries([2,3,4].flatMap(k=>[["email"+k,cut(o["em"+k],120)],["phone"+k,cut(o["ph"+k],30)]])),
    ...Object.fromEntries([1,2,3,4].filter(k=>o["g"+k]).map(k=>["g"+k,cut(o["g"+k],30)])), paid:o.paid, wa:o.wa, agreed:o.agreed, createdBy:S.uid});
  for(const o of fill){ const x=byName.get(key(o.name));
    try{ await db.collection("tcontacts").doc(x.id).set(contact(o)); nf++ }catch(err){ console.error(err) } }
  for(const [i,o] of add.entries()){
    try{ const ref=db.collection("tteams").doc();
      await ref.set({tid:t.id, cat, name:cut(o.name,40), ...Object.fromEntries(Array.from({length:nPl(t)},(_,k)=>["p"+(k+1),cut(o["p"+(k+1)],60)])), createdBy:S.uid, createdAt:new Date(base+i).toISOString(), status:o.paid?"confirmed":"pending"});
      await db.collection("tcontacts").doc(ref.id).set(contact(o));
      n++ }catch(err){ console.error(err) } }
  const okAll=n===add.length && nf===fill.length;
  toast(okAll ? [n?`${n} team${n>1?"s":""} added`:"", nf?`contact details added to ${nf}`:""].filter(Boolean).join(", ")+" 🎉" : "Some details didn't save. Publish the latest Firebase rules, then import again.");
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
    const go=()=>{ if(S.loaded) autoSetup(); else setTimeout(go,300) }; setTimeout(go,1200);
    const watchSecret=()=>{ const t=T(); if(t) db.collection("tsecrets").doc(t.id).get().then(d=>{ S.secret=d.exists?d.data().code:null; render() }).catch(()=>{}) };
    setTimeout(watchSecret,800);
  }
  auth.onAuthStateChanged(u=>{ if(u) db.collection("tunlocks").doc(u.uid).onSnapshot(d=>{ S.unlock=d.exists?d.data():null; render() },()=>{}) });
})();
