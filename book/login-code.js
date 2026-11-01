// Sign in with a 6-digit code sent to your email, shared by the booking and tournament pages.
// The club's Google script emails the code and, when it's right, hands the browser a sign-in for that
// (now email-confirmed) account. If the script isn't set up for codes yet, an email sign-in link is sent instead.
window.DSFLogin = {
  async url(){
    if(this._u !== undefined) return this._u;
    try{ const d = await firebase.firestore().collection("config").doc("mail").get(); this._u = (d.exists && d.data().url) || null }catch{ this._u = null }
    return this._u;
  },
  async post(body){
    const u = await this.url(); if(!u) return {ok:false, setup:true};
    try{ const r = await fetch(u, {method:"POST", body:JSON.stringify(body)}); const j = await r.json();
      return /only the organiser/i.test(j.error||"") ? {ok:false, setup:true} : j }   // an older script without login codes
    catch{ return {ok:false, error:"Couldn't reach the sign-in service. Check your connection and try again."} }
  },
  // returns {ok} when a code was emailed, {ok, link} when a sign-in link was sent instead, or {ok:false, error}
  async start(email, linkUrl){
    const r = await this.post({login:"start", email});
    if(r.ok || !r.setup) return r;
    try{ await firebase.auth().sendSignInLinkToEmail(email, {url:linkUrl, handleCodeInApp:true}); localStorage.setItem("dsf:linkemail", JSON.stringify(email)); localStorage.setItem("dsf:signin", JSON.stringify(email)); return {ok:true, link:true} }
    catch{ return {ok:false, error:"Couldn't send the email. Check the address and try again."} }
  },
  async verify(email, code){
    const r = await this.post({login:"verify", email, code});
    if(!r.ok) return r;
    try{ await firebase.auth().signInWithEmailAndPassword(email, r.pw); return {ok:true} }
    catch{ return {ok:false, error:"Couldn't finish signing in. Ask for a new code."} }
  }
};
