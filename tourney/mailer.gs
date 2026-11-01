// Dropshot Folks · emails from your own Gmail
// Club sessions: reminders with the session rules, and cancellation notices (booking page → Club details).
// Tournaments: each confirmed team's confirmation, team code and QR pass, and the
// "Dropshot Folks — Tournament records" Google Sheet in your Drive (Teams tab → 📊 Records).
// Set up once: script.google.com → New project → paste this whole file → Deploy → New deployment →
// type "Web app", Execute as "Me", Who has access "Anyone" → Deploy → copy the Web app URL into
// the booking page (Club details → 📧 Emails to players). One script does both.
// Only the organiser account below can send through it: every request carries the organiser's
// sign-in token, which is checked with Google before anything is sent.

const ORGANISER = 'info@dropshotfolks.co.uk';
const FIREBASE_KEY = 'AIzaSyAP7O7DMk-sJFCqICW2dPZar53TlVi9jaA'; // the public web key from book/firebase-config.js

// Open the Web app URL in a browser: if it says "working", the page can reach it.
function doGet() {
  return ContentService.createTextOutput('Dropshot Folks email script is working ✓  Daily emails left: ' + MailApp.getRemainingDailyQuota());
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.login) return reply(loginCode(d));   // anyone: sign in with a 6-digit code sent to their email
    if (d.wl) return reply(waitingList(d));   // club sessions: any signed-in player can join a waiting list or report a freed place
    const who = checkOrganiser(d.token);
    if (!who) return reply({ ok: false, error: 'Only the organiser can send emails.' });
    if (d.sheet) {
      const lock = LockService.getScriptLock(); lock.waitLock(30000);   // two open pages can't write over each other
      try { return reply(writeSheet(d.sheet)); } finally { lock.releaseLock(); }
    }
    if (d.test) {
      MailApp.sendEmail({ to: ORGANISER, subject: 'Dropshot Folks emails are working ✓', name: 'Dropshot Folks',
        htmlBody: '<p>Dropshot Folks emails are set up. Club session reminders, rules and cancellations, and tournament confirmations, will now send from this account.</p>' });
      return reply({ ok: true, left: MailApp.getRemainingDailyQuota() });
    }
    const email = s => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(String(s || '').trim());
    const to = String(d.to || '').trim();
    if (!email(to)) return reply({ ok: false, error: 'No valid email for this team.' });
    const cc = (d.cc || []).map(s => String(s).trim()).filter(email).filter(s => s.toLowerCase() !== to.toLowerCase()).slice(0, 5).join(',');
    const mail = {
      to: to, cc: cc, replyTo: ORGANISER, name: 'Dropshot Folks',
      subject: String(d.subject || 'Your team is confirmed').slice(0, 200),
      body: String(d.text || ''), htmlBody: String(d.html || '')
    };
    if (d.png) {   // tournament emails carry the team's QR pass; session emails have none
      const qr = Utilities.newBlob(Utilities.base64Decode(String(d.png)), 'image/png', String(d.file || 'team-pass.png').slice(0, 80));
      mail.inlineImages = { qr: qr }; mail.attachments = [qr];
    }
    MailApp.sendEmail(mail);
    return reply({ ok: true, left: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return reply({ ok: false, error: String(err && err.message || err) });
  }
}

// Tournament records: one Google Sheet (made the first time) with a tab per list. Every update rewrites the rows of the
// tournaments it sends; rows of tournaments no longer on the website (column A = tournament ID) are kept as an archive.
function writeSheet(data) {
  const props = PropertiesService.getScriptProperties();
  let ss = null, id = props.getProperty('SHEET_ID');
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) { ss = SpreadsheetApp.create('Dropshot Folks — Tournament records'); props.setProperty('SHEET_ID', ss.getId()); }
  const sent = {}; (data.tids || []).forEach(function (t) { sent[String(t)] = true; });
  (data.tabs || []).forEach(function (tab) {
    const name = String(tab.name || 'Sheet').replace(/[\[\]\*\?\/\\:]/g, ' ').slice(0, 99);
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    const old = sh.getLastRow() > 1 ? sh.getDataRange().getValues().slice(1) : [];
    const kept = old.filter(function (r) { return r[0] !== '' && !sent[String(r[0])]; });
    const rows = (tab.rows || []).map(function (r) { return r.map(function (v) { return v == null ? '' : v; }); }).concat(kept);
    const width = Math.max(1, rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0));
    // text that Sheets would turn into a number or formula (phones like 07700…, +44…) stays text
    const text = function (v) { return typeof v === 'string' && /^[\d+=\-@]/.test(v) ? "'" + v : v; };
    const grid = rows.map(function (r) { r = r.slice(0, width).map(text); while (r.length < width) r.push(''); return r; });
    sh.clear();
    if (grid.length) {
      sh.getRange(1, 1, grid.length, width).setValues(grid);
      sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#F3E9D9');
      sh.setFrozenRows(1);
    }
  });
  const first = ss.getSheetByName('Sheet1');
  if (first && ss.getSheets().length > 1 && first.getLastRow() === 0) ss.deleteSheet(first);
  return { ok: true, url: ss.getUrl(), at: new Date().toISOString() };
}

// Ask Google who the sign-in token belongs to; accept only the verified organiser email.
function checkOrganiser(token) {
  if (!token) return null;
  const r = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_KEY, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Referer: 'https://dropshotfolks.co.uk/' },
    payload: JSON.stringify({ idToken: token })
  });
  const u = ((JSON.parse(r.getContentText() || '{}').users) || [])[0];
  return u && u.emailVerified && String(u.email).toLowerCase() === ORGANISER ? u.email : null;
}

// ---------- login codes ----------
// "start": email a 6-digit code (valid 10 minutes; at most 5 codes an hour per address, 80 an hour in total).
// "verify": if the code is right, the player's Firebase account (found by email, or made) is marked as
// email-confirmed and given a long random password that only this script and their browser ever see;
// the browser signs in with it straight away. The same password is reused, so other devices stay signed in.
// Needs the Identity Toolkit admin API: the cloud-platform scope in appsscript.json, and this Google account
// must own the Firebase project.
const PROJECT = 'dropshotfolks';
const DISPOSABLE = ['onldm.net','mailinator.com','mailinator.net','yopmail.com','yopmail.net','yopmail.fr','guerrillamail.com','guerrillamail.info','guerrillamail.net','guerrillamail.org','guerrillamailblock.com','sharklasers.com','grr.la','pokemail.net','spam4.me','10minutemail.com','10minutemail.net','10minutemail.co.uk','temp-mail.org','temp-mail.io','tempmail.com','tempmail.net','tempmailo.com','tempmail.plus','tmpmail.org','tmpmail.net','tmpeml.com','getnada.com','nada.email','dispostable.com','maildrop.cc','mailnesia.com','trashmail.com','trashmail.de','trashmail.net','mohmal.com','emailondeck.com','fakeinbox.com','throwawaymail.com','mintemail.com','mytemp.email','tempinbox.com','burnermail.io','inboxkitten.com','mail.tm','mail.gw','dropmail.me','10mail.org','emltmp.com','spamgourmet.com','mailpoof.com','moakt.com','tempr.email','discard.email','fexpost.com','fextemp.com','kzccv.com','qiott.com','wuuvo.com','cmail.club','linshiyouxiang.net','1secmail.com','1secmail.org','1secmail.net','txcct.com','zslsz.com','rteet.com','dpptd.com','bheps.com','mailcatch.com','spambox.us','tempail.com','luxusmail.org','mailtemp.uk','owlymail.com','laafd.com','vjuum.com','ezztt.com','icznn.com','knmcadibav.com'];   // throwaway inbox services

function loginCode(d) {
  const email = String(d.email || '').trim().toLowerCase();
  if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email) || email.length > 120) return { ok: false, error: 'Enter a valid email address' };
  const cache = CacheService.getScriptCache(), key = 'lc_' + Utilities.base64EncodeWebSafe(email).slice(0, 200), now = Date.now();
  if (DISPOSABLE.indexOf(email.split('@').pop()) >= 0) return { ok: false, error: "Please use your normal email address. Temporary inboxes can't be used." };
  if (d.login === 'start') {
    const mine = JSON.parse(cache.get(key + '_n') || '[]').filter(t => now - t < 3600e3);
    if (mine.length >= 5) return { ok: false, error: 'Too many codes for this email. Wait an hour, or sign in with Google.' };
    const all = JSON.parse(cache.get('lc_all') || '[]').filter(t => now - t < 3600e3);
    if (all.length >= 80) return { ok: false, error: 'Too many sign-ins right now. Please try again in a little while.' };
    const code = String(100000 + Math.floor(Math.random() * 900000));
    cache.put(key, JSON.stringify({ code: code, tries: 0 }), 600);
    mine.push(now); cache.put(key + '_n', JSON.stringify(mine), 3600);
    all.push(now); cache.put('lc_all', JSON.stringify(all), 3600);
    MailApp.sendEmail({ to: email, name: 'Dropshot Folks', subject: code + ' is your Dropshot Folks login code',
      body: 'Your Dropshot Folks login code is ' + code + '\n\nType it on the page where you asked for it. It works for 10 minutes.\nIf you didn\'t ask for it, you can ignore this email.',
      htmlBody: '<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:16px;line-height:1.55;color:#24100F;max-width:480px">' +
        '<p>Your Dropshot Folks login code is</p><p style="font-size:34px;font-weight:800;letter-spacing:.25em;color:#7A2331;margin:8px 0 16px">' + code + '</p>' +
        '<p>Type it on the page where you asked for it. It works for 10 minutes.</p><p style="color:#715250;font-size:14px">If you didn\'t ask for it, you can ignore this email.</p></div>' });
    return { ok: true };
  }
  if (d.login === 'verify') {
    const rec = JSON.parse(cache.get(key) || 'null');
    if (!rec) return { ok: false, error: 'That code has expired. Ask for a new one.' };
    if (String(d.code || '').replace(/\D/g, '') !== rec.code) {
      rec.tries++;
      if (rec.tries >= 5) cache.remove(key); else cache.put(key, JSON.stringify(rec), 600);
      return { ok: false, error: rec.tries >= 5 ? 'Too many wrong tries. Ask for a new code.' : "That code isn't right. Check the email and try again." };
    }
    cache.remove(key);
    const props = PropertiesService.getScriptProperties(), pk = 'pw_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email)).slice(0, 40);
    let pw = props.getProperty(pk);
    const look = idt('/accounts:lookup', { email: [email] });
    if (look.code !== 200) return { ok: false, setup: true, error: 'Login codes aren\'t switched on yet. Use Google or the email link for now.' };
    const u = (look.body.users || [])[0];
    const fresh = !pw || !u || !u.emailVerified || !(u.providerUserInfo || []).some(p => p.providerId === 'password');
    if (fresh) {
      pw = pw || (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
      const res = u ? idt('/accounts:update', { localId: u.localId, password: pw, emailVerified: true })
                    : idt('/accounts', { email: email, password: pw, emailVerified: true });
      if (res.code !== 200) return { ok: false, setup: true, error: "Couldn't sign you in. Use Google or the email link for now." };
      props.setProperty(pk, pw);
    }
    return { ok: true, pw: pw };
  }
  return { ok: false, error: 'Unknown request' };
}
function idt(path, body) {
  const r = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/' + PROJECT + path, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true, payload: JSON.stringify(body),
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'X-Goog-User-Project': PROJECT } });
  return { code: r.getResponseCode(), body: JSON.parse(r.getContentText() || '{}') };
}

// ---------- club session waiting lists ----------
// "join": a player went on a waiting list; their email (from their own sign-in) is remembered for that session.
// "freed": someone cancelled. The script reads the session and its bookings itself (they're public), and only
// if a court really has a free place does it email the people waiting for that court. At most once per court
// every 10 minutes, so it can't be used to spam anyone.
function signedInUser(token) {
  if (!token) return null;
  const r = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_KEY, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Referer: 'https://dropshotfolks.co.uk/' }, payload: JSON.stringify({ idToken: token })
  });
  const u = ((JSON.parse(r.getContentText() || '{}').users) || [])[0];
  return u && u.email ? { uid: u.localId, email: String(u.email) } : null;
}
const FS = 'https://firestore.googleapis.com/v1/projects/dropshotfolks/databases/(default)/documents';
function fsVal(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('mapValue' in v) { const o = {}; const f = v.mapValue.fields || {}; Object.keys(f).forEach(k => o[k] = fsVal(f[k])); return o; }
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fsVal);
  return null;
}
function fsDoc(fields) { const o = {}; Object.keys(fields || {}).forEach(k => o[k] = fsVal(fields[k])); return o; }
function waitingList(d) {
  const sid = String(d.sid || '');
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(sid)) return { ok: false, error: 'Bad session' };
  const u = signedInUser(d.token); if (!u) return { ok: false, error: 'Sign in first' };
  const props = PropertiesService.getScriptProperties(), key = 'wl_' + sid;
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const list = JSON.parse(props.getProperty(key) || '[]');
    if (d.wl === 'join') {
      if (!list.some(x => x.uid === u.uid)) list.push({ uid: u.uid, email: u.email });
      props.setProperty(key, JSON.stringify(list.slice(-60)));
      return { ok: true };
    }
    if (d.wl !== 'freed' || !list.length) return { ok: true, sent: 0 };
    const sr = UrlFetchApp.fetch(FS + '/sessions/' + sid, { muteHttpExceptions: true });
    if (sr.getResponseCode() !== 200) return { ok: true, sent: 0 };
    const s = fsDoc(JSON.parse(sr.getContentText()).fields);
    if (s.open === false || s.cancelled) return { ok: true, sent: 0 };
    const q = UrlFetchApp.fetch(FS + ':runQuery', { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'bookings' }], where: { fieldFilter: { field: { fieldPath: 'sessionId' }, op: 'EQUAL', value: { stringValue: sid } } } } }) });
    const bookings = (JSON.parse(q.getContentText() || '[]') || []).filter(x => x.document).map(x => fsDoc(x.document.fields));
    const capOf = c => { const v = s.capacity && typeof s.capacity === 'object' ? s.capacity[c] : s.capacity; return Number(v == null ? 7 : v) || 0; };
    const active = ['awaiting', 'paid', 'confirmed'], now = Date.now();
    let sent = 0;
    [1, 2, 3, 4].forEach(c => {
      const free = capOf(c) - bookings.filter(b => Number(b.court) === c && active.indexOf(b.status) >= 0).length;
      if (free <= 0) return;
      const waiting = bookings.filter(b => Number(b.court) === c && b.status === 'waitlist').map(b => b.hostId || b.playerId);
      const to = list.filter(x => waiting.indexOf(x.uid) >= 0);
      const nk = 'wln_' + sid + '_' + c;
      if (!to.length || now - Number(props.getProperty(nk) || 0) < 10 * 60 * 1000) return;
      props.setProperty(nk, String(now));
      const when = new Date(s.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + s.start + '–' + s.end;
      const title = s.title || 'Dropshot Folks session';
      to.forEach(x => {
        MailApp.sendEmail({ to: x.email, replyTo: ORGANISER, name: 'Dropshot Folks', subject: 'A place is free: ' + title + ' · ' + when,
          body: 'Good news: a place has opened up on ' + title + ', ' + when + (s.venue ? ' at ' + s.venue : '') + '.\n\nYou\'re on the waiting list. The first person to take it gets it: open My bookings and tap "Take the place".\nhttps://dropshotfolks.co.uk/book/\n\nDropshot Folks',
          htmlBody: '<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:16px;line-height:1.55;color:#24100F;max-width:520px">' +
            '<p>Good news: a place has opened up on <b>' + title + '</b>, ' + when + (s.venue ? ' at ' + s.venue : '') + '.</p>' +
            '<p>You\'re on the waiting list. <b>The first person to take it gets it.</b></p>' +
            '<p><a href="https://dropshotfolks.co.uk/book/" style="display:inline-block;background:#7A2331;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">Take the place →</a></p>' +
            '<p>Dropshot Folks</p></div>' });
        sent++;
      });
    });
    return { ok: true, sent: sent };
  } finally { lock.releaseLock(); }
}

function reply(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor (select "authorise" → Run) to grant the permissions before deploying.
function authorise() {
  MailApp.getRemainingDailyQuota();
  CacheService.getScriptCache();
  Logger.log(idt('/accounts:lookup', { email: [ORGANISER] }).code + ' (200 means login codes will work)');
  SpreadsheetApp.getActiveSpreadsheet();
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
}
