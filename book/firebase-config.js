// Firebase settings for the booking app.
// Paste the values from Firebase console → Project settings → Your apps → Web app.
// These values identify the project; they are not secret. Access is controlled by firestore.rules.
// While apiKey is empty, the public page shows "Online booking is coming soon".
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAP7O7DMk-sJFCqICW2dPZar53TlVi9jaA",
  authDomain: "dropshotfolks.co.uk",
  projectId: "dropshotfolks",
  appId: "1:871666667741:web:a678db0cf7b73369a08b34"
};

// Email addresses that get the Organiser view. Keep in sync with firestore.rules.
window.DSF_ADMINS = ["info@dropshotfolks.co.uk"];
