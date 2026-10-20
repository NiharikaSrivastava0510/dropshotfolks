// Dropshot Folks · tournament emails
// Sends each confirmed team its confirmation, team code and QR pass from your own Gmail.
// Also keeps the "Dropshot Folks — Tournament records" Google Sheet in your Drive up to date (Teams tab → 📊 Records).
// Set up once: script.google.com → New project → paste this whole file → Deploy → New deployment →
// type "Web app", Execute as "Me", Who has access "Anyone" → Deploy → copy the Web app URL into the
// tournament page (Teams tab → 📧 Automatic emails).
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

function reply(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor (select "authorise" → Run) to grant the permissions before deploying.
function authorise() {
  MailApp.getRemainingDailyQuota();
  SpreadsheetApp.getActiveSpreadsheet();
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
}
