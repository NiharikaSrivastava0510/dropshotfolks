// Dropshot Folks · tournament emails
// Sends each confirmed team its confirmation, team code and QR pass from your own Gmail.
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
    if (d.test) {
      MailApp.sendEmail({ to: ORGANISER, subject: 'Dropshot Folks emails are working ✓', name: 'Dropshot Folks',
        htmlBody: '<p>Automatic tournament emails are set up. Confirmed teams will now get their code and QR pass by email.</p>' });
      return reply({ ok: true, left: MailApp.getRemainingDailyQuota() });
    }
    const email = s => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(String(s || '').trim());
    const to = String(d.to || '').trim();
    if (!email(to)) return reply({ ok: false, error: 'No valid email for this team.' });
    const cc = (d.cc || []).map(s => String(s).trim()).filter(email).filter(s => s.toLowerCase() !== to.toLowerCase()).slice(0, 5).join(',');
    const qr = Utilities.newBlob(Utilities.base64Decode(String(d.png || '')), 'image/png', String(d.file || 'team-pass.png').slice(0, 80));
    MailApp.sendEmail({
      to: to, cc: cc, replyTo: ORGANISER, name: 'Dropshot Folks',
      subject: String(d.subject || 'Your team is confirmed').slice(0, 200),
      body: String(d.text || ''), htmlBody: String(d.html || ''),
      inlineImages: { qr: qr }, attachments: [qr]
    });
    return reply({ ok: true, left: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return reply({ ok: false, error: String(err && err.message || err) });
  }
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
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
}
