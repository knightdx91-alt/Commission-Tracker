/* Cloud accounts config.
 *
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Add a Web App to it and copy the config values below.
 * 3. In the console, enable Authentication → Sign-in method:
 *      - Email/Password
 *      - Google (optional, for "Continue with Google")
 * 4. Create a Firestore database (Production mode) and paste the rules
 *    from the README so each user can only read/write their own data.
 * 5. Access is gated by an allow-list: only accounts listed in the Firestore
 *    "allowlist" collection can get past the login screen. See the README
 *    ("Restrict who can use the app") for how to add/remove people.
 * 6. Rename this file to  firebase-config.js  and deploy it next to index.html.
 *
 * If this file is absent, the app simply runs local-only (no login) — no errors.
 */
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
