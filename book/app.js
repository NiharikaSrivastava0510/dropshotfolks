/* ---------- Club rules ---------- */
const LEVELS = [
  {code:"E", key:"E", name:"Beginner", court:null, desc:"Still learning to hold the racket, can't yet clear from one end of the court to the other, or doesn't know the doubles rules yet. Not for Thursday sessions: start with coaching or a beginners' session."},
  {code:"D-", key:"Dm", name:"Lower Intermediate", court:1, desc:"Social player. Clears from one end to the other, smashes from the front, tries drops, knows the basic serves and how doubles works, but medium-paced games are still a stretch."},
  {code:"D+", key:"Dp", name:"Intermediate", court:2, desc:"Rallies of 6–10 shots, knows doubles rotation, plays clears, smashes and net shots, and enjoys fast-paced badminton."},
  {code:"C-", key:"Cm", name:"Mid Intermediate", court:3, desc:"Fast-paced player. Hits smashes, keeps rallies of 10–15 shots, kills at the net, clears and smashes with only a few mistakes."},
  {code:"C+", key:"Cp", name:"High Intermediate (upper)", court:4, desc:"Plays tournaments regularly, knows every shot and makes hardly any mistakes."}
];
// Club rule: no beginners (E) on Thursday sessions, whatever the court setup says.
const NO_BEGINNER_DAYS = [4];   // 0 = Sunday … 4 = Thursday
const beginnersBarred = s => !!s?.date && NO_BEGINNER_DAYS.includes(new Date(s.date+"T12:00:00").getDay());
const lvByCode = c => LEVELS.find(l=>l.code===c);
const lvByCourt = n => LEVELS.find(l=>l.court===n);
const CLR = {1:"var(--d1)",2:"var(--d2)",3:"var(--c1)",4:"var(--c2)"};
const COACHING = "https://dropshotfolks.co.uk/#coaching";
const PER_COURT = 7, GAME_MINS = 12;
// Level quiz: "about you" answers score 0 (beginner) to 4 (upper high intermediate);
// quick-quiz questions have one right answer and show why.
const QUIZ = [
  {e:"⏳", img:"hero-hall", call:"Pre-match chat", k:"years", q:"First things first: how long have you been playing badminton?", ic:["🐣","🌱","🌿","🌳","🦸"], a:["I'm just starting out","Less than a year","1–3 years","3–5 years","5+ years, it's my life"]},
  {e:"🤝", img:"ready-stance", call:"Warm-up", k:"grip", q:"Pick up your racket. How do you hold it?", ic:["🍳","🤔","🤝","🔄","🪄"], a:["Like a frying pan, or not sure","I'm still learning the proper grip","Handshake grip, comfortably","I switch between forehand and backhand grips","I change grips without even thinking"]},
  {e:"📆", img:"court-wide-2", call:"Warm-up", k:"week", q:"How many times a week do you get on court?", ic:["😴","1️⃣","2️⃣","3️⃣","🏠"], a:["Hardly ever, maybe once a month","About once a week","Twice a week","Three times a week","Four or more, I basically live here"]},
  {e:"🏸", img:"service-ready", call:"Rally 1 · the serve", tag:"serve", q:"Love all, play! You're serving to start a doubles rally. Which serve do most players use?", a:["High serve to the back line","Smash it down","Low serve, just over the net","Drive it at their body"], correct:2, why:"The low serve stays tight to the net so the receiver can't attack it."},
  {e:"🌈", img:"court-wide-1", call:"Warm-up", k:"clear", q:"Can you clear the shuttle from your back line all the way to the other end?", ic:["🙈","🤏","👍","🚀","🎯"], a:["Not yet, it lands mid-court","Sometimes, if I really go for it","Yes, most of the time","Yes, high and deep every time","Yes, and I attack with flat clears too"]},
  {e:"📏", img:"service-ready", call:"Rally 2 · doubles rules", tag:"rules", q:"Doubles serve: where must it land to be in?", a:["Anywhere on the other side","In the box straight in front of you","In the box diagonally opposite, not past the doubles back service line","Only between the back tramlines"], correct:2, why:"Diagonally opposite, and in doubles the serve is short at the back: the inner back line."},
  {e:"🔁", img:"court-lunge", call:"Warm-up", k:"rally", q:"How long can your rallies go with players at your level?", ic:["🐣","🙂","💪","🔥","🦸"], a:["I'm just learning to hit the shuttle","A few shots, under 6","6–10 shots","10–15 shots","15+, and I build the point to win it"]},
  {e:"🦘", img:"jump-reach", call:"Rally 3 · read the receiver", tag:"serve", q:"The receiver is creeping right up to the front line, ready to pounce on your low serve. What do you serve?", a:["A flick serve over their head","The same low serve, just faster","Serve it into the net","Wait for them to step back"], correct:0, why:"A flick serve flies just over their reach to the back of the court."},
  {e:"⚡", img:"backhand-defence", call:"Warm-up", k:"pace", q:"What pace of game feels comfortable?", ic:["🐢","🚶","🏃","🏎️","🚀"], a:["Slow and gentle","Social pace; medium-paced games are a stretch","Medium to fast","Fast-paced rallies, all game","Tournament pace"]},
  {e:"👀", img:"kneel-celebrate", call:"Rally 4 · spot the shot", tag:"shot", q:"Coach jumps at the back and hits it fast and steep, straight down at you. What shot was that?", a:["Clear","Lift","Smash","Net shot"], correct:2, why:"That's the smash: the big attacking shot to win the point."},
  {e:"💥", img:"backhand-defence", call:"Warm-up", k:"shots", q:"Which shots do you play on purpose?", ic:["🤷","➡️","🪶","💥","🎩"], a:["I don't know the different shots yet","Clears and front-court smashes","Clears, smashes, drops and net shots","All of those, plus drives and lifts under pressure","Every shot, including deception"]},
  {e:"🧑‍🏫", img:"net-high-five", call:"Change of ends", k:"coach", q:"Ever had a coach in your corner?", ic:["🙅","👋","📚","📈","🎓"], a:["Never, self-taught all the way","A taster session or two","Some lessons or group classes","Regular coaching for a while","Years of coaching or squad training"]},
  {e:"🪶", img:"court-three", call:"Rally 5 · spot the shot", tag:"shot", q:"Coach is at the back again, but this time it's soft and drops just over the net. What shot was that?", a:["Drive","Drop shot","Clear","Smash"], correct:1, why:"The drop shot pulls you forward and opens up the back of your court."},
  {e:"🥅", img:"net-high-five", call:"Warm-up", k:"net", q:"The shuttle pops up just above the net on your side. You…", ic:["🙈","↩️","👇","🔨","🎩"], a:["Duck!","Push it back over","Tap it down sometimes","Kill it, most of the time","Kill it or play a tight net shot, my choice"]},
  {e:"🔢", img:"group-high-five", call:"Rally 6 · scoring", tag:"rules", q:"How does a game of badminton finish?", a:["First to 15","First to 21, win by 2, and 30 wins if it's still close","First to 11, three times","First to 25"], correct:1, why:"21 points, you need a 2-point lead, and at 29–all the next point (30) wins."},
  {e:"🎯", img:"court-three", call:"Warm-up", k:"errors", q:"Be honest: how often do you make unforced errors?", ic:["😅","🙃","🙂","😎","🧊"], a:["Most rallies","Quite often","Sometimes","Only a few","Hardly ever"]},
  {e:"👯", img:"group-high-five", call:"Warm-up", k:"doubles", q:"How do you play doubles?", ic:["🙋","🧭","🔄","🛡️","♟️"], a:["I haven't played doubles","I'm still working out where to stand","Front-and-back and side-by-side, and we rotate","We rotate smoothly and cover every gap","We play tactical formations"]},
  {e:"🧭", img:"court-wide-1", call:"Match point · positions", tag:"court", q:"Your side is attacking. Where do you and your partner stand?", a:["Side by side","Both at the net","Both at the back","One at the front, one at the back"], correct:3, why:"Front-and-back when attacking, side-by-side when defending."},
  {e:"🏆", img:"kneel-celebrate", call:"Cool-down", k:"tour", q:"Tournaments: what's your story?", ic:["🙈","🎪","🤝","🏅","🥇"], a:["Never played one","Tried a fun one once","A few social tournaments","I play tournaments regularly","Regular competitive tournaments, medals included"]}
];
const packQuiz = ans => ({v:2, a:QUIZ.map((_,i)=>ans?.[i] ?? "").join(",")});
const knowCount = ans => QUIZ.filter((x,i)=>x.correct!=null && ans?.[i]===x.correct).length;
const qv = (ans,k) => ans[QUIZ.findIndex(x=>x.k===k)];
const rulesRight = ans => QUIZ.some((x,i)=>x.tag==="rules" && ans[i]===x.correct);
function levelFrom(ans){
  if(QUIZ.some((_,i)=>ans?.[i]==null)) return null;
  const self = QUIZ.map((x,i)=>x.correct==null ? ans[i] : null).filter(v=>v!=null);
  const nKnow = QUIZ.filter(x=>x.correct!=null).length, know = knowCount(ans);
  // E: can't hold the racket yet, can't clear end to end, or doesn't know the doubles rules
  if(qv(ans,"grip")===0 || qv(ans,"clear")===0 || !rulesRight(ans)) return "E";
  // "about you" answers scaled to 0–20 and quiz to 0–5, so the number of questions doesn't shift levels
  const t = self.reduce((a,b)=>a+b,0)*20/(self.length*4) + know*5/nKnow;
  if(t<=4 || self.filter(v=>v===0).length >= Math.ceil(self.length*.6)) return "E";
  const order=["D-","D+","C-","C+"];
  let lv = t<=9?"D-":t<=15?"D+":t<=20?"C-":"C+";
  // each level also needs what defines it
  const can = {
    "C+": qv(ans,"tour")>=3 && qv(ans,"errors")>=3 && know>=nKnow-1,
    "C-": qv(ans,"rally")>=3 && qv(ans,"pace")>=3 && qv(ans,"net")>=3 && qv(ans,"errors")>=2 && know>=nKnow-2,
    "D+": qv(ans,"rally")>=2 && qv(ans,"pace")>=2 && qv(ans,"doubles")>=2 && qv(ans,"shots")>=2 && know>=Math.ceil(nKnow/2)
  };
  while(lv!=="D-" && !can[lv]) lv=order[order.indexOf(lv)-1];
  return lv;
}
const STATUS = {
  awaiting:{label:"Awaiting payment", cls:"st-awaiting"},
  paid:{label:"Payment sent · checking", cls:"st-paid"},
  confirmed:{label:"Confirmed", cls:"st-confirmed"},
  waitlist:{label:"Waiting list", cls:"st-waitlist"},
  cancelled:{label:"Cancelled", cls:"st-cancelled"}
};
const ACTIVE = ["awaiting","paid","confirmed"];
const DEFAULT_CFG = {club:"Dropshot Folks", venue:"", address:"", price:"", bankName:"", accountName:"", sortCode:"", accountNumber:"", payLink:"", orgName:"", orgPhone:"", orgEmail:"", whatsapp:"", policy:"Pay within 24 hours to keep your place. Cancel at least 24 hours before for a refund."};

/* ---------- helpers ---------- */
const LOCAL = location.protocol==="file:" || ["localhost","127.0.0.1"].includes(location.hostname);
const ADMINS = (window.DSF_ADMINS||[]).map(x=>String(x).toLowerCase());
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const emailKey = s => String(s||"").trim().toLowerCase().replace(/[^a-z0-9_\-.~:@+]/g,"").slice(0,190);
const validEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||"").trim());
const nowIso = () => new Date().toISOString();
const fmtDate = d => new Date(d+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
const fmtLong = d => new Date(d+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
const fmtStamp = iso => new Date(iso).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const hhmm = d => d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
const sessStart = s => new Date(`${s.date}T${s.start||"00:00"}:00`);
const sessEnd = s => new Date(`${s.date}T${s.end||s.start||"23:59"}:00`);
const lvChip = code => { const l=lvByCode(code); return l?`<span class="lv lv-${l.key}">${esc(l.code)}</span>`:"" };
const stChip = st => `<span class="chip ${STATUS[st]?.cls||""}">${esc(STATUS[st]?.label||st)}</span>`;
const payRef = (name, s) => (`DSF ${String(name||"").split(/\s+/)[0].toUpperCase().replace(/[^A-Z]/g,"").slice(0,8)} ${s.date.slice(8,10)}${s.date.slice(5,7)}`).slice(0,18);
const venueOf = s => ({venue: s?.venue || S.cfg.venue, address: s?.address || S.cfg.address});
const mapsFor = v => "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(v.address||v.venue);
const ls = { get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}} };
function toast(msg){const t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3000)}
async function copyText(text, fallbackEl){
  try{await navigator.clipboard.writeText(text);toast("Copied")}
  catch{ if(fallbackEl){fallbackEl.hidden=false;fallbackEl.value=text;fallbackEl.select()} toast("Select the text and copy it") }
}
function hue(str){ let h=0; for(const ch of String(str)) h=(h*31+ch.charCodeAt(0))%360; return h }
function avatar(id, name, cls=""){
  const img = S.photos[id];
  if(typeof img==="string" && /^data:image\/(jpeg|png|webp);base64,/.test(img)) return `<img class="av ${cls}" src="${esc(img)}" alt="">`;
  const ini = String(name||"?").replace(/\(.*\)/,"").trim().split(/\s+/).map(w=>w[0]||"").join("").slice(0,2).toUpperCase();
  return `<span class="av ${cls}" style="background:hsl(${hue(id)} 38% 38%)" aria-hidden="true">${esc(ini)}</span>`;
}
function toThumb(file){
  return new Promise((res,rej)=>{
    const img=new Image();
    img.onload=()=>{ const n=160, c=document.createElement("canvas"); c.width=c.height=n;
      const k=Math.max(n/img.width,n/img.height), w=img.width*k, h=img.height*k;
      c.getContext("2d").drawImage(img,(n-w)/2,(n-h)/2,w,h); URL.revokeObjectURL(img.src); res(c.toDataURL("image/jpeg",.82)) };
    img.onerror=()=>rej(new Error("bad image")); img.src=URL.createObjectURL(file);
  });
}

/* ---------- storage: shared db when available, this browser otherwise ---------- */
const Store = {
  mode:"local", db:null, listeners:{},
  async init(){
    if(!window.FIREBASE_CONFIG?.apiKey) return;
    try{ firebase.initializeApp(window.FIREBASE_CONFIG); this.db=firebase.firestore(); this.mode="db"
      // local testing only: point at the Firebase emulators
      if(window.FIREBASE_EMULATOR){ firebase.auth().useEmulator("http://127.0.0.1:9099"); this.db.useEmulator("127.0.0.1",8080) } }catch(e){ console.error(e) }
  },
  listen(coll, cb){
    if(this.mode==="db"){
      return this.db.collection(coll).onSnapshot(s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))), e=>{ if(e.code!=="unavailable") toast("Live updates stopped. Reload the page.") });
    }
    (this.listeners[coll] ||= []).push(cb);
    cb(this._local(coll));
    return ()=>{};
  },
  _local(coll){ const o=ls.get("dsf:"+coll,{}); return Object.entries(o).map(([id,v])=>({id,...v})) },
  async set(coll,id,data){
    if(this.mode==="db"){ await this.db.collection(coll).doc(id).set(data); return }
    const o=ls.get("dsf:"+coll,{}); o[id]=data; ls.set("dsf:"+coll,o); (this.listeners[coll]||[]).forEach(f=>f(this._local(coll)));
  },
  async del(coll,id){
    if(this.mode==="db"){ await this.db.collection(coll).doc(id).delete(); return }
    const o=ls.get("dsf:"+coll,{}); delete o[id]; ls.set("dsf:"+coll,o); (this.listeners[coll]||[]).forEach(f=>f(this._local(coll)));
  }
};
async function save(coll,id,data,okMsg){
  try{ await Store.set(coll,id,data); if(okMsg) toast(okMsg); return true }
  catch(e){
    if(e?.code==="invalid_argument"||e?.code==="permission-denied") toast("You don't have permission to do that. Sign in again or contact the organiser.");
    else if(e?.code==="quota_exceeded") toast("Booking list is full. Contact the organiser.");
    else toast("Couldn't save. Check your connection and try again.");
    return false;
  }
}

/* ---------- state ---------- */
const TABS = {
  player:[["book","Book a session"],["live","Live courts"],["mine","My bookings"],["court","Session view"],["level","Level guide"],["venue","Venue & contact"]],
  organiser:[["o-overview","Overview"],["o-sessions","Sessions & bookings"],["live","Live courts"],["o-players","Players"],["o-club","Club details"]]
};
const S = {
  view: ls.get("dsf:view","player"),
  tab: ls.get("dsf:kiosk",null) ? "court" : ls.get("dsf:tab","book"),
  cfg: {...DEFAULT_CFG},
  sessions: [], bookings: [], players: [], photos: {},
  me: null, uid: null, isAdmin:false, loaded:false,
  quiz: {},                         // level-guide self-check
  reg: {ans:{}, photo:null},        // registration questions and photo
  gq: {}, guests: [],               // guest questions and guests waiting to be booked
  liveSess: null, result: null, liveKey: "",
  picks: new Set(),                 // sessions ticked but not booked yet
  qpos: {}, qfb: {}, fx: ls.get("dsf:fx", true),                // level quiz: card on screen and last answer feedback, per quiz
  rotEdit: {}, pedit: null,         // organiser: game being edited per court, player being edited
  kiosk: ls.get("dsf:kiosk", null), // session this device has open in session view
  unlock: null, secrets: {}         // this device's unlock; organiser: session codes
};
const meP = () => S.players.find(p=>p.id===S.me) || null;
const upcoming = () => S.sessions.filter(s=>sessEnd(s) >= new Date()).sort((a,b)=>sessStart(a)-sessStart(b));
const activeIn = (sid, court) => S.bookings.filter(b=>b.sessionId===sid && b.court===court && ACTIVE.includes(b.status));
const cap = (s,court) => { const v = Number(s.capacity?.[court] ?? s.capacity ?? PER_COURT); return Number.isFinite(v) ? v : PER_COURT };
const courtsOf = s => [1,2,3,4].filter(c => cap(s,c) > 0);
// each session can name its courts and choose which levels play on each (default: court n = level n)
const courtLevels = (s,c) => { const v=s?.courts?.[c]?.levels, l=Array.isArray(v) && v.length ? v : [lvByCourt(c).code];
  return beginnersBarred(s) ? l.filter(x=>x!=="E") : l };
const courtName = (s,c) => s?.courts?.[c]?.label || lvByCourt(c).name;
const courtChips = (s,c) => courtLevels(s,c).map(lvChip).join(" ");
// a player only ever goes on a court that includes their level: the first one with space, else the first one (waiting list)
const courtFor = (s,level) => { const cs=courtsOf(s).filter(c=>courtLevels(s,c).includes(level)); return cs.find(c=>activeIn(s.id,c).length<cap(s,c)) ?? cs[0] ?? null };
const myBookings = () => S.bookings.filter(b=>b.playerId===S.me || b.hostId===S.me);

/* ---------- rotation: same answer for everyone, worked out from the roster and the clock ---------- */
function rotInfo(s){
  // a session's rotation only runs on its own day, between its start and end times
  const startT = sessStart(s);
  const mins = Number(s.gameMins)||GAME_MINS, ms = mins*60e3, end = sessEnd(s), now = Date.now();
  const total = Math.max(1, Math.floor((end-startT)/ms));
  const idx = now<startT ? -1 : Math.min(total-1, Math.floor((now-startT)/ms));
  return {startT, mins, total, idx, live: now>=startT && now<end, done: now>=end, at:i=>new Date(startT.getTime()+i*ms)};
}
function courtRoster(s,c){ return S.bookings.filter(b=>b.sessionId===s.id && b.court===c && ACTIVE.includes(b.status) && !b.absent).sort((a,b)=>String(a.createdAt).localeCompare(b.createdAt)) }
function schedule(ids,total){
  const n=ids.length; if(n<4) return [];
  const played={}, last={}, pc={}, key=(a,b)=>a<b?a+"|"+b:b+"|"+a;
  ids.forEach(i=>{played[i]=0;last[i]=-1});
  const out=[];
  for(let g=0; g<total; g++){
    const four = ids.map((id,ix)=>({id,ix})).sort((x,y)=>played[x.id]-played[y.id] || last[x.id]-last[y.id] || ((x.ix-g)%n+n)%n-((y.ix-g)%n+n)%n).slice(0,4).map(o=>o.id);
    const [a,b,c,d]=four, opts=[[[a,b],[c,d]],[[a,c],[b,d]],[[a,d],[b,c]]];
    let best=opts[0], bs=1e9;
    opts.forEach(o=>{const sc=(pc[key(...o[0])]||0)+(pc[key(...o[1])]||0); if(sc<bs){bs=sc;best=o}});
    best.forEach(t=>pc[key(...t)]=(pc[key(...t)]||0)+1);
    four.forEach(i=>{played[i]++;last[i]=g});
    out.push({teams:best, sit:ids.filter(i=>!four.includes(i))});
  }
  return out;
}
function courtPlan(s,c){
  const roster=courtRoster(s,c), r=rotInfo(s), ids=roster.map(b=>b.playerId), ov=s.rot?.[c]||{};
  // organiser edits replace a game while all four players are still in the rotation
  const games=schedule(ids, r.total).map((g,i)=>{ const o=ov[i];
    if(!Array.isArray(o) || o.length!==4 || new Set(o).size!==4 || o.some(id=>!ids.includes(id))) return g;
    return {teams:[[o[0],o[1]],[o[2],o[3]]], sit:ids.filter(x=>!o.includes(x)), edited:true} });
  return {roster, r, games, names:Object.fromEntries(roster.map(b=>[b.playerId,b.name]))} }

/* ---------- Court 4 points ---------- */
// Winners of a scored Court 4 game each earn the winning margin in points.
// Points on every court. The winning margin is shared by the two winners (win 21–15: 3 points each);
// a game won at deuce (loser on 20 or more) is worth 1 point, so 0.5 each.
// 200 points: £2 off your next 2 sessions. 500 points: £4 off your next 3 sessions.
const POINTS_COURT = 4;   // court whose card shows the points leaderboard
const gamePts = x => (Math.min(x.sa,x.sb)>=20 ? 1 : Math.abs(x.sa-x.sb)) / 2;   // points per winner
const fmtPts = n => Number.isInteger(n) ? String(n) : n.toFixed(1);
const TIERS = [{at:200, off:2, n:2}, {at:500, off:4, n:3}];
function scoreOf(s,c,gi){ const x=s?.scores?.[c]?.[gi], ok=n=>Number.isInteger(n) && n>=0 && n<=30;
  return x && Array.isArray(x.a) && Array.isArray(x.b) && x.a.length===2 && x.b.length===2 && ok(x.sa) && ok(x.sb) ? x : null }
let ptsCache = null;
function pointsState(){
  if(ptsCache && ptsCache.sess===S.sessions && ptsCache.bk===S.bookings) return ptsCache.v;
  const pts={}, cross={}, off={};
  [...S.sessions].sort((a,b)=>sessStart(a)-sessStart(b)).forEach(s=>{
    [1,2,3,4].forEach(c=>Object.keys(s.scores?.[c]||{}).map(Number).sort((a,b)=>a-b).forEach(gi=>{
      const x=scoreOf(s,c,gi); if(!x || x.sa===x.sb) return;
      const m=gamePts(x);
      (x.sa>x.sb?x.a:x.b).forEach(id=>{ if(String(id).startsWith("guest-")) return;
        if(!S.bookings.some(b=>b.sessionId===s.id && b.playerId===id && b.status!=="cancelled")) return;
        const before=pts[id]||0; pts[id]=before+m;
        TIERS.forEach((t,ti)=>{ if(before<t.at && pts[id]>=t.at) (cross[id] ||= [])[ti]=sessStart(s).getTime() }) });
    }));
  });
  // each reward covers the player's next sessions booked after the one where they reached it
  Object.keys(cross).forEach(pid=>{
    const own=S.bookings.filter(b=>b.playerId===pid && !b.hostId && b.status!=="cancelled")
      .map(b=>({b,s:S.sessions.find(x=>x.id===b.sessionId)})).filter(x=>x.s).sort((a,b)=>sessStart(a.s)-sessStart(b.s));
    TIERS.forEach((t,ti)=>{ const at=cross[pid][ti]; if(at==null) return; let n=0;
      for(const x of own){ if(n>=t.n) break; if(sessStart(x.s).getTime()<=at || off[x.b.id]) continue; off[x.b.id]=t.off; n++ } });
  });
  const v={pts,cross,off}; ptsCache={sess:S.sessions, bk:S.bookings, v}; return v;
}
const canRun = s => (S.isAdmin && S.view==="organiser") || (!!s && S.kiosk===s.id && (Store.mode!=="db" || S.unlock?.sessionId===s.id));
const offChip = b => { const o=pointsState().off[b.id]; return o?` <span class="chip off">Points reward · £${o} off</span>`:"" };
function scoreForm(s,c,gi,sc,idp){
  return `<div class="scorein"><span class="lbl">Score</span><input type="number" min="0" max="30" inputmode="numeric" id="${idp}a-${esc(s.id)}-${c}-${gi}" value="${sc?sc.sa:""}" aria-label="Team A score"><span>–</span><input type="number" min="0" max="30" inputmode="numeric" id="${idp}b-${esc(s.id)}-${c}-${gi}" value="${sc?sc.sb:""}" aria-label="Team B score">
    <button class="btn small primary" data-score="${esc(s.id)}" data-c="${c}" data-gi="${gi}">${sc?"Update":"Save score"}</button>${sc?`<button class="btn small ghost danger" data-unscore="${esc(s.id)}" data-c="${c}" data-gi="${gi}">Clear</button>`:""}</div>`;
}
// Which game is on now: each court moves on as soon as its game's score is saved.
function courtNow(s,c,games,r){
  const done=Object.keys(s.scores?.[c]||{}).map(Number).filter(i=>scoreOf(s,c,i));
  return {cur: done.length ? Math.min(Math.max(...done)+1, Math.max(0,games.length-1)) : 0, byScore:true};
}
function gameBox(s,c,i,x,names,r,cur=0){
  const sc = scoreOf(s,c,i), teams = sc ? [sc.a,sc.b] : x.teams;
  const nm = id => names[id] ?? S.players.find(p=>p.id===id)?.name ?? "Player";
  const won = sc ? (sc.sa>sc.sb?0:1) : -1, now = r.live && i===cur && !sc;
  const side = (t,k) => `<div class="team ${won===k?"won":""}">${t.map(id=>`<div class="nm ${id===S.me?"me":""}">${avatar(id,nm(id),"sm")}<span>${esc(nm(id))}</span></div>`).join("")}</div>`;
  const mid = sc ? `<div class="sc">${sc.sa}–${sc.sb}<small>+${fmtPts(gamePts(sc))} pts each</small></div>` : `<div class="vs">vs</div>`;
  const org = canRun(s);
  return `<div class="game ${now?"now":""} ${sc?"done":""}">
    <div class="gh"><span class="lbl">Game ${i+1}</span>${sc?'<span class="chip st-confirmed">Finished</span>':now?'<span class="chip st-awaiting">On court</span>':""}${x.edited&&!sc?'<span class="chip st-paid">edited</span>':""}</div>
    <div class="teams">${side(teams[0],0)}${mid}${side(teams[1],1)}</div>
    ${x.sit.length && !sc ? `<div class="rest">Resting: ${x.sit.map(id=>esc(nm(id))).join(", ")}</div>` : ""}
    ${org ? scoreForm(s,c,i,sc,"g") : ""}
  </div>`;
}
function leaderboard(){
  const {pts}=pointsState(), name=id=>S.players.find(p=>p.id===id)?.name || S.bookings.find(b=>b.playerId===id)?.name || "Player";
  const top=Object.entries(pts).sort((a,b)=>b[1]-a[1]).slice(0,10);
  return `<details id="lb-${POINTS_COURT}"><summary>Points leaderboard</summary>
    <p class="muted" style="font-size:.85rem;margin-top:6px">Win a game on any court and you and your partner share the winning margin (21–15 = 3 points each; a deuce win = 0.5 each). ${TIERS.map(t=>`<b>${t.at} points</b>: £${t.off} off your next ${t.n} sessions`).join(" · ")}.</p>
    ${top.length?`<ol class="lb">${top.map(([id,n])=>`<li>${avatar(id,name(id),"sm")}<span>${esc(name(id))}</span><b>${fmtPts(n)}</b></li>`).join("")}</ol>`:`<div class="empty" style="margin-top:8px">No scores yet.</div>`}
  </details>`;
}
function pointsPanel(p){
  const {pts,cross,off}=pointsState(), n=pts[p.id]||0, next=TIERS.find(t=>n<t.at);
  const used=S.bookings.filter(b=>b.playerId===p.id && off[b.id]).map(b=>({b,s:S.sessions.find(x=>x.id===b.sessionId)})).filter(x=>x.s).sort((a,b)=>sessStart(a.s)-sessStart(b.s));
  return `<section class="panel"><div><h2>Your points</h2><p class="muted">Win a game on any court and you and your partner share the winning margin: win 21–15 and you each get 3. A game won at deuce is worth 0.5 each. Points are yours alone, whoever you partner.</p></div>
    <div class="pts"><div class="row" style="justify-content:space-between"><b style="font-family:var(--display);font-size:1.6rem">${fmtPts(n)} points</b><span class="muted">${next?`${fmtPts(next.at-n)} to go for £${next.off} off ${next.n} sessions`:"All rewards unlocked"}</span></div>
      <div class="meter"><i style="width:${Math.min(100,n/TIERS[TIERS.length-1].at*100)}%"></i></div>
      <div class="row" style="font-size:.85rem">${TIERS.map((t,ti)=>`<span class="chip ${cross[p.id]?.[ti]!=null?"off":"st-waitlist"}">${t.at} pts · £${t.off} off ${t.n} sessions${cross[p.id]?.[ti]!=null?" ✓":""}</span>`).join("")}</div></div>
    ${used.length?`<p style="font-size:.9rem">Discount applied to: ${used.map(({b,s})=>`${fmtDate(s.date)} (£${off[b.id]} off)`).join(", ")}. Book more sessions to use any rewards left.</p>`:cross[p.id]?`<p style="font-size:.9rem">You have a reward waiting. It comes off your next sessions automatically when you book.</p>`:""}
  </section>`;
}

/* ---------- "you're on" pop-ups ---------- */
let prevNow = null;
function checkAlerts(){
  const now={}, changed=[];
  S.sessions.filter(s=>rotInfo(s).live).forEach(s=>courtsOf(s).forEach(c=>{
    const {games,names,r}=courtPlan(s,c); if(!games.length) return;
    const {cur}=courtNow(s,c,games,r), k=s.id+"|"+c; now[k]=cur;
    if(prevNow && k in prevNow && prevNow[k]!==cur) changed.push({s,c,cur,games,names});
  }));
  const first=!prevNow; prevNow=now;
  if(!first && changed.length) showAlerts(changed);
}
function showAlerts(list){
  const team=(t,names)=>t.map(id=>`<span class="pl ${id===S.me?"me":""}">${avatar(id,names[id],"sm")}<span>${esc(names[id]||"Player")}</span></span>`).join("");
  const match=(g,names)=>`<div class="al-match"><div>${team(g.teams[0],names)}</div><i>vs</i><div>${team(g.teams[1],names)}</div></div>`;
  let mine="", host="";
  list.forEach(({s,c,cur,games,names})=>{
    const g=games[cur], nx=games[cur+1];
    if(g.teams.flat().includes(S.me)) mine+=`<div class="al-me now"><b>You're on now · Court ${c}</b>${match(g,names)}</div>`;
    else if(nx?.teams.flat().includes(S.me)) mine+=`<div class="al-me"><b>Get ready · you're next on Court ${c}</b>${match(nx,names)}</div>`;
    if(canRun(s)) host+=`<div class="al-court"><span class="lbl">Court ${c} · game ${cur+1} · on now</span>${match(g,names)}${nx?`<span class="lbl">Get ready · game ${cur+2}</span><p class="al-next">${nx.teams.map(t=>t.map(id=>esc(names[id]||"Player")).join(" & ")).join(" <i>vs</i> ")}</p>`:""}</div>`;
  });
  if(!mine && !host) return;
  const el=$("#alert"); if(!el) return;
  el.querySelector(".al-body").innerHTML = mine + host;
  el.hidden=false; try{ navigator.vibrate?.([200,100,200]) }catch{}
  clearTimeout(showAlerts.t); showAlerts.t=setTimeout(()=>{ el.hidden=true }, 25000);
}

/* ---------- little celebrations ---------- */
function burst(icons=["🏸","🎉","✨","🪶","🎊","🏆"]){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el=document.createElement("div"); el.className="burst"; el.setAttribute("aria-hidden","true");
  el.innerHTML=Array.from({length:28},(_,k)=>`<span style="left:${Math.random()*100}%;animation-delay:${(Math.random()*.5).toFixed(2)}s;animation-duration:${(2.2+Math.random()*1.4).toFixed(2)}s">${icons[k%icons.length]}</span>`).join("");
  document.body.append(el); setTimeout(()=>el.remove(),4200);
}
// "next session" chip in the header, with a live countdown
function nextChip(){
  const s=upcoming()[0]; if(!s) return "";
  const r=rotInfo(s), v=venueOf(s);
  return r.live ? `<span class="nc-live"></span><b>Live now</b> · ${esc(v.venue||"on court")} · <a href="#" data-go="live">Live courts →</a>`
    : `🏸 Next: <b>${fmtDate(s.date)} · ${esc(s.start)}</b> · starts in <span class="cd" data-at="${sessStart(s).toISOString()}">–</span>`;
}

/* ---------- check-in and session view ---------- */
function checkinList(s){
  const list=S.bookings.filter(b=>b.sessionId===s.id && ACTIVE.includes(b.status)).sort((a,b)=>a.court-b.court || String(a.name).localeCompare(b.name));
  if(!list.length) return `<div class="empty">No one booked yet.</div>`;
  const here=list.filter(b=>b.checkedIn).length, away=list.filter(b=>b.absent).length, org=S.isAdmin && S.view==="organiser";
  return `<p><b>${here} of ${list.length} here</b>${away?` · ${away} not here`:""}</p>
  <div class="ci">${list.map(b=>`<div class="ci-row ${b.checkedIn?"in":""} ${b.absent?"out":""}">
    <span class="pl">${avatar(b.playerId,b.name,"sm")}<span>${esc(b.name)}</span></span>
    <span class="muted" style="font-size:.82rem">Court ${esc(b.court)}${org?" "+stChip(b.status):""}</span>
    <span class="row" style="gap:6px;margin-left:auto"><button class="btn small ${b.checkedIn?"primary":""}" data-checkin="${esc(b.id)}" data-v="${b.checkedIn?"reset":"in"}" aria-pressed="${!!b.checkedIn}">${b.checkedIn?"✓ Here":"Here"}</button><button class="btn small ${b.absent?"out-on":"ghost"}" data-checkin="${esc(b.id)}" data-v="${b.absent?"reset":"out"}" aria-pressed="${!!b.absent}">Not here</button></span>
  </div>`).join("")}</div>`;
}
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from(crypto.getRandomValues(new Uint32Array(6)), n=>CODE_CHARS[n % CODE_CHARS.length]).join("");
async function tryUnlock(code){
  const cands = [...upcoming(), ...S.sessions.filter(s=>Date.now()-sessEnd(s) < 12*3600e3 && Date.now() >= sessEnd(s))].filter((s,i,a)=>a.indexOf(s)===i).slice(0,10);
  for(const s of cands){
    if(Store.mode!=="db"){ if(S.secrets[s.id]===code){ S.kiosk=s.id; ls.set("dsf:kiosk",s.id); render(); return true } continue }
    try{ await Store.db.collection("unlocks").doc(S.uid).set({sessionId:s.id, code, at:nowIso()});
      S.kiosk=s.id; S.unlock={sessionId:s.id, code}; ls.set("dsf:kiosk",s.id); render(); toast("Session view is open on this device"); return true }
    catch(e){ if(e?.code!=="permission-denied") { toast("Couldn't check the code. Check your connection."); return false } }
  }
  toast("That code doesn't match an upcoming session"); return false;
}
function viewCourt(){
  if(!S.loaded) return `<section class="panel"><div class="empty loading">Loading…</div></section>`;
  const s = S.kiosk && S.sessions.find(x=>x.id===S.kiosk);
  if(!s || !canRun(s)) return `<section class="panel"><div><h2>Session view</h2><p class="muted">For whoever is hosting the session. Enter the code the organiser gives you. Once it's open on this device you can check people in, enter scores and see the rotation for that session.</p></div>
    <div class="row" style="max-width:440px;flex-wrap:nowrap"><input id="k-code" placeholder="Session code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--mono)"><button class="btn primary" data-kopen="1">Open</button></div></section>`;
  const r=rotInfo(s), v=venueOf(s);
  return `<section class="panel"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><span class="lbl">Session view · you're hosting</span><h2>${fmtLong(s.date)} · ${esc(s.start)}–${esc(s.end)}</h2><p class="muted">${esc(v.venue||"")}${r.done?" · finished":r.live?" · live now":` · starts ${esc(s.start)}`}</p></div><button class="btn small ghost" data-kexit="1">Close session view</button></div>
    <p class="muted" style="font-size:.88rem">Check people in and enter each game's score to keep the courts moving. When you save a score, the next four players pop up on screen and everyone's phone with the booking page open tells them they're on or up next.</p>
</section>
  <section class="panel"><details id="ci-k-${s.id}" open><summary><b>Check-in</b></summary><div style="display:grid;gap:10px;margin-top:10px">${checkinList(s)}</div></details></section>
  <div class="court-grid">${courtsOf(s).map(c=>courtLive(s,c)).join("")}</div>`;
}

/* ---------- rendering ---------- */
function render(){
  // keep what people are typing when live data redraws the page
  const keep={}; document.querySelectorAll("#main input[id], #main select[id], #main textarea[id]").forEach(el=>{ if(el.type!=="file") keep[el.id]= (el.type==="checkbox"||el.type==="radio") ? {c:el.checked} : {v:el.value} });
  const focusId=document.activeElement?.id;
  const openD=new Set([...document.querySelectorAll("#main details[id][open]")].map(d=>d.id));
  const shut=new Set([...document.querySelectorAll("#main details[id]:not([open])")].map(d=>d.id));
  // players only ever get the player view; the organiser can switch
  const view = S.isAdmin ? S.view : "player", tabs = TABS[view];
  const tab = tabs.some(([k])=>k===S.tab) ? S.tab : tabs[0][0];
  const anyLive = S.sessions.some(s=>rotInfo(s).live);
  $("#viewbar").hidden = !S.isAdmin;
  document.querySelectorAll("#viewbar [data-view]").forEach(b=>b.setAttribute("aria-pressed", String(b.dataset.view===view)));
  $("#tabs").innerHTML = tabs.map(([k,label])=>`<button role="tab" data-tab="${k}" aria-selected="${k===tab}">${k==="live"&&anyLive?'<span class="dot pulse"></span>':""}${esc(label)}</button>`).join("");
  const p = meP();
  $("#who").innerHTML = (view==="organiser" ? `<span class="org-flag">Organiser</span>` : p ? `${avatar(p.id,p.name,"sm")}<span>${esc(p.name)}</span> ${lvChip(p.level)}` : "")
    + (Store.mode==="db" && S.uid ? ` <button class="btn small" id="signOut" type="button">Sign out</button>` : "");
  const views = {court:viewCourt, book:viewBook, live:viewLive, mine:viewMine, level:viewLevel, venue:viewVenue,
    "o-overview":orgOverview, "o-sessions":orgSessions, "o-players":orgPlayers, "o-club":orgClub};
  const head = view==="organiser" ? modeBanner() : reminderBanner() + modeBanner();
  $("#main").innerHTML = (Store.mode!=="db" && !LOCAL) ? setupPanel() : head + (views[tab]||viewBook)();
  if(S.lastTab!==tab){ const m=$("#main"); m.classList.remove("swap"); void m.offsetWidth; m.classList.add("swap"); S.lastTab=tab }
  const nc=$("#nextup"); if(nc){ const h=S.loaded?nextChip():""; nc.innerHTML=h; nc.hidden=!h }
  tickCountdowns();
  Object.entries(keep).forEach(([id,k])=>{ const el=document.getElementById(id); if(!el) return; if("c" in k){ if(!el.disabled) el.checked=k.c } else el.value=k.v });
  document.querySelectorAll("#main details[id]").forEach(d=>{ if(openD.has(d.id)) d.open=true; else if(shut.has(d.id)) d.open=false });
  if(focusId) document.getElementById(focusId)?.focus({preventScroll:true});
  S.liveKey = liveKey();
  checkAlerts();
}
function modeBanner(){
  if(Store.mode==="db" || !S.loaded) return "";
  return `<div class="banner warn"><div class="grow"><b>Preview mode.</b> Bookings are saved in this browser only. Add the Firebase settings to firebase-config.js to share bookings between players.</div></div>`;
}
function reminderBanner(){
  if(!S.me) return "";
  const soon = S.bookings.filter(b=>b.playerId===S.me && b.status==="confirmed").map(b=>({b,s:S.sessions.find(x=>x.id===b.sessionId)}))
    .filter(x=>x.s && sessStart(x.s)-new Date() < 48*3600e3 && sessEnd(x.s) > new Date());
  const due = myBookings().filter(b=>b.status==="awaiting");
  let out = soon.map(({b,s})=>{ const v=venueOf(s); return `<div class="banner ok"><div class="grow"><b>Reminder:</b> you're on Court ${esc(b.court)} ${sessStart(s).toDateString()===new Date().toDateString()?"today":fmtLong(s.date)} from ${esc(s.start)}${v.venue?`, ${esc(v.venue)}`:""}. Check Live courts for your games.</div>${v.address?`<a href="${mapsFor(v)}" target="_blank" rel="noopener">Get directions</a>`:""}</div>` }).join("");
  if(due.length) out += `<div class="banner warn"><div class="grow"><b>Payment needed:</b> ${due.length} place${due.length>1?"s are":" is"} waiting for payment. Places are held for 24 hours.</div><button class="btn small" data-go="mine">Pay now</button></div>`;
  return out;
}

/* ----- registration (new players answer the level questions first) ----- */
/* ---- level check as a mini match against the coach ---- */
const qScore = ans => { let you=0, coach=0, power=0;
  QUIZ.forEach((x,k)=>{ const a=ans[k]; if(a==null) return; if(x.correct==null) power+=a; else if(a===x.correct) you++; else coach++ }); return {you,coach,power} };
function quizFields(prefix, ans){
  const n=QUIZ.length; let i=S.qpos[prefix];
  if(i==null){ i=QUIZ.findIndex((_,k)=>ans[k]==null); if(i<0) i=n }
  const sc=qScore(ans), maxPow=QUIZ.filter(x=>x.correct==null).length*4;
  const board=`<div class="qboard"><span class="qside">🙋 <small>You</small> <b>${sc.you}</b></span><span class="qpow" title="Warm-up power">⚡ <i><em style="width:${Math.round(sc.power/maxPow*100)}%"></em></i></span><span class="qside"><b>${sc.coach}</b> <small>Coach</small> 🧢</span>
    <button type="button" class="qsnd" data-qfx="1" aria-label="${S.fx?"Mute the umpire":"Turn on the umpire voice"}">${S.fx?"🔊":"🔇"}</button></div>`;
  const bar=`<div class="qbar" aria-hidden="true">${QUIZ.map((_,k)=>`<i class="${ans[k]!=null?"done":""} ${k===i?"on":""}"></i>`).join("")}</div>`;
  const f=S.qfb[prefix];
  const fb = f && f.i===i-1 ? (f.self ? `<div class="qfb pow">🔥 Warm-up done: +${f.v} power</div>`
    : `<div class="qfb ${f.ok?"ok":"no"}">🗣️ ${f.ok?"Point to you! ":"Out! Point to Coach. "}${esc(QUIZ[f.i].why)}</div>`) : "";
  if(i>=n){
    const lv=levelFrom(ans), l=lv&&lvByCode(lv), right=k=>ans[k]===QUIZ[k].correct;
    const tagged=t=>QUIZ.every((x,k)=>x.tag!==t || right(k));
    const badges=[["🏸","Serve savvy",tagged("serve")],["👀","Shot spotter",tagged("shot")],["📏","Rules ref",tagged("rules")],["🧭","Court sense",tagged("court")]];
    const confetti=Array.from({length:18},(_,k)=>`<span style="left:${(k*53)%100}%;animation-delay:${(k%6)*.18}s">${["🏸","🎉","✨","🏆","🪶","🎊"][k%6]}</span>`).join("");
    return `<div class="qcard qres">${board}${fb}<div class="qconf" aria-hidden="true">${confetti}</div>
      <div class="qemoji">🏆</div><p class="lbl">Game, set and match</p>
      ${l?`<h3 class="qq">${prefix==="gq"?"They're":"You're"} ${lvChip(l.code)} ${esc(l.name)}</h3><p class="muted">${esc(l.desc)}</p>`:`<h3 class="qq">Almost there</h3><p class="muted">A rally was skipped. Go back to play it.</p>`}
      <p class="qfinal">Rallies <b>${sc.you}–${sc.coach}</b> · Power <b>${sc.power}/${maxPow}</b></p>
      <div class="row qbadges">${badges.map(([e,t,ok])=>`<span class="qbadge ${ok?"got":""}">${e} ${t}${ok?" ✓":""}</span>`).join("")}</div>
      <div class="row qnav"><button type="button" class="btn small ghost" data-qback="${prefix}">← Back</button><button type="button" class="btn small" data-qredo="${prefix}">🔁 Rematch</button></div></div>`;
  }
  const x=QUIZ[i], a=ans[i], know=x.correct!=null;
  return `<div class="qcard ${know?"rally":"warm"}">${board}${bar}${fb}
    <div class="qphoto" style="background-image:url('../images/site/${x.img}.jpg')"><span class="qcall">${esc(x.call)}</span><span class="qemoji">${x.e}</span>
      <div class="qcourt" aria-hidden="true"><span class="qnet"></span><span class="qshuttle">🏸</span></div></div>
    <div class="row" style="justify-content:space-between"><span class="lbl">${know?"Rally":"Warm-up"} · ${i+1} of ${n}</span>${i>0?`<button type="button" class="btn small ghost" data-qback="${prefix}">← Back</button>`:""}</div>
    <fieldset class="q"><legend class="qq">${esc(x.q)}</legend>
      <div class="qopts">${x.a.map((t,j)=>`<label class="qopt ${a===j?"picked":""}"><input type="radio" id="${prefix}${i}_${j}" name="${prefix}${i}" value="${j}" ${a===j?"checked":""}><span>${x.ic?`<span class="qic">${x.ic[j]}</span> `:""}${esc(t)}</span></label>`).join("")}</div>
    </fieldset>
    ${a!=null?`<div class="row qnav"><button type="button" class="btn small primary" data-qnext="${prefix}">${i===n-1?"🏆 See my level":"Next rally →"}</button></div>`:""}
  </div>`;
}
/* umpire voice and racket sounds (Web Speech and Web Audio, nothing to download) */
let audioCtx=null;
function sfx(kind){
  if(!S.fx) return;
  try{
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    const t=audioCtx.currentTime, tone=(f,at,d,type="sine",vol=.18)=>{ const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type=type; o.frequency.value=f; g.gain.setValueAtTime(vol,t+at); g.gain.exponentialRampToValueAtTime(.001,t+at+d); o.connect(g).connect(audioCtx.destination); o.start(t+at); o.stop(t+at+d) };
    if(kind==="hit"){ const len=.07, buf=audioCtx.createBuffer(1,audioCtx.sampleRate*len,audioCtx.sampleRate), d=buf.getChannelData(0);
      for(let k=0;k<d.length;k++) d[k]=(Math.random()*2-1)*Math.pow(1-k/d.length,3);
      const src=audioCtx.createBufferSource(), bp=audioCtx.createBiquadFilter(), g=audioCtx.createGain(); bp.type="bandpass"; bp.frequency.value=2200; g.gain.value=.9;
      src.buffer=buf; src.connect(bp).connect(g).connect(audioCtx.destination); src.start(t) }
    if(kind==="win"){ tone(660,.08,.18); tone(880,.22,.3) }
    if(kind==="lose"){ tone(330,.08,.2,"triangle"); tone(220,.24,.3,"triangle") }
    if(kind==="power"){ tone(520,.06,.12,"triangle",.12); tone(700,.16,.16,"triangle",.12) }
    if(kind==="match"){ [523,659,784,1046].forEach((f,k)=>tone(f,.1+k*.14,.35)) }
  }catch{}
}
// a warm female voice: the best match the phone or browser has
const FEMALE = /female|woman|libby|sonia|maisie|hazel|susan|serena|kate|stephanie|martha|fiona|moira|tessa|karen|samantha|victoria|zira|aria|jenny|emma|amy|ava|allison|google uk english female/i;
function umpireVoice(){
  const vs=("speechSynthesis" in window) ? speechSynthesis.getVoices() : [];
  const en=vs.filter(v=>/^en/i.test(v.lang)), gb=en.filter(v=>/GB/i.test(v.lang));
  return gb.find(v=>FEMALE.test(v.name)) || en.find(v=>FEMALE.test(v.name)) || gb[0] || en[0] || null;
}
if("speechSynthesis" in window) try{ speechSynthesis.getVoices(); speechSynthesis.addEventListener?.("voiceschanged", ()=>speechSynthesis.getVoices()) }catch{}
function say(text){
  if(!S.fx || !("speechSynthesis" in window)) return;
  try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text), v=umpireVoice();
    u.lang=v?.lang||"en-GB"; if(v) u.voice=v; u.rate=1; u.pitch=1.2; speechSynthesis.speak(u) }catch{}
}
function quizCall(prefix, ans){
  let i=S.qpos[prefix]; if(i==null){ i=QUIZ.findIndex((_,k)=>ans[k]==null); if(i<0) i=QUIZ.length }
  const f=S.qfb[prefix], lead = f && f.i===i-1 ? (f.self ? "" : f.ok ? "Point to you! " : "Out! Point to Coach. ") : "";
  if(i>=QUIZ.length){ const l=lvByCode(levelFrom(ans)||""); sfx("match"); say(`${lead}Game, set and match! ${l?`${prefix==="gq"?"They're":"You're"} ${l.name}.`:""}`); return }
  say(lead + (i===0 ? "Love all, play! " : "") + QUIZ[i].q);
}
function levelVerdict(lv, who="you"){
  if(!lv) return `<p class="muted">Answer all the questions to see ${who==="you"?"your":"their"} court.</p>`;
  const l=lvByCode(lv);
  return `<div class="banner ok"><div class="grow">${who==="you"?"You're":"They're"} ${lvChip(l.code)} <b>${esc(l.name)}</b>. ${who==="you"?"You'll":"They'll"} play on the court for this level at each session.</div></div>`;
}
function signInPanel(){
  return `<section class="panel">
    <div><h2>Sign in to book</h2><p class="muted">Sign in once to book sessions, see your court and follow the live rotation. New players answer five quick level questions after signing in.</p></div>
    <div class="signin">
      <button class="btn primary" id="googleIn" type="button">Continue with Google</button>
      <form id="emailIn" class="signin">
        <label class="f">Or get a sign-in link by email<input id="in-email" type="email" required placeholder="you@example.com" autocomplete="email"></label>
        <button class="btn" type="submit">Email me a sign-in link</button>
      </form>
    </div>
  </section>`;
}
function setupPanel(){
  const configured = !!window.FIREBASE_CONFIG?.apiKey;
  return `<section class="panel"><h2>${configured?"Booking couldn't load":"Online booking is coming soon"}</h2>
    <p class="muted">${configured?"Check your internet connection and refresh the page. If you use an ad blocker, try turning it off for this site. You can also message us on WhatsApp to book.":"Until then, message us on WhatsApp to book your place."}</p>
    <div><a class="btn primary" href="https://chat.whatsapp.com/KLVWEt809gZ3aqLaBhuNL2?mode=gi_t" target="_blank" rel="noopener">Message us on WhatsApp</a></div></section>`;
}
function registerPanel(){
  if(Store.mode==="db" && !S.uid) return signInPanel();
  const lv = levelFrom(S.reg.ans);
  return `<section class="panel">
    <div><h2>Join Dropshot Folks</h2><p class="muted">Register once. New players play a quick level-check match against the coach so we can put you on the right court. Beginners are welcome on sessions with a beginners' court.${Store.mode==="db"?"":" Already registered? Enter your email and press Continue."}</p></div>
    <form id="regForm" class="quiz">
      <div class="grid2">
        <label class="f">Full name<input id="r-name" placeholder="First and last name" autocomplete="name"></label>
        <label class="f">Email<input id="r-email" type="email" required placeholder="you@example.com" autocomplete="email" ${S.email?`value="${esc(S.email)}" readonly`:""}></label>
        <label class="f">Mobile (optional)<input id="r-phone" inputmode="tel" placeholder="07…" autocomplete="tel"></label>
        <label class="f">Your photo (shown on the live courts)<input id="r-photo" type="file" accept="image/*"></label>
      </div>
      ${S.reg.photo?`<div class="row"><img class="av lg" src="${esc(S.reg.photo)}" alt="Your photo"><span class="muted">Looking good.</span></div>`:""}
      <h3>Your level</h3>
      ${quizFields("rq", S.reg.ans)}
      ${levelVerdict(lv)}
      <div class="row"><button class="btn primary" type="submit" >${Store.mode==="db"?"Register":"Continue"}</button><span class="muted" style="font-size:.85rem">The organiser checks levels on the night and can move you.</span></div>
    </form>
  </section>`;
}

/* ----- book: pick sessions, we assign the court ----- */
function viewBook(){
  const p = meP();
  if(!S.loaded) return `<section class="panel"><div class="empty">Loading sessions…</div></section>`;
  if(!p) return registerPanel();
  const ups = upcoming(), lv = lvByCode(p.level);
  const bookable = sid => { const x=ups.find(y=>y.id===sid); return x && x.open!==false && courtFor(x,lv.code) && !S.bookings.some(b=>b.sessionId===sid && b.playerId===p.id && b.status!=="cancelled") };
  [...S.picks].forEach(id=>{ if(!bookable(id)) S.picks.delete(id) });
  const nPick = S.picks.size;
  let html = "";
  if(S.result) html += `<div class="banner ${S.result.ok?"ok":"warn"}"><div class="grow"><b>${esc(S.result.title)}</b><ul>${S.result.lines.map(l=>`<li>${l}</li>`).join("")}</ul></div><button class="btn small" data-go="mine">Go to payment</button></div>`;
  if(!ups.length) return html + `<section class="panel"><h2>Book a session</h2><div class="empty">No sessions are open yet. They'll appear here as soon as the organiser adds them.</div></section>`;
  html += `<section class="panel">
    <div><h2>Book a session</h2><p class="muted">Tick as many sessions as you like. You're ${lvChip(lv.code)} ${esc(lv.name)}, and we'll put you on the court for your level at each session, with rotating doubles.</p></div>
    <div class="picks">${ups.map(s=>{
      const myB = S.bookings.find(b=>b.sessionId===s.id && b.playerId===p.id && b.status!=="cancelled");
      const ct = courtFor(s,lv.code), left = ct ? cap(s,ct) - activeIn(s.id,ct).length : 0, v=venueOf(s), noCourt = !ct, closed = s.open===false || noCourt;
      return `<label class="pick ${myB||closed?"booked":""}"><input type="checkbox" id="pick-${s.id}" data-pick="${s.id}" ${myB||closed?"disabled":""} ${myB||(!closed&&S.picks.has(s.id))?"checked":""}>
        <span class="t"><b>${fmtLong(s.date)} · ${esc(s.start)}–${esc(s.end)}</b>
        <span class="muted">${esc(v.venue||"Venue to be confirmed")}${s.title?" · "+esc(s.title):""}</span>
        <span>${myB?`<span class="chip st-confirmed">✓ Booked</span> Court ${myB.court} ${stChip(myB.status)}`:closed?`<span class="chip st-waitlist">${noCourt?`Not running for ${esc(lv.code)} players`:"Booking closed"}</span>`:left>0?`Court ${ct} · ${esc(courtName(s,ct))}: <b>${left} of ${cap(s,ct)}</b> places left`:`Court ${ct} · ${esc(courtName(s,ct))} is full. You'll go on the waiting list for your level (players can't join another level's court).`}</span></span></label>`}).join("")}</div>
  </section>
  <section class="panel">
    <div><h2>Bring a guest</h2><p class="muted">Guests answer the same five questions and are placed on the court for their level. They're added to every session you tick above.</p></div>
    ${S.guests.length?`<div class="picks">${S.guests.map((g,i)=>`<div class="pick booked">${avatar("guest"+i,g.name)}<span class="t"><b>${esc(g.name)}</b><span>${lvChip(g.level)} ${esc(lvByCode(g.level).name)}</span></span><button class="btn small ghost danger" data-rmguest="${i}" style="margin-left:auto">Remove</button></div>`).join("")}</div>`:""}
    <details id="guestBox"><summary><b>Add a guest</b></summary>
      <div class="quiz" style="margin-top:10px">
        <label class="f">Guest's full name<input id="g-name" placeholder="First and last name"></label>
        ${quizFields("gq", S.gq)}
        ${levelVerdict(levelFrom(S.gq),"guest")}
        <div><button class="btn" type="button" id="addGuest" ${levelFrom(S.gq)?"":"disabled"}>Add guest</button></div>
      </div>
    </details>
  </section>
  <section class="panel bookbar ${nPick?"on":""}">
    <div class="row" style="justify-content:space-between"><div><h3>${nPick?`${nPick} session${nPick>1?"s":""} selected`:"Ready to book?"}</h3><p class="muted">${nPick?"Your place isn't held until you press Book. ":"Tick the sessions you want above. "}${S.cfg.price?`${esc(S.cfg.price)} per person per session. `:""}You'll see how to pay in My bookings.</p></div>
    <button class="btn primary" id="bookSel" ${nPick?"":"disabled"}>${nPick?`Book ${nPick} session${nPick>1?"s":""}`:"Book selected sessions"}${S.guests.length?` + ${S.guests.length} guest${S.guests.length>1?"s":""}`:""}</button></div>
  </section>
  ${remindPanel(p)}`;
  return html;
}

/* ----- booking reminders (weekly calendar event + organiser list) ----- */
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const BOOK_URL = location.origin + location.pathname;
const slotKey = s => `${new Date(s.date+"T12:00:00").getDay()}|${s.start}`;
function slotLabel(s){ return `${DAYS[new Date(s.date+"T12:00:00").getDay()]}s · ${s.start}–${s.end}` }
function slots(){ const m=new Map(); upcoming().forEach(s=>{ const k=slotKey(s); if(!m.has(k)) m.set(k,s) }); return [...m].map(([k,s])=>({k,s,label:slotLabel(s)})) }
function remindDay(s){ const d=new Date(s.date+"T12:00:00"); d.setDate(d.getDate()-1); return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}` }
function remindText(sl){ const v=venueOf(sl.s); return `${sl.label}${v.venue?" at "+v.venue:""}. Book your place: ${BOOK_URL}` }
function remindGcal(sl){
  const d=remindDay(sl.s);
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent("Book your Dropshot Folks session")+
    `&dates=${d}T100000/${d}T101500&ctz=Europe/London&recur=`+encodeURIComponent("RRULE:FREQ=WEEKLY")+"&details="+encodeURIComponent(remindText(sl));
}
function remindIcs(sl){
  const d=remindDay(sl.s), esc2=t=>t.replace(/[,;]/g,m=>"\\"+m);
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Dropshot Folks//Reminder//EN","BEGIN:VEVENT",`UID:remind-${sl.k.replace(/\W/g,"")}-${S.me||"guest"}@dropshotfolks`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}Z`,`DTSTART;TZID=Europe/London:${d}T100000`,`DTEND;TZID=Europe/London:${d}T101500`,"RRULE:FREQ=WEEKLY",
    "SUMMARY:Book your Dropshot Folks session",`DESCRIPTION:${esc2(remindText(sl))}`,`URL:${BOOK_URL}`,
    "BEGIN:VALARM","TRIGGER:PT0M","ACTION:DISPLAY","DESCRIPTION:Book your Dropshot Folks session","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"})); a.download=`dropshotfolks-reminder-${DAYS[Number(sl.k.split("|")[0])].toLowerCase()}.ics`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function remindPanel(p){
  const sl=slots(); if(!sl.length) return "";
  const on=p.remind||[];
  return `<section class="panel">
    <div><h2>Remind me to book</h2><p class="muted">Get a weekly reminder the day before, so you don't miss a session. Tick the sessions you want, then add the reminder to your calendar.</p></div>
    <div class="picks">${sl.map(x=>{ const v=venueOf(x.s), isOn=on.includes(x.k); return `<div class="pick" style="cursor:default;flex-wrap:wrap">
      <input type="checkbox" id="rem-${x.k.replace(/\W/g,"")}" data-remind="${esc(x.k)}" ${isOn?"checked":""} aria-label="Remind me about ${esc(x.label)}">
      <span class="t" style="flex:1"><b>${esc(x.label)}</b><span class="muted">${esc(v.venue||"Venue to be confirmed")}</span>
        ${isOn?`<span class="row" style="margin-top:6px"><a class="btn small" href="${remindGcal(x)}" target="_blank" rel="noopener">Add to Google Calendar</a><button class="btn small" type="button" data-remics="${esc(x.k)}">Apple / Outlook calendar</button></span>`:""}</span>
    </div>` }).join("")}</div>
    <p class="muted" style="font-size:.85rem">The organiser can also message players who asked for reminders.</p>
  </section>`;
}

/* ----- live courts ----- */
function liveKey(){ return S.sessions.map(s=>s.id+":"+rotInfo(s).idx).join(",") }
function pickLiveSession(){
  const ups = upcoming();
  if(S.liveSess && ups.find(s=>s.id===S.liveSess)) return ups.find(s=>s.id===S.liveSess);
  return ups.find(s=>rotInfo(s).live) || ups[0] || null;
}
function teamHtml(team, names){
  return team.map(id=>`<div class="pl ${id===S.me?"me":""}">${avatar(id,names[id])}<span>${esc(names[id])}</span></div>`).join("");
}
function viewLive(){
  if(!S.loaded) return `<section class="panel"><div class="empty loading">Loading…</div></section>`;
  const ups = upcoming(), s = pickLiveSession();
  if(!s) return `<section class="panel"><h2>Live courts</h2><div class="empty">No sessions coming up.</div></section>`;
  const r = rotInfo(s), v = venueOf(s);
  return `<section class="panel">
    <div><h2>Live courts</h2><p class="muted">Four play doubles while the others rest, and everyone gets the same number of games. When a game's score is saved, the next four go on.</p></div>
    <div class="sess">${ups.slice(0,6).map(x=>`<button data-live="${x.id}" aria-pressed="${x.id===s.id}"><b>${fmtDate(x.date)}</b><span>${esc(x.start)}–${esc(x.end)}${rotInfo(x).live?" · live now":""}</span></button>`).join("")}</div>
    <p>${r.live?`<span class="dot pulse"></span><b>Live now</b> · each court moves to its next game when the score is saved`:r.done?"This session has finished.":`First game at <b>${hhmm(r.startT)}</b> · starts in <span class="cd" data-at="${r.startT.toISOString()}">–</span>`} ${v.venue?` · ${esc(v.venue)}`:""}</p>
  </section>
  <div class="court-grid">${courtsOf(s).map(c=>courtLive(s,c)).join("")}</div>
  <section class="panel">${leaderboard()}</section>`;
}
function courtLive(s,c){
  const {roster,r,games,names}=courtPlan(s,c);
  const {cur, byScore} = courtNow(s,c,games,r), g = games[cur], nx = games[cur+1];
  let body;
  if(!games.length) body = `<div class="empty">Rotation starts once 4 players have booked. ${roster.length} so far.</div>`;
  else body = `
    <div class="lbl">${r.live?`Game ${cur+1} · on court now`:`Game ${cur+1} · first up`}</div>
    ${(()=>{ const sc = scoreOf(s,c,cur), tm = sc ? [sc.a,sc.b] : g.teams;
      return `<div class="match"><div class="side">${teamHtml(tm[0],names)}</div>${sc?`<div class="vs" style="font-style:normal;font-weight:700;color:var(--accent)">${sc.sa}–${sc.sb}</div>`:`<div class="vs">vs</div>`}<div class="side">${teamHtml(tm[1],names)}</div></div>`
        + (canRun(s) ? scoreForm(s,c,cur,sc,"m") : ""); })()}
    ${g.sit.length?`<div class="row"><span class="lbl">Resting</span><span class="stack">${g.sit.map(id=>avatar(id,names[id],"sm")).join("")}</span><span class="muted" style="font-size:.85rem">${g.sit.map(id=>esc(names[id])).join(", ")}</span></div>`:""}
    ${nx?`<div class="row"><span class="lbl">Next up · get ready</span><span style="font-size:.88rem">${nx.teams.map(t=>t.map(id=>esc(names[id])).join(" & ")).join(" <i class='muted'>vs</i> ")}</span></div>`:""}
    <details id="rot-${s.id}-${c}"><summary>Full rotation (${games.length} games)</summary><div class="games">
      ${games.map((x,i)=>gameBox(s,c,i,x,names,r,cur)).join("")}
    </div></details>`;
  return `<div class="court-live ${r.live?"live":""}" style="--cc:${CLR[c]}">
    <div class="hd"><span class="num">Court ${c}</span><span>${courtChips(s,c)} ${esc(courtName(s,c))}</span><span class="muted" style="font-size:.85rem">${roster.length}/${cap(s,c)} players</span></div>
    ${roster.length?`<div class="stack">${roster.map(b=>avatar(b.playerId,b.name)).join("")}</div>`:""}
    ${body}
    ${canRun(s) ? (()=>{ const away=S.bookings.filter(b=>b.sessionId===s.id&&b.court===c&&ACTIVE.includes(b.status)&&b.absent);
      return (S.isAdmin && S.view==="organiser" ? rotEditor(s,c,games,roster,r) : "") + `<details id="ctl-${s.id}-${c}"><summary>Who's here (${roster.length})</summary><div style="display:grid;gap:6px;margin-top:8px">
        ${[...roster,...away].map(b=>`<div class="row" style="justify-content:space-between"><span class="pl">${avatar(b.playerId,b.name,"sm")}<span>${esc(b.name)}</span></span><button class="btn small ghost" data-absent="${esc(b.id)}">${b.absent?"Back in rotation":"Not here"}</button></div>`).join("")}
      </div></details>` })() : ""}
  </div>`;
}

function rotEditor(s,c,games,roster,r){
  if(!games.length) return "";
  const k=`${s.id}-${c}`, gi=Math.min(S.rotEdit[k] ?? courtNow(s,c,games,r).cur, games.length-1), g=games[gi], cur=g.teams.flat();
  const pick=(slot)=>`<select id="re-${k}-${gi}-${slot}" aria-label="Player ${slot+1}">${roster.map(b=>`<option value="${esc(b.playerId)}" ${b.playerId===cur[slot]?"selected":""}>${esc(b.name)}</option>`).join("")}</select>`;
  const anyEdits = Object.keys(s.rot?.[c]||{}).length>0;
  return `<details id="red-${k}"><summary>Edit rotation</summary><div style="display:grid;gap:10px;margin-top:8px">
    <label class="f">Game<select data-regame="${k}">${games.map((x,i)=>`<option value="${i}" ${i===gi?"selected":""}>Game ${i+1}${scoreOf(s,c,i)?" (played)":""}${x.edited?" (edited)":""}</option>`).join("")}</select></label>
    <div class="grid2"><div style="display:grid;gap:6px"><span class="lbl">Team A</span>${pick(0)}${pick(1)}</div><div style="display:grid;gap:6px"><span class="lbl">Team B</span>${pick(2)}${pick(3)}</div></div>
    <div class="row"><button class="btn small primary" data-resave="${k}" data-sid="${esc(s.id)}" data-c="${c}" data-gi="${gi}">Save game ${gi+1}</button>
      ${g.edited?`<button class="btn small" data-rereset="${k}" data-sid="${esc(s.id)}" data-c="${c}" data-gi="${gi}">Undo edit</button>`:""}
      ${anyEdits?`<button class="btn small ghost danger" data-reall="${esc(s.id)}" data-c="${c}">Reset all edits</button>`:""}</div>
  </div></details>`;
}

/* ----- my bookings ----- */
function viewMine(){
  const p = meP();
  if(!p) return registerPanel();
  const mine = myBookings().filter(b=>b.status!=="cancelled").map(b=>({b,s:S.sessions.find(x=>x.id===b.sessionId)})).filter(x=>x.s)
    .sort((a,b)=>sessStart(a.s)-sessStart(b.s) || (a.b.hostId?1:-1));
  const lv = lvByCode(p.level);
  let html = `<section class="panel">
    <div class="row" style="justify-content:space-between"><div class="row">${avatar(p.id,p.name,"lg")}<div><h2>${esc(p.name)}</h2><label class="btn small ghost" for="photoChange" style="margin-top:6px">${S.photos[p.id]?"Change photo":"Add your photo"}</label><input id="photoChange" type="file" accept="image/*" hidden></div></div>${Store.mode==="db"?"":`<button class="btn small ghost" id="signOut">Switch player</button>`}</div>
    <dl class="kv"><dt>Email</dt><dd>${esc(p.email)}</dd>${p.phone?`<dt>Mobile</dt><dd>${esc(p.phone)}</dd>`:""}
      <dt>Level</dt><dd>${lvChip(p.level)} ${esc(lv?.name||"")} ${p.verified?'<span class="chip st-confirmed">Checked by organiser</span>':""}</dd>
      ${p.levelRequest?`<dt>Level change</dt><dd>Asked to move to ${lvChip(p.levelRequest)}. The organiser will review it.</dd>`:""}</dl>
    ${p.levelRequest?"":`<details id="reqBox"><summary>Ask the organiser to change my level</summary>
      <div class="row" style="margin-top:8px"><select id="reqLevel" style="max-width:280px">${LEVELS.filter(l=>l.code!==p.level).map(l=>`<option value="${l.code}">${l.code} · ${l.name}</option>`).join("")}</select><button class="btn small" id="reqBtn">Send request</button></div></details>`}
  </section>`;
  html += pointsPanel(p);
  const upc = mine.filter(x=>sessEnd(x.s)>=new Date()), past = mine.filter(x=>sessEnd(x.s)<new Date()).reverse();
  html += `<section class="panel"><h2>My bookings</h2>${upc.length?upc.map(({b,s})=>bookingCard(b,s)).join(""):`<div class="empty">No bookings. <a href="#" data-go="book">Book a session</a></div>`}</section>`;
  if(past.length) html += `<section class="panel"><details id="pastBox"><summary><b>Past sessions (${past.length})</b></summary><div style="display:grid;gap:10px;margin-top:10px">${past.map(({b,s})=>bookingCard(b,s)).join("")}</div></details></section>`;
  return html;
}
function bookingCard(b,s){
  const c = S.cfg, past = sessEnd(s) < new Date(), v = venueOf(s), isGuest = !!b.hostId;
  const guests = isGuest ? [] : S.bookings.filter(x=>x.hostId===b.playerId && x.sessionId===s.id && x.status==="awaiting");
  // amount to transfer: the session fee (e.g. "£15") times you + guests, when the fee is a plain number
  const people = guests.length+1, fee = parseFloat(String(c.price||"").replace(/[^0-9.]/g,""));
  const off = pointsState().off[b.id] || 0;
  const amount = Number.isFinite(fee) && fee>0 ? "£"+Math.max(0,fee*people-off).toFixed(2).replace(/\.00$/,"") : "";
  const allDetails = [c.accountName&&`Name: ${c.accountName}`, c.sortCode&&`Sort code: ${c.sortCode}`, c.accountNumber&&`Account number: ${c.accountNumber}`, amount&&`Amount: ${amount}`, `Reference: ${b.ref}`].filter(Boolean).join("\n");
  const pay = b.status==="awaiting" && !isGuest ? `
    <p><b>Pay ${amount?amount:(c.price?esc(c.price):"the session fee")}${guests.length?` (you + ${guests.length} guest${guests.length>1?"s":""})`:""}</b>${off?` <span class="chip off">£${off} points reward taken off</span>`:""} by bank transfer from your banking app, using this reference so the organiser can match it.</p>
    <dl class="paybox">
      ${c.accountName?`<dt>Name</dt><dd>${esc(c.accountName)}</dd><span></span>`:""}
      ${c.bankName?`<dt>Bank</dt><dd>${esc(c.bankName)}</dd><span></span>`:""}
      ${c.sortCode?`<dt>Sort code</dt><dd class="sel">${esc(c.sortCode)}</dd><button class="btn small ghost" data-copy="${esc(c.sortCode)}">Copy</button>`:""}
      ${c.accountNumber?`<dt>Account</dt><dd class="sel">${esc(c.accountNumber)}</dd><button class="btn small ghost" data-copy="${esc(c.accountNumber)}">Copy</button>`:""}
      ${amount?`<dt>Amount</dt><dd class="sel">${amount}</dd><button class="btn small ghost" data-copy="${amount}">Copy</button>`:""}
      <dt>Reference</dt><dd class="sel">${esc(b.ref)}</dd><button class="btn small ghost" data-copy="${esc(b.ref)}">Copy</button>
    </dl>
    ${c.accountNumber?`<div class="row"><button class="btn small" data-copy="${esc(allDetails)}">Copy all payment details</button><span class="muted" style="font-size:.85rem">Then open your banking app and paste.</span></div>`:""}
    ${!c.accountNumber && !c.payLink?`<p class="muted">The organiser hasn't added payment details yet. Check Venue &amp; contact or message them.</p>`:""}
    <div class="row">${c.payLink?`<a class="btn" href="${esc(c.payLink)}" target="_blank" rel="noopener">Pay online</a>`:""}<button class="btn primary small" data-paid="${esc(b.id)}">I've paid${guests.length?" for everyone":""}</button></div>` : "";
  let games = "";
  if(!isGuest && ACTIVE.includes(b.status) && !past){
    const {games:gs, r} = courtPlan(s,b.court), {cur} = courtNow(s,b.court,gs,r);
    const mineIdx = gs.map((g,i)=>g.teams.flat().includes(b.playerId)?i:-1).filter(i=>i>=0);
    games = gs.length ? `<p><span class="lbl">Your games</span> ${mineIdx.map(i=>`<span class="chip ${r.live&&i===cur?"st-confirmed":"st-waitlist"}">#${i+1}${i===cur&&r.live?" · on now":i<cur?" · played":""}</span>`).join(" ")} <a href="#" data-golive="${s.id}">Live court</a></p>`
      : `<p class="muted">Your rotation appears once 4 players are booked on Court ${esc(b.court)}.</p>`;
  }
  const cal = b.status==="confirmed" && !past && !isGuest ? `<div class="row"><a class="btn small" href="${gcalUrl(b,s)}" target="_blank" rel="noopener">Add to Google Calendar</a><button class="btn small" data-ics="${esc(b.id)}">Download calendar reminder</button>${v.address?`<a class="btn small" href="${mapsFor(v)}" target="_blank" rel="noopener">Directions</a>`:""}</div>` : "";
  return `<div class="bk">
    <div class="row" style="justify-content:space-between"><h3>${isGuest?`Guest: ${esc(b.name)} · `:""}${fmtLong(s.date)} · ${esc(s.start)}–${esc(s.end)}</h3>${stChip(b.status)}</div>
    <p>Court ${esc(b.court)} · ${esc(courtName(s,b.court))} ${courtChips(s,b.court)}${v.venue?` · ${esc(v.venue)}`:""}${offChip(b)}</p>
    ${b.status==="waitlist"?`<p class="muted">This court is full. If a place opens up, the organiser will offer it to you before you pay.</p>`:""}
    ${b.status==="paid"?`<p class="muted">Thanks. The organiser will confirm once the payment arrives.</p>`:""}
    ${isGuest&&b.status==="awaiting"?`<p class="muted">Paid together with your own place for this session.</p>`:""}
    ${pay}${games}${cal}
    <div class="log">${(b.log||[]).slice().reverse().map(e=>`<span>${fmtStamp(e.at)} — ${esc(e.text)}</span>`).join("")}</div>
    ${!past && b.status!=="cancelled"?`<div class="row"><button class="btn small ghost danger" data-cancel="${esc(b.id)}">Cancel ${isGuest?"guest":"booking"}</button><span class="muted" style="font-size:.82rem">${esc(S.cfg.policy)}</span></div>`:""}
  </div>`;
}

/* ----- level guide ----- */
function viewLevel(){
  const res = levelFrom(S.quiz), p = meP();
  return `<section class="panel"><div><h2>Level guide</h2><p class="muted">Each court is for one level. You book a session and we put you on the court for your level. Beginners (E) can book sessions that have a beginners' court, but not Thursday sessions.</p></div>
    <div class="levels">${LEVELS.map(l=>`<div class="lvrow"><span class="lv lv-${l.key}">${l.code}</span><div><b>${l.name}</b>${l.court?` · Court ${l.court}`:" · court set per session"}<p class="muted">${l.desc}</p></div></div>`).join("")}</div></section>
  <section class="panel"><div><h2>Think you've moved up?</h2><p class="muted">Take the questions again. If the answer changes, ask the organiser to move you.</p></div>
    <form class="quiz" id="quiz">${quizFields("q", S.quiz)}</form>
    ${res ? `<div class="banner ok"><div class="grow">Suggested level: ${lvChip(res)} <b>${lvByCode(res).name}</b>.</div>${p?(p.level!==res?`<button class="btn small" id="quizReq" data-lv="${res}">Ask organiser to change my level</button>`:`<span>That's your current level.</span>`):`<button class="btn small primary" data-go="book">Register</button>`}</div>` : levelVerdict(res)}
    <p class="muted">Still unsure? <a href="#" data-go="venue">Message the organiser</a>.</p>
  </section>`;
}

/* ----- venue & contact ----- */
function waUrl(text){ const n=(S.cfg.whatsapp||S.cfg.orgPhone||"").replace(/\D/g,"").replace(/^0/,"44"); return n?`https://wa.me/${n}?text=${encodeURIComponent(text)}`:"" }
function viewVenue(){
  const c=S.cfg;
  const wa = waUrl("Hi, I have a question about a Dropshot Folks session.");
  const venues=[]; [...upcoming().map(venueOf), {venue:c.venue,address:c.address}].forEach(v=>{
    if((v.venue||v.address) && !venues.some(x=>x.venue===v.venue && x.address===v.address)) venues.push(v) });
  const dayList = v => [...new Set(upcoming().filter(s=>venueOf(s).venue===v.venue).map(s=>`${new Date(s.date+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long"})}s ${s.start}–${s.end}`))].join(" · ");
  return `<section class="panel"><h2>Getting there</h2>
    ${venues.length?venues.map(v=>`<div class="bk"><h3>${esc(v.venue||"Venue")}</h3>${dayList(v)?`<p class="muted">${esc(dayList(v))}</p>`:""}
      ${v.address?`<p class="sel">${esc(v.address)}</p>`:""}
      <div class="row"><a class="btn primary small" href="${mapsFor(v)}" target="_blank" rel="noopener">Open in Google Maps</a>${v.address?`<button class="btn small" data-copy="${esc(v.address)}">Copy address</button>`:""}</div></div>`).join("")
    :`<div class="empty">The organiser hasn't added a venue yet.</div>`}
  </section>
  <section class="panel"><h2>Contact the organiser</h2>
    ${c.orgName||c.orgPhone||c.orgEmail?`<dl class="kv">${c.orgName?`<dt>Organiser</dt><dd>${esc(c.orgName)}</dd>`:""}${c.orgPhone?`<dt>Phone</dt><dd class="sel">${esc(c.orgPhone)}</dd>`:""}${c.orgEmail?`<dt>Email</dt><dd class="sel">${esc(c.orgEmail)}</dd>`:""}</dl>
    <div class="row">${wa?`<a class="btn primary" href="${wa}" target="_blank" rel="noopener">Message on WhatsApp</a>`:""}${c.orgPhone?`<button class="btn" data-copy="${esc(c.orgPhone)}">Copy number</button>`:""}${c.orgEmail?`<button class="btn" data-copy="${esc(c.orgEmail)}">Copy email</button>`:""}</div>
    <p class="muted">Contact the organiser about level reviews, refunds, or if you can't book.</p>`
    :`<div class="empty">Contact details will appear here once the organiser adds them.</div>`}
  </section>
  <section class="panel"><h2>Payment &amp; cancellations</h2><p>${esc(c.policy)}</p>${c.price?`<p>Session fee: <b>${esc(c.price)}</b></p>`:""}</section>`;
}

/* ---------- organiser ---------- */
function orgParts(){
  const c=S.cfg, ups=upcoming(), reqs=S.players.filter(p=>p.levelRequest);
  const f=(id,label,ph="")=>`<label class="f">${label}<input id="c-${id}" value="${esc(c[id])}" placeholder="${esc(ph)}"></label>`;
  const requests = reqs.length?`<section class="panel"><h2>Level change requests</h2><div class="tbl"><table><thead><tr><th>Player</th><th>Now</th><th>Wants</th><th></th></tr></thead><tbody>
    ${reqs.map(p=>`<tr><td>${esc(p.name)} <span class="muted">${esc(p.email)}</span></td><td>${lvChip(p.level)}</td><td>${lvChip(p.levelRequest)}</td><td class="row"><button class="btn small primary" data-approve="${esc(p.id)}">Approve</button><button class="btn small ghost" data-decline="${esc(p.id)}">Decline</button></td></tr>`).join("")}
  </tbody></table></div></section>`:"";
  const sessions = `<section class="panel"><h2>Sessions &amp; bookings</h2>
    ${ups.length?ups.map(adminSession).join(""):`<div class="empty">No upcoming sessions. Add one below.</div>`}
    <details id="addSess"><summary><b>Add sessions</b></summary>
      <form id="sessForm" class="grid2" style="margin-top:10px">
        <label class="f">First date<input id="s-date" type="date" required></label>
        <label class="f">Start<input id="s-start" type="time" value="18:30" required></label>
        <label class="f">End<input id="s-end" type="time" value="21:30" required></label>
        <label class="f">Players per court<input id="s-cap" type="number" min="4" max="20" value="${PER_COURT}"></label>
        <label class="f">Minutes per game<select id="s-mins">${[10,12,15,20].map(m=>`<option ${m===GAME_MINS?"selected":""}>${m}</option>`).join("")}</select></label>
        <label class="f">Repeat weekly for<select id="s-weeks"><option value="1">Just this date</option><option value="4">4 weeks</option><option value="8">8 weeks</option><option value="12">12 weeks</option></select></label>
        <label class="f">Title (optional)<input id="s-title" placeholder="Thursday"></label>
        <label class="f">Note for players (optional)<input id="s-note" placeholder="Bring indoor shoes"></label>
        <label class="f">Venue<input id="s-venue" placeholder="Swanlea School" value="${esc(c.venue)}"></label>
        <label class="f">Venue address<input id="s-address" placeholder="Street, postcode" value="${esc(c.address)}"></label>
        <div class="row" style="grid-column:1/-1"><button class="btn primary">Add sessions</button></div>
      </form></details>
  </section>`;
  const players = `<section class="panel"><h2>Players</h2>
    ${S.players.length?`<div class="tbl"><table><thead><tr><th></th><th>Player</th><th>Contact</th><th>Level</th><th>Checked</th></tr></thead><tbody>
    ${S.players.slice().sort((a,b)=>String(a.name).localeCompare(b.name)).map(p=>(S.pedit===p.id?`<tr><td colspan="5"><div class="grid2">
        <label class="f">Name<input id="pe-name" value="${esc(p.name)}"></label>
        <label class="f">Email<input id="pe-email" type="email" value="${esc(p.email||"")}"></label>
        <label class="f">Mobile<input id="pe-phone" value="${esc(p.phone||"")}"></label>
        <div class="row" style="align-self:end"><button class="btn small primary" data-psave="${esc(p.id)}">Save</button><button class="btn small" data-pedit="">Close</button><button class="btn small ghost danger" data-pdel="${esc(p.id)}">Delete player</button></div>
      </div></td></tr>`:"")+`<tr><td>${avatar(p.id,p.name,"sm")}</td><td>${esc(p.name)}<br><button class="btn small ghost" data-pedit="${esc(p.id)}">Edit</button></td><td class="sel">${esc(p.email||"–")}${p.phone?`<br><span class="muted">${esc(p.phone)}</span>`:""}</td>
      <td><select data-setlv="${esc(p.id)}" aria-label="Level for ${esc(p.name)}">${LEVELS.map(l=>`<option value="${l.code}" ${l.code===p.level?"selected":""}>${l.code}</option>`).join("")}</select></td>
      <td><input type="checkbox" data-verify="${esc(p.id)}" ${p.verified?"checked":""} aria-label="Level checked"></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Players appear here when they register.</div>`}
  </section>`;
  const club = `<section class="panel"><h2>Club details</h2><p class="muted">Players see these on the Venue &amp; contact tab and when they pay. Each session can also have its own venue.</p>
    <form id="cfgForm" class="grid2">
      ${f("venue","Default venue name","Swanlea School")}${f("address","Default venue address")}
      ${f("price","Session fee","£6")}${f("payLink","Online payment link (optional)","https://monzo.me/…")}
      ${f("accountName","Account name")}${f("bankName","Bank")}${f("sortCode","Sort code","00-00-00")}${f("accountNumber","Account number")}
      ${f("orgName","Organiser name")}${f("orgPhone","Organiser phone")}${f("orgEmail","Organiser email")}${f("whatsapp","WhatsApp number (if different)")}
      <label class="f" style="grid-column:1/-1">Payment &amp; cancellation policy<textarea id="c-policy" rows="2">${esc(c.policy)}</textarea></label>
      <div class="row" style="grid-column:1/-1"><button class="btn primary">Save club details</button></div>
    </form>
  </section>`;
  return {requests, sessions, players, club};
}
const notOrg = `<section class="panel"><div class="empty">Only the organiser can see this.</div></section>`;
// Sessions running all four courts whose setup doesn't match the standard one-level-per-court layout
function setupWarnings(){
  const std={1:"D-",2:"D+",3:"C-",4:"C+"};
  return upcoming().filter(s=>courtsOf(s).length===4).map(s=>{
    const off=[1,2,3,4].filter(c=>courtLevels(s,c).join()!==std[c]);
    const wrong=S.bookings.filter(b=>b.sessionId===s.id && ACTIVE.includes(b.status) && std[b.court]!==b.level && Object.values(std).includes(b.level));
    return off.length ? {s, off, wrong} : null }).filter(Boolean);
}
function setupBanner(){
  return setupWarnings().map(({s,off,wrong})=>`<div class="banner warn"><div class="grow"><b>${fmtLong(s.date)}: court setup isn't standard.</b>
    ${off.map(c=>`Court ${c} takes ${courtLevels(s,c).join(" + ")||"no levels"}`).join(" · ")}.${wrong.length?` ${wrong.length} player${wrong.length>1?"s are":" is"} on the wrong court (${wrong.map(b=>`${esc(b.name)} ${esc(b.level)} on Court ${esc(b.court)}`).join(", ")}).`:""}</div>
    <button class="btn small primary" data-stdcourts="${esc(s.id)}">Fix now</button></div>`).join("");
}
const orgSessions = () => S.isAdmin ? setupBanner() + orgParts().sessions : notOrg;
const orgPlayers = () => S.isAdmin ? orgParts().requests + orgParts().players : notOrg;
// after a level change, move the player's upcoming bookings to their new court
async function moveToLevelCourt(pid, level){
  let n=0;
  for(const b of S.bookings.filter(b=>b.playerId===pid && b.status!=="cancelled")){
    const s=S.sessions.find(x=>x.id===b.sessionId); if(!s || sessEnd(s)<new Date()) continue;
    const court=courtFor(s,level);
    if(court && court!==b.court){ await setBooking(b.id,{court, level},`Moved to Court ${court} after a level change.`,null); n++ }
    else if(b.level!==level) await setBooking(b.id,{level},null,null);
  }
  return n;
}
// Standard setup: one level per court (D- 1, D+ 2, C- 3, C+ 4). Moves booked players onto their level's court.
async function standardCourts(sid){
  const s0=S.sessions.find(x=>x.id===sid); if(!s0) return;
  const {id,courts,...body}=s0, s1={...body, id};
  if(!await save("sessions",id,body)) return;
  let moved=0; const stuck=[];
  for(const b of S.bookings.filter(b=>b.sessionId===sid && b.status!=="cancelled")){
    if(courtLevels(s1,b.court).includes(b.level)) continue;
    const c=courtsOf(s1).find(n=>courtLevels(s1,n).includes(b.level));
    if(c){ await setBooking(b.id,{court:c},`Moved to Court ${c}: standard courts for this session.`,null); moved++ } else stuck.push(b.name);
  }
  toast(`Standard courts set${moved?`, ${moved} moved`:""}${stuck.length?`. No court for: ${stuck.join(", ")}`:""}`);
}
const orgClub = () => S.isAdmin ? orgParts().club : notOrg;
function orgOverview(){
  if(!S.isAdmin) return notOrg;
  if(!S.loaded) return `<section class="panel"><div class="empty loading">Loading…</div></section>`;
  const ups = upcoming(), s = ups.find(x=>rotInfo(x).live) || ups[0], warn = setupBanner();
  const toCheck = S.bookings.filter(b=>b.status==="paid" && ups.some(x=>x.id===b.sessionId));
  const reqs = S.players.filter(p=>p.levelRequest);
  const missing = ["price","accountNumber","orgPhone"].filter(k=>!S.cfg[k]);
  let html = warn;
  if(missing.length) html += `<div class="banner warn"><div class="grow"><b>Finish your club details.</b> Players can't see ${missing.map(k=>({price:"the session fee",accountNumber:"your bank details",orgPhone:"your phone number"})[k]).join(", ")} yet.</div><button class="btn small" data-tab-go="o-club">Add details</button></div>`;
  if(!s) return html + `<section class="panel"><h2>Overview</h2><div class="empty">No upcoming sessions. Add some in Sessions &amp; bookings.</div><div><button class="btn primary" data-tab-go="o-sessions">Add sessions</button></div></section>`;
  const inS = S.bookings.filter(b=>b.sessionId===s.id), r = rotInfo(s), v = venueOf(s);
  const n = st => inS.filter(b=>b.status===st).length;
  const playing = inS.filter(b=>ACTIVE.includes(b.status)).length, capTotal=[1,2,3,4].reduce((t,c)=>t+cap(s,c),0);
  html += `<section class="panel">
    <div class="row" style="justify-content:space-between"><div><h2>${r.live?'<span class="dot pulse"></span>Live now: ':"Next session: "}${fmtLong(s.date)}</h2><p class="muted">${esc(s.start)}–${esc(s.end)}${v.venue?` · ${esc(v.venue)}`:""}${r.live?` · game ${r.idx+1} of ${r.total}`:""}</p></div>
      <div class="row"><button class="btn small" data-msg="${s.id}">Copy reminder message</button><button class="btn small" data-emails="${s.id}">Copy player emails</button><button class="btn small" data-tab-go="live">Live courts</button></div></div>
    <div class="tiles">
      <div class="tile"><span class="lbl">Booked</span><b>${playing}/${capTotal}</b><span class="muted">places</span></div>
      <div class="tile ${n("paid")?"alert":""}"><span class="lbl">Payments to check</span><b>${n("paid")}</b><span>players say they've paid</span></div>
      <div class="tile"><span class="lbl">Not paid yet</span><b>${n("awaiting")}</b><span class="muted">holding a place</span></div>
      <div class="tile"><span class="lbl">Confirmed</span><b>${n("confirmed")}</b><span class="muted">paid and ready</span></div>
      <div class="tile"><span class="lbl">Waiting list</span><b>${n("waitlist")}</b><span class="muted">${n("waitlist")?"offer places if someone cancels":"nobody waiting"}</span></div>
    </div>
    <div style="display:grid;gap:8px">${courtsOf(s).map(c=>{const k=activeIn(s.id,c).length, m=cap(s,c); return `<div class="cbar" style="--cc:${CLR[c]}"><span>Court ${c} · ${esc(courtName(s,c))}</span><span class="meter"><i style="width:${Math.min(100,k/m*100)}%"></i></span><span class="mono">${k}/${m}</span></div>`}).join("")}</div>
    <textarea id="msg-${s.id}" rows="6" hidden readonly></textarea>
  </section>`;
  html += `<section class="panel"><h2>Payments to check</h2>
    ${toCheck.length?`<p class="muted">Check your bank for these references, then confirm.</p><div class="tbl"><table><thead><tr><th>Player</th><th>Session</th><th>Ref</th><th></th></tr></thead><tbody>
      ${toCheck.sort((a,b)=>a.sessionId.localeCompare(b.sessionId)).map(b=>{const ss=S.sessions.find(x=>x.id===b.sessionId); return `<tr><td>${esc(b.name)}${offChip(b)}</td><td>${fmtDate(ss.date)} · Court ${esc(b.court)}</td><td class="mono">${esc(b.ref)}</td><td><button class="btn small primary" data-confirm="${esc(b.id)}">Confirm paid</button></td></tr>`}).join("")}
    </tbody></table></div>`:`<div class="empty">Nothing to check. Payments players mark as sent will appear here.</div>`}
  </section>`;
  if(reqs.length) html += `<div class="banner info"><div class="grow"><b>${reqs.length} level change request${reqs.length>1?"s":""}</b> waiting for you.</div><button class="btn small" data-tab-go="o-players">Review</button></div>`;
  html += `<section class="panel"><h2>Coming up</h2><div class="tbl"><table><thead><tr><th>Session</th><th>Booked</th><th>To check</th><th>Unpaid</th><th>Waiting</th></tr></thead><tbody>
    ${ups.map(x=>{const b=S.bookings.filter(y=>y.sessionId===x.id); const c=st=>b.filter(y=>y.status===st).length;
      return `<tr><td>${fmtDate(x.date)} · ${esc(x.start)}${x.open===false?' <span class="chip st-waitlist">Closed</span>':""}</td><td>${b.filter(y=>ACTIVE.includes(y.status)).length}/${[1,2,3,4].reduce((t,k)=>t+cap(x,k),0)}</td><td>${c("paid")}</td><td>${c("awaiting")}</td><td>${c("waitlist")}</td></tr>`}).join("")}
  </tbody></table></div></section>`;
  return html;
}
function adminSession(s){
  const r = rotInfo(s), v = venueOf(s);
  const rows = [1,2,3,4].map(c=>{
    const list = S.bookings.filter(b=>b.sessionId===s.id && b.court===c && b.status!=="cancelled").sort((a,b)=>String(a.createdAt).localeCompare(b.createdAt));
    if(!cap(s,c) && !list.length) return "";
    return `<tr><td colspan="5" style="background:var(--sunk)"><b>Court ${c}</b> · ${esc(courtName(s,c))} ${courtChips(s,c)} · ${activeIn(s.id,c).length}/${cap(s,c)}${cap(s,c)?"":" · not running"}</td></tr>` +
      (list.length?list.map(b=>{ const em=S.players.find(p=>p.id===b.playerId)?.email; return `<tr><td>${esc(b.name)}${offChip(b)}${b.hostId?` <span class="chip st-waitlist">guest ${lvChip(b.level)}</span>`:""}${em?`<br><span class="muted" style="font-size:.82rem">${esc(em)}</span>`:""}</td><td class="mono">${esc(b.ref)}</td><td><select data-status="${esc(b.id)}" aria-label="Status for ${esc(b.name)}">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${k===b.status?"selected":""}>${v.label}</option>`).join("")}</select>${b.absent?' <span class="chip st-cancelled">Not here</span>':""}</td>
        <td><select data-court="${esc(b.id)}" aria-label="Court for ${esc(b.name)}">${[1,2,3,4].map(n=>`<option value="${n}" ${n===b.court?"selected":""}>Court ${n}</option>`).join("")}</select></td>
        <td class="row">${b.status==="paid"||b.status==="awaiting"?`<button class="btn small primary" data-confirm="${esc(b.id)}">Confirm paid</button>`:""}
        ${b.status==="waitlist"?`<button class="btn small" data-offer="${esc(b.id)}">Offer place</button>`:""}
        ${ACTIVE.includes(b.status)?`<button class="btn small ghost" data-absent="${esc(b.id)}">${b.absent?"Back in rotation":"Not here"}</button>`:""}
        <button class="btn small ghost danger" data-acancel="${esc(b.id)}">Cancel</button></td></tr>` }).join(""):`<tr><td colspan="5" class="muted">No bookings</td></tr>`);
  }).join("");
  return `<div class="bk"><div class="row" style="justify-content:space-between"><h3>${fmtLong(s.date)} · ${esc(s.start)}–${esc(s.end)}${s.title?" · "+esc(s.title):""}</h3>
    <div class="row"><button class="btn small" data-msg="${s.id}">Copy reminder message</button><button class="btn small" data-emails="${s.id}">Copy player emails</button><button class="btn small" data-toggle="${s.id}">${s.open===false?"Open booking":"Close booking"}</button><button class="btn small ghost danger" data-delsess="${s.id}">Delete</button></div></div>
    <p class="muted">${esc(v.venue||"No venue set")}${v.address?" · "+esc(v.address):""}</p>
    <div class="row code-row"><span class="lbl">Session view code</span>${S.secrets[s.id]?`<b class="code">${esc(S.secrets[s.id])}</b><button class="btn small" data-copy="${esc(S.secrets[s.id])}">Copy</button><button class="btn small ghost" data-newcode="${esc(s.id)}">New code</button>`:`<button class="btn small primary" data-newcode="${esc(s.id)}">Create code</button>`}<span class="muted" style="font-size:.82rem">Give it to whoever runs the court-side device. A new code locks out devices using the old one.</span></div>
    <details id="ci-${s.id}"><summary><b>Check-in list</b> (${S.bookings.filter(b=>b.sessionId===s.id&&ACTIVE.includes(b.status)&&b.checkedIn).length} of ${S.bookings.filter(b=>b.sessionId===s.id&&ACTIVE.includes(b.status)).length} here)</summary><div style="display:grid;gap:10px;margin-top:10px">${checkinList(s)}</div></details>
    <div class="tbl"><table><thead><tr><th>Player</th><th>Ref</th><th>Status</th><th>Court</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    ${S.bookings.some(b=>b.sessionId===s.id&&b.status==="cancelled")?`<details id="canc-${s.id}"><summary>Cancelled (${S.bookings.filter(b=>b.sessionId===s.id&&b.status==="cancelled").length})</summary><div style="display:grid;gap:6px;margin-top:8px">${S.bookings.filter(b=>b.sessionId===s.id&&b.status==="cancelled").map(b=>`<div class="row" style="justify-content:space-between"><span>${esc(b.name)} · Court ${esc(b.court)}</span><span class="row"><button class="btn small" data-restore="${esc(b.id)}">Restore</button><button class="btn small ghost danger" data-bdel="${esc(b.id)}">Delete</button></span></div>`).join("")}</div></details>`:""}
    ${(()=>{ const k=slotKey(s), want=S.players.filter(p=>(p.remind||[]).includes(k) && p.email && !S.bookings.some(b=>b.sessionId===s.id && b.playerId===p.id && b.status!=="cancelled"));
      if(!want.length) return "";
      const emails=want.map(p=>p.email).join(","), subj=`Book your Dropshot Folks session: ${fmtLong(s.date)}`;
      const body=`Hi! Places are open for ${fmtLong(s.date)}, ${s.start}–${s.end}${venueOf(s).venue?" at "+venueOf(s).venue:""}.\n\nBook here: ${BOOK_URL}\n\nSee you on court!`;
      return `<div class="banner info"><div class="grow"><b>${want.length} player${want.length>1?"s want":" wants"} a reminder</b> for this session and ${want.length>1?"haven't":"hasn't"} booked yet: ${want.map(p=>esc(p.name)).join(", ")}</div>
        <span class="row"><a class="btn small primary" href="mailto:?bcc=${encodeURIComponent(emails)}&subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}">Email them</a><button class="btn small" data-copy="${esc(emails)}">Copy emails</button></span></div>` })()}
    <details id="addp-${s.id}"><summary>Add a player to this session</summary>
      <div class="grid2" style="margin-top:8px">
        <label class="f">Name<input id="ap-name-${s.id}" placeholder="First and last name"></label>
        <label class="f">Court<select id="ap-court-${s.id}">${courtsOf(s).map(n=>`<option value="${n}">Court ${n} · ${esc(courtName(s,n))}</option>`).join("")}</select></label>
        <label class="f">Status<select id="ap-status-${s.id}">${Object.entries(STATUS).filter(([k])=>k!=="cancelled").map(([k,v])=>`<option value="${k}" ${k==="confirmed"?"selected":""}>${v.label}</option>`).join("")}</select></label>
        <div class="row" style="align-self:end"><button class="btn small primary" data-addp="${esc(s.id)}">Add player</button></div>
      </div></details>
    <details id="es-${s.id}"><summary>Edit session</summary>
      <div class="grid2" style="margin-top:8px">
        <label class="f">Date<input id="es-date-${s.id}" type="date" value="${esc(s.date)}"></label>
        <label class="f">Start<input id="es-start-${s.id}" type="time" value="${esc(s.start)}"></label>
        <label class="f">End<input id="es-end-${s.id}" type="time" value="${esc(s.end)}"></label>
        <label class="f">Title<input id="es-title-${s.id}" value="${esc(s.title||"")}"></label>
        <label class="f">Venue<input id="es-venue-${s.id}" value="${esc(s.venue||"")}"></label>
        <label class="f">Venue address<input id="es-address-${s.id}" value="${esc(s.address||"")}"></label>
        <label class="f" style="grid-column:1/-1">Note for players<input id="es-note-${s.id}" value="${esc(s.note||"")}"></label>
        <h3 style="grid-column:1/-1;margin-top:6px">Courts</h3>
        ${[1,2,3,4].map(n=>`<div class="bk" style="gap:6px"><b>Court ${n}</b>
          <label class="f">Name<input id="es-label${n}-${s.id}" value="${esc(courtName(s,n))}"></label>
          <span class="lbl">Levels on this court</span><div class="row">${LEVELS.map(l=>`<label class="row" style="gap:4px;font-size:.85rem"><input type="checkbox" style="width:auto" id="es-lv${n}${l.key}-${s.id}" ${courtLevels(s,n).includes(l.code)?"checked":""}>${lvChip(l.code)}</label>`).join("")}</div>
          <label class="f">Places<input id="es-cap${n}-${s.id}" type="number" min="0" max="30" value="${cap(s,n)}"></label></div>`).join("")}
        <p class="muted" style="grid-column:1/-1;font-size:.85rem">Set places to 0 if a court isn't running. Players go to the first running court that includes their level.</p>
        <label class="row" style="grid-column:1/-1;gap:6px"><input type="checkbox" style="width:auto" id="es-all-${s.id}"> Use this court setup for every upcoming ${esc(slotLabel(s))} session</label>
        <div class="row" style="grid-column:1/-1"><button class="btn small primary" data-savesess="${esc(s.id)}">Save session</button><button class="btn small" data-stdcourts="${esc(s.id)}">Use standard courts</button><span class="muted" style="font-size:.82rem">D- Court 1 · D+ Court 2 · C- Court 3 · C+ Court 4, and moves booked players to match.</span></div>
      </div></details>
    <textarea id="msg-${s.id}" rows="6" hidden readonly></textarea></div>`;
}
function reminderText(s){
  const v=venueOf(s);
  let t=`🏸 Dropshot Folks reminder: ${fmtLong(s.date)}, ${s.start}–${s.end}\n${v.venue?v.venue+"\n":""}${v.address?v.address+"\n"+mapsFor(v)+"\n":""}\n`;
  courtsOf(s).forEach(n=>{const names=S.bookings.filter(b=>b.sessionId===s.id&&b.court===n&&b.status==="confirmed").map(b=>b.name);
    t+=`Court ${n} (${courtName(s,n)}): ${names.length?names.join(", "):"places available"}\n`});
  const unpaid=S.bookings.filter(b=>b.sessionId===s.id&&b.status==="awaiting").map(b=>b.name);
  if(unpaid.length) t+=`\nStill to pay: ${unpaid.join(", ")}\n`;
  return t+"\nYour game rotation is live on the booking page. See you on court!";
}

/* ---------- actions ---------- */
function addLog(b,text){ return {...b, log:[...(b.log||[]), {at:nowIso(), text}]} }
async function bookSelected(){
  const p=meP(); if(!p) return;
  const ids=[...S.picks];
  if(!ids.length){ toast("Tick at least one session"); return }
  const lv=lvByCode(p.level), lines=[]; let ok=true;
  for(const sid of ids){
    const s=S.sessions.find(x=>x.id===sid); if(!s) continue;
    const taken={}; const used=c=>(taken[c] ??= activeIn(s.id,c).length);
    const place=async(id, body, court, label)=>{
      const full = used(court) >= cap(s,court);
      let b={...body, sessionId:s.id, court, status: full?"waitlist":"awaiting", ref:payRef(p.name,s), createdAt:nowIso(), log:[]};
      b=addLog(b, full?`Court ${court} is full. On the waiting list.`:`Place held on Court ${court}. Please pay to confirm.`);
      if(!await save("bookings",id,b)) { ok=false; lines.push(`${fmtDate(s.date)}: couldn't book ${esc(label)}`); return }
      if(!full) taken[court]++;
      lines.push(`${fmtDate(s.date)} · ${esc(label)}: Court ${court} — ${full?"full, added to the waiting list":"place held, pay to confirm"}`);
      if(full) ok=false;
    };
    const myId=`${s.id}_${p.id}`;
    const pickCourt=lvl=>{ const cs=courtsOf(s).filter(c=>courtLevels(s,c).includes(lvl)); return cs.find(c=>used(c)<cap(s,c)) ?? cs[0] ?? null };
    const myCourt=pickCourt(p.level);
    if(!myCourt){ ok=false; lines.push(p.level==="E" && beginnersBarred(s) ? `${fmtDate(s.date)}: Thursday sessions aren't for beginners (E). Coaching is a great way to start.` : `${fmtDate(s.date)}: this session isn't running a court for ${esc(p.level)} players`); continue }
    if(!S.bookings.find(b=>b.id===myId && b.status!=="cancelled")) await place(myId, {playerId:p.id, name:p.name, level:p.level}, myCourt, "You");
    let k = S.bookings.filter(b=>b.sessionId===s.id && b.hostId===p.id).length;
    for(const g of S.guests){
      k++; const gid=`${s.id}_${p.id}_g${k}`, gCourt=pickCourt(g.level);
      if(!gCourt){ ok=false; lines.push(`${fmtDate(s.date)} · ${esc(g.name)}: no court for ${esc(g.level)} players this session`); continue }
      await place(gid, {playerId:`guest-${p.id}-${k}`, hostId:p.id, name:`${g.name} (guest of ${p.name.split(" ")[0]})`, level:g.level, quiz:packQuiz(g.ans)}, gCourt, g.name);
    }
  }
  S.guests=[]; S.gq={}; S.picks.clear();
  S.result={ok, title: ok?"You're booked in. Pay to confirm your places.":"Booking done, with some notes:", lines};
  if(ok){ burst(); sfx("match") }
  render(); window.scrollTo({top:0,behavior:"smooth"});
}
async function setBooking(id,patch,text,msg="Updated"){
  const b=S.bookings.find(x=>x.id===id); if(!b) return;
  const {id:_,...body}=b; const next={...body,...patch}; return save("bookings",id,text?addLog(next,text):next,msg);
}
async function savePlayer(p){ const {id,...body}=p; return save("players",id,body) }
async function savePhoto(id,img){ return save("photos",id,{img, updatedAt:nowIso()}) }
async function downloadIcs(b){
  const s=S.sessions.find(x=>x.id===b.sessionId); if(!s) return;
  const d=x=>x.replace(/[-:]/g,""), st=`${d(s.date)}T${d(s.start)}00`, en=`${d(s.date)}T${d(s.end)}00`;
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Dropshot Folks//Booking//EN","BEGIN:VEVENT",`UID:${esc(b.id)}@dropshotfolks`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}Z`,
    `DTSTART;TZID=Europe/London:${st}`,`DTEND;TZID=Europe/London:${en}`,`SUMMARY:Dropshot Folks – Court ${esc(b.court)}`,`LOCATION:${[venueOf(s).venue,venueOf(s).address].filter(Boolean).join(", ").replace(/,/g,"\\,")}`,
    "BEGIN:VALARM","TRIGGER:-P1D","ACTION:DISPLAY","DESCRIPTION:Dropshot Folks tomorrow","END:VALARM","BEGIN:VALARM","TRIGGER:-PT2H","ACTION:DISPLAY","DESCRIPTION:Dropshot Folks in 2 hours","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  try{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"})); a.download=`dropshotfolks-${s.date}.ics`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000) }
  catch{ toast("Use Add to Google Calendar instead") }
}
function gcalUrl(b,s){
  const d=x=>x.replace(/[-:]/g,"");
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(`Dropshot Folks – Court ${esc(b.court)}`)+
    `&dates=${d(s.date)}T${d(s.start)}00/${d(s.date)}T${d(s.end)}00&ctz=Europe/London&location=`+encodeURIComponent([venueOf(s).venue,venueOf(s).address].filter(Boolean).join(", "));
}
function arm(t,label,fn){ if(t.dataset.armed){ fn(); return } t.dataset.armed="1"; const old=t.textContent; t.textContent=label; setTimeout(()=>{ if(t.isConnected){ delete t.dataset.armed; t.textContent=old } },4000) }

document.addEventListener("click", async e=>{
  const t=e.target.closest("button,a"); if(!t) return;
  const ds=t.dataset;
  if(ds.view){ S.view=ds.view; S.tab=TABS[S.view][0][0]; ls.set("dsf:view",S.view); ls.set("dsf:tab",S.tab); render(); window.scrollTo({top:0}); return }
  if(t.closest("#tabs")){ S.tab=ds.tab; S.result=null; ls.set("dsf:tab",S.tab); render(); return }
  if(ds.tabGo){ S.tab=ds.tabGo; ls.set("dsf:tab",S.tab); render(); window.scrollTo({top:0}); return }
  if(ds.go){ e.preventDefault(); S.tab=ds.go; render(); window.scrollTo({top:0}); return }
  if(ds.golive){ e.preventDefault(); S.liveSess=ds.golive; S.tab="live"; render(); window.scrollTo({top:0}); return }
  if(ds.live){ S.liveSess=ds.live; render(); return }
  if(t.id==="bookSel"){ t.disabled=true; await bookSelected(); t.disabled=false; return }
  if(t.id==="addGuest"){
    const name=$("#g-name").value.trim(), level=levelFrom(S.gq);
    if(!name){ toast("Add your guest's name"); return }
    if(!level){ toast("Answer all five questions for your guest"); return }
    S.guests.push({name, level, ans:{...S.gq}}); S.gq={}; $("#g-name").value=""; render(); toast(`${name} added`); return }
  if(ds.rmguest!=null){ S.guests.splice(Number(ds.rmguest),1); render(); return }
  if(ds.copy!=null){ copyText(ds.copy); return }
  if(ds.paid){
    const b=S.bookings.find(x=>x.id===ds.paid);
    await setBooking(ds.paid,{status:"paid"},"You marked this as paid. Waiting for the organiser to check.","Thanks, the organiser will check");
    for(const g of S.bookings.filter(x=>x.hostId===b.playerId && x.sessionId===b.sessionId && x.status==="awaiting")) await setBooking(g.id,{status:"paid"},"Paid by host.",null);
    return }
  if(ds.cancel){ arm(t,"Tap again to cancel",()=>setBooking(ds.cancel,{status:"cancelled"},"Cancelled by player.","Booking cancelled")); return }
  if(ds.ics){ downloadIcs(S.bookings.find(b=>b.id===ds.ics)); return }
  if(t.id==="signOut"){ if(Store.mode==="db"){ await firebase.auth().signOut(); location.reload() } else { S.me=null; ls.set("dsf:me",null); render() } return }
  if(t.id==="googleIn"){ try{ await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()) }catch(err){ if(err?.code!=="auth/popup-closed-by-user") toast("Couldn't sign in with Google. Try the email link instead.") } return }
  if(t.id==="reqBtn" || t.id==="quizReq"){
    const lv = t.id==="reqBtn" ? $("#reqLevel").value : ds.lv;
    if(await savePlayer({...meP(), levelRequest:lv})) toast("Request sent to the organiser"); return }
  // organiser
  if(ds.confirm){ setBooking(ds.confirm,{status:"confirmed"},"Payment received. Your place is confirmed — see you on court!","Confirmed"); return }
  if(ds.offer){ setBooking(ds.offer,{status:"awaiting"},"A place opened up. Please pay to confirm."); return }
  if(ds.absent){ const b=S.bookings.find(x=>x.id===ds.absent); setBooking(ds.absent,{absent:!b.absent},null, b.absent?"Back in the rotation":"Taken out of the rotation"); return }
  if(ds.acancel){ arm(t,"Confirm cancel",()=>setBooking(ds.acancel,{status:"cancelled"},"The organiser cancelled this booking.")); return }
  if(ds.approve){ const p=S.players.find(x=>x.id===ds.approve), lv=p.levelRequest;
    if(await savePlayer({...p, level:lv, levelRequest:null, verified:true})){ const n=await moveToLevelCourt(p.id, lv); toast(n?`Level updated. ${n} upcoming booking${n>1?"s":""} moved to their new court.`:"Level updated") } return }
  if(ds.decline){ const p=S.players.find(x=>x.id===ds.decline); await savePlayer({...p, levelRequest:null}); toast("Request declined"); return }
  if(ds.msg){ const s=S.sessions.find(x=>x.id===ds.msg); copyText(reminderText(s), $("#msg-"+s.id)); return }
  if(ds.emails){ const s=S.sessions.find(x=>x.id===ds.emails);
    const list=[...new Set(S.bookings.filter(b=>b.sessionId===s.id && ACTIVE.includes(b.status)).map(b=>S.players.find(p=>p.id===(b.hostId||b.playerId))?.email).filter(Boolean))];
    if(!list.length){ toast("No player emails for this session yet"); return }
    copyText(list.join(", "), $("#msg-"+s.id)); return }
  if(ds.toggle){ const s=S.sessions.find(x=>x.id===ds.toggle); const {id,...body}=s; save("sessions",id,{...body,open:s.open===false},"Updated"); return }
  if(ds.remics){ const sl=slots().find(x=>x.k===ds.remics); if(sl) remindIcs(sl); return }
  if(ds.pedit!=null){ S.pedit=ds.pedit||null; render(); return }
  if(ds.psave){ const p=S.players.find(x=>x.id===ds.psave); const name=$("#pe-name").value.trim(), email=$("#pe-email").value.trim(), phone=$("#pe-phone").value.trim();
    if(!name){ toast("Add a name"); return } if(email && !validEmail(email)){ toast("Enter a valid email address"); return }
    if(await savePlayer({...p, name, email, phone})){ S.pedit=null; toast("Player updated"); render() } return }
  if(ds.pdel){ arm(t,"Tap again to delete",()=>Store.del("players",ds.pdel).then(()=>{ S.pedit=null; toast("Player deleted. Their bookings stay until you cancel them.") }).catch(()=>toast("Couldn't delete"))); return }
  if(ds.restore){ setBooking(ds.restore,{status:"awaiting"},"Booking restored by the organiser.","Booking restored"); return }
  if(ds.bdel){ arm(t,"Tap again to delete",()=>Store.del("bookings",ds.bdel).then(()=>toast("Booking deleted")).catch(()=>toast("Couldn't delete"))); return }
  if(ds.addp){ const sid=ds.addp, s=S.sessions.find(x=>x.id===sid); const name=$("#ap-name-"+sid).value.trim(), court=Number($("#ap-court-"+sid).value), status=$("#ap-status-"+sid).value;
    if(!name){ toast("Add the player's name"); return }
    const ts=Date.now().toString(36), b={sessionId:sid, playerId:`walkin-${ts}`, name, level:courtLevels(s,court)[0], court, status, ref:payRef(name,s), createdAt:nowIso(), addedBy:"organiser", log:[]};
    if(await save("bookings",`${sid}_w${ts}`, addLog(b,`Added to Court ${court} by the organiser.`), `${name} added to Court ${court}`)) $("#ap-name-"+sid).value="";
    return }
  if(ds.savesess){ const sid=ds.savesess, s=S.sessions.find(x=>x.id===sid), v=k=>$(`#es-${k}-${sid}`).value.trim();
    if(!v("date")||!v("start")||!v("end")){ toast("Add a date, start and end time"); return }
    const capacity={}, courts={};
    for(const n of [1,2,3,4]){
      const x=Number($(`#es-cap${n}-${sid}`).value); capacity[n]=Number.isFinite(x)&&x>=0?x:0;
      const levels=LEVELS.filter(l=>$(`#es-lv${n}${l.key}-${sid}`).checked).map(l=>l.code);
      if(capacity[n]>0 && !levels.length){ toast(`Pick at least one level for Court ${n}, or set its places to 0`); return }
      courts[n]={label:$(`#es-label${n}-${sid}`).value.trim() || lvByCourt(n).name, levels:levels.length?levels:[lvByCourt(n).code]};
    }
    const {id,...body}=s;
    if(!await save("sessions",id,{...body, date:v("date"), start:v("start"), end:v("end"), title:v("title"), venue:v("venue"), address:v("address"), note:v("note"), capacity, courts},"Session updated")) return;
    if($(`#es-all-${sid}`)?.checked){
      const same=upcoming().filter(x=>x.id!==sid && slotKey(x)===slotKey(s));
      for(const x of same){ const {id:xid,...xb}=x; await save("sessions",xid,{...xb, capacity, courts}) }
      toast(`Court setup copied to ${same.length} more session${same.length===1?"":"s"}`);
    }
    return }
  if(ds.qnext||ds.qback||ds.qredo){ const k=ds.qnext||ds.qback||ds.qredo, ans=k==="rq"?S.reg.ans:k==="gq"?S.gq:S.quiz;
    let i=S.qpos[k]; if(i==null){ i=QUIZ.findIndex((_,j)=>ans[j]==null); if(i<0) i=QUIZ.length }
    S.qfb[k]=null;
    if(ds.qredo){ if(k==="rq") S.reg.ans={}; else if(k==="gq") S.gq={}; else S.quiz={}; S.qpos[k]=0 }
    else S.qpos[k] = ds.qnext ? Math.min(QUIZ.length,i+1) : Math.max(0,i-1);
    render(); sfx("hit"); quizCall(k, ds.qredo ? {} : ans); return }
  if(ds.qfx){ S.fx=!S.fx; ls.set("dsf:fx",S.fx); if(!S.fx) try{ speechSynthesis.cancel() }catch{}; render();
    if(S.fx){ const k=t.closest("#quiz")?"q":t.closest("#regForm")?"rq":"gq"; quizCall(k, k==="rq"?S.reg.ans:k==="gq"?S.gq:S.quiz) } return }
  if(ds.alertok){ $("#alert").hidden=true; return }
  if(ds.kopen){ const code=($("#k-code")?.value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(code.length<4){ toast("Enter the session code"); return }
    if(Store.mode==="db" && !S.uid){ ls.set("dsf:kcode",code);
      try{ await firebase.auth().signInAnonymously() }   // the page reloads signed in, then the code is checked
      catch(e){ ls.set("dsf:kcode",null); toast(e?.code==="auth/operation-not-allowed"?"Session view isn't switched on yet. Ask the organiser.":"Couldn't open session view. Check your connection.") }
      return }
    tryUnlock(code); return }
  if(ds.kexit){ const sid=S.kiosk; S.kiosk=null; S.unlock=null; ls.set("dsf:kiosk",null);
    if(Store.mode==="db" && S.uid){ try{ await Store.db.collection("unlocks").doc(S.uid).delete() }catch{}
      if(firebase.auth().currentUser?.isAnonymous){ await firebase.auth().signOut(); return } }
    render(); toast("Session view closed"); return }
  if(ds.newcode){ const sid=ds.newcode, code=newCode();
    if(Store.mode==="db"){ try{ await Store.db.collection("secrets").doc(sid).set({code}); toast(`Code ${code} ready`) }catch{ toast("Couldn't save the code") } }
    else { S.secrets[sid]=code; render() }
    return }
  if(ds.checkin){ const b=S.bookings.find(x=>x.id===ds.checkin); if(!b) return; const s=S.sessions.find(x=>x.id===b.sessionId);
    if(!canRun(s)){ toast("Open session view to check people in"); return }
    const v=ds.v, patch = v==="in" ? {checkedIn:true, absent:false} : v==="out" ? {checkedIn:false, absent:true} : {checkedIn:false, absent:false};
    setBooking(b.id, patch, v==="in"?"Checked in.":v==="out"?"Marked not here.":"Check-in cleared.", v==="in"?`${b.name} is here`:v==="out"?`${b.name} marked not here`:"Cleared"); return }
  if(ds.stdcourts){ const sid=ds.stdcourts; arm(t,"Tap again to reset courts",()=>standardCourts(sid)); return }
  if(ds.score){ const s=S.sessions.find(x=>x.id===ds.score), gi=Number(ds.gi), box=t.closest(".scorein"); if(!s||!box) return;
    const [ia,ib]=box.querySelectorAll("input"), sa=Number(ia.value), sb=Number(ib.value);
    if(ia.value===""||ib.value===""||!Number.isInteger(sa)||!Number.isInteger(sb)||sa<0||sb<0||sa>30||sb>30){ toast("Enter both scores (0–30)"); return }
    if(sa===sb){ toast("Scores can't be level"); return }
    const c=Number(ds.c); if(![1,2,3,4].includes(c)) return;
    const g=courtPlan(s,c).games[gi], prev=scoreOf(s,c,gi); if(!g && !prev) return;
    const teams = prev ? [prev.a,prev.b] : g.teams;
    const {id,...body}=s, scores={...(s.scores||{})}; scores[c]={...(scores[c]||{}), [gi]:{a:teams[0], b:teams[1], sa, sb, at:nowIso()}};
    save("sessions",id,{...body, scores},`Court ${c} game ${gi+1}: ${sa}–${sb} saved`); return }
  if(ds.unscore){ const s=S.sessions.find(x=>x.id===ds.unscore), gi=String(ds.gi); if(!s) return;
    arm(t,"Tap again to clear",()=>{ const {id,...body}=s, scores={...(s.scores||{})}, c=Number(ds.c), cs={...(scores[c]||{})}; delete cs[gi]; scores[c]=cs;
      save("sessions",id,{...body, scores},`Game ${Number(gi)+1} score cleared`) }); return }
  if(ds.resave){ const s=S.sessions.find(x=>x.id===ds.sid), k=ds.resave, gi=Number(ds.gi), c=ds.c;
    const ids=[0,1,2,3].map(i=>$(`#re-${k}-${gi}-${i}`).value);
    if(new Set(ids).size!==4){ toast("Pick four different players"); return }
    const {id,...body}=s, rot={...(s.rot||{})}; rot[c]={...(rot[c]||{}), [gi]:ids};
    save("sessions",id,{...body, rot},`Game ${gi+1} updated`); return }
  if(ds.rereset){ const s=S.sessions.find(x=>x.id===ds.sid), gi=String(ds.gi), c=ds.c;
    const {id,...body}=s, rot={...(s.rot||{})}, court={...(rot[c]||{})}; delete court[gi]; rot[c]=court;
    save("sessions",id,{...body, rot},`Game ${Number(gi)+1} back to automatic`); return }
  if(ds.reall){ const s=S.sessions.find(x=>x.id===ds.reall), c=ds.c; const {id,...body}=s, rot={...(s.rot||{})}; rot[c]={};
    arm(t,"Tap again to reset",()=>save("sessions",id,{...body, rot},"Rotation back to automatic")); return }
  if(ds.delsess){ arm(t,"Tap again to delete",()=>Store.del("sessions",ds.delsess).then(()=>toast("Session deleted")).catch(()=>toast("Couldn't delete"))); return }
});
document.addEventListener("change", async e=>{
  const t=e.target;
  const m=/^(rq|gq|q)(\d+)$/.exec(t.name||"");
  if(m){ const target = m[1]==="rq"?S.reg.ans : m[1]==="gq"?S.gq : S.quiz, qi=Number(m[2]), x=QUIZ[qi]; target[qi]=Number(t.value);
    // swipe on to the next card; quick-quiz answers show why on the next card
    const ok = target[qi]===x.correct;
    S.qfb[m[1]] = x.correct!=null ? {i:qi, ok} : {i:qi, self:true, v:target[qi]}; S.qpos[m[1]]=qi+1; render();
    sfx("hit"); setTimeout(()=>sfx(x.correct==null?"power":ok?"win":"lose"),120); quizCall(m[1], target); return }
  if(t.id==="r-photo" || t.id==="photoChange"){
    const file=t.files?.[0]; if(!file) return;
    try{ const img=await toThumb(file);
      if(t.id==="r-photo"){ S.reg.photo=img; render() }
      else if(await savePhoto(S.me,img)) toast("Photo updated");
    }catch{ toast("That file isn't a photo we can use. Try a JPG or PNG.") }
    return }
  if(t.dataset.setlv){ const p=S.players.find(x=>x.id===t.dataset.setlv), lv=t.value;
    if(await savePlayer({...p, level:lv, verified:true})){ const n=await moveToLevelCourt(p.id, lv); toast(n?`Level updated. ${n} upcoming booking${n>1?"s":""} moved to their new court.`:"Level updated") } return }
  if(t.dataset.verify){ const p=S.players.find(x=>x.id===t.dataset.verify); savePlayer({...p, verified:t.checked}); return }
  if(t.dataset.pick){ if(t.checked) S.picks.add(t.dataset.pick); else S.picks.delete(t.dataset.pick); render(); return }
  if(t.dataset.remind){ const p=meP(); if(!p) return; const k=t.dataset.remind, cur=p.remind||[];
    const next=t.checked?[...new Set([...cur,k])]:cur.filter(x=>x!==k);
    if(await savePlayer({...p, remind:next})) toast(t.checked?"Reminder on. Add it to your calendar below.":"Reminder off"); return }
  if(t.dataset.status){ const st=t.value; setBooking(t.dataset.status,{status:st},`Status set to ${STATUS[st]?.label||st} by the organiser.`,"Status updated"); return }
  if(t.dataset.regame){ S.rotEdit[t.dataset.regame]=Number(t.value); render(); return }
  if(t.dataset.court){ const n=Number(t.value); setBooking(t.dataset.court,{court:n},`Moved to Court ${n} by the organiser.`,`Moved to Court ${n}`); return }
  if(t.dataset.gamemins){ const s=S.sessions.find(x=>x.id===t.dataset.gamemins); const {id,...body}=s; save("sessions",id,{...body,gameMins:Number(t.value)},"Game length updated"); return }
});
document.addEventListener("submit", async e=>{
  e.preventDefault();
  if(e.target.id==="emailIn"){
    const email=$("#in-email").value.trim();
    if(!validEmail(email)){ toast("Enter a valid email address"); return }
    try{ await firebase.auth().sendSignInLinkToEmail(email,{url:location.origin+location.pathname, handleCodeInApp:true}); ls.set("dsf:signin",email); toast("Check your email for the sign-in link") }
    catch{ toast("Couldn't send the link. Check the address and try again.") }
    return }
  if(e.target.id==="regForm"){
    const email=$("#r-email").value.trim(), name=$("#r-name").value.trim(), phone=$("#r-phone").value.trim(), level=levelFrom(S.reg.ans);
    if(!validEmail(email)){ toast("Enter a valid email address"); return }
    const id = Store.mode==="db" ? S.uid : emailKey(email);
    if(!id){ toast("Sign in to register"); return }
    const ex=S.players.find(p=>p.id===id);
    if(ex && Store.mode!=="db"){ S.me=id; ls.set("dsf:me",id); toast(`Welcome back, ${ex.name}`); render(); return }
    if(!name){ toast("Add your full name"); return }
    if(!level){ toast("Answer all five level questions"); return }
    if(await savePlayer({id,email,name,phone,level,quiz:packQuiz(S.reg.ans),verified:false,levelRequest:null,createdAt:nowIso()})){
      if(S.reg.photo) await savePhoto(id,S.reg.photo);
      S.me=id; if(Store.mode!=="db") ls.set("dsf:me",id); S.reg={ans:{},photo:null}; burst(); toast(`Welcome! You're ${level} ${lvByCode(level).name}.`); render() }
  }
  if(e.target.id==="sessForm"){
    const date=$("#s-date").value, start=$("#s-start").value, end=$("#s-end").value, c=Number($("#s-cap").value)||PER_COURT, weeks=Number($("#s-weeks").value)||1;
    if(!date||!start||!end){ toast("Add a date, start and end time"); return }
    const base={start,end,gameMins:Number($("#s-mins").value)||GAME_MINS,title:$("#s-title").value.trim(),note:$("#s-note").value.trim(),venue:$("#s-venue").value.trim(),address:$("#s-address").value.trim(),capacity:{1:c,2:c,3:c,4:c},open:true};
    for(let w=0; w<weeks; w++){
      const d=new Date(date+"T12:00:00"); d.setDate(d.getDate()+7*w);
      const day=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if(!await save("sessions",`s${day}-${start.replace(":","")}`,{...base,date:day})) return;
    }
    toast(weeks>1?`${weeks} sessions added`:"Session added");
  }
  if(e.target.id==="cfgForm"){
    const cfg={...S.cfg}; Object.keys(DEFAULT_CFG).forEach(k=>{const el=$("#c-"+k); if(el) cfg[k]=el.value.trim()});
    save("config","main",cfg,"Club details saved");
  }
});

/* ---------- clock: countdowns tick, courts rotate on their own ---------- */
function tickCountdowns(){
  document.querySelectorAll(".cd[data-at]").forEach(el=>{
    const ms=new Date(el.dataset.at)-Date.now();
    if(ms<=0){ el.textContent="now"; return }
    const d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/3600e3), m=Math.floor(ms%3600e3/60e3), s=Math.floor(ms%60e3/1e3);
    el.textContent = d>0 ? `${d}d ${h}h ${m}m` : h>0 ? `${h}h ${m}m` : `${m}:${String(s).padStart(2,"0")}`;
  });
}
setInterval(()=>{
  tickCountdowns();
  if(S.loaded && liveKey()!==S.liveKey) render();
},1000);

/* ---------- boot ---------- */
render();
(async()=>{
  await Store.init();
  if(Store.mode==="db"){
    const A=firebase.auth();
    if(A.isSignInWithEmailLink(location.href)){
      const em = ls.get("dsf:signin",null) || prompt("Confirm your email to finish signing in");
      try{ await A.signInWithEmailLink(em, location.href); ls.set("dsf:signin",null) }catch{ toast("That sign-in link has expired. Ask for a new one.") }
      history.replaceState(null,"",location.pathname);
    }
    await new Promise(res=>{ let first=true; A.onAuthStateChanged(u=>{
      if(!first){ if((u?.uid||null)!==S.uid) location.reload(); return }
      first=false; S.uid=u?.uid||null; S.me=S.uid; S.email=u?.email||"";
      S.isAdmin = !!u && u.emailVerified && ADMINS.includes(S.email.toLowerCase()); res() }) });
  } else {
    S.isAdmin = LOCAL; // preview: let the organiser try everything
    S.me = ls.get("dsf:me", null);
  }
  const first={sessions:1,bookings:1,players:1,config:1,photos:1};
  const once=k=>{ if(first[k]){ delete first[k]; if(!Object.keys(first).length){ S.loaded=true;
      // a session code typed before signing in on this device
      const kc=ls.get("dsf:kcode",null); if(kc && S.uid){ ls.set("dsf:kcode",null); S.tab="court"; tryUnlock(kc) } } } render() };
  Store.listen("sessions", d=>{S.sessions=d; once("sessions")});
  Store.listen("bookings", d=>{S.bookings=d; once("bookings")});
  if(Store.mode==="db" && !S.isAdmin){
    // players can only read their own record
    if(S.uid) Store.db.collection("players").doc(S.uid).onSnapshot(d=>{S.players=d.exists?[{id:d.id,...d.data()}]:[]; once("players")}, ()=>{S.players=[]; once("players")});
    else { S.players=[]; once("players") }
  } else Store.listen("players", d=>{S.players=d; once("players")});
  if(Store.mode==="db" && S.uid) Store.db.collection("unlocks").doc(S.uid).onSnapshot(d=>{ S.unlock=d.exists?d.data():null; render() }, ()=>{});
  if(Store.mode==="db" && S.isAdmin) Store.listen("secrets", d=>{ S.secrets=Object.fromEntries(d.map(x=>[x.id,x.code])); render() });
  Store.listen("photos", d=>{S.photos=Object.fromEntries(d.map(x=>[x.id,x.img])); once("photos")});
  Store.listen("config", d=>{const m=d.find(x=>x.id==="main"); S.cfg={...DEFAULT_CFG,...(m||{})}; delete S.cfg.id; once("config")});
})();
