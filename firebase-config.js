/* Cloud accounts config — live.
 *
 * Reuses the shared "ludus-alera" Firebase project (same project as the Ludus
 * app). This app uses Firebase Auth + Firestore; Ludus uses the Realtime
 * Database in the same project, so the two coexist without conflict.
 *
 * Access is gated by an allow-list: only accounts listed in the Firestore
 * "allowlist" collection can get past the login screen. See README section 6.
 */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBoWXONT4fF-Oqnj95oEJ4v7djN839sUok",
  authDomain: "ludus-alera.firebaseapp.com",
  projectId: "ludus-alera",
  storageBucket: "ludus-alera.firebasestorage.app",
  messagingSenderId: "208415489645",
  appId: "1:208415489645:web:ef266583dee64a48a04964",
  measurementId: "G-VFR4SVWQ79"
};
