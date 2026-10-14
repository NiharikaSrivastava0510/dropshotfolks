/* Dropshot Folks: organiser edits for the main website.
   Visitors: the text, links and photos the organiser changed are loaded from Firestore (site/*) and shown in place.
   Organiser: open dropshotfolks.co.uk/#edit (or 🏠 Edit homepage on the tournament page), click any text to change it, change links and photos, then Save.
   Loaded right after the footer, before the page's other scripts, so every element is tagged with its original content. */
(function () {
  const PROJECT = "dropshotfolks", API = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
  const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
  const INLINE = new Set(["B", "STRONG", "I", "EM", "BR", "SPAN", "SMALL", "A", "U", "SUP", "SUB", "MARK"]);
  const SKIP = "script,style,noscript,svg,input,textarea,select,option,iframe,#nextCount,#formSuccessTitle,#formSuccessBody,#lightboxCounter,[aria-live],button[type=submit],.site-edit-ui,[data-noedit]";
  const ls = { get(k) { try { return localStorage.getItem(k) } catch { return null } }, set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch {} } };

  // ---- tag every editable piece of text and every photo with a stable key (from its original content) ----
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0; return h.toString(36) };
  const norm = s => s.replace(/\s+/g, " ").trim();
  const onlyInline = el => [...el.querySelectorAll("*")].every(c => INLINE.has(c.tagName));
  const hasText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const texts = [], imgs = [], seen = {};
  const key = (prefix, s) => { const k = prefix + hash(s); seen[k] = (seen[k] || 0) + 1; return seen[k] > 1 ? `${k}-${seen[k]}` : k };
  (function walk(el) {
    for (const c of el.children) {
      if (c.matches(SKIP) || c.dataset.ek) continue;
      if (c.tagName === "IMG") { c.dataset.ek = key("i", c.getAttribute("src") || ""); c.dataset.eo = c.getAttribute("src") || ""; imgs.push(c); continue }
      if (hasText(c) && onlyInline(c)) {
        c.dataset.ek = key("t", c.tagName + norm(c.innerHTML)); c.dataset.eo = c.innerHTML; texts.push(c);
        if (c.tagName === "A") c.dataset.eh = c.getAttribute("href") || "";
        c.querySelectorAll("a").forEach((a, i) => { a.dataset.ek = `${c.dataset.ek}-a${i}`; a.dataset.eh = a.getAttribute("href") || "" });
        continue;
      }
      if (c.tagName === "A") { c.dataset.ek = key("l", c.getAttribute("href") + norm(c.textContent)); c.dataset.eh = c.getAttribute("href") || "" }
      // text sitting next to icons or blocks (e.g. a button with an arrow): wrap just the words so they can be edited
      if (hasText(c)) for (const n of [...c.childNodes]) if (n.nodeType === 3 && n.textContent.trim()) {
        const sp = document.createElement("span"); n.replaceWith(sp); sp.append(n); sp.dataset.ek = key("w", c.tagName + norm(n.textContent)); sp.dataset.eo = sp.innerHTML; texts.push(sp) }
      walk(c);
    }
  })(document.body);

  // ---- keep edited HTML to simple formatting and safe links ----
  const okHref = h => /^(https?:|mailto:|tel:|#|\.?\/|[a-z0-9_-]+(\/|\.html|$))/i.test(h.trim()) && !/^\s*javascript:/i.test(h);
  function clean(html) {
    const tpl = document.createElement("template"); tpl.innerHTML = html;
    (function scrub(n) {
      for (const c of [...n.children]) {
        scrub(c);
        if (!INLINE.has(c.tagName)) { c.replaceWith(...c.childNodes); continue }
        for (const a of [...c.attributes]) if (!(a.name === "class" || (a.name === "href" && c.tagName === "A" && okHref(a.value)) || a.name === "target" || a.name === "rel")) c.removeAttribute(a.name);
      }
    })(tpl.content);
    return tpl.innerHTML.replace(/&nbsp;/g, " ").trim();
  }

  // ---- apply the organiser's changes ----
  let saved = { t: {}, h: {}, i: {} };
  const byKey = k => document.querySelector(`[data-ek="${k}"]`);
  function apply(edits) {
    for (const [k, v] of Object.entries(edits.t || {})) { const el = byKey(k); if (!el) continue; el.innerHTML = clean(v);
      if (el.dataset.count != null) { const m = /^(\d+)(.*)$/.exec(el.textContent.trim()); if (m) { el.dataset.count = m[1]; el.dataset.suffix = m[2] } } }
    for (const [k, v] of Object.entries(edits.h || {})) { const el = byKey(k); if (el && okHref(v)) el.setAttribute("href", v) }
    for (const [k, v] of Object.entries(edits.i || {})) { const el = byKey(k); if (el && /^(data:image\/|https:)/.test(v)) { el.src = v; el.removeAttribute("srcset") } }
  }
  const val = f => f?.stringValue ?? "";
  const mapOf = f => Object.fromEntries(Object.entries(f?.mapValue?.fields || {}).map(([k, v]) => [k, val(v)]));
  window.siteReady = fetch(`${API}/site?pageSize=300`).then(r => r.ok ? r.json() : {}).then(d => {
    for (const doc of d.documents || []) { const id = doc.name.split("/").pop(), f = doc.fields || {};
      if (id === "content") { saved.t = mapOf(f.t); saved.h = mapOf(f.h) }
      else if (id.startsWith("img-")) saved.i[id.slice(4)] = val(f.src) }
    apply(saved);
  }).catch(() => {});

  // ---- organiser edit mode ----
  const css = document.createElement("style"); css.textContent = `
    .site-editing [data-ek][contenteditable]{outline:1.5px dashed rgba(122,28,46,.35);outline-offset:3px;border-radius:4px;cursor:text}
    .site-editing [data-ek][contenteditable]:hover{outline-color:rgba(122,28,46,.8)}
    .site-editing [data-ek][contenteditable]:focus{outline:2px solid #7a1c2e;background:rgba(255,248,230,.6)}
    .site-editing img[data-ek]{cursor:pointer;outline:2px dashed rgba(122,28,46,.4);outline-offset:-2px}
    .site-editing img[data-ek]:hover{outline-color:#7a1c2e}
    .se-bar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99999;display:flex;gap:8px;align-items:center;flex-wrap:wrap;max-width:min(940px,calc(100vw - 24px));padding:10px 12px;border-radius:18px;background:#2b0f16;color:#fff;font:600 14px/1.3 system-ui,sans-serif;box-shadow:0 18px 40px -12px rgba(0,0,0,.5)}
    .se-bar .se-tip{font-weight:400;opacity:.8}.se-bar .se-grow{flex:1}
    .se-bar button{font:inherit;border:0;border-radius:99px;padding:8px 14px;background:rgba(255,255,255,.14);color:#fff;cursor:pointer}
    .se-bar .se-link{color:#f3d9a4;text-decoration:none;padding:8px 10px}
    .se-bar .se-save{background:#f3d9a4;color:#2b0f16}.se-bar button:disabled{opacity:.45;cursor:default}
    .se-toast{position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:99999;padding:10px 16px;border-radius:12px;background:#2b0f16;color:#fff;font:600 14px system-ui,sans-serif;box-shadow:0 10px 30px -10px rgba(0,0,0,.5)}`;
  document.head.append(css);
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s) });
  let fb = null, db = null, editing = false, dirty = { t: {}, h: {}, i: {} }, current = null, bar = null;
  async function firebaseReady() {
    if (fb) return fb;
    for (const f of ["firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js"]) await loadScript(SDK + f);
    await loadScript("book/firebase-config.js");
    firebase.initializeApp(window.FIREBASE_CONFIG); db = firebase.firestore(); fb = firebase;
    if (window.FIREBASE_EMULATOR) { firebase.auth().useEmulator("http://127.0.0.1:9099"); db.useEmulator("127.0.0.1", 8080) }
    await new Promise(r => { const off = firebase.auth().onAuthStateChanged(() => { off(); r() }) });
    return fb;
  }
  const isAdmin = u => !!u && u.emailVerified && (window.DSF_ADMINS || []).map(x => String(x).toLowerCase()).includes(String(u.email || "").toLowerCase());
  async function start(quiet) {
    try {
      if (!quiet) say("Opening edit mode…"); await firebaseReady();
      let u = firebase.auth().currentUser;
      if (!isAdmin(u) && quiet) { ls.set("dsf:siteedit", null); return }      // signed out since last time: wait for the footer link
      if (!isAdmin(u)) { u = (await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())).user }
      if (!isAdmin(u)) { say(`${u?.email || "That account"} isn't an organiser account. Sign in with info@dropshotfolks.co.uk.`); await firebase.auth().signOut(); return }
      ls.set("dsf:siteedit", "1"); enter();
    } catch (e) { say(e?.code === "auth/popup-blocked" ? "Allow pop-ups for this site, then try again." : "Couldn't sign in. Try again.") }
  }
  function say(msg) { let t = document.getElementById("seToast"); if (!t) { t = document.createElement("div"); t.id = "seToast"; t.className = "site-edit-ui se-toast"; document.body.append(t) } t.textContent = msg; t.hidden = false; clearTimeout(say.t); say.t = setTimeout(() => t.hidden = true, 3500) }
  const count = () => Object.values(dirty).reduce((n, o) => n + Object.keys(o).length, 0);
  function drawBar() {
    const n = count(), el = current;
    bar.innerHTML = `<b>✏️ Editing the website</b><span class="se-tip">${el ? (el.tagName === "IMG" ? "Photo selected" : "Typing in the highlighted text") : "Click any text to change it · click a photo to replace it"}</span>
      ${el && linkOf(el) ? `<button type="button" data-se="link">🔗 Change link</button>` : ""}
      ${el && el.tagName === "IMG" ? `<button type="button" data-se="photo">📷 Replace photo</button>` : ""}
      ${el && isChanged(el) ? `<button type="button" data-se="orig">↺ Original</button>` : ""}
      <span class="se-grow"></span><a href="tourney/" class="se-link">🏆 Manage tournaments</a><button type="button" data-se="save" class="se-save" ${n ? "" : "disabled"}>💾 Save${n ? ` (${n})` : ""}</button><button type="button" data-se="exit">Done</button>`;
  }
  const linkOf = el => el.dataset.eh != null ? el : (el.querySelector("a[data-eh]") || el.closest("a[data-eh]"));
  const isChanged = el => { const k = el.dataset.ek; return !!(saved.t[k] || saved.h[k] || saved.i[k] || dirty.t[k] != null || dirty.h[k] != null || dirty.i[k] != null) };
  function enter() {
    if (editing) return; editing = true; document.documentElement.classList.add("site-editing");
    bar = document.createElement("div"); bar.className = "site-edit-ui se-bar"; document.body.append(bar); drawBar();
    texts.forEach(el => { el.contentEditable = "true"; el.spellcheck = true });
    document.querySelectorAll("[data-count][data-ek]").forEach(el => { el.innerHTML = saved.t[el.dataset.ek] ? clean(saved.t[el.dataset.ek]) : el.dataset.eo });   // stop the count-up so it can't overwrite typing
    say("Click any text to change it, then press Save.");
  }
  function exit() {
    if (count() && !confirm("You have changes that aren't saved. Leave without saving?")) return;
    editing = false; document.documentElement.classList.remove("site-editing"); texts.forEach(el => el.removeAttribute("contenteditable"));
    bar?.remove(); bar = null; current = null; ls.set("dsf:siteedit", null);
    if (count()) location.reload();
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-se]");
    if (b) { e.preventDefault(); act(b.dataset.se); return }
    if (!editing || e.target.closest(".site-edit-ui")) return;
    const el = e.target.closest("[data-ek]");
    const link = e.target.closest("a"); if (link) e.preventDefault();          // links don't navigate while editing
    if (e.target.closest("button,summary,[data-tab]") && !el) e.preventDefault();
    if (el) { current = el; if (el.tagName === "IMG") { e.preventDefault(); e.stopPropagation() } drawBar() }
  }, true);
  document.addEventListener("input", e => { if (!editing) return; const el = e.target.closest?.("[data-ek]"); if (!el || el.tagName === "IMG") return;
    dirty.t[el.dataset.ek] = clean(el.innerHTML); current = el; drawBar() });
  document.addEventListener("keydown", e => { if (editing && e.key === "Enter" && e.target.closest?.("[data-ek]") && !/^(P|LI|DD|BLOCKQUOTE)$/.test(e.target.tagName)) e.preventDefault() });
  document.addEventListener("paste", e => { if (!editing || !e.target.closest?.("[data-ek]")) return; e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")) });
  async function act(what) {
    const el = current;
    if (what === "exit") return exit();
    if (what === "link" && el) {
      const a = linkOf(el); if (!a) return;
      const v = prompt("Where should this link go? (web address, mailto:you@example.com, tel:07…, or #section)", a.getAttribute("href") || "");
      if (v == null) return; if (!okHref(v)) { say("That link doesn't look right"); return }
      a.setAttribute("href", v.trim());
      if (a !== el && el.contains(a) && texts.includes(el)) dirty.t[el.dataset.ek] = clean(el.innerHTML);   // a link inside a sentence is saved with the sentence
      else dirty.h[a.dataset.ek] = v.trim();
      drawBar(); return }
    if (what === "photo" && el?.tagName === "IMG") {
      const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
      inp.onchange = async () => { const f = inp.files?.[0]; if (!f) return; try { const src = await shrink(f); el.src = src; el.removeAttribute("srcset"); dirty.i[el.dataset.ek] = src; drawBar() } catch { say("Couldn't read that photo") } };
      inp.click(); return }
    if (what === "orig" && el) {
      const k = el.dataset.ek;
      if (el.tagName === "IMG") { el.src = el.dataset.eo; dirty.i[k] = "" } else { el.innerHTML = el.dataset.eo; dirty.t[k] = ""; if (el.dataset.eh != null) { el.setAttribute("href", el.dataset.eh); dirty.h[k] = "" } }
      drawBar(); return }
    if (what === "save") {
      try {
        const del = firebase.firestore.FieldValue.delete(), upd = {};
        for (const [k, v] of Object.entries(dirty.t)) upd[`t.${k}`] = v === "" ? del : v;
        for (const [k, v] of Object.entries(dirty.h)) upd[`h.${k}`] = v === "" ? del : v;
        if (Object.keys(upd).length) { const ref = db.collection("site").doc("content"); await ref.set({ t: {}, h: {} }, { merge: true }); await ref.update(upd) }
        for (const [k, v] of Object.entries(dirty.i)) v === "" ? await db.collection("site").doc("img-" + k).delete() : await db.collection("site").doc("img-" + k).set({ src: v });
        for (const kind of ["t", "h", "i"]) for (const [k, v] of Object.entries(dirty[kind])) { if (v === "") delete saved[kind][k]; else saved[kind][k] = v }
        dirty = { t: {}, h: {}, i: {} }; drawBar(); say("Saved ✓ Everyone sees the new version now.");
      } catch (e) { say(e?.code === "permission-denied" ? "Not allowed: publish the latest Firebase rules, then try again." : "Couldn't save. Check your connection.") }
    }
  }
  function shrink(file, max = 1600) {
    return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(img.src);
      let q = .85, out = c.toDataURL("image/jpeg", q); while (out.length > 700000 && q > .4) { q -= .1; out = c.toDataURL("image/jpeg", q) } res(out) }; img.onerror = rej; img.src = URL.createObjectURL(file) });
  }
  addEventListener("beforeunload", e => { if (editing && count()) { e.preventDefault(); e.returnValue = "" } });

  window.siteEdit = { start, ready: firebaseReady };
  // entry points: footer link, /#edit, or straight back in on the organiser's own browser
  document.querySelectorAll("[data-site-edit]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); start() }));
  if (location.hash === "#edit") window.siteReady.then(() => start());
  else if (ls.get("dsf:siteedit") === "1") window.siteReady.then(() => start(true));
  addEventListener("hashchange", () => { if (location.hash === "#edit") window.siteReady.then(() => start()) });
})();
