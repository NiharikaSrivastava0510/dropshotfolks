// Thursday check list: draws the tick boxes from questions.js and saves the answers to Firestore ("surveys").
(() => {
  const S = window.DSF_SURVEY, $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tick = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="#2B2B2B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const DONE = "dsf:thursday-check";
  const store = {
    get() { try { return localStorage.getItem(DONE) } catch { return null } },
    set(v) { try { localStorage.setItem(DONE, v) } catch {} }
  };

  $("questions").innerHTML = S.questions.map((q, i) => `
    <fieldset class="card" data-q="${q.id}">
      <legend><span class="n">${i + 1}</span>${esc(q.q)}${q.required ? ' <span class="req">*</span>' : ""}<span class="hint">${esc(q.hint || (q.one ? "Tick one" : ""))}</span></legend>
      <div class="opts">${q.opts.map(([k, label]) => `
        <label class="opt"><input type="${q.one ? "radio" : "checkbox"}" name="${q.id}" value="${k}"><span class="box">${tick}</span><span>${esc(label)}</span></label>`).join("")}
      </div>
    </fieldset>`).join("");
  $("lastN").textContent = S.questions.length + 1;

  let db = null;
  try {
    if (window.FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey) {
      firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore();
    }
  } catch {}

  const show = done => { $("formView").hidden = done; $("doneView").hidden = !done; window.scrollTo(0, 0) };
  if (store.get()) show(true);

  $("again").onclick = () => { $("survey").reset(); $("err").hidden = true; show(false) };

  $("survey").onsubmit = async e => {
    e.preventDefault();
    const f = e.target, err = $("err"), btn = $("send");
    err.hidden = true;
    const doc = { form: S.form };
    for (const q of S.questions) {
      const picked = [...f.querySelectorAll(`input[name="${q.id}"]:checked`)].map(i => i.value);
      if (q.one) { if (picked[0]) doc[q.id] = picked[0] }
      else if (picked.length) doc[q.id] = picked;
    }
    const missing = S.questions.find(q => q.required && !doc[q.id]);
    if (missing) {
      err.textContent = "Please answer: " + missing.q;
      err.hidden = false;
      f.querySelector(`[data-q="${missing.id}"]`).scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const comment = f.comment.value.trim().slice(0, 500);
    if (comment) doc.comment = comment;
    if (!db) { err.textContent = "Sorry, the check list isn't switched on yet."; err.hidden = false; return }
    doc.at = firebase.firestore.FieldValue.serverTimestamp();
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      await db.collection("surveys").add(doc);
      store.set(new Date().toISOString());
      f.reset();
      show(true);
    } catch {
      err.textContent = "Couldn't send your answers. Check your connection and try again.";
      err.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = "Send my answers";
    }
  };
})();
