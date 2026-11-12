// Thursday results: the organiser signs in and sees the check list answers added up.
(() => {
  const S = window.DSF_SURVEY, $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pct = (n, d) => d ? Math.round(100 * n / d) : 0;
  const Q = Object.fromEntries(S.questions.map(q => [q.id, q]));
  const label = (qid, k) => (Q[qid].opts.find(o => o[0] === k) || [k, k])[1];
  const has = (r, qid, keys) => [].concat(r[qid] || []).some(v => keys.includes(v));
  const day = d => d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const formUrl = new URL("./", location.href).href;
  let rows = [];

  const gate = (title, text, signIn) => {
    $("gate").hidden = false; $("report").hidden = true;
    $("gateTitle").textContent = title; $("gateText").textContent = text || "";
    $("googleIn").hidden = $("gateAlt").hidden = !signIn;
  };

  if (!window.FIREBASE_CONFIG || !FIREBASE_CONFIG.apiKey) { gate("Not switched on yet", "Firebase isn't set up for this site yet."); return }
  firebase.initializeApp(FIREBASE_CONFIG);
  const auth = firebase.auth(), db = firebase.firestore();
  const admins = (window.DSF_ADMINS || []).map(e => e.toLowerCase());

  $("googleIn").onclick = async () => {
    try { await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()) }
    catch (e) { if (e?.code !== "auth/popup-closed-by-user") $("gateText").textContent = "Couldn't sign in with Google. Try the booking page instead." }
  };

  auth.onAuthStateChanged(async u => {
    if (!u) return gate("Organiser sign-in", "These results are private. Sign in with the organiser account to see them.", true);
    if (!u.emailVerified || !admins.includes((u.email || "").toLowerCase()))
      return gate("Organiser only", `You're signed in as ${u.email || "a player"}. Only the organiser account can see the results.`, true);
    gate("Loading answers…", "");
    try {
      const snap = await db.collection("surveys").where("form", "==", S.form).get();
      rows = snap.docs.map(d => ({ id: d.id, ...d.data(), at: d.data().at?.toDate?.() || null }))
        .sort((a, b) => (b.at || 0) - (a.at || 0));
      render();
    } catch {
      gate("Couldn't load the answers", "Check that the latest book/firestore.rules have been published in the Firebase console, then reload.");
    }
  });

  function tile(big, text, small) {
    return `<div class="tile"><b>${big}</b><span>${esc(text)}</span>${small ? `<small>${esc(small)}</small>` : ""}</div>`;
  }

  function render() {
    $("gate").hidden = true; $("report").hidden = false;
    const n = rows.length;
    const answered = qid => rows.filter(r => r[qid] && [].concat(r[qid]).length);
    const share = (qid, keys) => { const a = answered(qid); const k = a.filter(r => has(r, qid, keys)).length; return [pct(k, a.length), k, a.length] };
    const dates = rows.map(r => r.at).filter(Boolean);
    const span = dates.length ? `${day(dates[dates.length - 1])} – ${day(dates[0])}` : "No answers yet";

    const [reg, regK, regN] = share("often", ["most", "every"]);
    const [rec, recK, recN] = share("recommend", ["yes"]);
    const [bro, broK, broN] = share("brought", ["one", "few", "many"]);
    const [miss, missK, missN] = share("without", ["less", "stop"]);
    const localK = rows.filter(r => [].concat(r.local || []).length).length;
    const newK = rows.filter(r => r.often === "first").length;
    $("tiles").innerHTML = [
      tile(n, n === 1 ? "player has answered" : "players have answered", span),
      tile(reg + "%", "come most weeks or every week", `${regK} of ${regN}`),
      tile(rec + "%", "would definitely recommend it", `${recK} of ${recN} who answered`),
      tile(bro + "%", "have brought a friend along", `${broK} of ${broN} who answered`),
      tile(miss + "%", "would play less or stop without Thursday", `${missK} of ${missN} who answered`),
      tile(pct(localK, n) + "%", "live, work or study in Tower Hamlets", `${localK} of all ${n}`),
      tile(newK, newK === 1 ? "first-timer" : "first-timers", "came for the first time")
    ].join("");

    $("charts").innerHTML = S.questions.map(q => {
      const a = answered(q.id), base = a.length;
      const counts = q.opts.map(([k, lab]) => [lab, a.filter(r => has(r, q.id, [k])).length]);
      if (!q.one) counts.sort((x, y) => y[1] - x[1]);
      return `<section class="card q"><h3>${esc(q.q)}</h3>
        <p class="base">${base} answered${q.one ? "" : " · people could tick more than one"}</p>
        ${counts.map(([lab, c]) => `<div class="row"><span class="lab">${esc(lab)}</span>
          <span class="num">${c} <small>· ${pct(c, base)}%</small></span>
          <div class="track" role="img" aria-label="${esc(lab)}: ${c} of ${base}, ${pct(c, base)}%"><div class="fill" style="width:${pct(c, base)}%"></div></div></div>`).join("")}
      </section>`;
    }).join("");

    const said = rows.filter(r => r.comment);
    $("commentsCard").hidden = !said.length;
    $("comments").innerHTML = said.map(r => `<li><time>${esc(day(r.at))}</time>${esc(r.comment)}</li>`).join("");
  }

  $("csv").onclick = () => {
    const cell = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["Date", ...S.questions.map(q => q.q), "Comment"];
    const lines = rows.map(r => [r.at ? r.at.toISOString().slice(0, 16).replace("T", " ") : "",
      ...S.questions.map(q => [].concat(r[q.id] || []).map(k => label(q.id, k)).join("; ")), r.comment || ""]);
    const csv = "﻿" + [head, ...lines].map(l => l.map(cell).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `thursday-check-list-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  $("print").onclick = () => window.print();

  $("poster").onclick = () => {
    if (!$("qr").innerHTML) {
      try { const q = qrcode(0, "M"); q.addData(formUrl); q.make(); $("qr").innerHTML = q.createSvgTag({ cellSize: 8, margin: 2, scalable: true }) } catch {}
      $("posterUrl").textContent = formUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    }
    $("report").hidden = true; $("posterView").hidden = false; window.scrollTo(0, 0);
  };
  $("closePoster").onclick = () => { $("posterView").hidden = true; $("report").hidden = false };
  $("printPoster").onclick = () => {
    document.body.classList.add("print-poster");
    window.print();
    setTimeout(() => document.body.classList.remove("print-poster"), 500);
  };
})();
