# dropshotfolks

Website for Dropshot Folks, served by GitHub Pages at dropshotfolks.co.uk.

- `index.html` – the main site
- `book/` – the court booking app (book a session, get a court by level, live rotation, organiser tools)

## Turning on the booking app

`book/` runs on Firebase (free Spark plan). Until `book/firebase-config.js` has an `apiKey`,
dropshotfolks.co.uk/book shows "Online booking is coming soon".

1. Go to https://console.firebase.google.com, **Add project** (e.g. `dropshotfolks`). Google Analytics is not needed.
2. **Build → Authentication → Get started.** Under Sign-in method, enable **Google** and **Email/Password** with
   **Email link (passwordless sign-in)** switched on. Under Settings → Authorised domains, add
   `dropshotfolks.co.uk` and `www.dropshotfolks.co.uk`.
3. **Build → Firestore Database → Create database** (location `eur3` or `europe-west2`, start in production mode).
   Open the **Rules** tab, paste the contents of `book/firestore.rules`, and **Publish**.
4. **Project settings → Your apps → Web (`</>`)**, register an app, and copy `apiKey`, `authDomain`,
   `projectId` and `appId` into `book/firebase-config.js`.
5. Push to `main`. Sign in at dropshotfolks.co.uk/book with info@dropshotfolks.co.uk to get the Organiser view,
   fill in Club details, and add sessions.

The organiser email is listed in two places that must match: `DSF_ADMINS` in `book/firebase-config.js` and
`isAdmin()` in `book/firestore.rules`.
