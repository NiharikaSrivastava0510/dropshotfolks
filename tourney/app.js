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
  prize1:"Trophy + gold medals, bags & bottles", prize2:"Silver medals, beanies & headbands", prize3:"Bronze medals, grip tapes & socks",
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
function richTxt(txt){
  const out=[]; let list=[];
  const flush=()=>{ if(list.length){ out.push(`<ol class="clauses">${list.join("")}</ol>`); list=[] } };
  String(txt||"").split(/\n+/).map(l=>l.trim()).filter(Boolean).forEach(l=>{
    const m=/^(\d+)[.)]\s*(.*)$/.exec(l);
    if(m){ const t=/^([^.:]{2,45})[.:]\s+(.+)$/.exec(m[2]); list.push(`<li>${t?`<b>${esc(t[1])}</b><span>${esc(t[2])}</span>`:`<span>${esc(m[2])}</span>`}</li>`) }
    else { flush(); out.push(`<p>${esc(l)}</p>`) } });
  flush(); return `<div class="rich">${out.join("")}</div>`;
}
// how much each team plays, in numbers
function glance(t){
  const team=isTeam(t), per=team?Object.keys(DISC).length:1, gs=Number(t.groupSize)||(team?3:4);
  const nT=teamsOf(t).filter(x=>x.status==="confirmed").length || teamsOf(t).length;
  const groups=Object.values(t.groups||{}).flatMap(o=>Object.values(o||{}));
  const minG=groups.length?Math.min(...groups.map(g=>g.length)):gs, ties=Math.max(1,minG-1)*legs(t);
  const ms=matchesOf(t).filter(m=>!m.bye);
  return {team, per, nT, gs, nG:groups.length, ties, matches:ties*per, total:ms.length};
}
const glanceLine = t => { const g=glance(t); if(!g.nT) return "";
  return `<p class="glance">${g.nT} teams${g.nG?` · ${g.nG} groups`:""} · every team plays at least <b>${g.team?`${g.ties} ties (${g.matches} matches)`:`${g.ties} matches`}</b>${g.total?` · ${g.total} matches in total`:""}</p>` };
// organiser: format & scoring form shown in place of the picture
function formatForm(t){
  const sel=(id,val,opts)=>`<select id="fe-${id}">${opts.map(([v,l])=>`<option value="${v}" ${String(val)===String(v)?"selected":""}>${l}</option>`).join("")}</select>`;
  const num=(id,val,min,max)=>`<input id="fe-${id}" type="number" min="${min}" max="${max}" value="${esc(val??"")}">`;
  const row=(label,k,src)=>`<div class="fe-row"><b>${label}</b>
    <label class="f">Points ${sel(k+"to",src.pointsTo??(k?"0":21),[...(k?[["0",k==="f"?"Same as knockouts":"Same as round robin"]]:[]),["11","11"],["15","15"],["21","21"]])}</label>
    <label class="f">Deuce max (0 = standard) ${num(k+"cap",src.cap??0,0,40)}</label>
    <label class="f">Games ${sel(k+"bo",src.bestOf??(k?"0":1),[...(k?[["0",k==="f"?"Same as knockouts":"Same as round robin"]]:[]),["1","1 game"],...(k?[]:[["2","2 games (total points at 1–1)"]]),["3","Best of 3"]])}</label></div>`;
  return `<div class="fmtform">
    <div class="fv-box"><h4>🔁 Round robin & who goes through</h4><div class="grid2">
      <label class="f">Teams per group ${num("gsize",t.groupSize??(isTeam(t)?3:4),3,8)}</label>
      <label class="f">Teams through per group ${num("adv",t.advance??2,1,4)}</label>
      <label class="f">Knockout size, filled with best runners-up (0 = off) ${num("kosize",t.koSize??0,0,64)}</label>
      <label class="f">Deuce ${sel("deuce",t.deuce===false?0:1,[["1","On: win by 2"],["0","Off: first to the points"]])}</label>
      <label class="row" style="gap:6px;align-self:end"><input type="checkbox" id="fe-bronze" style="width:auto" ${bronzeOn(t)?"checked":""}> 🥉 3rd-place match</label></div></div>
    <div class="fv-box"><h4>🏸 Scoring</h4>${row("🔁 Round robin","",{pointsTo:t.pointsTo,cap:t.cap,bestOf:t.bestOf})}${row("⚔️ Quarter & semi-finals","k",t.stageRules?.ko||{})}${row("🏆 Final & 3rd place","f",t.stageRules?.final||{})}</div>
    <div class="fv-box"><h4>📝 Good to know</h4><textarea id="fe-format" rows="4" placeholder="e.g. 2 minutes warm-up, 20 seconds between games…">${esc(t.format||"")}</textarea></div>
    <div class="row"><button class="btn primary" data-savefmt="1">💾 Save format & scoring</button><button class="btn small ghost" data-editfmt="0">Cancel</button></div></div>`;
}
// the game format as a picture: numbers, how a tie works, the route to the final, points and scoring
function formatVisual(t){
  const g=glance(t), r=rules(t), ko=rules(t,{stage:"ko"}), fin=rules(t,{stage:"ko",roundName:"Final"}), adv=Number(t.advance)||2, wild=Number(t.koSize)>0||Number(t.wild)>0;
  const stat=(n,l)=>`<div class="fv-stat"><b>${n}</b><span>${l}</span></div>`;
  const rl=x=>`${x.bestOf===3?"Best of 3 · ":x.bestOf===2?"2 games · ":"1 game · "}to ${x.to}${x.deuce?` (deuce, max ${x.cap})`:""}`;
  const two=[r,ko,fin].some(x=>x.bestOf===2);
  return `<div class="fmtv">
    <div class="fv-glance">${g.nT?stat(g.nT,"teams"):""}${stat(`${g.gs}`,"teams per group")}${stat(g.team?g.ties:g.ties, g.team?`ties for every team (min)`:"group matches for every team (min)")}${g.team?stat(g.matches,"matches for every team (min)"):""}${g.total?stat(g.total,"matches in total"):""}</div>
    ${g.team?`<div class="fv-box"><h4>🤝 Every tie = ${g.per} matches</h4><div class="fv-tie">
      <div><span>👨👨</span><b>Men's doubles</b></div><div><span>👩👩</span><b>Women's doubles</b></div><div><span>👨👩</span><b>Mixed doubles 1</b></div><div><span>👨👩</span><b>Mixed doubles 2</b></div></div>
      <p>Win <b>3 of 4</b> to win the tie. At <b>2–2</b>, the team with more total points wins; still level → the winner of Mixed doubles 2.</p></div>`:""}
    <div class="fv-box"><h4>🗺️ The route to the final</h4><div class="fv-steps">
      <div><i>1</i><b>Groups</b><span>${g.nG?`${g.nG} groups`:`Groups of ${g.gs}`}. Everyone plays everyone in their group${legs(t)===2?" <b>twice, back to back</b>":""}.</span></div>
      <div><i>2</i><b>${adv===1?"Winners through":`Top ${adv} through`}</b><span>${adv===1?"Each group winner":`The top ${adv} of each group`}${wild?", plus the best of the rest,":""} reach the knockouts.${g.team&&new Set(Object.values(t.groups?.TC||{}).map(x=>x.length)).size>1?" Groups are different sizes, so teams from different groups are compared on <b>points per tie</b>.":""}</span></div>
      <div><i>3</i><b>Knockouts</b><span>${koPath(t)}${bronzeOn(t)?" (+ 🥉 match for 3rd)":""}.</span></div></div></div>
    ${g.team?`<div class="fv-box"><h4>📊 Group points</h4><div class="fv-pts"><div><b>4</b><span>win by 6+</span></div><div><b>3</b><span>win by 4–5</span></div><div><b>1</b><span>win by 3 or less</span></div><div><b>0</b><span>loss</span></div></div><p class="muted">Margin = total points across the tie. Level on points → points difference, then head-to-head.</p></div>`
      :`<div class="fv-box"><h4>📊 Group places</h4><p>Most wins first. Level → head-to-head, then points difference, then points scored.</p></div>`}
    <div class="fv-box"><h4>🏸 Scoring</h4><div class="fv-score"><div><span>🔁 Round robin (groups)</span><b>${rl(r)}</b></div><div><span>⚔️ Knockouts${ruleTxt(fin)!==ruleTxt(ko)?" (quarter & semi-finals)":""}</span><b>${rl(ko)}</b></div>${ruleTxt(fin)!==ruleTxt(ko)?`<div><span>🏆 Final${bronzeOn(t)?" & 3rd place":""}</span><b>${rl(fin)}</b></div>`:""}</div>${two?`<p class="muted">2 games: both games are always played. At 1–1, the pair with more total points wins the match.</p>`:""}</div>
    ${t.format?`<div class="fv-box"><h4>📝 Good to know</h4>${richTxt(t.format)}</div>`:""}
  </div>`;
}
const prizeCards = t => { const p=[t.prize1,t.prize2,t.prize3], ed=S.isAdmin;
  if(!ed && !p.some(Boolean)) return t.prizes?`<p><b>Prizes:</b> ${esc(t.prizes)}</p>`:"";
  return `<div class="prizes">${[["🥇","Winners","gold"],["🥈","Runners-up","silver"],["🥉","Third place","bronze"]].map(([i,l,c],k)=>p[k]||ed?`<div class="prize ${c}"><span class="pm">${i}</span><span class="pl">${l}${ed?' <em>✏️ tap to edit</em>':""}</span><b ${ed?`contenteditable="plaintext-only" data-prize="${k+1}" spellcheck="true" data-ph="Add a prize…"`:""}>${esc(p[k]||"")}</b></div>`:"").join("")}</div>` };
const bankOf = t => t?.bank && (t.bank.acct || t.bank.sort) ? t.bank : null;
// a Team Cup tie: men's, women's and two mixed doubles (XD = mixed 1: man 1 + woman 1, XD2 = mixed 2: man 2 + woman 2)
const DISC = {MD:"Men's doubles", WD:"Women's doubles", XD:"Mixed doubles 1", XD2:"Mixed doubles 2"};
const isTeam = t => t?.mode==="team";
const legs = t => Number(t?.legs)===2 ? 2 : 1;   // how many times each pair in a group meets (2 = back to back)
const nPl = t => isTeam(t)?4:2;
const playersOf = x => [x?.p1,x?.p2,x?.p3,x?.p4].filter(Boolean);
const fmtHtml = t => { const [main, extra] = formatTxt(t).split("\n\n");
  return `<div class="rich"><ul class="fmtlist">${main.split("\n").filter(Boolean).map(l=>{ const m=/^([^:]{2,40}):\s*(.+)$/.exec(l); return `<li>${m?`<b>${esc(m[1])}</b> ${esc(m[2])}`:esc(l)}</li>` }).join("")}</ul>${extra?`<h4>Also</h4>${richTxt(extra)}`:""}</div>` };
function formatTxt(t){
  const r=rules(t);
  if(isTeam(t)){ const adv=Number(t.advance)||2, wild=Number(t.wild)||0;
    return [`Teams of 4: 2 men and 2 women.`,
      `Every tie between two teams is 4 matches: men's doubles, women's doubles and two mixed doubles. Win 3 of the 4 to win the tie; at 2–2 the team with more total points wins, and if still level the winner of Mixed doubles 2.`,
      `Group stage: round robin in ${Number(t.numGroups)>0?`${Number(t.numGroups)} groups`:`groups of about ${Number(t.groupSize)||3}`}.${legs(t)===2?" Every pair of teams in a group meets twice, back to back: each discipline plays its second match on the same court straight after the first.":""}`,
      `Group points: win by 6 or more points = 4, win by 4–5 = 3, win by 3 or less = 1, loss = 0. The margin is the total points across the tie's 4 matches. Level teams are split by points difference, then head-to-head.`,
      crossPairs(t,t.groups?.TC)?`Knockouts: the top ${adv} of each group go through. ${adv===2?"Quarter-finals cross the groups: Winner A v Runner-up C, Winner B v Runner-up D, Winner C v Runner-up A, Winner D v Runner-up B.":"Semi-finals: Winner A v Winner C, Winner B v Winner D."}`:`Knockouts: top ${adv} of each group${wild?` plus the best ${wild} third-placed team${wild>1?"s":""}`:""} go through. Seeding: group winners first, then runners-up; teams from different groups are compared on points per tie, so groups of different sizes are fair. The top seeds get a bye if the bracket isn't full.${t.bronze!==false?" The final and the bronze medal match are played at the same time.":""}`,
      `Group matches: ${r.bestOf===1?"1 game ":""}${ruleTxt(r)}${r.deuce&&r.cap<(CAP_FOR[r.to]||0)?`, at ${r.cap-1}–${r.cap-1} the next point wins`:""}${r.bestOf===2?". Both games are always played; at 1–1 the pair with more total points wins":""}.`,
      ...(()=>{ const ko=rules(t,{stage:"ko"}), fin=rules(t,{stage:"ko",roundName:"Final"});
        return [...(ruleTxt(ko)!==ruleTxt(r)?[`Knockout matches: ${ko.bestOf===1?"1 game ":""}${ruleTxt(ko)}.`]:[]), ...(ruleTxt(fin)!==ruleTxt(ko)?[`Final${bronzeOn(t)?" and bronze medal match":""}: ${fin.bestOf===1?"1 game ":""}${ruleTxt(fin)}.`]:[])] })()].join("\n")+(t.format?`\n\n${t.format}`:"") }
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
  tab: /^#(screen|court=\d+)$/.test(location.hash) ? "screen" : location.hash==="#ref" ? "ref" : location.hash==="#checkin" ? "checkin" : new URLSearchParams(location.search).get("tab") || ls.get("dsf:ttab","reg"),
  refOnly: location.hash==="#ref", refPre: (new URLSearchParams(location.search).get("ref")||"").toUpperCase().replace(/[^A-Z0-9]/g,"")||null,
  tourneys:[], teams:[], matches:[], contacts:{}, secret:null, unlock:null,
  uid:null, isAdmin:false, loaded:false, tid: new URLSearchParams(location.search).get("t") || ls.get("dsf:tid",null),
  cat: null, toss: {}, newT:false, codes:{}, codesLoaded:false, rulesOld:false, desk:null, deskCode:null, mail:null, mailing:false, scan:null, otab: ls.get("dsf:otab","details"), editTeam:null, addTeam:false, myTeam: ls.get("dsf:myteam",null), refCourt: ls.get("dsf:refcourt",1), edit:null, scrIdx:0
};
let db=null, auth=null;
const T = () => S.tourneys.find(t=>t.id===S.tid) || (S.tid && S.tourneys.find(t=>t.id.startsWith(S.tid))) || nextTourney() || null;
// the soonest tournament that hasn't finished yet, else the most recent
function nextTourney(){ const today=new Date(Date.now()-864e5).toISOString().slice(0,10), by=[...S.tourneys].sort((a,b)=>String(a.date||"9").localeCompare(String(b.date||"9")));
  return by.find(t=>String(t.date||"9")>=today) || by[by.length-1] }
const cats = t => (t?.cats||[]).filter(c=>c && c.id);
const catName = (t,id) => cats(t).find(c=>c.id===id)?.name || id;
const teamsOf = (t,cat) => S.teams.filter(x=>x.tid===t?.id && (!cat || x.cat===cat)).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
const teamById = id => S.teams.find(x=>x.id===id);
const tName = id => id ? (teamById(id)?.name || "Team") : null;
const matchesOf = (t,cat) => S.matches.filter(m=>m.tid===t?.id && (!cat || m.cat===cat)).sort((a,b)=>(a.order??0)-(b.order??0));
const canDesk = t => !!t && (S.isAdmin || (S.desk?.tid===t.id));
const canRef = t => !!t && (S.isAdmin || (S.unlock?.tid===t.id));

/* ---------- scoring rules ---------- */
// points per game 11/15/21; with deuce you must win by 2, up to a cap (11→15, 15→21, 21→30); without deuce first to the target wins
const CAP_FOR = {11:15, 15:21, 21:30};
// knockout rounds can have their own scoring: t.stageRules = {ko:{pointsTo,cap,bestOf}, final:{…}} (final = final & 3rd-place play-off)
const isFinalRound = m => m?.roundName==="Final" || m?.roundName==="Bronze medal match";
const rules = (t, m) => {   // the final & 3rd place follow the knockout scoring unless they have their own
  const pick=st=>Object.fromEntries(Object.entries(st||{}).filter(([,v])=>Number(v)>0));
  if(m?.stage==="ko") t={...t, ...pick(t?.stageRules?.ko), ...(isFinalRound(m)?pick(t?.stageRules?.final):{})};
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
    return src.seed ? seedLabel(t, m.cat, src.seed) : src.wild ? `Best ${adv===1?"runner-up":PLACE(adv+1)} ${src.wild}` : `${PLACE(src.p)} Group ${src.g}` }
  const from=m.from?.[side==="a"?0:1], f=from && S.matches.find(x=>x.id===from);
  if(f?.bye) return sideLabel(f, f.src?.a||f.a ? "a" : "b");
  return f ? `${m.fromLose?"Loser":"Winner"} ${shortRound(f.roundName)} ${f.slot||""}`.trim() : "To be decided";
}
// Team Cup seeds in words: group winners first (best record first), then runners-up
function seedLabel(t, cat, k){
  const G=Object.keys(t?.groups?.[cat]||{}).length||1, adv=Math.max(1,Number(t?.advance)||2), place=Math.ceil(k/G), i=k-(place-1)*G;
  if(place>adv){ const w=k-adv*G, who=adv===1?"runner-up":`${PLACE(adv+1)} place`; return w>1?`${ordinal(w)} best ${who}`:`Best ${who}` }
  const who=place===1?"group winner":place===2?"runner-up":`${PLACE(place)} place`;
  return i===1?`Best ${who}`:`${ordinal(i)} best ${who}`;
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
    W.w++; L.l++; W.pts+=tiePts(margin); const k=[m.a,m.b].sort().join("|")+"|"+W.id; res[k]=(res[k]||0)+1 });
  const h2h=(x,y)=>{ const p=[x,y].sort().join("|"), wx=res[p+"|"+x]||0, wy=res[p+"|"+y]||0; return wx>wy?-1:wy>wx?1:0 };
  return Object.values(row).sort((x,y)=>y.pts-x.pts || (y.pf-y.pa)-(x.pf-x.pa) || h2h(x.id,y.id) || y.pf-x.pf || String(tName(x.id)).localeCompare(tName(y.id)));
}
const allGroupsDone = (t, cat) => { const g=t.groups?.[cat]; return !!g && Object.keys(g).every(G=>groupDone(t,cat,G)) };
// everyone through to the knockouts, best first: top places in each group plus the best wildcards
function qualifiers(t, cat){
  if(!allGroupsDone(t,cat)) return null;
  const g=t.groups[cat], adv=Math.max(1,Number(t.advance)||2), wild=nWild(t,g), rank=acrossGroups;
  const tables=Object.keys(g).sort().map(G=>standings(t,cat,G));
  const through=tables.flatMap(tb=>tb.slice(0,adv)), extra=tables.map(tb=>tb[adv]).filter(Boolean).sort(rank).slice(0,wild);
  const band=x=>tables.findIndex(tb=>tb.includes(x))>=0 ? tables.find(tb=>tb.includes(x)).indexOf(x) : adv;
  return [...through, ...extra].sort((x,y)=>band(x)-band(y) || rank(x,y)).map(x=>x.id);
}
// doubles events: the best teams in the next place down (e.g. best runners-up), best first
// comparing teams from different groups (groups can be different sizes): points per tie, then point difference per tie, then points scored per tie
const per = (x, k) => x.p ? x[k]/x.p : 0;
const acrossGroups = (x, y) => (per(y,y.pts!=null?"pts":"w")-per(x,x.pts!=null?"pts":"w")) || (per(y,"pf")-per(y,"pa"))-(per(x,"pf")-per(x,"pa")) || per(y,"pf")-per(x,"pf");
function wildTeams(t, cat){
  if(!allGroupsDone(t,cat)) return null;
  const g=t.groups[cat], adv=Math.max(1,Number(t.advance)||2);
  return Object.keys(g).sort().map(G=>standings(t,cat,G)[adv]).filter(Boolean).sort(acrossGroups).slice(0,nWild(t,g)).map(x=>x.id);
}

/* ---------- fixture generation (organiser) ---------- */
// one match, or for the Team Cup one tie = 3 matches sharing a tie id
function addFixture(batch, t, id, data, plan={}){
  if(!isTeam(t) || data.bye){ batch.set(db.collection("tmatches").doc(id), {...data, ...(plan[id]||{})}); return [id] }
  return Object.keys(DISC).map((d,k)=>{ const mid=`${id}_${d}`, {first, ...rest}=data; batch.set(db.collection("tmatches").doc(mid), {...rest, tie:id, disc:d, order:(data.order??0)*4+k, ...(first?{after:`${first}_${d}`}:{}), ...(plan[mid]||{})}); return mid });
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
  const size=Math.max(3, Number(t.groupSize)||(isTeam(t)?3:4)), ng=Number(t.numGroups)>0 ? Math.max(1,Math.min(Number(t.numGroups), Math.floor(ids.length/2))) : Math.max(1, Math.round(ids.length/size)), letters="ABCDEFGHIJKLMNOP";
  const groups={}; for(let g=0;g<ng;g++) groups[letters[g]]=[];
  shuffle(ids).forEach((id,i)=>{ const row=Math.floor(i/ng), col=i%ng, g=row%2?ng-1-col:col; groups[letters[g]].push(id) });
  await clearMatches(t, cat);
  const batch=db.batch(), made=groupFixtures(t, cat, groups, batch);
  batch.set(db.collection("tourneys").doc(t.id), {groups:{...(t.groups||{}), [cat]:groups}}, {merge:true});
  await batch.commit(); toast(`${catName(t,cat)}: ${ng} group${ng>1?"s":""} and ${made} ${isTeam(t)?`ties (${made*4} matches)`:"matches"} created`);
}
// round-robin fixtures for the given groups ({A:[ids]…}); returns how many ties/matches were added
function groupFixtures(t, cat, groups, batch){
  const base=matchesOf(t).length ? Math.max(...matchesOf(t).map(m=>m.order||0))+1 : 0;
  const perGroup=Object.entries(groups).map(([G,ids])=>({G, rounds:roundRobin(ids)}));
  if(!perGroup.length) return 0;
  const maxR=Math.max(...perGroup.map(x=>x.rounds.length)); let order=base;
  for(let r=0;r<maxR;r++) perGroup.forEach(({G,rounds})=>(rounds[r]||[]).forEach((pair,k)=>{
    const id=`${t.id}_${cat}_${G}${r+1}${String.fromCharCode(97+k)}`;
    addFixture(batch, t, id, {tid:t.id, cat, stage:"group", group:G, round:r+1, a:pair[0], b:pair[1], ...(legs(t)===2?{leg:1}:{}), status:"scheduled", games:[], winner:null, court:0, order:order++, updatedAt:nowIso()});
    if(legs(t)===2) addFixture(batch, t, id+"L2", {tid:t.id, cat, stage:"group", group:G, round:r+1, a:pair[1], b:pair[0], leg:2, first:id, status:"scheduled", games:[], winner:null, court:0, order:order++, updatedAt:nowIso()});
  }));
  return order-base;
}
function groupEditor(t, cat){
  const old=t.groups?.[cat]||{}, d=S.gDraft||{}, Gs=[...new Set([...Object.keys(old), ...Object.values(d).filter(Boolean), ...(S.gExtra||[])])].sort();
  const all=teamsOf(t,cat).filter(x=>x.status==="confirmed"||Object.keys(d).includes(x.id)), sel=x=>`<select data-gmove="${esc(x.id)}" aria-label="Group for ${esc(x.name)}">${Gs.map(G=>`<option value="${G}" ${d[x.id]===G?"selected":""}>Group ${G}</option>`).join("")}<option value="" ${d[x.id]?"":"selected"}>Not in a group</option></select>`;
  const box=(G,label)=>{ const xs=all.filter(x=>(d[x.id]||"")===G); return `<div class="grp ge ${G&&old[G]&&!(old[G].length===xs.length&&xs.every(x=>old[G].includes(x.id)))?"changed":""}"><h3>${label}<span class="muted" style="font-size:.8rem;font-family:var(--body)">${xs.length} team${xs.length===1?"":"s"}</span></h3>
    ${xs.length?xs.map(x=>`<div class="ge-row"><span>${avatar(x.name)} <b>${esc(x.name)}</b></span>${sel(x)}</div>`).join(""):`<p class="muted">No teams.</p>`}</div>` };
  const free=all.filter(x=>!d[x.id]);
  return `<div class="ge-bar"><b>✏️ Editing groups</b><span class="muted">Pick a new group for any team. Only the groups you change get new fixtures; the others keep theirs (and their results).</span>
      <div class="row"><button class="btn small" data-gadd="1">➕ Add a group</button><button class="btn small ghost" data-gcancel="1">Cancel</button><button class="btn primary small" data-gsave="${esc(cat||"")}">💾 Save groups</button></div></div>
    <div class="groups">${Gs.map(G=>box(G,`Group ${G}`)).join("")}${free.length?box("","Not in a group"):""}</div>`;
}
// organiser: move teams between groups; only the groups that changed get new fixtures
async function saveGroupEdit(t, cat){
  const old=t.groups?.[cat]||{}, draft=S.gDraft||{}, letters=[...new Set([...Object.keys(old), ...Object.values(draft).filter(Boolean)])].sort();
  const next={}; letters.forEach(G=>next[G]=[]);
  Object.entries(draft).forEach(([id,G])=>{ if(G) next[G].push(id) });
  Object.keys(next).forEach(G=>{ if(!next[G].length) delete next[G] });
  const same=(a,b)=>a.length===b.length && a.every(x=>b.includes(x));
  const changed=[...new Set([...Object.keys(old), ...Object.keys(next)])].filter(G=>!same(old[G]||[], next[G]||[]));
  if(!changed.length){ S.grpOn=false; render(); toast("No changes"); return }
  if(Object.values(next).some(a=>a.length<2) && !confirm("A group has fewer than 2 teams, so it has no matches. Save anyway?")) return;
  const hit=matchesOf(t,cat).filter(m=>m.stage==="group" && changed.includes(m.group) && m.status!=="scheduled");
  if(hit.length && !confirm(`Groups ${changed.join(", ")} change. ${hit.length} match${hit.length>1?"es":""} already started or played in them will be deleted. Carry on?`)) return;
  const gone=matchesOf(t,cat).filter(m=>m.stage==="group" && changed.includes(m.group)), hadPlan=matchesOf(t).some(m=>m.pcourt);
  for(let i=0;i<gone.length;i+=400){ const b=db.batch(); gone.slice(i,i+400).forEach(m=>b.delete(db.collection("tmatches").doc(m.id))); await b.commit() }
  S.matches=S.matches.filter(m=>!gone.includes(m));
  const batch=db.batch(), made=groupFixtures(t, cat, Object.fromEntries(changed.filter(G=>next[G]).map(G=>[G,next[G]])), batch);
  batch.update(db.collection("tourneys").doc(t.id), {[`groups.${cat}`]:next});
  await batch.commit().catch(()=>{ toast("Couldn't save the groups"); return });
  S.grpOn=false; S.gDraft=null; S.gExtra=null; render();
  toast(`Groups ${changed.join(", ")} updated: ${made} ${isTeam(t)?"ties":"matches"} made${Object.keys(next).length!==Object.keys(old).length?". The number of groups changed: re-make the knockout bracket":""}`);
  if(hadPlan){ for(let i=0;i<30 && matchesOf(t,cat).filter(m=>m.stage==="group" && changed.includes(m.group)).length<made;i++) await new Promise(r=>setTimeout(r,100));
    await scheduleAll(S.tourneys.find(x=>x.id===t.id)||t) }
}
// once / twice back to back: re-make the group matches straight away (same groups), then courts & times again
async function setLegs(t, n){
  if(!await db.collection("tourneys").doc(t.id).set({legs:n},{merge:true}).then(()=>true,()=>false)){ toast("Couldn't save"); return }
  const t2={...t, legs:n}, todo=(cats(t).length?cats(t):[{id:""}]).filter(c=>t.groups?.[c.id] && matchesOf(t,c.id).some(m=>m.stage==="group" && (n===2)!==!!m.leg));
  const say=n===2?"each pair plays twice, back to back":"each pair plays once";
  if(!todo.length){ toast(`Saved: ${say}`); render(); return }
  const gone=todo.flatMap(c=>matchesOf(t,c.id).filter(m=>m.stage==="group")), played=gone.filter(m=>m.status!=="scheduled").length;
  if(played && !confirm(`${played} group match${played>1?"es have":" has"} already started or been played. Changing to "${say}" re-makes the group matches and clears those scores. Carry on?`)){ render(); return }
  const hadPlan=matchesOf(t).some(m=>m.pcourt);
  for(let i=0;i<gone.length;i+=400){ const b=db.batch(); gone.slice(i,i+400).forEach(m=>b.delete(db.collection("tmatches").doc(m.id))); await b.commit() }
  S.matches=S.matches.filter(m=>!gone.includes(m));
  const batch=db.batch(); let made=0; todo.forEach(c=>{ made+=groupFixtures(t2, c.id, t.groups[c.id], batch) }); await batch.commit();
  toast(`Done: ${say}. Same groups, ${made} ${isTeam(t)?"ties":"matches"}${hadPlan?". Setting courts & times…":""}`);
  if(hadPlan){ const want=made*(isTeam(t)?4:1), have=()=>todo.reduce((s,c)=>s+matchesOf(t,c.id).filter(m=>m.stage==="group").length,0);
    for(let i=0;i<50 && have()<want;i++) await new Promise(r=>setTimeout(r,100));
    await scheduleAll({...(S.tourneys.find(x=>x.id===t.id)||t), legs:n}) }
}
async function clearMatches(t, cat, stage){
  const ms=matchesOf(t,cat).filter(m=>!stage || m.stage===stage);
  for(let i=0;i<ms.length;i+=400){ const b=db.batch(); ms.slice(i,i+400).forEach(m=>b.delete(db.collection("tmatches").doc(m.id))); await b.commit() }
}
// Team Cup with an even number of groups: groups pair up across the draw (A with C, B with D…):
// Winner A v Runner-up C, Winner B v Runner-up D, Winner C v Runner-up A, Winner D v Runner-up B
function crossPairs(t, groups){
  const G=Object.keys(groups||{}).sort(), adv=Math.max(1,Number(t.advance)||2), h=G.length/2, n=adv===2?G.length:h;
  if(!isTeam(t) || nWild(t,groups) || G.length<2 || G.length%2 || adv>2 || (n&(n-1)) || G.some(g=>groups[g].length<adv)) return null;
  const out=[]; for(let i=0;i<h;i++) out.push([{g:G[i],p:1},{g:G[i+h],p:adv}]);
  if(adv===2) for(let i=0;i<h;i++) out.push([{g:G[i+h],p:1},{g:G[i],p:2}]);
  return out;
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
  const cross=crossPairs(t,groups);
  if(!cross && seeds.length<2){ toast("Not enough teams go through for a knockout"); return }
  const keepPlan=Object.fromEntries(matchesOf(t,cat).filter(m=>m.stage==="ko" && m.pcourt).map(m=>[m.id,{pcourt:m.pcourt, ptime:m.ptime||null, pnum:m.pnum??null, pslot:m.pslot??null}]));
  await clearMatches(t, cat, "ko");
  let P=1; while(P<(cross?cross.length*2:seeds.length)) P*=2;
  const order=seedOrder(P), batch=db.batch(), base=Math.max(0,...matchesOf(t).map(m=>m.order||0))+1;
  // first-round pairs; then swap opponents so nobody meets a team from their own group
  const grpOf=x=>x?.g ?? x?.seed, pairs=cross||[];
  if(!cross) for(let i=0;i<P;i+=2) pairs.push([seeds[order[i]-1]||null, seeds[order[i+1]-1]||null]);
  if(!cross) for(let i=0;i<pairs.length;i++){ const [a,b]=pairs[i]; if(!a||!b||grpOf(a)!==grpOf(b)) continue;
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
  // give the new knockout matches courts and times straight away, after the group matches
  if(matchesOf(t).some(m=>m.stage==="group" && m.pcourt)){
    for(let i=0;i<30 && !matchesOf(t,cat).some(m=>m.stage==="ko" && !m.bye && m.order>=base);i++) await new Promise(r=>setTimeout(r,100));
    await scheduleAll(S.tourneys.find(x=>x.id===t.id)||t, true) }
}

/* ---------- courts & order of play (organiser) ---------- */
// matches run on points, not the clock: each gets a court and a place in that court's queue (pnum); clock times only if switched on
const clockOn = t => t?.timed!==false;
const ordinal = n => n+(["th","st","nd","rd"][(n%100-20)%10]||["th","st","nd","rd"][n%100]||"th");
const planOrder = m => [Number(m.pnum)||999, Number(m.pslot)||999, String(m.ptime||"99")];
const byPlan = (x,y) => { const a=planOrder(x), b=planOrder(y); return a[0]-b[0] || a[1]-b[1] || a[2].localeCompare(b[2]) || (x.order||0)-(y.order||0) };
// when & where a knockout match (or a whole Team Cup tie) is on, for everyone to see
function whenTxt(t, m){
  const ms=m.tie?S.matches.filter(x=>x.tie===m.tie&&x.pcourt):m.pcourt?[m]:[]; if(!ms.length) return "Time & court to come";
  const courts=[...new Set(ms.map(x=>x.pcourt))].sort((a,b)=>a-b), times=ms.map(x=>x.ptime).filter(Boolean).sort();
  const run=courts.length>2 && courts[courts.length-1]-courts[0]===courts.length-1;
  const c=`Court${courts.length>1?"s":""} ${run?`${courts[0]}–${courts[courts.length-1]}`:courts.length>1?`${courts.slice(0,-1).join(", ")} & ${courts[courts.length-1]}`:courts[0]}`;
  return clockOn(t)&&times.length ? `🕒 ${times[0]} · ${c}` : `📍 ${c}${!m.tie&&m.pnum?` · ${ordinal(Number(m.pnum))}`:""}`;
}
const AVC=["#7A2331","#D97757","#2f8f4e","#3b6fb6","#8a4fb3","#c28a12","#1f8a8a","#b33a6b"];
const avatar = name => { const s=String(name||"?"), h=[...s].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7); return `<i class="av" style="background:${AVC[h%AVC.length]}">${esc(s.trim()[0]?.toUpperCase()||"?")}</i>` };
function planTxt(m, short){
  const t=S.tourneys.find(x=>x.id===m.tid); if(!m.pcourt) return "";
  if(clockOn(t) && m.ptime) return short ? `${m.ptime} C${m.pcourt}` : `🕒 ${m.ptime} · Court ${m.pcourt}`;
  if(clockOn(t) && m.pnum) return short ? `C${m.pcourt}` : `Court ${m.pcourt}`;
  return short ? `C${m.pcourt}${m.pnum?` #${m.pnum}`:""}` : `Court ${m.pcourt}${m.pnum?` · ${ordinal(Number(m.pnum))} on court`:""}`;
}
const hm = (start, mins) => { const [h,m]=String(start||"10:00").split(":").map(Number), x=h*60+m+mins; return `${String(Math.floor(x/60)%24).padStart(2,"0")}:${String(x%60).padStart(2,"0")}` };
// one court per group: the organiser's choice (t.groupCourts), else Group A on Court 1, B on Court 2… (a second category's groups take the next courts)
function poolCourts(t){ if(!t?.poolCourts) return null; const map={}; let n=0;
  (cats(t).length?cats(t):[{id:""}]).forEach(c=>Object.keys(t.groups?.[c.id]||{}).sort().forEach(G=>{ const k=c.id+"|"+G; n++; map[k]=Number(t.groupCourts?.[k])||n })); return n?map:null }
function groupCourtsBox(t){
  const map=poolCourts({...t, poolCourts:true}); if(!map) return "";
  const top=Math.min(12,Math.max(6,Number(t.courts)||0,...Object.values(map))), multi=cats(t).length>1;
  return `<div class="tm-courts tm-gc"><span class="lbl">🏸 Which group plays on which court</span><p class="muted">Choose a court for each group. All that group's matches are played on it, each tie straight through (match 1 and match 2 of each discipline back to back). Knockouts then use any of these courts.</p>
    <div class="gc-row">${Object.entries(map).map(([k,c])=>{ const G=k.split("|")[1]; return `<label class="gc"><b>${multi?esc(catName(t,k.split("|")[0]))+" · ":""}Group ${esc(G)}</b><select data-gcourt="${esc(k)}">${Array.from({length:top},(_,i)=>`<option value="${i+1}" ${i+1===c?"selected":""}>Court ${i+1}</option>`).join("")}</select></label>` }).join("")}</div>
    <div class="tm-court"><label>First match <input type="time" data-gcstart="1" value="${esc(t.startTime||"09:00")}"></label><label>Every <input type="number" data-gcgap="1" min="3" max="90" value="${Number(t.gapMins)||Number(t.matchMins)||10}"> min</label><button class="btn small primary" data-gcapply="1">Put groups on these courts &amp; set times</button></div>
    ${t.poolCourts?`<p class="muted" style="margin:4px 0 0">✓ Now: ${Object.entries(map).map(([k,c])=>`Group ${esc(k.split("|")[1])} → Court ${c}`).join(" · ")}</p>`:""}</div>`;
}
async function scheduleAll(t, koOnly){
  const pool=poolCourts(t), home=m=>pool&&m.stage==="group"?pool[m.cat+"|"+m.group]||0:0;
  const C=Math.max(1,Number(t.courts)||4,...Object.values(pool||{})), mins=Math.max(5,Number(t.matchMins)||15), ms=matchesOf(t).filter(m=>!m.bye);
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
  let pending=[...ms].sort((a,b)=>(a.stage==="ko")-(b.stage==="ko") || (a.round||0)-(b.round||0) || (a.order||0)-(b.order||0));
  let slot=0, last=new Set(); const perCourt={}, onCourt={};
  // knockouts only: group matches keep their courts and times, knockouts follow on after them
  if(koOnly){ const gm=ms.filter(m=>m.stage==="group"); if(gm.some(m=>m.pslot==null)) koOnly=false;
    else { gm.forEach(m=>{ slotOf[m.id]=m.pslot; perCourt[m.pcourt]=Math.max(perCourt[m.pcourt]||0, Number(m.pnum)||0) });
      slot=gm.length?Math.max(...gm.map(m=>m.pslot))+1:0; pending=pending.filter(m=>m.stage!=="group") } }
  const byId=Object.fromEntries(ms.map(m=>[m.id,m])), follow={}, forced={};
  ms.forEach(m=>{ if(m.after && byId[m.after]) follow[m.after]=m });
  while(pending.length && slot<500){
    const used=new Set(), now=new Set();
    // back to back: the second meeting of a discipline takes the same court straight after the first
    Object.entries(forced[slot]||{}).forEach(([c,m])=>{ const i=pending.indexOf(m); if(i<0) return; pending.splice(i,1); slotOf[m.id]=slot; m._c=Number(c); m._n=(perCourt[c]=(perCourt[c]||0)+1); used.add(Number(c)); teamsIn(m).forEach(x=>now.add(x)) });
    for(let c=1;c<=C;c++){ if(used.has(c)) continue;
      const ok=(m,rest)=>{ if(m.after && byId[m.after]) return false; if(home(m) && home(m)!==c) return false; const r=ready(m); if(r==null||r>slot) return false; const tm=teamsIn(m); return tm.every(x=>!now.has(x)) && (!rest || tm.every(x=>!last.has(x))) };
      // one court per group: finish the tie on this court before the next one starts
      let i=pool&&onCourt[c]?pending.findIndex(m=>m.tie && tieBase(m.tie)===onCourt[c] && ok(m,false)):-1;
      if(i<0) i=pending.findIndex(m=>ok(m,true)); if(i<0) i=pending.findIndex(m=>ok(m,false)); if(i<0){ if(pool) continue; break }
      const m=pending.splice(i,1)[0]; slotOf[m.id]=slot; m._c=c; if(m.tie) onCourt[c]=tieBase(m.tie); m._n=(perCourt[c]=(perCourt[c]||0)+1); teamsIn(m).forEach(x=>now.add(x));
      if(follow[m.id]) (forced[slot+1]=forced[slot+1]||{})[c]=follow[m.id];
    }
    last=now; slot++;
  }
  for(let i=0;i<ms.length;i+=400){ const b=db.batch();
    ms.slice(i,i+400).forEach(m=>{ if(slotOf[m.id]!=null && (!koOnly || m.stage!=="group")) b.update(db.collection("tmatches").doc(m.id),{pcourt:m._c, pslot:slotOf[m.id], pnum:m._n, ptime:clockOn(t)?hm(t.startTime,slotOf[m.id]*mins):null}) }); await b.commit() }
  toast(clockOn(t) ? `Courts and times set: ${pool?`${Object.entries(pool).map(([k,c])=>`Group ${k.split("|")[1]} on Court ${c}`).join(", ")}; `:""}${mins} min per match, finishing about ${hm(t.startTime,slot*mins)}` : `Courts and order of play set on ${C} court${C>1?"s":""}: about ${slot} matches per court`);
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
// two meetings of the same pair (group stage, "twice, back to back") show as one card: each discipline's two matches side by side
const tieBase = id => String(id||"").replace(/L2$/,"");
function fixList(t, ms, opts={}){
  const seen=new Set(), DO=Object.keys(DISC);
  return ms.map(m=>{ if(!m.tie) return matchRow(t,m,opts); const key=m.leg?tieBase(m.tie):m.tie; if(seen.has(key)) return ""; seen.add(key);
    const legs2=!!m.leg, t1=legs2?key:m.tie, t2=legs2?key+"L2":null, first=S.matches.find(x=>x.tie===t1)||m;
    const r1=tieResult(t1), r2=t2?tieResult(t2):null;
    const mine=opts.me&&(sideTeam(first,"a")===opts.me||sideTeam(first,"b")===opts.me), stage=m.stage==="ko"?(m.roundName||"Knockout"):`Group ${m.group}${legs2?" · plays twice, back to back":""}`;
    // flip = the 2nd meeting has the teams the other way round, so its scores are turned to match the card
    const cell=(x,flip)=>{ if(!x) return ""; const g=(x.games||[]).slice(-1)[0], live=x.status==="live", done=x.status==="done", gs=(x.games||[]).filter(y=>y[0]||y[1]).map(y=>flip?`${y[1]}–${y[0]}`:`${y[0]}–${y[1]}`).join(", "), w=flip?(x.winner==="a"?"b":x.winner==="b"?"a":null):x.winner;
      return done ? `<b class="${w==="a"?"wa":"wb"}">${esc(gs)}</b>` : live ? `<span class="livebadge">Court ${esc(x.court)}</span> <b>${g?(flip?`${g[1]}–${g[0]}`:`${g[0]}–${g[1]}`):"0–0"}</b>`
        : opts.plan && S.isAdmin ? planPick(t,x) : `<span class="muted">${esc(planTxt(x))}</span>` };
    const row=(d)=>{ const x1=S.matches.find(x=>x.tie===t1&&x.disc===d), x2=t2&&S.matches.find(x=>x.tie===t2&&x.disc===d); if(!x1) return "";
      const ed=x=>opts.edit&&x?`data-medit="${esc(x.id)}" role="button" tabindex="0"`:"";
      if(!legs2) return `<div class="rb ${x1.status==="live"?"live":""}" ${ed(x1)}><span>${esc(DISC[d]||d)}</span><span>${cell(x1)}</span></div>`;
      return `<div class="rb2"><span class="rb2-d">${esc(DISC[d]||d)}</span><div class="rb2-m ${x1.status==="live"?"live":""}" ${ed(x1)}><i>Match 1</i>${cell(x1)}</div><div class="rb2-m ${x2?.status==="live"?"live":""}" ${ed(x2)}><i>Match 2</i>${cell(x2,true)}</div></div>` };
    const sc = legs2 ? [r1,r2].map((r,i)=>r&&r.done?(i?`${r.b}–${r.a}`:`${r.a}–${r.b}`):"–").join(" · ") : (r1.done?`${r1.a}–${r1.b}`:"vs");
    const w1=r1.winner, w2=r2?.winner==="a"?"b":r2?.winner==="b"?"a":null, won=q=>legs2?[w1,w2].filter(x=>x===q).length:(w1===q?1:0);
    return `<div class="tie ${mine?"me":""} ${legs2?"twice":""}"><div class="tie-s">${esc(stage)}${r1.onPoints||r2?.onPoints?" · decided on total points":""}</div>
      <div class="tie-h"><span class="${won("a")>won("b")?"win":""}">${sideName(first,"a")}</span><b>${legs2&&!(r1.done||r2?.done)?"vs":sc}</b><span class="${won("b")>won("a")?"win":""}">${sideName(first,"b")}</span></div>
      ${DO.map(row).join("")}</div>` }).join("");
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
/* ---------- referee timers: waiting for the teams, warm-up, break between games ---------- */
const TIMERS = {wait:["⏳","Waiting for teams",180], warm:["🔥","Warm-up",120], brk:["☕","Break",20]};
const timerSecs = (t,k) => Number(t?.timers?.[k]) > 0 ? Number(t.timers[k]) : TIMERS[k][2];
const fmtSecs = n => n>=60 ? `${Math.floor(n/60)}:${String(n%60).padStart(2,"0")}` : `0:${String(n).padStart(2,"0")}`;
const timerOf = m => { const x=S.localTimers?.[m?.id] || m?.timer; return x && x.end && x.end > Date.now()-15000 ? x : null };
const cd = x => `<span class="cd" data-end="${x.end}">${fmtSecs(Math.max(0,Math.ceil((x.end-Date.now())/1000)))}</span>`;
function timerChip(m){ const x=timerOf(m); if(!x) return ""; const [i,l]=TIMERS[x.k]||["⏱","Timer"]; return `<span class="tmr ${x.k}">${i} ${l} ${cd(x)}</span>` }
function timerBar(t, m, hint){
  if(!m) return ""; const x=timerOf(m);
  if(x){ const [i,l]=TIMERS[x.k]||["⏱","Timer"]; return `<div class="tbar on ${x.k}"><div class="tbar-big">${i} ${l}<b>${cd(x)}</b></div><button class="btn small ghost" data-timer="stop" data-mid="${esc(m.id)}">Stop timer</button></div>` }
  const order=hint==="brk"?["brk","warm","wait"]:hint==="wait"?["wait","warm","brk"]:["warm","brk","wait"];
  return `<div class="tbar"><span class="lbl">⏱ Timer</span><div class="cats">${order.map((k,j)=>`<button type="button" class="${j===0?"first":""}" data-timer="${k}" data-mid="${esc(m.id)}">${TIMERS[k][0]} ${TIMERS[k][1]} · ${fmtSecs(timerSecs(t,k))}</button>`).join("")}</div></div>`;
}
async function setTimer(t, m, k){
  const data = k==="stop" ? {timer:null} : {timer:{k, end:Date.now()+timerSecs(t,k)*1000, s:timerSecs(t,k)}};
  S.localTimers=S.localTimers||{}; delete S.localTimers[m.id];
  await db.collection("tmatches").doc(m.id).update(data).catch(()=>{ if(k!=="stop") S.localTimers[m.id]=data.timer; toast("Timer runs on this phone only until the organiser publishes the latest Firebase rules") });
  render();
}
// the next match due on a court (its own queue first)
const nextOn = (t, c) => upNext(t,60).find(x=>Number(x.pcourt)===c) || null;
// "call to court": a court just came free (or the referee started the waiting timer) and the next teams are wanted
function courtCalls(t){
  const n=Math.max(1,Number(t.courts)||4), out=[];
  for(let c=1;c<=n;c++){ if(liveOn(t,c)) continue; const nx=nextOn(t,c); if(!nx) continue;
    const lastDone=matchesOf(t).filter(m=>m.status==="done"&&Number(m.court)===c).map(m=>Date.parse(m.updatedAt)||0).sort((a,b)=>b-a)[0]||0;
    const tm=timerOf(nx); if(tm?.k==="wait" || (lastDone && Date.now()-lastDone<180000)) out.push({c, m:nx}) }
  return out;
}
const callBox = (t, x, big) => { const a=sideTeam(x.m,"a"), b=sideTeam(x.m,"b");
  return `<div class="call ${big?"big":""}"><span class="call-c">📣 Court ${x.c}</span><b>${esc(a?tName(a):sideLabel(x.m,"a"))}</b><i>v</i><b>${esc(b?tName(b):sideLabel(x.m,"b"))}</b><span class="call-d">${esc(x.m.disc?DISC[x.m.disc]:catName(t,x.m.cat))}${x.m.leg?` · ${x.m.leg===1?"1st":"2nd"} meeting`:""} · please come to Court ${x.c}</span>${timerChip(x.m)}</div>` };

// organiser: every match's court and time in one place, in order; change any of it at any time
const toMin = h => { const [a,b]=String(h||"").split(":").map(Number); return Number.isFinite(a)&&Number.isFinite(b) ? a*60+b : null };
// a court's matches in playing order: ties in the order they're planned, inside a tie MD, WD, XD, XD2 with match 1 then match 2
function courtOrder(t, c){
  const ms=matchesOf(t).filter(m=>!m.bye && Number(m.pcourt)===c), key=m=>m.tie?tieBase(m.tie):m.id, rank={}, D=Object.keys(DISC);
  ms.slice().sort(byPlan).forEach((m,i)=>{ const k=key(m); if(rank[k]==null) rank[k]=i });
  return ms.sort((x,y)=>rank[key(x)]-rank[key(y)] || D.indexOf(x.disc)-D.indexOf(y.disc) || (x.leg||1)-(y.leg||1));
}
// a court's ties (or single matches) in playing order; a tie that has started stays where it is
function courtTies(t, c){
  const out=[], at={};
  courtOrder(t,c).forEach(m=>{ const k=m.tie?tieBase(m.tie):m.id; if(at[k]==null){ at[k]=out.length; out.push({k, ms:[]}) } out[at[k]].ms.push(m) });
  return out.map(x=>{ const f=x.ms[0], a=sideTeam(f,"a"), b=sideTeam(f,"b");
    return {...x, started:x.ms.some(m=>m.status!=="scheduled"), ko:f.stage==="ko", teams:[a,b].filter(Boolean),
      name:`${a?tName(a):sideLabel(f,"a")} v ${b?tName(b):sideLabel(f,"b")}`, stage:f.stage==="ko"?(f.roundName||"Knockout"):`Group ${f.group}`,
      time:x.ms.filter(m=>m.status==="scheduled").map(m=>m.ptime).filter(Boolean).sort()[0]||"" } });
}
// times for one court: matches not yet played from `start`, every `gap` minutes; ties in the order of `keys` when given
async function timeCourt(t, c, start, gap, keys){
  let ties=courtTies(t,c);
  if(keys){ const pos=Object.fromEntries(keys.map((k,i)=>[k,i])); ties=[...ties.filter(x=>x.started), ...ties.filter(x=>!x.started).sort((x,y)=>(pos[x.k]??1e9)-(pos[y.k]??1e9))] }
  const ups=[]; let n=0, j=0;
  ties.forEach(x=>x.ms.forEach(m=>ups.push([m.id, {pnum:++n, ...(m.status==="scheduled"?{ptime:hm(start,(j++)*gap)}:{})}])));
  for(let i=0;i<ups.length;i+=400){ const b=db.batch(); ups.slice(i,i+400).forEach(([id,u])=>b.update(db.collection("tmatches").doc(id),u)); await b.commit() }
}
// a random new order for the group ties not yet started, preferring one where teams play as few ties in a row as possible; knockouts stay last
function shuffleTies(ties){
  const free=ties.filter(x=>!x.started && !x.ko), ko=ties.filter(x=>!x.started && x.ko), last=ties.filter(x=>x.started).slice(-1);
  const cost=list=>[...last,...list].reduce((n,x,i,a)=>n+(i && x.teams.some(id=>a[i-1].teams.includes(id))?1:0),0), now=free.map(x=>x.k).join();
  let best=free, bc=1e9;
  for(let k=0;k<400;k++){ const p=[...free]; for(let i=p.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [p[i],p[j]]=[p[j],p[i]] }
    const c=cost(p)+(p.map(x=>x.k).join()===now?100:0); if(c<bc){ best=p; bc=c } }
  return [...best, ...ko].map(x=>x.k);
}
function courtOrderList(t, c){
  const ties=courtTies(t,c), open=S.coOpen?.[c], n=ties.filter(x=>!x.started && !x.ko).length;
  return `<div class="co"><div class="row"><button class="btn small ghost" data-coopen="${c}" aria-expanded="${!!open}">${open?"▾":"▸"} Order of play · ${ties.length} ${isTeam(t)?"ties":"matches"}</button>${n>1?`<button class="btn small" data-cshuffle="${c}">🔀 Shuffle order</button>`:""}</div>
    ${open?`<ol class="co-list">${ties.map((x,i)=>`<li class="${x.started?"done":""}"><span class="co-t">${esc(x.time||"–")}</span><span class="co-n"><b>${esc(x.name)}</b> <span class="muted">${esc(x.stage)}</span></span>${x.started?`<span class="muted">${x.ms.every(m=>m.status==="done")?"✓ Played":"Started"}</span>`
      :`<span class="co-b"><button class="btn small ghost" data-cmove="${c}" data-ck="${esc(x.k)}" data-cdir="-1" aria-label="Earlier"${i===0||ties[i-1].started?" disabled":""}>↑</button><button class="btn small ghost" data-cmove="${c}" data-ck="${esc(x.k)}" data-cdir="1" aria-label="Later"${i===ties.length-1?" disabled":""}>↓</button></span>`}</li>`).join("")}</ol>`:""}</div>`;
}
function courtTimes(t){
  const C=[...new Set(matchesOf(t).filter(m=>!m.bye && m.pcourt).map(m=>Number(m.pcourt)))].sort((a,b)=>a-b); if(!C.length) return "";
  const gap=Number(t.gapMins)||Number(t.matchMins)||10;
  return `<div class="tm-courts"><span class="lbl">⏱ Times court by court</span><p class="muted">Set when a court's first match starts and the minutes between matches. Every match on that court not yet played gets its time, in order: each discipline's match 1 and match 2 back to back.</p>
    ${C.map(c=>{ const ms=courtOrder(t,c), left=ms.filter(m=>m.status==="scheduled"), first=left.map(m=>m.ptime).filter(Boolean).sort()[0]||t.startTime||"09:00";
      const gs=[...new Set(ms.map(m=>m.stage==="ko"?"Knockouts":`Group ${m.group}`))].join(", ");
      return `<div class="tm-court" data-court="${c}"><b>Court ${c}</b><span class="muted">${esc(gs)} · ${left.length} to play</span>
        <label>First match <input type="time" data-cstart="${c}" value="${esc(first)}"></label><label>Every <input type="number" data-cgap="${c}" min="3" max="90" value="${gap}"> min</label>
        <button class="btn small primary" data-ctimes="${c}"${left.length?"":" disabled"}>Set times</button>${courtOrderList(t,c)}</div>` }).join("")}
    ${C.length>1?`<button class="btn small" data-ctimes="all">Set times on all courts</button>`:""}</div>`;
}
function timingsView(t){
  const ms=matchesOf(t).filter(m=>!m.bye), seen=new Set(), rows=[];
  const keyOf=m=>m.tie?(m.leg?tieBase(m.tie):m.tie):m.id;
  ms.slice().sort(byPlan).forEach(m=>{ const k=keyOf(m); if(seen.has(k)) return; seen.add(k); rows.push(m) });
  const parts=m=>m.tie?ms.filter(x=>keyOf(x)===keyOf(m)).sort((x,y)=>Object.keys(DISC).indexOf(x.disc)-Object.keys(DISC).indexOf(y.disc)||(x.leg||1)-(y.leg||1)):[m];
  const first=m=>parts(m).map(x=>x.ptime).filter(Boolean).sort()[0]||"";
  rows.sort((a,b)=>(first(a)||"99").localeCompare(first(b)||"99") || byPlan(a,b));
  const left=ms.filter(m=>m.status==="scheduled"&&m.ptime).length; let last=null;
  const list=rows.map(m=>{ const ps=parts(m), st=m.tie?tieResult(m.tie):null, done=m.tie?ps.every(x=>x.status==="done"):m.status==="done", live=ps.some(x=>x.status==="live"), f=first(m);
    const head=f!==last?`<h4 class="tm-slot">${f?`🕒 ${esc(f)}`:"No time yet"}</h4>`:""; last=f;
    const lab=m.stage==="ko"?(m.roundName||"Knockout"):`Group ${m.group}${m.leg?" · plays twice, back to back":""}`, fm=m.leg?(S.matches.find(x=>x.tie===keyOf(m))||m):m;
    const who=`${sideTeam(fm,"a")?esc(tName(sideTeam(fm,"a"))):esc(sideLabel(fm,"a"))} <span class="muted">v</span> ${sideTeam(fm,"b")?esc(tName(sideTeam(fm,"b"))):esc(sideLabel(fm,"b"))}`;
    return `${head}<div class="tm-row ${done?"done":""} ${live?"live":""}"><div class="tm-h"><div><span class="lbl">${esc(lab)}${!m.tie&&cats(t).length>1?` · ${esc(catName(t,m.cat))}`:""}</span><b>${who}</b></div>
      ${done?`<span class="bdone">✓ Played</span>`:live?`<span class="livebadge">Live</span>`:m.tie?`<label class="tm-start">Starts <input type="time" data-tiestart="${esc(keyOf(m))}" value="${esc(f)}"></label>`:""}</div>
      ${done||live?"":`<div class="tm-parts">${ps.map(x=>`<div class="bk-er">${x.disc?`<span>${esc(DISC[x.disc])}${x.leg?` · match ${x.leg}`:""}</span>`:""}${planPick(t,x)}</div>`).join("")}</div>`}</div>` }).join("");
  return `<div class="tm-top"><div><b>🕒 Timings & courts</b><p class="muted">Set or change any match's court and time here, any time. Players, referees and the big screen see changes straight away. The fixtures themselves don't change.</p></div>
      ${groupCourtsBox(t)}${courtTimes(t)}<details class="tm-plan"${matchesOf(t).some(m=>m.pcourt)?"":" open"}><summary>🏸 Courts, match length & one court per group</summary>${schedForm(t)}</details><div class="tm-shift"><span class="lbl">Running late or early? Move all ${left} matches not yet started</span><div class="row">${[-10,-5,5,10,15,30].map(d=>`<button class="btn small ${d>0?"":"ghost"}" data-shift="${d}">${d>0?"+":"−"}${Math.abs(d)} min</button>`).join("")}</div></div></div>
    ${rows.length?`<div class="tm-list">${list}</div>`:`<div class="empty">No fixtures yet. Make them in ⚙️ Organiser tools first.</div>`}`;
}
// the knockout draw, drawn like on paper: rounds left to right, lines joining each pair to the next round, champion at the end
function bracket(t, cat){
  const ko=matchesOf(t,cat).filter(m=>m.stage==="ko" && (!m.disc || m.disc==="MD")); if(!ko.length) return "";
  const isBronze=m=>m.roundName==="Bronze medal match";
  const rounds=[...new Set(ko.filter(m=>!isBronze(m)).map(m=>m.round))].sort((a,b)=>a-b);
  const keyOf=m=>m.tie||m.id;
  const card=m=>{
    const a=sideTeam(m,"a"), b=sideTeam(m,"b"), tr=m.tie?tieResult(m.tie):null, w=m.bye?null:tr?tr.winner:m.status==="done"?m.winner:null;
    const live=!m.bye && (tr?S.matches.some(x=>x.tie===m.tie&&x.status==="live"):m.status==="live");
    const sc=side=>tr ? (tr.done?String(side==="a"?tr.a:tr.b):"") : m.status==="done"?(m.games||[]).map(g=>side==="a"?g[0]:g[1]).join(" "):"";
    const row=(id,side)=>`<div class="bk-t ${w===side?"win":w?"lose":""}">${id?avatar(tName(id)):`<i class="av tbd">?</i>`}<span class="${id?"":"tbd"}">${id?esc(tName(id)):esc(sideLabel(m,side))}</span><b>${esc(sc(side))}</b></div>`;
    if(m.bye){ const side=(m.a||m.src?.a)?"a":"b", id=sideTeam(m,side);
      return `<div class="bk-m bye">${row(id,side)}<div class="bk-t byel"><span>bye · straight through</span></div></div>` }
    const label=`${shortRound(m.roundName)}${/^(SF|QF|R\d+)$/.test(shortRound(m.roundName))?` ${m.slot}`:""}`, k=keyOf(m), open=S.koEdit===k;
    const meta=live?`<span class="livebadge">Live</span>`:w?`<span class="bdone">✓ Played</span>`:`<span class="bwhen">${esc(whenTxt(t,m))}</span>`;
    const edit=S.isAdmin && !live && !w ? `<button class="bk-ed" data-koedit="${esc(k)}" title="Change court & time">${open?"✕":"✏️"}</button>` : "";
    return `<div class="bk-m ${live?"live":""} ${m.roundName==="Final"?"final":""} ${open?"editing":""}"><div class="bk-meta"><b>${esc(label)}</b>${meta}${edit}</div>${row(a,"a")}${row(b,"b")}</div>`;
  };
  const cols=rounds.map((rn,ri)=>{ const ms=ko.filter(m=>m.round===rn && !isBronze(m)).sort((a,b)=>a.slot-b.slot), name=ms[0]?.roundName||"";
    const slots=ms.map(m=>`<div class="bk-slot">${card(m)}</div>`);
    const body = ms.length>1 ? Array.from({length:Math.ceil(slots.length/2)},(_,i)=>`<div class="bk-pair">${slots[2*i]}${slots[2*i+1]||""}</div>`).join("") : `<div class="bk-pair one">${slots[0]||""}</div>`;
    return `<div class="bk-col ${ri===0?"first":""}"><h4 class="bk-h">${esc(name==="Final"?"🏆 Final":name)}</h4><div class="bk-body">${body}</div></div>` });
  const fin=ko.find(m=>m.roundName==="Final"), champ=fin?winnerTeam(fin):null;
  cols.push(`<div class="bk-col champ"><h4 class="bk-h">Champions</h4><div class="bk-body"><div class="bk-pair one"><div class="bk-slot"><div class="bk-champ">${champ?`<span class="bk-cup">🏆</span>${avatar(tName(champ))}<b>${esc(tName(champ))}</b>`:`<span class="bk-cup">🏆</span><span class="tbd">Winner of the final</span>`}</div></div></div></div></div>`);
  const br=ko.find(isBronze), em=S.isAdmin && S.koEdit && ko.find(m=>keyOf(m)===S.koEdit);
  const pop=em ? (()=>{ const lab=isBronze(em)?"Bronze medal match":`${em.roundName}${/^(SF|QF|R\d+)$/.test(shortRound(em.roundName))?` ${em.slot}`:""}`;
    const xs=em.tie?S.matches.filter(x=>x.tie===em.tie).sort((x,y)=>Object.keys(DISC).indexOf(x.disc)-Object.keys(DISC).indexOf(y.disc)):[em];
    return `<div class="bk-pop" role="dialog" aria-label="Court and time"><div class="bk-popc"><div class="row" style="justify-content:space-between"><h3>✏️ ${esc(lab)}: court & time</h3><button class="btn small ghost" data-koedit="${esc(S.koEdit)}">Done</button></div>
      <p class="muted">${esc(sideLabel(em,"a")===tName(sideTeam(em,"a"))?"":"")}${sideTeam(em,"a")?esc(tName(sideTeam(em,"a"))):esc(sideLabel(em,"a"))} v ${sideTeam(em,"b")?esc(tName(sideTeam(em,"b"))):esc(sideLabel(em,"b"))}</p>
      <div class="bk-edit">${xs.map(x=>`<div class="bk-er">${x.disc?`<span>${esc(DISC[x.disc])}</span>`:""}${planPick(t,x)}</div>`).join("")}</div><p class="muted" style="font-size:.8rem">Changes save straight away and players see them at once.</p></div></div>` })() : "";
  return `${pop}<div class="bk">${cols.join("")}</div>${br?`<div class="bk-bronze"><h4 class="bk-h">🥉 Bronze medal match</h4>${card(br)}</div>`:""}`;
}
function courtCard(t, c){
  const m=liveOn(t,c), r=rules(t,m);
  const fb=`<a class="focusbtn" href="#court=${c}" target="_blank" rel="noopener" title="Open Court ${c} full screen in a new tab">⛶ Focus</a>`;
  if(!m){ const nx=nextOn(t,c); return `<div class="ct idle"><div class="cn"><span>Court ${c}</span><span>free ${fb}</span></div>${nx?`<div class="ct-next"><span class="lbl">Next on court</span><b>${esc(tName(sideTeam(nx,"a")))} <i>v</i> ${esc(tName(sideTeam(nx,"b")))}</b><small>${esc(nx.disc?DISC[nx.disc]:catName(t,nx.cat))}${nx.leg?` · ${nx.leg===1?"1st":"2nd"} meeting`:""}</small>${timerChip(nx)}</div>`:`<div class="muted">Waiting for the next match</div>`}</div>` }
  const g=(m.games||[]).slice(-1)[0]||[0,0], w=gamesWon(m,r), need=Math.floor(r.bestOf/2)+1, sv=svcState(m,Math.max(0,(m.games||[]).length-1));
  const side=(s,i)=>{ const id=sideTeam(m,s), tm=teamById(id), srv=sv&&sv.serving===s;
    const pl=k=>esc(tm?(k===1?tm.p1:tm.p2):""), names=m.disc?esc(DISC[m.disc]):tm?(srv?(sv.server===1?`🏸 ${pl(1)} & ${pl(2)}`:`${pl(1)} & 🏸 ${pl(2)}`):`${pl(1)} & ${pl(2)}`):"";
    return `<div class="row2"><div class="nm">${srv?"🏸 ":""}${esc(tName(id))}<small>${names}</small>${r.bestOf>1?`<span class="gw">${Array.from({length:need},(_,k)=>`<i class="${k<w[s]?"on":""}"></i>`).join("")}</span>`:""}</div><div class="pt">${g[i]}</div></div>` };
  return `<div class="ct"><div class="cn"><span>Court ${c} · ${esc(catName(t,m.cat))}</span><span>${esc(stageTxt(m))} ${fb}</span></div>${timerChip(m)?`<div class="ct-tmr">${timerChip(m)}</div>`:""}${side("a",0)}${side("b",1)}${m.ref?`<div class="ctref">🧑‍⚖️ Referee: ${esc(m.ref)}</div>`:""}</div>`;
}

/* ---------- views ---------- */
function noTourney(){ return S.isAdmin ? orgBar(null)+viewOrg("new") : `<section class="panel"><h2>Tournaments</h2><div class="empty">No tournament set up yet. Check back soon.</div></section>` }
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
  if(S.isAdmin && S.newT) return orgBar(t)+viewOrg("new");
  if(S.isAdmin && S.editDetails) return orgBar(t)+viewOrg("details");
  const mine=S.uid && !S.isAdmin?S.teams.filter(x=>x.tid===t.id && x.createdBy===S.uid):[];
  const full=c=>Number(t.maxTeams)>0 && teamsOf(t,c).length>=Number(t.maxTeams);
  const mapQ=[t.venue,t.address].filter(Boolean).join(", "), r=rules(t);
  return `${orgBar(t)}${pickBar(t)}<section class="panel thero ${t.poster?"":"noposter"}">${t.poster?`<div class="tposter"><img src="${esc(t.poster)}" alt="${esc(t.name||"Tournament")} poster"></div>`:""}<div class="tinfo">
      ${S.isAdmin?`<button class="btn small editbtn" data-editdetails="1">✏️ Edit details</button>`:""}<span class="lbl">${esc(fmtDate(t.date))}${t.venue?` · ${esc(t.venue)}`:""}</span>
      <div class="big">${esc(t.name||"Tournament")}</div>
      ${t.info?`<p>${esc(t.info).replace(/\n/g,"<br>")}</p>`:""}
      <div class="row">${cats(t).map(c=>`<span class="chip st-paid">${esc(c.name)} · ${teamsOf(t,c.id).length}${Number(t.maxTeams)?`/${Number(t.maxTeams)}`:""} teams</span>`).join("")}</div>
      ${t.entry?`<p class="entry"><b>Entry:</b> ${esc(t.entry)}</p>`:""}${prizeCards(t)}
      ${glanceLine(t)}
      ${mapQ?`<div class="row" style="align-items:flex-start"><a class="btn small" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQ)}" target="_blank" rel="noopener">📍 Directions</a><span style="font-size:.9rem">${esc(mapQ)}${t.directions?`<br><span class="muted">${esc(t.directions).replace(/\n/g,"<br>")}</span>`:""}</span></div>`:""}
    </div></section>
    <section class="panel">${S.isAdmin?`<button class="btn small editbtn" data-editfmt="${S.editFmt?0:1}">${S.editFmt?"Close":"✏️ Edit format & scoring"}</button>`:""}<h2>📋 Game format</h2>${S.isAdmin&&S.editFmt?formatForm(t):formatVisual(t)}</section>
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
    ${mine.length?`<section class="panel"><h2>Your teams</h2><p class="muted">Not in the WhatsApp group yet? <a href="${esc(waLink(t))}" target="_blank" rel="noopener">Join it here</a>, as that's where all updates go.</p><div class="teamlist">${mine.map(x=>`<div class="team"><span class="lbl">${esc(catName(t,x.cat))}</span><b>${esc(x.name)}</b><span>${esc(playersOf(x).join(x.p3?", ":" & "))}</span><span>${x.status==="confirmed"?'<span class="chip st-confirmed">Confirmed</span>':'<span class="chip st-awaiting">Waiting for the organiser</span>'}</span><button class="btn small ghost danger" data-withdraw="${esc(x.id)}">Withdraw</button></div>`).join("")}</div></section>`:""}`;
}
function viewTeams(){
  const t=T(); if(!t) return noTourney();

  if(S.isAdmin) return `${orgBar(t)}${pickBar(t)}${viewOrg("teams")}`;
  return `${pickBar(t)}<section class="panel">${S.isAdmin?`<button class="btn small editbtn" data-goorg="teams">✏️ Manage teams</button>`:""}<h2>Teams</h2>${catBar(t)}
    ${(()=>{ const ts=teamsOf(t,S.cat); return ts.length?`<p class="muted">${ts.length} team${ts.length>1?"s":""} registered${Number(t.maxTeams)?` of ${Number(t.maxTeams)}`:""} · ${ts.filter(x=>x.status==="confirmed").length} confirmed</p>
      <div class="teamlist">${ts.map((x,i)=>`<div class="team"><span class="lbl">#${i+1}</span><b>${esc(x.name)}</b><span>${esc(playersOf(x).join(x.p3?", ":" & "))}</span><span>${x.status==="confirmed"?'<span class="chip st-confirmed">Confirmed</span>':'<span class="chip st-awaiting">Pending</span>'}</span></div>`).join("")}</div>`:`<div class="empty">No teams yet. Be the first!</div>` })()}
  </section>`;
}
function viewFix(){
  const t=T(); if(!t) return noTourney();
  if(!fxUnlocked(t)) return `${pickBar(t)}<section class="panel signgate"><div class="sg-ico">🔒</div><h2>Fixtures are for registered teams</h2>
    <p class="muted">Enter the team code from your confirmation message, or scan the QR code in it with your phone camera.</p>
    <div class="row sg-mail"><input id="fx-code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="Team code" style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--mono)"><button class="btn primary" data-fxcode="1">Unlock</button></div>
    <p class="muted" style="font-size:.85rem">No code yet? Teams get one when the organiser confirms their place.</p></section>`;
  const myPass = !S.isAdmin && ls.get(`dsf:fx:${t.id}`,null);
  const tools = S.isAdmin ? `<div class="otools ${S.fxTools?"open":""}"><button class="btn ${S.fxTools?"":"primary"} otbtn" data-fxtools="1">${S.fxTools?"Hide organiser tools ▴":"⚙️ Organiser tools: make groups, knockouts, courts & times ▾"}</button>${S.fxTools?viewOrg("fixtures"):""}</div>` : "";
  const head=`${orgBar(t)}${pickBar(t)}${myPass?.code?passCard(t,myPass)+myMatches(t,myPass.team):""}${tools}<section class="panel"><h2>Fixtures & results</h2>${glanceLine(t)}${S.isAdmin&&matchesOf(t).length?`<p class="orghint">✏️ Organiser: change a match's court or time right on it, or tap it to fix the score.</p>`:""}
    ${catBar(t)}</section>`;
  const groups=t.groups?.[S.cat], ms=matchesOf(t,S.cat), edit=canRef(t);
  if(!groups && !ms.length) return head+`<section class="panel"><div class="empty">Fixtures appear here once the organiser makes the groups.</div></section>`;
  const hasKo=ms.some(m=>m.stage==="ko"), canKo=hasKo || (S.isAdmin && !!groups), fx=S.isAdmin && S.fxTab==="time" ? "time" : canKo && (S.fxTab==="ko" || !groups) ? "ko" : "groups";
  const tabs=`<div class="fxtabs"><button data-fxtab="groups" aria-pressed="${fx==="groups"}">Groups</button><button data-fxtab="ko" aria-pressed="${fx==="ko"}" ${canKo?"":"disabled"}>Knockouts</button>${S.isAdmin?`<button data-fxtab="time" aria-pressed="${fx==="time"}">🕒 Timings</button>`:""}</div>`;
  if(fx==="time" && S.isAdmin) return head+`<section class="panel">${tabs}${timingsView(t)}</section>`;
  if(fx==="ko"){ const koList=ms.filter(m=>m.stage==="ko" && !m.bye).sort((a,b)=>a.round-b.round||a.slot-b.slot||(a.order||0)-(b.order||0));
    return head+`<section class="panel">${tabs}${koBar(t)}${hasKo?bracket(t,S.cat):`<div class="empty">No knockout bracket yet. Pick where the knockouts start above, or <button class="btn small primary" data-genko="${esc(S.cat||"")}">Make knockout bracket</button></div>`}
      <details class="vm" id="vm-${esc(S.cat)}-ko"><summary>${isTeam(t)?"View every knockout match":"View knockout matches"} (${isTeam(t)?new Set(koList.map(m=>m.tie)).size+" ties":koList.length})</summary><div class="mlist">${fixList(t,koList,{edit, plan:true})}</div></details></section>` }
  const adv=Number(t.advance)||2;
  return head+`<section class="panel">${tabs}
    <p class="muted" style="margin:0 0 4px">${adv===1?"The group winner goes":`The top ${adv} in each group go`} through${Number(t.koSize)>0||Number(t.wild)?", plus the best of the rest":""}. Green = going through.${new Set(Object.values(t.groups?.[S.cat]||{}).map(x=>x.length)).size>1?` Groups are different sizes: knockout seeds compare teams from different groups on points per ${isTeam(t)?"tie":"match"}.`:""}</p>
    ${S.isAdmin&&S.grpOn?groupEditor(t,S.cat):""}
    <div class="groups">${S.grpOn?"":Object.keys(groups||{}).sort().map(G=>{ const gm=ms.filter(m=>m.stage==="group"&&m.group===G), n=isTeam(t)?new Set(gm.map(m=>m.tie)).size:gm.length, played=isTeam(t)?new Set(gm.filter(m=>m.tie&&tieResult(m.tie).complete).map(m=>m.tie)).size:gm.filter(m=>m.status==="done").length;
      return `<div class="grp"><h3>Group ${G}<span class="muted" style="font-size:.8rem;font-family:var(--body)">${played} of ${n} played</span></h3>${standTable(t,S.cat,G)}
        <details class="vm" id="vm-${esc(S.cat)}-${G}"><summary>View all ${n} ${isTeam(t)?"ties":"matches"}</summary><div class="mlist">${fixList(t,gm,{edit, plan:true})}</div></details></div>` }).join("")}</div></section>`;
}
function viewLive(){
  const t=T(); if(!t) return noTourney();
  const n=Math.max(1,Number(t.courts)||4), nx=upNext(t,6), done=matchesOf(t).filter(m=>m.status==="done"&&!m.bye).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,6);
  return `${pickBar(t)}<section class="panel"><div class="row" style="justify-content:space-between"><div><h2>Live courts</h2><p class="muted">Scores update the moment the referee taps.</p></div><a class="btn small" href="#screen" data-screen="1">📺 Big screen</a></div>
    ${(()=>{ const calls=courtCalls(t); return calls.length?`<div class="calls">${calls.map(x=>callBox(t,x)).join("")}</div>`:"" })()}
    <div class="courts">${Array.from({length:n},(_,i)=>courtCard(t,i+1)).join("")}</div></section>
    <section class="panel"><h2>Up next</h2>${nx.length?`<div class="mlist">${nx.map(m=>matchRow(t,m,{cat:true})).join("")}</div>`:`<div class="empty">Nothing waiting.</div>`}</section>
    ${done.length?`<section class="panel"><h2>Latest results</h2><div class="mlist">${done.map(m=>matchRow(t,m,{cat:true})).join("")}</div></section>`:""}`;
}

// organiser: courts & times right on the Fixtures tab
function schedForm(t){
  const has=matchesOf(t).some(m=>m.pcourt), on=clockOn(t), G=Object.keys(poolCourts({...t, poolCourts:true})||{}).map(k=>k.split("|")[1]);
  return `<div class="row schedf" style="align-items:flex-end">
      <label class="f" style="width:110px">Courts<input data-f="courts" type="number" min="1" max="12" value="${esc(t.courts||4)}"></label>
      <label class="row" style="gap:6px;align-self:end;flex-wrap:nowrap"><input type="checkbox" style="width:auto" data-f="timed" ${on?"checked":""}> Show start times</label>
      ${on?`<label class="f" style="width:140px">First match<input data-f="start" type="time" value="${esc(t.startTime||"10:00")}"></label>
      <label class="f" style="width:150px">Minutes per match<input data-f="mins" type="number" min="5" max="60" value="${esc(t.matchMins||15)}"></label>`:""}
      ${G.length?`<label class="row" style="gap:6px;align-self:end;flex-wrap:nowrap" title="Every group match is played on its group's own court"><input type="checkbox" style="width:auto" data-f="pool" ${t.poolCourts?"checked":""}> One court per group <span class="muted">(${Object.entries(poolCourts({...t, poolCourts:true})).slice(0,4).map(([k,c])=>`${esc(k.split("|")[1])} → Court ${c}`).join(", ")}${G.length>4?"…":""})</span></label>`:""}
      <button class="btn primary" data-fxsched="1">${has?`Update courts & ${on?"times":"order"}`:`Assign courts & ${on?"times":"order"}`}</button></div>`;
}
function schedPanel(t){
  const has=matchesOf(t).some(m=>m.pcourt), on=clockOn(t), last=on&&has?matchesOf(t).filter(m=>m.ptime).map(m=>m.ptime).sort().slice(-1)[0]:"";
  return `<section class="panel"><h2>🏸 Courts & order of play</h2>
    ${schedForm(t)}
    <p class="muted" style="font-size:.85rem">${on?"Each match gets a court and a start time.":"Matches run on points, not the clock: each match gets a court and its place in that court's queue (1st, 2nd, 3rd…). When a court's match finishes, the next one for that court starts."} Covers every category. Nobody plays twice at once, and knockouts come after their groups${matchesOf(t).some(m=>m.stage==="ko")?"":" (make the knockout bracket first, in step 2 above, so it's included)"}. ${last?`Last match at <b>${esc(last)}</b>. `:""}To move one match, change its court or ${on?"time":"order"} right on the match below.</p></section>`;
}

/* referee */
function viewRef(){
  const t=T(); if(!t) return noTourney();
  if(S.isAdmin && !S.refOnly) return `${orgBar(t)}${pickBar(t)}${viewOrg("refs")}${viewRefInner(t)}`;
  return viewRefInner(t);
}
function viewRefInner(t){
  if(!canRef(t)) return `<section class="panel signgate refgate"><div class="sg-ico">🏸</div><h2>Referee sign-in</h2><p class="muted">${S.refPre?"Your code is filled in. Just add your name.":"Enter your name and the referee code from the organiser."} You stay signed in on this phone for the day.</p>
    <div class="refform"><label class="f">Your name<input id="ref-name" maxlength="40" autocomplete="name" placeholder="e.g. Priya" value="${esc(ls.get("dsf:refname","")||"")}"></label>
    <label class="f" ${S.refPre?"hidden":""}>Referee code<input id="ref-code" placeholder="Code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" value="${esc(S.refPre||"")}" style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--mono)"></label>
    <button class="btn primary" data-refopen="1">Start refereeing →</button></div></section>`;
  const n=Math.max(1,Number(t.courts)||4), c=Math.min(n,Math.max(1,S.refCourt)), m=liveOn(t,c), r=rules(t,m);
  const courtPick=`<div class="cats">${Array.from({length:n},(_,i)=>`<button data-refcourt="${i+1}" aria-pressed="${i+1===c}">Court ${i+1}${liveOn(t,i+1)?" 🔴":""}</button>`).join("")}</div>`;
  if(!m){ const nx=upNext(t,30).sort((x,y)=>(x.pcourt===c?0:1)-(y.pcourt===c?0:1)).slice(0,6), lastHere=matchesOf(t).filter(x=>x.status==="done"&&Number(x.court)===c).sort((x,y)=>String(y.updatedAt).localeCompare(String(x.updatedAt)))[0];
    const backToBack = nx[0] && lastHere && nx[0].after && nx[0].after===lastHere.id;
    return `<section class="panel"><div class="refhi">👋 <b>${esc(ls.get("dsf:refname","")||S.unlock?.name||"Referee")}</b><button class="btn small ghost" data-refname="1">Change name</button></div><h2>Referee · Court ${c}</h2>${courtPick}
      ${nx[0]?`<div class="refnext"><span class="lbl">${backToBack?"Next · same pairs, 2nd meeting":"Next on this court"}</span><b>${esc(tName(sideTeam(nx[0],"a")))} v ${esc(tName(sideTeam(nx[0],"b")))}</b><span class="muted">${esc(nx[0].disc?DISC[nx[0].disc]:"")}</span>${timerBar(t,nx[0],backToBack?"brk":"wait")}</div>`:""}
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
      ${timerBar(t,m,gi?"brk":"warm")}
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
function viewOrg(only){
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
      ${f("entry","Entry fee",x?.entry,"text",'placeholder="e.g. £25 per player"')}
      <div style="grid-column:1/-1"><span class="lbl">Prizes</span><div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${f("p1","🥇 Gold · winners",x?.prize1??(x?.prize2||x?.prize3?"":x?.prizes),"text",'placeholder="e.g. Trophy + £200"')}${f("p2","🥈 Silver · runners-up",x?.prize2,"text",'placeholder="e.g. Medals + £150"')}${f("p3","🥉 Bronze · third place",x?.prize3,"text",'placeholder="e.g. Medals + £100"')}</div></div>
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
  if(!t || S.newT || only==="new") return `${only?"":list+preset}<section class="panel" id="newt"><h2>New tournament</h2>${form(null)}<div class="savebar"><button class="btn primary" data-tsave="new">Create tournament</button>${t?`<button class="btn small ghost" data-tnewx="1">Cancel</button>`:""}</div></section>`;

  const ot=only||S.otab||"details", nTeams=teamsOf(t).length;
  const sub=`<div class="osub">${[["details","📝 Details"],["teams",`👥 Teams · ${nTeams}`],["fixtures","🗓 Fixtures"],["refs","📣 Referees & screen"]].map(([k,l])=>`<button data-otab="${k}" aria-pressed="${ot===k}">${l}</button>`).join("")}</div>`;
  const head=`<section class="panel ohead"><div><span class="lbl">Managing</span><h2>${esc(t.name||"Tournament")}</h2><span class="muted">${esc(fmtDate(t.date))} · registration ${t.regOpen?"open":"closed"}</span></div>${sub}</section>`;
  let body="";
  if(ot==="details") body=`<section class="panel"><div class="row" style="justify-content:space-between"><h2>✏️ Edit tournament details</h2><button class="btn small ghost" data-editdetails="0">Close</button></div>${form(t)}<div class="savebar"><button class="btn primary" data-tsave="${esc(t.id)}">💾 Save changes</button><button class="btn small ghost" data-tsave="new">Save as a new tournament</button></div></section>`;
  if(ot==="refs") body=`
    <section class="panel"><h2>Referees & big screen</h2>
      <div class="row code-row"><span class="lbl">Referee code</span>${S.secret?`<b class="code">${esc(S.secret)}</b><button class="btn small" data-copy="${esc(S.secret)}">Copy</button><button class="btn small ghost" data-tcode="1">New code</button>`:`<button class="btn small primary" data-tcode="1">Create code</button>`}</div>
      ${(()=>{ const link=S.secret?`https://dropshotfolks.co.uk/tourney/?t=${encodeURIComponent(t.id)}&ref=${encodeURIComponent(S.secret)}#ref`:"https://dropshotfolks.co.uk/tourney/#ref", msg=`🏸 Referee for ${t.name||"the tournament"}\nTap to sign in (your code is built in, just add your name):\n${link}\n\nPick your court, tap Start, do the toss, then tap a team for each point.`;
        if(!S.secret) return `<p class="muted">Create a code first: you'll get a one-tap sign-in link and QR code for referees.</p>`;
        return `<div class="refshare"><div class="pass-qr">${qrSvg(link)}</div><div><span class="lbl">One-tap referee sign-in</span><p>Referees scan this QR code or open the link, type their name, and they're in. They stay signed in on that phone.</p>
          <div class="row"><button class="btn small" data-copy="${esc(link)}">Copy link</button><a class="btn small primary" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">💬 Send to referees on WhatsApp</a></div></div></div>` })()}
      ${(()=>{ const refs=(S.refs||[]).filter(x=>x.tid===t.id && x.code===S.secret); return `<div><span class="lbl">Signed-in referees · ${refs.length}</span>${refs.length?`<div class="chips">${refs.map(x=>{ const on=matchesOf(t).find(m=>m.status==="live"&&m.ref&&m.ref===x.name); return `<span class="chip ${on?"st-confirmed":""}">🧑‍⚖️ ${esc(x.name||"No name")}${on?` · Court ${esc(on.court)}`:""}</span>` }).join("")}</div>`:`<p class="muted">Nobody yet.</p>`}</div>` })()}
      <div class="tset"><span class="lbl">⏱ Referee timers (seconds)</span><div class="row">${Object.entries(TIMERS).map(([k,[i,l]])=>`<label class="f">${i} ${l}<input type="number" min="5" max="1800" step="5" data-timerset="${k}" value="${timerSecs(t,k)}"></label>`).join("")}</div></div>
      <p class="muted" style="font-size:.85rem">Referees only see the scoring screen, nothing else. A new code signs out every phone using the old one.</p>
      <div class="row"><a class="btn small" href="#screen" data-screen="1">📺 Open big screen</a><span class="muted" style="font-size:.85rem">Put it on the projector and press F for full screen.</span></div></section>`;
  if(ot==="teams") body=`<section class="panel"><div class="row" style="justify-content:space-between"><h2>Teams</h2><div class="row"><button class="btn small" data-scanqr="1">📷 Scan QR</button><label class="btn small" for="imp-file">📥 Import spreadsheet</label><input id="imp-file" type="file" accept=".xlsx,.csv" hidden><button class="btn small primary" data-oaddopen="1">➕ Add a team</button></div></div>${catBar(t)}
      ${S.addTeam?`<div class="ogrp"><h3>New team · ${esc(catName(t,S.cat))}</h3><div class="grid2"><label class="f">Team name<input id="oa-name" maxlength="40"></label>${Array.from({length:nPl(t)},(_,i)=>`<label class="f">Player ${i+1}<input id="oa-p${i+1}" maxlength="60"></label>`).join("")}</div>
        <div class="row"><button class="btn primary small" data-oadd="${esc(S.cat||"")}">Add team</button><button class="btn small ghost" data-oaddopen="0">Cancel</button></div></div>`:""}
      ${(()=>{ const ts=teamsOf(t,S.cat); if(!ts.length) return `<div class="empty">No teams in this category yet.</div>`;
        return `<div class="row"><span class="muted">${ts.length} teams · ${ts.filter(x=>x.status==="confirmed").length} confirmed</span>${ts.some(x=>x.status!=="confirmed")?`<button class="btn small" data-confirmall="${esc(S.cat)}">Confirm all</button>`:""}</div>
        <div class="otl">${ts.map(x=>teamCard(t,x)).join("")}</div>` })()}
      ${mailPanel(t)}${recordsPanel()}
      <p class="muted" style="font-size:.82rem">📥 Import takes Google Form responses (.xlsx or .csv): teams already here get their contact details filled in, new teams are added.</p></section>`;
  if(ot==="fixtures") body=`<section class="panel"><h2>1 · Groups</h2>${catBar(t)}
      <p class="muted">${isTeam(t)?`${Number(t.numGroups)>0?`${Number(t.numGroups)} groups`:`Groups of about ${Number(t.groupSize)||3}`}; every tie is men's, women's and two mixed doubles. Top ${Number(t.advance)||2} per group go through.`:`Groups of about ${Number(t.groupSize)||4}; everyone plays everyone in their group. ${Number(t.advance)===1?"The winner":`The top ${Number(t.advance)||2}`} of each group go${Number(t.advance)===1?"es":""} through.`} Only confirmed teams are included. Change group sizes in 📝 Details.</p>
      <div class="row"><label class="f" style="margin:0">Number of groups <select data-numgroups="1">${[0,2,3,4,5,6,8].map(n=>`<option value="${n}" ${(Number(t.numGroups)||0)===n?"selected":""}>${n?n:"Auto"}</option>`).join("")}</select></label><label class="f" style="margin:0">Each pair of teams plays <select data-legs="1"><option value="1" ${legs(t)===1?"selected":""}>once</option><option value="2" ${legs(t)===2?"selected":""}>twice, back to back</option></select></label><button class="btn primary" data-gen="${esc(S.cat||"")}">${t.groups?.[S.cat]?"Re-make groups":"Make groups"}</button>${t.groups?.[S.cat]?`<button class="btn small" data-grpedit="1">✏️ Move teams between groups</button>`:""}${matchesOf(t,S.cat).length?`<button class="btn small ghost danger" data-clearfix="${esc(S.cat||"")}">Clear all fixtures</button>`:""}</div>
      <p class="muted" style="font-size:.85rem">${(()=>{ const g=matchesOf(t,S.cat).filter(m=>m.stage==="group"); return g.length?`${g.filter(m=>m.status==="done").length} of ${g.length} group matches played.`:"No groups yet." })()}</p></section>
    <section class="panel"><h2>2 · Knockouts</h2><p class="muted">Make it any time: the places read "Winner Group A" and so on, and fill in by themselves as groups finish.</p>
      ${koStartPick(t)}
      <button class="btn primary" data-genko="${esc(S.cat||"")}">${matchesOf(t,S.cat).some(m=>m.stage==="ko")?"Re-make knockout bracket":"Make knockout bracket"}</button></section>
    ${schedPanel(t).replace("🏸 Courts & order of play","3 · Courts & order of play")}
    ${only?"":`<section class="panel"><h2>4 · Scores & changes</h2><p class="muted">Open the <b>Fixtures</b> tab and tap any match to fix its score, court or order. Referees score live from their phones.</p><button class="btn small" data-tab="fix">Open Fixtures</button></section>`}`;
  return only ? body : `${list}${preset}${head}${body}`;
}
// the knockout rounds in words, from the bracket if it's made, else from the settings: "Semi-finals → 🏆 final"
function koPath(t){
  const ko=matchesOf(t).filter(m=>m.stage==="ko" && !m.bye && m.roundName!=="Bronze medal match");
  let P=ko.length?2**Math.max(...ko.map(m=>m.round||1)):0;
  if(!P){ const gs=Object.values(t.groups||{})[0]; if(!gs) return "Quarter-finals → semi-finals → 🏆 final";
    const adv=Math.max(1,Number(t.advance)||2), cur=Object.values(gs).reduce((s,g)=>s+Math.min(adv,g.length),0)+nWild(t,gs); P=1; while(P<cur) P*=2 }
  const names=[]; for(let k=P/2;k>=1;k/=2) names.push(roundName(k)); return names.map((n,i)=>i===names.length-1?"🏆 final":i?n.toLowerCase():n).join(" → ");
}
// organiser, on the Knockouts tab: which round the knockouts start with, and the 3rd-place match on or off; either re-makes the bracket
function koBar(t){
  if(!S.isAdmin) return ""; const groups=t.groups?.[S.cat]||{}, G=Object.keys(groups).length; if(G<2) return "";
  const adv=Math.max(1,Number(t.advance)||2), cur=Object.values(groups).reduce((s,g)=>s+Math.min(adv,g.length),0)+nWild(t,groups), n=Object.values(groups).flat().length;
  let P=1; while(P<cur) P*=2;
  const opts=[[2,"Final only"],[4,"Semi-finals"],[8,"Quarter-finals"],[16,"Round of 16"],[32,"Round of 32"]].filter(([k])=>k>=G && k<2*n), w=nWild(t,groups);
  return `<div class="kobar"><span class="lbl">🏆 Organiser: knockouts start with</span><div class="row">${opts.map(([k,l])=>`<button class="btn small ${k===P?"primary":""}" data-kosize="${k}" aria-pressed="${k===P}">${l}</button>`).join("")}
    <button class="btn small ${bronzeOn(t)?"primary":"ghost"}" data-kobronze="${bronzeOn(t)?0:1}" aria-pressed="${bronzeOn(t)}">🥉 3rd-place match: ${bronzeOn(t)?"On":"Off"}</button></div>
    <p class="muted">Now: ${cur} teams go through (${adv===1?"group winners":`top ${adv} per group`}${w?` + best ${w} ${adv===1?"runner"+(w>1?"s":"")+"-up":"of the rest"}`:""})${cur<P?`, ${P-cur} bye${P-cur>1?"s":""}`:""}. Tap a round to change it: the bracket is made again straight away.</p></div>`;
}
async function setKo(t, upd){
  await db.collection("tourneys").doc(t.id).set(upd,{merge:true});
  if(!t.groups?.[S.cat]){ toast("Saved"); return }
  if(matchesOf(t,S.cat).some(m=>m.stage==="ko" && !m.bye && m.status!=="scheduled") && !confirm("Some knockout matches already have results. Re-make the bracket anyway?")){ toast("Saved. Press Re-make knockout bracket when you're ready."); return }
  await generateKnockouts({...t, ...upd}, S.cat); S.fxTab="ko"; render();
}
const koSizeUpd = (t, k) => { const G=Object.keys(t.groups?.[S.cat]||{}).length||1, adv=Math.max(1,Math.min(4,Math.floor(k/G))); return {advance:adv, koSize:adv*G===k?0:k, wild:0} };
// organiser: how big the knockouts are, in one choice (sets teams through per group + best runners-up)
function koStartPick(t){
  const groups=t.groups?.[S.cat]||{}, G=Object.keys(groups).length; if(G<2) return "";
  const adv=Math.max(1,Number(t.advance)||2), cur=Object.values(groups).reduce((s,g)=>s+Math.min(adv,g.length),0)+nWild(t,groups), n=Object.values(groups).flat().length;
  const opts=[[2,"Final"],[4,"Semi-finals"],[8,"Quarter-finals"],[16,"Round of 16"]].filter(([k])=>k>=G && k<=n);
  const say=k=>{ const a=Math.floor(k/G), w=k-a*G; return `${a===1?"group winners":`top ${a} per group`}${w?` + best ${w} ${a===1?"runner"+(w>1?"s":"")+"-up":"of the rest"}`:""}` };
  return `<div class="row" style="margin:0 0 10px"><label class="f" style="margin:0">Knockouts start with <select data-kostart="1">${opts.map(([k,l])=>`<option value="${k}" ${cur===k?"selected":""}>${l}: ${k} teams (${say(k)})</option>`).join("")}${opts.some(([k])=>k===cur)?"":`<option value="" selected>${cur} teams go through (custom)</option>`}</select></label></div>`;
}
// organiser bar on every tab: switch / add / delete tournaments, one-tap official details
function orgBar(t){
  if(!S.isAdmin) return "";
  const preset = PRESETS.map(p=>{ const x=p.find(); if(p.create ? x : (!x || x.preset===p.key)) return ""; return `<button class="btn small primary" data-preset="${p.key}">${p.btn}</button>` }).join("");
  return `<div class="orgbar"><span class="ob-l">🔑 Organiser</span>${t?`<span class="ob-t">Editing <b>${esc(t.name||"Tournament")}</b></span>`:""}<span class="ob-g"></span>${preset}
    <a class="btn small" href="../#edit">🏠 Edit homepage</a><button class="btn small" data-tnew="1">➕ New tournament</button>${t?`<button class="btn small ghost danger" data-tdelt="${esc(t.id)}">🗑 Delete</button>`:""}</div>
    ${S.rulesOld?`<div class="rulesbar"><b>⚠️ Your Firebase rules are out of date.</b> Team codes, QR passes, check-in and website edits won't work until you publish them.
      <ol><li>Open <a href="https://raw.githubusercontent.com/NiharikaSrivastava0510/dropshotfolks/main/book/firestore.rules" target="_blank" rel="noopener">the latest rules</a>, press ⌘A then ⌘C.</li>
      <li>Open <a href="https://console.firebase.google.com/project/dropshotfolks/firestore/rules" target="_blank" rel="noopener">Firebase → Firestore → Rules</a>, click in the editor, ⌘A, ⌘V, then <b>Publish</b>.</li><li>Reload this page.</li></ol></div>`:""}`;
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
    ${x.status==="confirmed"&&S.codes[x.id]?(()=>{ const code=S.codes[x.id].code, msg=confirmMsg(t,x), ph=ukPhone(c.phone);
      return `<div class="otc-code"><span>🎟 Code <b class="code">${esc(code)}</b>${S.codes[x.id].mailedAt?` <span class="chip st-confirmed" title="${esc(S.codes[x.id].mailedTo||"")}">📧 Emailed ${esc(new Date(S.codes[x.id].mailedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"}))}</span>`:c.email?"":' <span class="chip st-awaiting">No email saved</span>'}${x.checkedIn?' <span class="chip st-confirmed">✅ Checked in</span>':""}</span>
        <div class="row">${S.mail?.url&&c.email?`<button class="btn small" data-mailteam="${esc(x.id)}">📧 ${S.codes[x.id].mailedAt?"Email again":"Email now"}</button>`:c.email?`<a class="btn small" href="mailto:${esc(c.email)}?subject=${encodeURIComponent(`${x.name} is confirmed · ${t.name||"Tournament"}`)}&body=${encodeURIComponent(msg)}">📧 Email</a>`:""}<button class="btn small primary" data-sendqr="${esc(x.id)}">📲 Send QR</button><a class="btn small" href="https://wa.me/${ph?esc(ph):""}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" title="${ph?"Opens a chat with the captain":"No phone saved: pick the chat in WhatsApp"}">💬 WhatsApp</a><button class="btn small ghost" data-copy="${esc(msg)}">Copy message</button><a class="btn small ghost" href="${esc(passUrl(t,code))}" target="_blank" rel="noopener">🎫 Pass</a></div></div>` })():""}
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
  if(!m) return `<div class="scr fc">${head}<div class="fc-idle"><div>${nextHere?"📣":"🏸"}</div><small>Court ${c} is free</small>${nextHere?`<p>${esc(tName(sideTeam(nextHere,"a")))} v ${esc(tName(sideTeam(nextHere,"b")))}</p><small>${esc(nextHere.disc?DISC[nextHere.disc]:catName(t,nextHere.cat))} · please come to Court ${c}</small>${timerChip(nextHere)}`:`<p>Court ${c} is free</p>`}</div>${foot}</div>`;
  const gi=Math.max(0,(m.games||[]).length-1), g=(m.games||[])[gi]||[0,0], w=gamesWon(m,r), sv=svcState(m,gi), need=r.bestOf===2?2:Math.floor(r.bestOf/2)+1;
  const row=(s,i)=>{ const id=sideTeam(m,s), tm=teamById(id), srv=sv&&sv.serving===s;
    const pl=k=>esc(tm?(k===1?tm.p1:tm.p2):""), who=m.disc?esc(DISC[m.disc]):tm?`${srv&&sv.server===1?"🏸 ":""}${pl(1)} & ${srv&&sv.server===2?"🏸 ":""}${pl(2)}`:"";
    return `<div class="fc-row ${srv?"srv":""} ${s}"><div class="fc-nm"><b>${esc(tName(id))}</b><span>${who}</span>${r.bestOf>1?`<span class="gw">${Array.from({length:need},(_,k)=>`<i class="${k<w[s]?"on":""}"></i>`).join("")}</span>`:""}</div><div class="fc-pt">${g[i]}</div></div>` };
  const svLine = sv ? `🏸 ${esc(pName(sideTeam(m,sv.serving),sv.server))} serves from the ${sv.court==="R"?"right":"left"} → ${esc(pName(sideTeam(m,otherSide(sv.serving)),sv.receiver))}` : "";
  return `<div class="scr fc">${head}
    <div class="fc-main">${timerChip(m)?`<div class="fc-tmr">${timerChip(m)}</div>`:""}<div class="fc-meta">${esc(catName(t,m.cat))} · ${esc(stageTxt(m))} · Game ${gi+1}${(m.games||[]).length>1?` · earlier: ${esc((m.games||[]).slice(0,-1).map(x=>`${x[0]}–${x[1]}`).join(", "))}`:""}</div>
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
    ${(()=>{ const calls=courtCalls(t); return calls.length?`<div class="scr-calls">${calls.map(x=>callBox(t,x,true)).join("")}</div>`:"" })()}
    <div class="scr-b"><div class="scr-courts">${Array.from({length:n},(_,i)=>courtCard(t,i+1)).join("")}</div><div class="scr-side scr-fade">${side}</div></div>
    <div class="scr-f">${nx.length?`<b>Up next:</b> ${nx.map(m=>`${m.pcourt?`<b>${esc(planTxt(m,true))}</b> `:""}${esc(tName(sideTeam(m,"a")))} vs ${esc(tName(sideTeam(m,"b")))} <span>(${esc(catName(t,m.cat))})</span>`).join(" · ")}`:"<b>dropshotfolks.co.uk/tourney</b> · scores live on your phone"}</div></div>`;
}

/* ---------- render ---------- */
const TABS = () => [["reg","Register"],["teams","Teams"],["fix","Fixtures"],["live","Live"],...(S.isAdmin||S.unlock||S.refOnly?[["ref","Referee"]]:[]),...(S.isAdmin||S.desk||location.hash==="#checkin"?[["checkin","Check-in"]]:[])];
const playerIn = () => !!auth?.currentUser && !auth.currentUser.isAnonymous;
function render(){
  if(document.activeElement?.dataset?.prize){ render.later=true; return }   // don't wipe a prize while it's being typed
  const keep={}; document.querySelectorAll("#main input[id],#main select[id],#main textarea[id]").forEach(el=>{ if(el.type!=="file") keep[el.id]=el.type==="checkbox"?{c:el.checked}:{v:el.value} });
  const openD=new Set([...document.querySelectorAll("#main details[id][open]")].map(d=>d.id));
  document.body.classList.toggle("screen", S.tab==="screen");
  document.body.classList.toggle("refonly", !!S.refOnly);
  if(S.refOnly) S.tab="ref";
  if(S.tab==="screen"){ const fc=/^#court=(\d+)$/.exec(location.hash); $("#main").innerHTML = fc ? viewFocus(Number(fc[1])) : viewScreen(); tickClock(); return }
  const tabs=TABS(); if(!tabs.some(([k])=>k===S.tab) && !(S.isAdmin && S.tab==="org")) S.tab="reg";
  if(!S.isAdmin){ S.editDetails=false; S.newT=false }
  const t=T(), anyLive=t && matchesOf(t).some(m=>m.status==="live");
  $("#tabs").innerHTML=tabs.map(([k,l])=>`<button role="tab" data-tab="${k}" aria-selected="${k===S.tab}">${k==="live"&&anyLive?'<span class="dot pulse"></span>':""}${esc(l)}</button>`).join("");
  const tf=$("#tfoot"); if(tf) tf.innerHTML=S.isAdmin||S.tab!=="reg"?"":`<button class="btn small ghost" data-signin="1" type="button">🔑 Organiser login</button>`;
  $("#who").innerHTML=(S.isAdmin?`<span class="org-flag">Organiser</span>`:location.hash==="#login"?`<button class="btn small" data-signin="1" type="button">🔑 Organiser sign in</button>`:"")+(S.uid && !auth?.currentUser?.isAnonymous?` <button class="btn small" id="signOut" type="button">Sign out</button>`:"");
  const tn=$("#tname"); tn.innerHTML=t?`🏆 <b>${esc(t.name||"Tournament")}</b> · ${esc(fmtDate(t.date))}`:""; tn.hidden=!t;
  const views={reg:viewReg, teams:viewTeams, fix:viewFix, live:viewLive, ref:viewRef, org:viewOrg, checkin:viewCheckin};
  $("#main").innerHTML = !S.loaded ? `<section class="panel"><div class="empty loading">Loading…</div></section>` : scanCard() + (S.edit?editPanel():"") + views[S.tab]();
  Object.entries(keep).forEach(([id,k])=>{ const el=document.getElementById(id); if(!el) return; if("c" in k) el.checked=k.c; else el.value=k.v });
  document.querySelectorAll("#main details[id]").forEach(d=>{ if(openD.has(d.id)) d.open=true });
}
function tickClock(){ const c=$("#clock"); if(c) c.textContent=new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) }
setInterval(()=>{ if(S.tab==="screen"){ tickClock() } },15000);
// countdowns tick every half second without redrawing the page
setInterval(()=>{ document.querySelectorAll(".cd[data-end]").forEach(el=>{ const left=Math.ceil((Number(el.dataset.end)-Date.now())/1000);
  el.textContent = left>0 ? fmtSecs(left) : "Time!"; const box=el.closest(".tbar,.tmr,.call");
  if(left<=0 && box && !box.classList.contains("over")){ box.classList.add("over"); if(el.closest(".refbox,.panel") && S.tab==="ref") navigator.vibrate?.([200,100,200]) }
  else if(left>0 && left<=5 && box) box.classList.add("soon") }) },500);
setInterval(()=>{ if(S.tab==="screen"){ S.scrIdx++; render() } },12000);
addEventListener("hashchange",()=>{ S.refOnly = location.hash==="#ref";
  S.tab = /^#(screen|court=\d+)$/.test(location.hash) ? "screen" : S.refOnly ? "ref" : location.hash==="#checkin" ? "checkin" : (S.tab==="screen"?"live":S.tab); render() });
document.addEventListener("keydown",e=>{ if(S.tab!=="screen") return;
  if(e.key==="f"||e.key==="F") document.documentElement.requestFullscreen?.().catch(()=>{});
  if(e.key==="Escape" && !document.fullscreenElement) location.hash="" });

/* ---------- actions ---------- */
async function ensureSignedIn(){
  if(auth.currentUser) return auth.currentUser;
  const c=await auth.signInAnonymously(); S.uid=c.user.uid; return c.user;
}
async function tryRefUnlock(code, name){
  const t=T(); if(!t) return;
  try{ await ensureSignedIn(); const ref=db.collection("tunlocks").doc(auth.currentUser.uid);
    await ref.set({tid:t.id, code, at:nowIso(), ...(name?{name}:{})}).catch(e=>{ if(name && e?.code==="permission-denied") return ref.set({tid:t.id, code, at:nowIso()}); throw e });
    S.unlock={tid:t.id, code, name}; S.refPre=null; history.replaceState(null,"",location.pathname+`?t=${t.id}`+location.hash); render(); toast(`Welcome${name?`, ${name}`:""}! Referee mode is on for this phone 🏸`) }
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
    box.innerHTML=`<div class="readcard"><h2>${k==="format"?"📋 Game format":"📜 Terms & conditions"}</h2><div class="readtxt">${k==="format"?formatVisual(t2):richTxt(t2.terms||DEFAULT_TERMS)}</div><button type="button" class="btn primary" data-readdone="${k}">I've read this ✓</button></div>`;
    document.body.appendChild(box); box.querySelector("[data-readdone]").focus(); return }
  if(ds.readdone){ (S.read||={})[ds.readdone]=true; t0.closest(".readmodal")?.remove(); render(); return }
  if(ds.wajoin){ S.waOpened=true; setTimeout(render,300); return }   // let the link open, then unlock the tick box
  if(t0.id==="signOut"){ await auth.signOut(); location.reload(); return }
  if(ds.goorg){ const k=ds.goorg; S.tab={details:"reg",teams:"teams",fixtures:"fix",refs:"ref"}[k]||"reg"; if(k==="details") S.editDetails=true; if(k==="fixtures") S.fxTools=true; ls.set("dsf:ttab",S.tab); render(); scrollTo({top:0}); return }
  if(ds.scanqr){ scanQr(); return }
  if(ds.deskopen){ const code=($("#desk-code")?.value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,""); if(code.length<4){ toast("Enter the check-in code"); return } tryDeskUnlock(code); return }
  if(ds.deskexit){ try{ await db.collection("tdesk").doc(auth.currentUser.uid).delete() }catch{} S.desk=null; render(); return }
  if(ds.cicode){ const c=($("#ci-code")?.value||"").trim(); if(c.length<4){ toast("Type the team code"); return } await openScan(c); return }
  if(ds.checkin){ const x=teamById(ds.checkin), tt=S.tourneys.find(y=>y.id===x?.tid); if(!canDesk(tt)) return; const on=ds.v==="1";
    await db.collection("tteams").doc(ds.checkin).update({checkedIn:on, checkedInAt:on?nowIso():null}).then(()=>toast(on?`${x.name} checked in ✅`:"Check-in undone"),e=>toast(e?.code==="permission-denied"?"Not allowed: ask the organiser to publish the latest Firebase rules":"Couldn't save")); return }
  if(ds.scanstop){ scanQr.stop?.(); return }
  if(ds.scanx){ S.scan=null; history.replaceState(null,"",location.pathname+(T()?`?t=${T().id}`:"")); render(); return }
  if(ds.fxcode){ const p=await useCode($("#fx-code")?.value); if(p){ render(); toast(`Welcome, ${teamById(p.team)?.name||p.name}! 🏸`) } return }
  if(ds.fxout){ ls.set(`dsf:fx:${T()?.id}`,null); render(); return }
  if(ds.editfmt!=null){ S.editFmt=ds.editfmt==="1"; render(); return }
  if(ds.savefmt && S.isAdmin){ const g=id=>$(`#fe-${id}`), n=(id,min,max,d)=>Math.min(max,Math.max(min,Number(g(id)?.value)||d));
    const data={groupSize:n("gsize",3,8,3), advance:n("adv",1,4,2), koSize:Math.min(64,Math.max(0,Number(g("kosize").value)||0)), deuce:g("deuce").value!=="0", bronze:g("bronze").checked,
      pointsTo:Number(g("to").value)||21, cap:Math.min(40,Math.max(0,Number(g("cap").value)||0)), bestOf:Number(g("bo").value)||1, format:g("format").value.trim().slice(0,2000),
      stageRules:Object.fromEntries([["ko","k"],["final","f"]].map(([key,k])=>[key,{pointsTo:Number(g(k+"to").value)||0, cap:Math.min(40,Math.max(0,Number(g(k+"cap").value)||0)), bestOf:Number(g(k+"bo").value)||0}]))};
    await db.collection("tourneys").doc(T().id).set(data,{merge:true}).then(()=>{ S.editFmt=false; render(); toast("Format & scoring saved ✓") },()=>toast("Couldn't save")); return }
  if(ds.editdetails!=null){ S.editDetails=ds.editdetails==="1"; S.newT=false; render(); scrollTo({top:0,behavior:"smooth"}); return }
  if(ds.fxtools!=null){ S.fxTools=!S.fxTools; render(); return }
  if(ds.tab){ S.tab=ds.tab; S.edit=null; S.newT=false; ls.set("dsf:ttab",S.tab); if(location.hash) history.replaceState(null,"",location.pathname); render(); scrollTo({top:0}); return }
  if(ds.screen){ e.preventDefault(); location.hash="#screen"; return }
  if(ds.tid){ S.tid=ds.tid; S.newT=false; S.cat=null; ls.set("dsf:tid",S.tid); render(); return }
  if(ds.cat){ S.cat=ds.cat; render(); return }
  if(ds.fxtab){ S.fxTab=ds.fxtab; render(); return }
  if(ds.gcancel){ S.grpOn=false; S.gDraft=null; S.gExtra=null; render(); return }
  if(ds.grpedit && S.isAdmin){ const t=T(), c=S.cat; S.grpOn=true; S.fxTab="groups"; S.fxTools=false; S.gExtra=[]; S.gDraft={}; Object.entries(t?.groups?.[c]||{}).forEach(([G,ids])=>ids.forEach(id=>S.gDraft[id]=G)); render(); document.querySelector(".ge-bar")?.scrollIntoView({behavior:"smooth",block:"center"}); return }
  if(ds.gadd && S.isAdmin){ const t=T(), have=new Set([...Object.keys(t?.groups?.[S.cat]||{}), ...Object.values(S.gDraft||{}), ...(S.gExtra||[])]); const L=[..."ABCDEFGHIJKLMNOP"].find(x=>!have.has(x)); if(L){ S.gExtra=[...(S.gExtra||[]), L]; render() } return }
  if(ds.gsave!==undefined && S.isAdmin){ const t=T(); if(t) await saveGroupEdit(t, S.cat); return }
  if(ds.gcapply && S.isAdmin){ const gc={}; document.querySelectorAll("[data-gcourt]").forEach(x=>{ gc[x.dataset.gcourt]=Number(x.value)||1 });
    const start=$("[data-gcstart]")?.value||t.startTime||"09:00", mins=Math.min(90,Math.max(3,Number($("[data-gcgap]")?.value)||10));
    if(matchesOf(t).some(m=>m.pcourt) && !confirm("Move every group match onto its group's court and set new times for all matches?")) return;
    const upd={groupCourts:gc, poolCourts:true, startTime:start, matchMins:mins, gapMins:mins, timed:true, courts:Math.min(12,Math.max(...Object.values(gc)))};
    await db.collection("tourneys").doc(t.id).set(upd,{merge:true}); await scheduleAll({...t, ...upd}); return }
  if(ds.coopen){ S.coOpen={...(S.coOpen||{}), [ds.coopen]:!S.coOpen?.[ds.coopen]}; render(); return }
  if((ds.cmove||ds.cshuffle) && S.isAdmin){ const c=Number(ds.cmove||ds.cshuffle), ties=courtTies(t,c);
    const start=$(`[data-cstart="${c}"]`)?.value||ties.find(x=>!x.started)?.time||t.startTime||"09:00", gap=Math.min(90,Math.max(3,Number($(`[data-cgap="${c}"]`)?.value)||Number(t.gapMins)||10));
    let keys=ties.filter(x=>!x.started).map(x=>x.k);
    if(ds.cshuffle) keys=shuffleTies(ties);
    else { const i=keys.indexOf(ds.ck), j=i+Number(ds.cdir); if(i<0||j<0||j>=keys.length) return; [keys[i],keys[j]]=[keys[j],keys[i]] }
    S.coOpen={...(S.coOpen||{}), [c]:true}; await timeCourt(t,c,start,gap,keys);
    toast(ds.cshuffle?`Court ${c} reshuffled ✓ New times from ${start}`:"Moved ✓ Times updated"); return }
  if(ds.ctimes && S.isAdmin){ const C=ds.ctimes==="all"?[...document.querySelectorAll("[data-ctimes]")].map(b=>b.dataset.ctimes).filter(x=>x!=="all"):[ds.ctimes]; let gap=10;
    // read every row first: saving one court redraws the page
    const rows=C.map(c=>[Number(c), $(`[data-cstart="${c}"]`)?.value, Math.min(90,Math.max(3,Number($(`[data-cgap="${c}"]`)?.value)||10))]);
    const miss=rows.find(r=>!r[1]); if(miss){ toast(`Pick the first match time for Court ${miss[0]}`); return }
    for(const [c,start,g] of rows){ gap=g; await timeCourt(t, c, start, g) }
    await db.collection("tourneys").doc(t.id).set({gapMins:gap, ...(clockOn(t)?{}:{timed:true})},{merge:true});
    toast(`Times set on ${C.length>1?`${C.length} courts`:`Court ${C[0]}`} ✓`); return }
  if(ds.shift && S.isAdmin){ const d=Number(ds.shift), t=T(), ms=matchesOf(t).filter(m=>m.status==="scheduled"&&m.ptime);
    for(let i=0;i<ms.length;i+=400){ const b=db.batch(); ms.slice(i,i+400).forEach(m=>b.update(db.collection("tmatches").doc(m.id),{ptime:hm(m.ptime,d)})); await b.commit() }
    toast(`${ms.length} matches moved ${d>0?"later":"earlier"} by ${Math.abs(d)} min`); return }
  if(ds.koedit){ S.koEdit = S.koEdit===ds.koedit ? null : ds.koedit; render(); return }
  if(ds.openko){ const d=document.querySelector("details.vm[id$='-ko']"); if(d){ d.open=true; const el=document.querySelector(`[data-medit="${ds.openko}_MD"]`)?.closest(".tie")||d; el.scrollIntoView({behavior:"smooth",block:"center"}); el.classList.add("flash"); setTimeout(()=>el.classList.remove("flash"),1600) } return }
  if(ds.mailteam){ const x=teamById(ds.mailteam); if(x) await mailTeam(t,x); return }
  if(ds.mailall){ await mailAll(t); return }
  if(ds.mailsave){ const url=($("#mail-url")?.value||"").trim(); if(url && !/^https:\/\/script\.google\.com\/(a\/macros\/[\w.-]+|macros)\/s\/[\w-]+\/exec$/.test(url)){ toast("Paste the Web app URL: it starts https://script.google.com/macros/s/ and ends /exec"); return }
    const saved=await db.collection("config").doc("mail").set({url, updatedAt:nowIso()},{merge:true}).then(()=>{ S.mail=url?{...S.mail, url}:null; render(); return true },()=>{ toast("Couldn't save"); return false });
    if(!saved) return; if(!url){ toast("Automatic emails turned off"); return } toast("Saved ✓ Sending a test email…"); const r=await mailPost({test:true});
    toast(r.ok?`Test email sent to ${DSF_ORG} ✓ Check your inbox`:`Test email didn't send: ${r.error}`); return }
  if(ds.xlsx){ downloadRecords(); return }
  if(ds.sheetsync){ await syncSheet(); return }
  if(ds.mailtest){ const r=await mailPost({test:true}); toast(r.ok?`Test email sent to ${DSF_ORG} ✓ Check your inbox`:`Didn't work: ${r.error}`); return }
  if(ds.copyscript){ try{ const txt=await (await fetch("mailer.gs?v="+Date.now())).text(); await navigator.clipboard.writeText(txt); toast("Script copied ✓ Paste it into script.google.com") }catch{ window.open("mailer.gs","_blank") } return }
  if(ds.sendqr){ const x=teamById(ds.sendqr), t=S.tourneys.find(y=>y.id===x?.tid); if(x&&t) await sendQr(t,x); return }
  if(ds.copy){ try{ await navigator.clipboard.writeText(ds.copy); toast("Copied") }catch{ toast(ds.copy) } return }
  if(ds.psignin==="google"){ try{ const c=await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      if(ADMINS.includes(String(c.user.email||"").toLowerCase())) return location.reload();
      S.uid=c.user.uid; render(); toast(`Signed in as ${c.user.email}`) }catch(e){ toast(e?.code==="auth/popup-blocked"?"Allow pop-ups, then try again":"Sign-in didn't finish") } return }
  if(ds.psignin==="email"){ const em=($("#pl-email")?.value||"").trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){ toast("Enter your email address"); return }
    try{ await auth.sendSignInLinkToEmail(em,{url:location.origin+location.pathname+"?t="+encodeURIComponent(T()?.id||""), handleCodeInApp:true}); ls.set("dsf:linkemail",em); S.linkSent=em; render() }
    catch(e){ toast(e?.code==="auth/operation-not-allowed"?"Email sign-in isn't switched on yet":"Couldn't send the link. Check the address.") } return }
  if(ds.signin){ try{ await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); location.reload() }catch{ toast("Sign-in didn't finish") } return }
  if(ds.withdraw){ const x=teamById(ds.withdraw); if(!x||!confirm(`Withdraw ${x.name}?`)) return;
    await db.collection("tcontacts").doc(x.id).delete().catch(()=>{}); await db.collection("tteams").doc(x.id).delete().then(()=>toast("Team withdrawn"),()=>toast("Couldn't withdraw")); return }
  // referee
  if(ds.refopen){ const code=($("#ref-code")?.value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,""), name=($("#ref-name")?.value||"").trim().slice(0,40);
    if(!name){ toast("Add your name"); $("#ref-name")?.focus(); return } if(code.length<4){ toast("Enter the referee code"); return } ls.set("dsf:refname",name); tryRefUnlock(code, name); return }
  if(ds.refname){ const n=prompt("Your name", ls.get("dsf:refname","")||""); if(n==null) return; const name=n.trim().slice(0,40); if(!name) return; ls.set("dsf:refname",name);
    if(S.unlock) await db.collection("tunlocks").doc(auth.currentUser.uid).update({name}).catch(()=>{}); render(); return }
  if(ds.refexit){ try{ await db.collection("tunlocks").doc(auth.currentUser.uid).delete() }catch{} S.unlock=null; render(); return }
  if(ds.refleave){ S.refOnly=false; history.replaceState(null,"",location.pathname); S.tab="live"; render(); return }
  if(ds.refcourt){ S.refCourt=Number(ds.refcourt); ls.set("dsf:refcourt",S.refCourt); render(); return }
  if(ds.start){ const m=S.matches.find(x=>x.id===ds.start); if(!m) return; const c=Number(ds.court); keepAwake();
    if(liveOn(t,c)){ toast(`Court ${c} already has a match`); return }
    const rn=S.isAdmin?"":(ls.get("dsf:refname","")||""), base={status:"live", court:c, games:m.games?.length?m.games:[[0,0]], winner:null};
    // the teams are here: the "waiting for teams" timer ends when the match starts
    const ok=await db.collection("tmatches").doc(m.id).update({...base, games:toDb(base.games), ...(rn?{ref:rn}:{}), ...(m.timer?.k==="wait"?{timer:null}:{}), updatedAt:nowIso()}).then(()=>true,()=>false); if(ok){ if(S.localTimers) delete S.localTimers[m.id]; return }
    await upd(m.id,base); return }
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
  if(ds.timer){ const m=S.matches.find(x=>x.id===ds.mid); if(m && canRef(T())) await setTimer(T(), m, ds.timer); return }
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
    const data={name:g("name").value.trim(), date:g("date").value, venue:g("venue").value.trim(), entry:g("entry").value.trim(), info:g("info").value.trim(), prize1:g("p1").value.trim().slice(0,200), prize2:g("p2").value.trim().slice(0,200), prize3:g("p3").value.trim().slice(0,200),
      maxTeams:Number(g("max").value)||0, courts:Math.min(12,Math.max(1,Number(g("courts").value)||4)), groupSize:Math.min(8,Math.max(3,Number(g("gsize").value)||4)), advance:Math.min(4,Math.max(1,Number(g("adv").value)||2)),
      pointsTo:Number(g("to").value)||21, deuce:g("deuce").value!=="0", bestOf:Number(g("bo").value)||1, startTime:g("start").value||"10:00", matchMins:Math.min(60,Math.max(5,Number(g("mins").value)||15)),
      address:g("address").value.trim(), directions:g("dirs").value.trim(), format:g("format").value.trim().slice(0,2000), terms:(g("terms").value.trim()||DEFAULT_TERMS).slice(0,5000),
      bank:{name:g("bname").value.trim().slice(0,60), sort:g("bsort").value.trim().slice(0,12), acct:g("bacct").value.trim().slice(0,20), note:g("bnote").value.trim().slice(0,200)}, wa:/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(g("wa").value.trim())?g("wa").value.trim().split("?")[0]:WA_GROUP, ...(S.posterDraft!==undefined?{poster:S.posterDraft}:{}), regOpen:g("open").checked,
      koSize:Math.min(64,Math.max(0,Number(g("kosize").value)||0)),
      stageRules:Object.fromEntries([["ko","k"],["final","f"]].map(([key,k])=>[key,{pointsTo:Number(g(k+"to").value)||0, cap:Math.min(40,Math.max(0,Number(g(k+"cap").value)||0)), bestOf:Number(g(k+"bo").value)||0}])),
      mode:team?"team":"pairs", cap:Math.min(40,Math.max(0,Number(g("cap").value)||0)), wild:Math.min(8,Math.max(0,Number(g("wild").value)||0)), bronze:g("bronze").checked,
      catIds, cats:team?[{id:"TC",name:"Team Cup"}]:CAT_PRESETS.filter(([id])=>catIds.includes(id)).map(([id,name])=>({id,name}))};
    const id = ds.tsave==="new" ? `t${(data.date||nowIso().slice(0,10)).replace(/-/g,"")}-${Date.now().toString(36).slice(-4)}` : ds.tsave;
    await db.collection("tourneys").doc(id).set(data,{merge:true}).then(()=>{ S.tid=id; S.newT=false; S.editDetails=false; ls.set("dsf:tid",id); S.posterDraft=undefined; render(); scrollTo({top:0,behavior:"smooth"}); toast("Tournament saved ✓") },()=>toast("Couldn't save")); return }
  if(ds.deskcode){ const desk=newCode(); await db.collection("tsecrets").doc(t.id).set({desk},{merge:true}).then(()=>{ S.deskCode=desk; render(); toast(`Check-in code ${desk}`) },()=>toast("Couldn't save the code")); return }
  if(ds.tcode){ const code=newCode(); await db.collection("tsecrets").doc(t.id).set({code},{merge:true}).then(()=>{ S.secret=code; render(); toast(`Referee code ${code}`) },()=>toast("Couldn't save the code")); return }
  if(ds.tconfirm){ await db.collection("tteams").doc(ds.tconfirm).update({status:ds.v}).catch(()=>toast("Couldn't update"));
    if(ds.v==="confirmed"){ const x=teamById(ds.tconfirm); if(x) x.status="confirmed"; const made=await ensureCodes(t,[ds.tconfirm]); if(S.mail?.url && x && S.contacts[x.id]?.email && !S.codes[x.id]?.mailedAt) await mailTeam(t,x); else if(made) toast("Confirmed ✓ Team code made. Send it with 📧 Email or 💬 WhatsApp.") } return }
  if(ds.confirmall){ const b=db.batch(), ids=teamsOf(t,ds.confirmall).filter(x=>x.status!=="confirmed").map(x=>x.id); ids.forEach(id=>b.update(db.collection("tteams").doc(id),{status:"confirmed"})); await b.commit();
    ids.forEach(id=>{ const x=teamById(id); if(x) x.status="confirmed" }); await ensureCodes(t); toast("All confirmed, team codes made"); if(S.mail?.url) await mailAll(t); return }
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
  if(ds.tnew){ S.newT=true; S.tab="reg"; render(); $("#newt")?.scrollIntoView({behavior:"smooth"}); return }
  if(ds.tnewx){ S.newT=false; render(); return }
  if(ds.tdelt){ const x=S.tourneys.find(y=>y.id===ds.tdelt); if(!x) return;
    const typed=prompt(`This deletes ${x.name} with all ${teamsOf(x).length} teams, fixtures and results. It can't be undone.\n\nType DELETE to confirm.`); if(typed!=="DELETE") return;
    if(S.mail?.sheetUrl){ toast("Saving it to your Google Sheet first…"); await syncSheet(true) }
    try{ const docs=[...matchesOf(x).map(m=>db.collection("tmatches").doc(m.id)), ...teamsOf(x).flatMap(tm=>[db.collection("tcontacts").doc(tm.id), db.collection("tteams").doc(tm.id)]), db.collection("tsecrets").doc(x.id), db.collection("tourneys").doc(x.id)];
      for(let i=0;i<docs.length;i+=400){ const b=db.batch(); docs.slice(i,i+400).forEach(d=>b.delete(d)); await b.commit() }
      if(S.tid===x.id){ S.tid=null; ls.set("dsf:tid",null) } toast(`${x.name} deleted`) }catch{ toast("Couldn't delete it all. Try again.") } return }
  if(ds.gen){ if(matchesOf(t,ds.gen).length && !confirm("This replaces all fixtures and results for this category. Carry on?")) return; await generateGroups(t, ds.gen); return }
  if(ds.fxsched){ const box=t0.closest(".schedf")||document, f=k=>box.querySelector(`[data-f="${k}"]`);
    const timed=!!f("timed")?.checked, start=f("start")?.value||t.startTime||"10:00", mins=Math.min(60,Math.max(5,Number(f("mins")?.value||t.matchMins)||15)), poolOn=f("pool")?!!f("pool").checked:!!t.poolCourts;
    const nG=Object.keys(poolCourts({...t, poolCourts:true})||{}).length, courts=Math.min(12,Math.max(1,Number(f("courts")?.value)||4, poolOn?nG:1));
    if(matchesOf(t).some(m=>m.pcourt) && !confirm("Re-do the court and time for every match?")) return;
    await db.collection("tourneys").doc(t.id).set({startTime:start, matchMins:mins, courts, timed, poolCourts:poolOn},{merge:true});
    await scheduleAll({...t, startTime:start, matchMins:mins, courts, timed, poolCourts:poolOn}); return }
  if(ds.sched){ if(matchesOf(t).some(m=>m.pcourt) && !confirm("Re-do the court and order for every match?")) return; await scheduleAll(t); return }
  if(ds.eplan){ const c=Number($("#ep-court").value)||0, tm=$("#ep-time")?.value, n=Number($("#ep-num")?.value)||0; await db.collection("tmatches").doc(ds.eplan).update({pcourt:c||null, ...($("#ep-time")?{ptime:tm||null}:{pnum:n||null, pslot:Math.max(0,n-1)})}).then(()=>toast("Court & time saved"),()=>toast("Couldn't save")); return }
  if(ds.kosize && S.isAdmin){ await setKo(t, koSizeUpd(t, Number(ds.kosize))); return }
  if(ds.kobronze && S.isAdmin){ await setKo(t, {bronze:ds.kobronze==="1"}); return }
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
document.addEventListener("input", e=>{ if(e.target.id!=="ci-find") return; S.ciFilter=e.target.value; const q=S.ciFilter.toLowerCase();
  document.querySelectorAll(".ci-row").forEach(r=>{ r.hidden=!!q && !r.textContent.toLowerCase().includes(q) }) });
document.addEventListener("change", async e=>{
  if(e.target.dataset?.kostart && S.isAdmin){ const t=T(), k=Number(e.target.value); if(!t||!k||!t.groups?.[S.cat]) return; await setKo(t, koSizeUpd(t,k)); return }
  if(e.target.dataset?.timerset && S.isAdmin){ const t=T(), k=e.target.dataset.timerset, v=Math.min(1800,Math.max(5,Number(e.target.value)||TIMERS[k][2]));
    if(t) await db.collection("tourneys").doc(t.id).set({timers:{...(t.timers||{}), [k]:v}},{merge:true}).then(()=>toast(`${TIMERS[k][1]}: ${fmtSecs(v)}`),()=>toast("Couldn't save")); return }
  if(e.target.dataset?.tiestart && S.isAdmin){ const tie=e.target.dataset.tiestart, v=e.target.value, ms=S.matches.filter(x=>(x.tie===tie||x.tie===tie+"L2") && x.status==="scheduled"); if(!v||!ms.length) return;
    const base=ms.map(x=>toMin(x.ptime)).filter(x=>x!=null), d=base.length?toMin(v)-Math.min(...base):0, b=db.batch();
    ms.forEach(x=>b.update(db.collection("tmatches").doc(x.id),{ptime:x.ptime?hm(x.ptime,d):v})); await b.commit().then(()=>toast(`Tie moved to ${v}`),()=>toast("Couldn't save")); return }
  if(e.target.dataset?.gmove && S.isAdmin){ S.gDraft={...(S.gDraft||{}), [e.target.dataset.gmove]:e.target.value}; render(); return }
  if(e.target.dataset?.legs && S.isAdmin){ const t=T(); if(t) await setLegs(t, Number(e.target.value)===2?2:1); return }
  if(e.target.dataset?.numgroups && S.isAdmin){ const t=T(); if(t) await db.collection("tourneys").doc(t.id).set({numGroups:Number(e.target.value)||0},{merge:true}).then(()=>toast("Saved. Press Re-make groups to use it."),()=>toast("Couldn't save")); return }
  const pc=e.target.dataset?.plcourt, pt=e.target.dataset?.pltime, pn=e.target.dataset?.plnum;
  if((pc||pt||pn) && S.isAdmin){ const id=pc||pt||pn, data=pc?{pcourt:Number(e.target.value)||null}:pt?{ptime:e.target.value||null}:{pnum:Number(e.target.value)||null, pslot:Math.max(0,(Number(e.target.value)||1)-1)};
    await db.collection("tmatches").doc(id).update(data).then(()=>toast(pc?`Court ${e.target.value||"cleared"}`:pt?`Time ${e.target.value||"cleared"}`:`${ordinal(Number(e.target.value)||1)} on its court`),()=>toast("Couldn't save")); return }
  if(e.target.id==="imp-file" && e.target.files?.[0] && S.isAdmin){ const f=e.target.files[0]; e.target.value="";
    try{ const list=teamsFromRows(await readSheet(f)); if(!list.length){ toast("No teams found. Is there a 'Team Name' column?"); return } await importTeams(T(), list) }
    catch(err){ console.error(err); toast("Couldn't read that file. Save it as .xlsx or .csv and try again.") } return }
  if(e.target.dataset?.f==="timed" && S.isAdmin){ const t=T(); if(t) await db.collection("tourneys").doc(t.id).set({timed:e.target.checked},{merge:true}); return }
  if(e.target.id!=="to-poster" || !e.target.files?.[0]) return;
  try{ S.posterDraft=await shrinkImage(e.target.files[0]); render(); toast("Poster ready. Press Save to publish it.") }catch{ toast("Couldn't read that image") }
});
document.addEventListener("focusout", async e=>{
  const k=e.target.dataset?.prize; if(!k || !S.isAdmin) return; const t=T(); if(!t) return;
  const v=e.target.textContent.replace(/\s+/g," ").trim().slice(0,200); if(v===(t["prize"+k]||"")) return;
  await db.collection("tourneys").doc(t.id).set({["prize"+k]:v},{merge:true}).then(()=>toast("Prize saved ✓"),()=>toast("Couldn't save the prize"));
  if(render.later){ render.later=false; render() }
});
document.addEventListener("keydown", e=>{ if(e.key==="Enter" && e.target.dataset?.prize){ e.preventDefault(); e.target.blur() } });
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
    // gold / silver / bronze prizes for the two events, if not set yet
    for(const [tid,pz] of [["t20261018-teamcup",{prize1:TEAM_CUP.prize1, prize2:TEAM_CUP.prize2, prize3:TEAM_CUP.prize3}], [S.tourneys.find(x=>x.date==="2026-11-21")?.id, {prize1:"£200 per team, in each category", prize2:"£150 per team, in each category", prize3:"£100 per team, in each category"}]]){
      const x=tid && S.tourneys.find(y=>y.id===tid); if(x && !x.prize1 && !x.prize2 && !x.prize3) await db.collection("tourneys").doc(x.id).set(pz,{merge:true}) }
    const np=S.tourneys.find(x=>x.date==="2026-11-21");
    if(np && np.preset!=="netplay"){ await db.collection("tourneys").doc(np.id).set({...NET_PLAY, preset:"netplay"},{merge:true}); done.push("the official Net Play details") }
    if(done.length){ S.tid=id; ls.set("dsf:tid",id); render(); toast(`Set up: ${done.join(", ")} ✓`) }
  }catch(e){ console.error(e); toast("Couldn't finish setting up. Reload to try again.") }
  autoSetup.running=false;
}

/* ---------- team codes: each confirmed team gets a code + QR that unlocks Fixtures; the organiser scans it at check-in ---------- */
// tcodes/{teamId} = {code, tid}  (organiser only) · tpasses/{code} = {tid, team, name}  (anyone can look up one code, nobody can list them)
const passUrl = (t, code) => `${location.origin}/tourney/?t=${encodeURIComponent(t.id)}&code=${encodeURIComponent(code)}`;
const qrSvg = (text, cell=6) => { try{ const q=qrcode(0,"M"); q.addData(text); q.make(); return q.createSvgTag({cellSize:cell, margin:2, scalable:true}) }catch{ return "" } };
async function ensureCodes(t, ids){
  if(!S.isAdmin || !t || !S.codesLoaded) return 0;
  const todo=teamsOf(t).filter(x=>x.status==="confirmed" && !S.codes[x.id] && (!ids || ids.includes(x.id)));
  if(!todo.length) return 0; const b=db.batch();
  todo.forEach(x=>{ const code=newCode(); S.codes[x.id]={code, tid:t.id}; b.set(db.collection("tcodes").doc(x.id),{code, tid:t.id}); b.set(db.collection("tpasses").doc(code),{tid:t.id, team:x.id, name:x.name}) });
  await b.commit().catch(()=>toast("Couldn't make team codes. Publish the latest Firebase rules.")); return todo.length;
}
const fxUnlocked = t => S.isAdmin || (S.unlock?.tid===t?.id) || !!ls.get(`dsf:fx:${t?.id}`,null);
async function useCode(code, quiet){
  code=String(code||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,""); if(code.length<4){ if(!quiet) toast("Enter your team code"); return false }
  try{ const d=await db.collection("tpasses").doc(code).get(); if(!d.exists){ if(!quiet) toast("That code isn't right. Check your confirmation message."); return false }
    const p=d.data(); ls.set(`dsf:fx:${p.tid}`,{code, team:p.team, name:p.name}); S.tid=p.tid; ls.set("dsf:tid",p.tid); return p }
  catch{ if(!quiet) toast("Couldn't check the code. Check your connection."); return false }
}
function confirmMsg(t, x){
  const code=S.codes[x.id]?.code||"", url=passUrl(t,code);
  return `Hi ${x.p1||"there"},\n\nGreat news: ${x.name} is confirmed for ${t.name||"the tournament"} on ${fmtDate(t.date)}${t.venue?` at ${t.venue}`:""}.\n\nYour team code: ${code}\n\nSee your fixtures and your team pass (QR code to show at check-in):\n${url}\n\nSee you on court!\nDropshot Folks`;
}
const ukPhone = p => { let d=String(p||"").replace(/[^\d+]/g,""); if(d.startsWith("+")) return d.slice(1); if(d.startsWith("00")) return d.slice(2); if(d.startsWith("0")) return "44"+d.slice(1); return d };
// the pass a team shows at check-in
// the team's own matches, in order, with time, court and opponent
function myMatches(t, team){
  if(!team) return ""; const seen=new Set(), rows=[];
  matchesOf(t).filter(m=>!m.bye).sort(byPlan).forEach(m=>{ const key=m.tie||m.id; if(seen.has(key)) return;
    const a=sideTeam(m,"a"), b=sideTeam(m,"b"); if(a!==team && b!==team) return; seen.add(key);
    const tr=m.tie?tieResult(m.tie):null, done=tr?tr.done:m.status==="done", live=m.tie?S.matches.some(x=>x.tie===m.tie&&x.status==="live"):m.status==="live";
    const opp=a===team?b:a, mine=a===team?"a":"b", res=done?(tr?`${tr[mine]}–${tr[mine==="a"?"b":"a"]}`:""):"";
    rows.push(`<div class="mm ${live?"live":""} ${done?"done":""}"><span class="mm-when">${live?`<span class="livebadge">Live</span>`:done?`<b>${(tr?tr.winner:m.winner)===mine?"Won":"Lost"} ${esc(res)}</b>`:esc(whenTxt(t,m))}</span>
      <span class="mm-vs">${opp?avatar(tName(opp)):""}<span><span>vs <b>${opp?esc(tName(opp)):esc(sideLabel(m,mine==="a"?"b":"a"))}</b></span><small class="muted">${esc(m.stage==="ko"?m.roundName:`Group ${m.group}`)}</small></span></span></div>`) });
  if(!rows.length) return "";
  return `<section class="panel"><h2>🗓 Your matches</h2><div class="mmlist">${rows.join("")}</div>
    <p class="muted" style="font-size:.85rem">Times are a guide: matches run on points, so be at your court a few minutes early.</p></section>`;
}
function passCard(t, p){
  const x=teamById(p.team), url=passUrl(t,p.code);
  return `<section class="panel pass"><div class="pass-qr">${qrSvg(url)}</div><div class="pass-info"><span class="lbl">🎫 Team pass · ${esc(t.name||"")}</span><h2>${esc(x?.name||p.name||"Your team")}</h2>
    ${x?`<p class="muted">${esc(playersOf(x).join(" · "))}</p>`:""}<p>Team code <b class="code">${esc(p.code)}</b></p><p class="muted" style="font-size:.88rem">Show this QR code at the Tournament Desk to check in. Screenshot it to keep it handy.</p>
    ${x?.checkedIn?`<span class="chip st-confirmed">✅ Checked in</span>`:""}</div></section>`;
}
// organiser: the team pass as a picture (QR + team + code), shared to WhatsApp with the confirmation message
async function passPng(t, x, code){
  const q=qrcode(0,"M"); q.addData(passUrl(t,code)); q.make(); const n=q.getModuleCount();
  const W=1080, H=1400, c=document.createElement("canvas"); c.width=W; c.height=H; const g=c.getContext("2d"), F="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  g.fillStyle="#F3E9D9"; g.fillRect(0,0,W,H); g.fillStyle="#7A2331"; g.fillRect(0,0,W,250);
  g.textAlign="center"; g.fillStyle="#FFFFFF"; g.font=`800 64px ${F}`; g.fillText("DROPSHOT FOLKS",W/2,110);
  g.fillStyle="#EBD9BA"; g.font=`500 38px ${F}`; g.fillText(`${t.name||"Tournament"} · ${fmtDate(t.date)}`.slice(0,60),W/2,180);
  const box=640, x0=(W-box)/2, y0=310, cell=Math.floor((box-60)/n), qs=cell*n, qx=(W-qs)/2, qy=y0+(box-qs)/2;
  g.fillStyle="#FFFFFF"; g.beginPath(); g.roundRect?g.roundRect(x0,y0,box,box,36):g.rect(x0,y0,box,box); g.fill();
  g.fillStyle="#000000"; for(let r=0;r<n;r++) for(let k=0;k<n;k++) if(q.isDark(r,k)) g.fillRect(qx+k*cell,qy+r*cell,cell,cell);
  g.fillStyle="#24100F"; g.font=`800 60px ${F}`; g.fillText(String(x.name).slice(0,28),W/2,1050);
  g.fillStyle="#715250"; g.font=`500 34px ${F}`; g.fillText(playersOf(x).join(" · ").slice(0,60),W/2,1105);
  g.fillStyle="#EFE3CE"; g.beginPath(); g.roundRect?g.roundRect(W/2-260,1150,520,110,24):g.rect(W/2-260,1150,520,110); g.fill();
  g.fillStyle="#7A2331"; g.font=`800 64px ui-monospace,Menlo,monospace`; g.fillText(code.split("").join(" "),W/2,1228);
  g.fillStyle="#715250"; g.font=`500 32px ${F}`; g.fillText("Team code · show this QR at the Tournament Desk",W/2,1320);
  return await new Promise(r=>c.toBlob(r,"image/png"));
}
async function sendQr(t, x){
  const code=S.codes[x.id]?.code; if(!code){ toast("No team code yet"); return }
  const msg=confirmMsg(t,x), blob=await passPng(t,x,code), file=new File([blob],`${x.name.replace(/[^\w]+/g,"-")}-team-pass.png`,{type:"image/png"});
  try{ await navigator.clipboard.writeText(msg) }catch{}
  if(navigator.canShare?.({files:[file]})){
    try{ await navigator.share({files:[file], text:msg, title:`${x.name} · team pass`}); toast("Sent ✓ If WhatsApp dropped the words, paste them: the message is copied."); return }
    catch(e){ if(e?.name==="AbortError") return } }
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=file.name; document.body.append(a); a.click(); a.remove();
  toast("Pass picture saved and message copied. Attach the picture in WhatsApp and paste the message.");
}
/* ---------- automatic emails: the organiser's own Gmail sends each confirmed team its confirmation, code and QR (tourney/mailer.gs) ---------- */
const DSF_ORG = "info@dropshotfolks.co.uk";
function mailPanel(t){
  const on=!!S.mail?.url, ts=teamsOf(t).filter(x=>x.status==="confirmed"&&S.codes[x.id]), todo=ts.filter(x=>!S.codes[x.id].mailedAt&&S.contacts[x.id]?.email), none=ts.filter(x=>!S.contacts[x.id]?.email);
  return `<details id="mailset" class="mailset ${on?"on":""}"${on?"":" open"}><summary>📧 Automatic emails · <b>${on?"On ✓":"Off"}</b>${on?` <span class="muted">· confirmed teams get their code and QR by email as soon as you press Confirm</span>`:` <span class="muted">· set up once, free, from your Gmail</span>`}</summary>
    ${on?`<div class="row">${todo.length?`<button class="btn small primary" data-mailall="1"${S.mailing?" disabled":""}>📧 Email ${todo.length} team${todo.length>1?"s":""} not emailed yet</button>`:`<span class="muted">Every confirmed team with an email has been emailed.</span>`}<button class="btn small ghost" data-mailtest="1">Send test email</button></div>
      ${none.length?`<p class="muted">No email saved for: ${none.map(x=>esc(x.name)).join(", ")}. Use 📥 Import spreadsheet or ✏️ Edit to add one.</p>`:""}`:""}
    <ol class="mailsteps">
      <li>Sign in to Google as <b>${DSF_ORG}</b>, then open <a href="https://script.google.com/home/projects/create" target="_blank" rel="noopener">script.google.com → New project</a>.</li>
      <li><button class="btn small" data-copyscript="1">📋 Copy the script</button> Delete what's in the editor, paste, then press 💾 Save.</li>
      <li>Click <b>Deploy → New deployment</b>. Click ⚙️ next to "Select type" and choose <b>Web app</b>. Set <b>Execute as: Me</b> and <b>Who has access: Anyone</b>. Click <b>Deploy</b>.</li>
      <li>Click <b>Authorise access</b> and choose your account. If Google says "Google hasn't verified this app", click <b>Advanced → Go to … (unsafe)</b> → <b>Allow</b>. It's your own script.</li>
      <li>Copy the <b>Web app URL</b> and paste it here:
        <div class="row"><input id="mail-url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(S.mail?.url||"")}" style="flex:1;min-width:220px"><button class="btn small primary" data-mailsave="1">Save &amp; send test email</button></div></li>
      <li>Check your inbox for <b>"Dropshot Folks emails are working ✓"</b>. If it's there, you're done.</li>
    </ol></details>`;
}
async function mailPost(body){
  if(!S.mail?.url) return {ok:false, error:"Automatic emails aren't set up"};
  try{ const token=await auth.currentUser.getIdToken();
    const r=await fetch(S.mail.url,{method:"POST", body:JSON.stringify({...body, token})}); return await r.json() }
  catch(e){ return {ok:false, error:"Couldn't reach the email script. Check the Web app URL and that access is set to Anyone."} }
}
const b64 = async blob => { const u=new Uint8Array(await blob.arrayBuffer()); let s=""; for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s) };
function mailHtml(t, x, code){
  const url=passUrl(t,code), wa=t.wa||WA_GROUP, P="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;";
  return `<div style="background:#F3E9D9;padding:24px 12px;${P}"><div style="max-width:560px;margin:0 auto;background:#FCF7EE;border-radius:18px;overflow:hidden;border:1px solid #DFCDAE">
  <div style="background:#7A2331;color:#fff;padding:22px 24px;text-align:center"><div style="font-size:22px;font-weight:800;letter-spacing:.04em">DROPSHOT FOLKS</div><div style="color:#EBD9BA;font-size:15px;margin-top:4px">${esc(t.name||"Tournament")} · ${esc(fmtDate(t.date))}</div></div>
  <div style="padding:24px;color:#24100F;font-size:16px;line-height:1.5">
    <div style="font-size:22px;font-weight:800;margin-bottom:8px">✅ Registration confirmed</div>
    <p style="margin:0 0 12px">Hi ${esc(x.p1||"there")},</p>
    <p style="margin:0 0 12px">Great news: <b>${esc(x.name)}</b> is confirmed for <b>${esc(t.name||"the tournament")}</b> on <b>${esc(fmtDate(t.date))}</b>${t.venue?` at <b>${esc(t.venue)}</b>`:""}.</p>
    <p style="margin:0 0 6px">Players: ${esc(playersOf(x).join(" · "))}</p>
    <div style="text-align:center;margin:22px 0 8px"><div style="font-size:13px;color:#715250;text-transform:uppercase;letter-spacing:.12em">Your team code</div>
      <div style="display:inline-block;margin-top:6px;background:#EFE3CE;color:#7A2331;font:800 30px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.3em;padding:10px 18px;border-radius:12px">${esc(code)}</div></div>
    <p style="margin:12px 0;text-align:center">Use this code to see your fixtures on the tournament page.</p>
    <div style="text-align:center;margin:18px 0"><a href="${esc(url)}" style="display:inline-block;background:#7A2331;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">See your fixtures →</a></div>
    <div style="text-align:center;margin:22px 0 6px"><img src="cid:qr" alt="Team pass QR code" width="300" style="max-width:100%;border-radius:12px;border:1px solid #DFCDAE"></div>
    <p style="margin:6px 0 18px;text-align:center;color:#715250;font-size:14px">📱 Show this QR code at the Tournament Desk when you arrive to check in. It's also attached.</p>
    <p style="margin:0 0 12px">💬 Updates on the day go to the tournament WhatsApp group. If you haven't joined yet: <a href="${esc(wa)}" style="color:#7A2331">${esc(wa)}</a></p>
    <p style="margin:18px 0 0">See you on court! 🏸<br><b>Dropshot Folks</b></p></div></div></div>`;
}
async function mailTeam(t, x, quiet){
  const c=S.contacts[x.id]||{}, code=S.codes[x.id]?.code; if(!code){ if(!quiet) toast("No team code yet"); return false }
  if(!c.email){ if(!quiet) toast(`No email saved for ${x.name}`); return false }
  if(!quiet) toast(`Emailing ${x.name}…`);
  const png=await passPng(t,x,code);
  const r=await mailPost({to:c.email, cc:[c.email2,c.email3,c.email4].filter(Boolean), subject:`✅ ${x.name} is confirmed · ${t.name||"Tournament"} · team code ${code}`,
    text:confirmMsg(t,x), html:mailHtml(t,x,code), png:await b64(png), file:`${x.name.replace(/[^\w]+/g,"-")}-team-pass.png`});
  if(!r.ok){ toast(`Email to ${x.name} didn't send: ${r.error||"unknown error"}`); return false }
  const at=nowIso(); S.codes[x.id]={...S.codes[x.id], mailedAt:at, mailedTo:c.email};
  await db.collection("tcodes").doc(x.id).set({mailedAt:at, mailedTo:c.email},{merge:true}).catch(()=>{}); render();
  if(!quiet) toast(`Emailed ${x.name} ✓ (${c.email})`); return true;
}
async function mailAll(t){
  if(S.mailing) return; const todo=teamsOf(t).filter(x=>x.status==="confirmed"&&S.codes[x.id]&&!S.codes[x.id].mailedAt&&S.contacts[x.id]?.email); if(!todo.length){ toast("Nobody left to email"); return }
  S.mailing=true; render(); let n=0; for(const x of todo){ toast(`Emailing ${x.name} (${n+1}/${todo.length})…`); if(await mailTeam(t,x,true)) n++; else break }
  S.mailing=false; render(); toast(n===todo.length?`Emailed ${n} team${n>1?"s":""} ✓`:`Emailed ${n} of ${todo.length}. Check the message above and try again.`);
}
/* ---------- records: every tournament, team, contact, match and table in one spreadsheet (Excel download, or a Google Sheet kept up to date through mailer.gs) ---------- */
const when = s => s ? new Date(s).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "";
function buildRecords(){
  const ts=[...S.tourneys].sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))), plain=id=>id?tName(id):"";
  const tour=[["Tournament ID","Tournament","Date","Venue","Type","Categories","Teams","Confirmed","Matches played","Matches","Champions"]];
  const team=[["Tournament ID","Tournament","Date","Category","Team","Status","Group",...[1,2,3,4].flatMap(n=>[`Player ${n}`,`P${n} gender`,`P${n} level`,`P${n} phone`,`P${n} email`]),"Emergency contact","Emergency phone","Notes","WhatsApp group","Says paid","Paid as","Team code","Emailed","Checked in","Registered"]];
  const match=[["Tournament ID","Tournament","Date","Category","Stage","Group / round","Meeting","Discipline","Team A","Team B","Court","Time","Status","Score","Points A","Points B","Winner","Referee"]];
  const table=[["Tournament ID","Tournament","Category","Group","Position","Team","Played","Won","Lost","Points","Points for","Points against","Difference"]];
  ts.forEach(t=>{ const head=[t.id, t.name||"Tournament"], cs=cats(t).length?cats(t):[{id:"",name:""}];
    const finals=matchesOf(t).filter(m=>m.stage==="ko" && m.roundName==="Final"), champs=[...new Set(finals.map(m=>[m.cat,winnerTeam(m)]).filter(x=>x[1]).map(([c,w])=>`${cats(t).length>1?catName(t,c)+": ":""}${tName(w)}`))].join("; ");
    const ms=matchesOf(t).filter(m=>!m.bye);
    tour.push([...head, t.date||"", t.venue||"", isTeam(t)?"Team Cup":"Doubles", cats(t).map(c=>c.name).join(", "), teamsOf(t).length, teamsOf(t).filter(x=>x.status==="confirmed").length, ms.filter(m=>m.status==="done").length, ms.length, champs]);
    teamsOf(t).forEach(x=>{ const c=S.contacts[x.id]||{}, k=S.codes[x.id]||{}, G=Object.entries(t.groups?.[x.cat]||{}).find(([,ids])=>ids.includes(x.id))?.[0]||"";
      team.push([...head, t.date||"", catName(t,x.cat)||"", x.name||"", x.status==="confirmed"?"Confirmed":"Pending", G,
        ...[1,2,3,4].flatMap(n=>[x["p"+n]||"", c["g"+n]||"", c["lv"+n]||"", (n===1?c.phone:c["phone"+n])||"", (n===1?c.email:c["email"+n])||""]),
        c.emName||"", c.emPhone||"", c.notes||"", c.wa?"Yes":"", c.paid?"Yes":"", c.payName||"", k.code||"", k.mailedAt?`${when(k.mailedAt)}${k.mailedTo?` (${k.mailedTo})`:""}`:"", x.checkedIn?(when(x.checkedInAt)||"Yes"):"", when(x.createdAt)]) });
    ms.forEach(m=>{ const p=pts(m), A=sideTeam(m,"a"), B=sideTeam(m,"b");
      match.push([...head, t.date||"", catName(t,m.cat)||"", m.stage==="ko"?"Knockout":"Group", m.stage==="ko"?(m.roundName||""):`Group ${m.group||""}`, m.leg?`Match ${m.leg}`:"", m.disc?DISC[m.disc]:"",
        A?plain(A):sideLabel(m,"a"), B?plain(B):sideLabel(m,"b"), m.pcourt||m.court||"", m.ptime||"", m.status==="done"?"Played":m.status==="live"?"Live":"To play", gamesTxt(m), m.games?.length?p.a:"", m.games?.length?p.b:"",
        m.status==="done"&&m.winner?plain(sideTeam(m,m.winner)):"", m.ref||""]) });
    cs.forEach(c=>Object.keys(t.groups?.[c.id]||{}).sort().forEach(G=>standings(t,c.id,G).forEach((r,i)=>
      table.push([...head, c.name||"", `Group ${G}`, i+1, plain(r.id), r.p, r.w, r.l, r.pts??r.w, r.pf, r.pa, r.pf-r.pa]))));
  });
  return {tids:ts.map(t=>t.id), tabs:[{name:"Tournaments",rows:tour},{name:"Teams",rows:team},{name:"Matches",rows:match},{name:"Standings",rows:table}]};
}
// a small .xlsx writer: plain zip (no compression) of the spreadsheet XML parts
const CRC = (()=>{ const tb=new Uint32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; tb[n]=c>>>0 } return u=>{ let c=0xFFFFFFFF; for(let i=0;i<u.length;i++) c=tb[(c^u[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0 } })();
function zip(files){
  const enc=new TextEncoder(), parts=[], cd=[]; let off=0;
  const u16=n=>[n&255,(n>>>8)&255], u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
  files.forEach(([name,txt])=>{ const nm=enc.encode(name), data=enc.encode(txt), crc=CRC(data), same=[...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(data.length),...u32(data.length),...u16(nm.length),...u16(0)];
    const local=new Uint8Array([...u32(0x04034b50),...same]); parts.push(local,nm,data);
    cd.push(new Uint8Array([...u32(0x02014b50),...u16(20),...same,...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nm); off+=local.length+nm.length+data.length });
  const size=cd.reduce((s,x)=>s+x.length,0);
  return new Blob([...parts,...cd,new Uint8Array([...u32(0x06054b50),0,0,0,0,...u16(files.length),...u16(files.length),...u32(size),...u32(off),0,0])],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}
function xlsx(tabs){
  const x=s=>String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const col=i=>{ let s=""; for(i++;i>0;i=Math.floor((i-1)/26)) s=String.fromCharCode(65+(i-1)%26)+s; return s };
  const sheet=rows=>{ const w=Math.max(1,...rows.map(r=>r.length)), wd=Array.from({length:w},(_,i)=>Math.min(45,Math.max(8,...rows.map(r=>String(r[i]??"").length+2))));
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${wd.map((v,i)=>`<col min="${i+1}" max="${i+1}" width="${v}" customWidth="1"/>`).join("")}</cols><sheetData>${rows.map((r,ri)=>`<row r="${ri+1}">${r.map((v,ci)=>v==null||v===""?"":`<c r="${col(ci)}${ri+1}"${ri?"":' s="1"'}${typeof v==="number"&&isFinite(v)?`><v>${v}</v>`:` t="inlineStr"><is><t xml:space="preserve">${x(v)}</t></is>`}</c>`).join("")}</row>`).join("")}</sheetData>${rows.length>1?`<autoFilter ref="A1:${col(w-1)}${rows.length}"/>`:""}</worksheet>` };
  const S_="http://schemas.openxmlformats.org", R=`${S_}/officeDocument/2006/relationships`;
  return zip([
    ["[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="${S_}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${tabs.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`],
    ["_rels/.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${S_}/package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ["xl/workbook.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="${S_}/spreadsheetml/2006/main" xmlns:r="${R}"><sheets>${tabs.map((s,i)=>`<sheet name="${x(String(s.name).replace(/[\[\]:*?\/\\]/g," ").slice(0,31))}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join("")}</sheets>${tabs.some(s=>s.rows.length>1)?`<definedNames>${tabs.map((s,i)=>s.rows.length>1?`<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${x(String(s.name).replace(/'/g,"''"))}'!$A$1:$${col(Math.max(1,...s.rows.map(r=>r.length))-1)}$${s.rows.length}</definedName>`:"").join("")}</definedNames>`:""}</workbook>`],
    ["xl/_rels/workbook.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${S_}/package/2006/relationships">${tabs.map((_,i)=>`<Relationship Id="rId${i+1}" Type="${R}/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join("")}<Relationship Id="rId${tabs.length+1}" Type="${R}/styles" Target="styles.xml"/></Relationships>`],
    ["xl/styles.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="${S_}/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3E9D9"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
    ...tabs.map((s,i)=>[`xl/worksheets/sheet${i+1}.xml`, sheet(s.rows)])]);
}
function downloadRecords(){
  const a=document.createElement("a"); a.href=URL.createObjectURL(xlsx(buildRecords().tabs)); a.download=`dropshot-folks-records-${new Date().toISOString().slice(0,10)}.xlsx`;
  document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),5000); toast("Excel file downloaded ✓");
}
// the Google Sheet lives in the organiser's Google Drive; tournaments deleted here stay in it
async function syncSheet(quiet){
  if(!S.mail?.url){ if(!quiet) toast("Set up 📧 Automatic emails first: the Google Sheet uses the same script"); return false }
  if(S.syncing) return false; S.syncing=true; if(!quiet){ toast("Updating the Google Sheet…"); render() }
  const rec=buildRecords(), sig=JSON.stringify(rec), r=await mailPost({sheet:rec}); S.syncing=false;
  if(r.ok && r.url){ S.sheetSig=sig; S.mail={...S.mail, sheetUrl:r.url, sheetAt:r.at||nowIso()};
    await db.collection("config").doc("mail").set({sheetUrl:r.url, sheetAt:r.at||nowIso()},{merge:true}).catch(()=>{}); render();
    if(!quiet) toast("Google Sheet updated ✓"); return true }
  render(); if(!quiet) toast(r.error==="No valid email for this team."?"Your Google script is the old version. Follow the 3 update steps under 📊 Records.":`Google Sheet didn't update: ${r.error||"unknown error"}`); return false;
}
// while the organiser has the page open, keep the sheet in step (only when something changed)
setInterval(()=>{ if(S.isAdmin && S.loaded && S.mail?.url && S.mail?.sheetUrl && !S.syncing && !document.hidden && JSON.stringify(buildRecords())!==S.sheetSig) syncSheet(true) }, 120000);
function recordsPanel(){
  const u=S.mail?.sheetUrl;
  return `<details class="mailset recset ${u?"on":""}"><summary>📊 Records spreadsheet${u?` · <b>Google Sheet ✓</b> <span class="muted">· updated ${esc(when(S.mail.sheetAt))}</span>`:` <span class="muted">· every team, contact, match and result, kept for the future</span>`}</summary>
    <div class="row">${u?`<a class="btn small primary" href="${esc(u)}" target="_blank" rel="noopener">📊 Open Google Sheet</a>`:""}<button class="btn small ${u?"":"primary"}" data-sheetsync="1"${S.syncing?" disabled":""}>${S.syncing?"Updating…":u?"🔄 Update now":"📊 Make my Google Sheet"}</button><button class="btn small" data-xlsx="1">⬇️ Download Excel</button>${u?`<button class="btn small ghost" data-copy="${esc(u)}">Copy link</button>`:""}</div>
    <p class="muted" style="font-size:.85rem">Four tabs: Tournaments, Teams (players, phones, emails, levels, codes, check-in), Matches (courts, times, scores, referees) and Standings. The Google Sheet is private to <b>${DSF_ORG}</b>, updates itself every couple of minutes while this page is open, and keeps tournaments even after you delete them here.</p>
    ${u?"":S.mail?.url?`<p class="muted" style="font-size:.85rem"><b>First time?</b> Your Google script needs the new version:</p><ol class="mailsteps"><li><button class="btn small" data-copyscript="1">📋 Copy the script</button> In <a href="https://script.google.com/home" target="_blank" rel="noopener">script.google.com</a> open your Dropshot Folks project, select all the code, paste over it, press 💾 Save.</li>
      <li>Pick <b>authorise</b> in the function menu at the top and press <b>▶ Run</b>. Allow access (Advanced → Go to … → Allow).</li>
      <li><b>Deploy → Manage deployments</b> → ✏️ → Version: <b>New version</b> → <b>Deploy</b>. The URL stays the same. Then press <b>📊 Make my Google Sheet</b> above.</li></ol>`:`<p class="muted" style="font-size:.85rem">For a Google Sheet link, set up 📧 Automatic emails above first (it uses the same script). The Excel download works now.</p>`}</details>`;
}
// organiser: what a scanned team code shows
function scanCard(){
  if(!S.scan || !(S.isAdmin || S.desk)) return ""; const p=S.scan, x=teamById(p.team), t=S.tourneys.find(y=>y.id===p.tid);
  if(!x) return `<section class="panel scancard"><h2>📷 Scanned code ${esc(p.code||"")}</h2><p>${p.err==="rules"?"Couldn't look the code up: the latest Firebase rules aren't published yet.":p.err==="net"?"Couldn't look the code up. Check the internet connection.":"No team found for this code. Check it was typed right, or find the team in the list below."}</p><button class="btn small ghost" data-scanx="1">Close</button></section>`;
  return `<section class="panel scancard ${x.checkedIn?"in":""}"><span class="lbl">📷 Scanned · ${esc(t?.name||"")}</span><h2>${esc(x.name)}</h2><p>${esc(playersOf(x).join(" · "))}</p>
    <div class="row">${x.status==="confirmed"?'<span class="chip st-confirmed">Confirmed</span>':'<span class="chip st-awaiting">Not confirmed</span>'}${x.checkedIn?`<span class="chip st-confirmed">✅ Checked in ${x.checkedInAt?esc(new Date(x.checkedInAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})):""}</span>`:""}</div>
    <div class="row">${x.checkedIn?`<button class="btn small ghost" data-checkin="${esc(x.id)}" data-v="0">Undo check-in</button>`:`<button class="btn primary" data-checkin="${esc(x.id)}" data-v="1">✅ Check in</button>`}${`<button class="btn small" data-scanqr="1">📷 Scan next</button>`}<button class="btn small ghost" data-scanx="1">Close</button></div></section>`;
}
// organiser: scan a team's QR code inside the app (Chrome / Android); on iPhone the camera app opens the link instead
async function scanQr(){
  const box=document.createElement("div"); box.className="readmodal"; box.innerHTML=`<div class="readcard scanbox"><h2>📷 Scan a team QR code</h2><p class="muted">Point the camera at the QR code on the team's phone or email.</p><video playsinline muted></video><button type="button" class="btn" data-scanstop="1">Cancel</button></div>`; document.body.append(box);
  let stream; try{ stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}) }catch{ box.remove(); toast("Camera not available. Allow camera access, or type the team code instead."); return }
  const v=box.querySelector("video"); v.srcObject=stream; await v.play().catch(()=>{});
  let det=null; if("BarcodeDetector" in window){ try{ det=new BarcodeDetector({formats:["qr_code"]}) }catch{} }
  if(!det && !window.jsQR) await new Promise(r=>{ const sc=document.createElement("script"); sc.src="jsqr.js?v=1"; sc.onload=r; sc.onerror=r; document.head.append(sc) });
  const cv=document.createElement("canvas"), cx=cv.getContext("2d",{willReadFrequently:true});
  const stop=()=>{ stream.getTracks().forEach(k=>k.stop()); box.remove() }; scanQr.stop=stop;
  const read=async()=>{ if(det){ const r=await det.detect(v); return r[0]?.rawValue }
    if(!window.jsQR || !v.videoWidth) return null; const k=Math.min(1,640/v.videoWidth); cv.width=Math.round(v.videoWidth*k); cv.height=Math.round(v.videoHeight*k);
    cx.drawImage(v,0,0,cv.width,cv.height); return window.jsQR(cx.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height,{inversionAttempts:"dontInvert"})?.data };
  (async function loop(){ if(!document.body.contains(box)) return;
    try{ const raw=await read(); if(raw){ const code=(/[?&]code=([A-Z0-9]+)/i.exec(raw)||[])[1]||raw; stop(); navigator.vibrate?.(80); await openScan(code); return } }catch{}
    setTimeout(loop,120) })();
}
async function openScan(code){
  code=String(code||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  let err=null; const d=await db.collection("tpasses").doc(code).get().catch(e=>{ err=e; return null });
  S.scan = d?.exists ? {...d.data(), code} : {code, err:err?.code==="permission-denied"?"rules":err?"net":null}; if(d?.exists){ S.tid=d.data().tid } render(); scrollTo({top:0,behavior:"smooth"});
}

/* ---------- check-in desk: organiser or volunteers with the check-in code scan team QR codes ---------- */
function viewCheckin(){
  const t=T(); if(!t) return noTourney();
  const head=S.isAdmin?`${orgBar(t)}${pickBar(t)}`:"";
  if(!canDesk(t)) return `${head}<section class="panel signgate"><div class="sg-ico">🎟</div><h2>Check-in desk</h2><p class="muted">Enter the check-in code from the organiser to check teams in on this phone.</p>
    <div class="row sg-mail"><input id="desk-code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="Check-in code" style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--mono)"><button class="btn primary" data-deskopen="1">Open</button></div></section>`;
  const ts=teamsOf(t).filter(x=>x.status==="confirmed"), done=ts.filter(x=>x.checkedIn).length, q=(S.ciFilter||"").toLowerCase();
  const list=ts.filter(x=>!q || [x.name,...playersOf(x)].join(" ").toLowerCase().includes(q)).sort((a,b)=>(a.checkedIn?1:0)-(b.checkedIn?1:0) || a.name.localeCompare(b.name));
  const access=S.isAdmin?(()=>{ const link=`https://dropshotfolks.co.uk/tourney/?t=${t.id}#checkin`, msg=`🎟 Check-in volunteer for ${t.name||"the tournament"}\nOpen: ${link}\n${S.deskCode?`Code: ${S.deskCode}\n`:""}Tap 📷 Scan team QR and point it at each team's QR code.`;
    return `<section class="panel"><h2>🙋 Volunteer access</h2><div class="row code-row"><span class="lbl">Check-in code</span>${S.deskCode?`<b class="code">${esc(S.deskCode)}</b><button class="btn small" data-copy="${esc(S.deskCode)}">Copy</button><button class="btn small ghost" data-deskcode="1">New code</button>`:`<button class="btn small primary" data-deskcode="1">Create code</button>`}</div>
      ${S.deskCode?`<div class="row"><button class="btn small" data-copy="${esc(link)}">Copy link</button><a class="btn small primary" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Send link & code on WhatsApp</a></div>`:""}
      <p class="muted" style="font-size:.85rem">Volunteers open the link and enter the code. They can only check teams in: no editing, no contact details. A new code locks out phones using the old one.</p></section>` })():"";
  return `${head}<section class="panel ci-top"><div class="row" style="justify-content:space-between"><div><span class="lbl">Check-in · ${esc(t.name||"")}</span><h2>${done} of ${ts.length} teams checked in</h2></div></div>
      <div class="ci-bar"><i style="width:${ts.length?Math.round(done*100/ts.length):0}%"></i></div>
      <button class="btn primary ci-scan" data-scanqr="1">📷 Scan team QR</button>
      <div class="row"><input id="ci-code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="Or type the team code" style="flex:1;text-transform:uppercase;letter-spacing:.15em;font-family:var(--mono)"><button class="btn" data-cicode="1">Find</button></div></section>
    <section class="panel"><div class="row" style="justify-content:space-between"><h2>Teams</h2><input id="ci-find" placeholder="Search team or player" value="${esc(S.ciFilter||"")}" style="max-width:240px"></div>
      <div class="ci-list">${list.map(x=>`<div class="ci-row ${x.checkedIn?"in":""}"><div><b>${esc(x.name)}</b><span class="muted">${esc(playersOf(x).join(" · "))}</span></div>
        ${x.checkedIn?`<span class="chip st-confirmed">✅ ${x.checkedInAt?esc(new Date(x.checkedInAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})):"In"}</span><button class="btn small ghost" data-checkin="${esc(x.id)}" data-v="0">Undo</button>`:`<button class="btn small primary" data-checkin="${esc(x.id)}" data-v="1">Check in</button>`}</div>`).join("")||`<div class="empty">No confirmed teams yet.</div>`}</div>
      ${S.desk&&!S.isAdmin?`<div class="row"><button class="btn small ghost" data-deskexit="1">Close check-in on this phone</button></div>`:""}</section>${access}`;
}
async function tryDeskUnlock(code){
  const t=T(); if(!t) return;
  try{ await ensureSignedIn(); await db.collection("tdesk").doc(auth.currentUser.uid).set({tid:t.id, code, at:nowIso()});
    S.desk={tid:t.id, code}; render(); toast("Check-in is open on this phone ✓") }
  catch(e){ toast(e?.code==="permission-denied"?"That code doesn't match":"Couldn't check the code") }
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
    const live = S.tab==="ref" && matchesOf(T()).some(m=>m.status==="live"), typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||"");
    if(live || typing){ if(!checkVersion.told){ checkVersion.told=true; toast("A new version of the page is ready. It will load when you're between matches.") } return }
    freshLoad(v) }catch{}
}
// load the new version past the browser's saved copy (a new address can't come from the cache)
function freshLoad(v){
  try{ if(sessionStorage.getItem("dsf:tried")===v) return; sessionStorage.setItem("dsf:tried",v) }catch{}
  const q=new URLSearchParams(location.search); q.set("v",v); location.replace(location.pathname+"?"+q.toString()+location.hash);
}
setTimeout(checkVersion, 4000); setInterval(checkVersion, 120000);

/* ---------- start ---------- */
(async function start(){
  render();
  if(!window.FIREBASE_CONFIG?.apiKey){ $("#main").innerHTML=`<section class="panel"><div class="empty">Firebase isn't configured.</div></section>`; return }
  firebase.initializeApp(window.FIREBASE_CONFIG); db=firebase.firestore(); auth=firebase.auth();
  if(auth.isSignInWithEmailLink(location.href)){ const em=ls.get("dsf:linkemail",null) || prompt("Confirm your email to finish signing in");
    if(em) try{ await auth.signInWithEmailLink(em, location.href); ls.set("dsf:linkemail",null); S.tab="teams"; setTimeout(()=>toast(`Signed in as ${em}`),800) }catch{ setTimeout(()=>toast("That sign-in link has expired. Ask for a new one."),800) }
    history.replaceState(null,"",location.pathname+(new URLSearchParams(location.search).get("t")?`?t=${new URLSearchParams(location.search).get("t")}`:"")) }
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
    db.collection("tunlocks").onSnapshot(sn=>{ S.refs=sn.docs.map(d=>({id:d.id,...d.data()})); render() },()=>{});
    db.collection("config").doc("mail").onSnapshot(d=>{ S.mail=d.exists&&d.data().url?d.data():null; render() },()=>{});
    listen("tcontacts", d=>{ S.contacts=Object.fromEntries(d.map(x=>[x.id,x])); render() });
    db.collection("tcodes").onSnapshot(sn=>{ S.codes=Object.fromEntries(sn.docs.map(d=>[d.id,d.data()])); const first=!S.codesLoaded; S.codesLoaded=true; render();
      if(first) setTimeout(async()=>{ for(const t of S.tourneys) await ensureCodes(t) },2500); S.rulesOld=false },e=>{ if(e?.code==="permission-denied"){ S.rulesOld=true; render() } });
    const go=()=>{ if(S.loaded) autoSetup(); else setTimeout(go,300) }; setTimeout(go,1200);
    const watchSecret=()=>{ const t=T(); if(t) db.collection("tsecrets").doc(t.id).get().then(d=>{ S.secret=d.exists?d.data().code||null:null; S.deskCode=d.exists?d.data().desk||null:null; render() }).catch(()=>{}) };
    setTimeout(watchSecret,800);
  }
  const qcode=new URLSearchParams(location.search).get("code");
  if(qcode){ const wait=()=>new Promise(r=>{ const k=()=>S.loaded?r():setTimeout(k,200); k() }); await wait();
    const u=await new Promise(r=>{ const off=auth.onAuthStateChanged(x=>{ off(); r(x) }) });
    if(!S.isAdmin && u){ const d=await db.collection("tdesk").doc(u.uid).get().catch(()=>null); if(d?.exists) S.desk=d.data() }
    if(S.isAdmin || S.desk){ S.tab="checkin"; openScan(qcode) }
    else { const p=await useCode(qcode,true); S.tab="fix"; render(); if(p) toast(`Welcome, ${teamById(p.team)?.name||p.name}! 🏸`); else toast("That team code isn't right") ; history.replaceState(null,"",location.pathname+(p?`?t=${p.tid}`:"")) } }
  auth.onAuthStateChanged(u=>{ if(u){ db.collection("tunlocks").doc(u.uid).onSnapshot(d=>{ S.unlock=d.exists?d.data():null; render() },()=>{});
    db.collection("tdesk").doc(u.uid).onSnapshot(d=>{ S.desk=d.exists?d.data():null; render() },()=>{}) } });
})();
