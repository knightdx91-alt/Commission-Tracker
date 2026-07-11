# Commission Tracker — deployable app

A single-page web app (PWA) for tracking wireless-retail commission. Works
offline, installs to the home screen, and can be published to the Play Store.

## Files
| File | What it is |
|------|-----------|
| `index.html` | The whole app (HTML + CSS + JS, no dependencies) |
| `manifest.webmanifest` | PWA metadata (name, colors, icons) |
| `sw.js` | Service worker — makes it work offline |
| `icon.svg` | App icon (source; generate PNGs from this — see below) |
| `.well-known/assetlinks.json` | Play Store TWA verification (fill in later) |
| `firebase-config.example.js` | Template for optional cloud accounts (login + sync) |

The camera **barcode scanner** and **offline install** only work over **HTTPS**
(or `localhost`) — they are intentionally disabled on `file://` and in preview
sandboxes.

## 1. Test locally
```sh
cd dist
python3 -m http.server 8080
# open http://localhost:8080
```

## 2. Put it online (free HTTPS)
Any static host works. Easiest is **Netlify**: drag the `dist` folder onto
https://app.netlify.com/drop and you get an HTTPS URL in seconds. GitHub Pages,
Cloudflare Pages, and Firebase Hosting work the same way. Once hosted:
- Android Chrome shows an **Install app** prompt (Add to Home screen).
- The scanner's camera works.
- It runs with no signal.

## 3. Generate the icon PNGs
The manifest references `icon-192.png`, `icon-512.png`,
`icon-512-maskable.png`, and `icon-180.png`. Generate them from `icon.svg`:
- Easiest: go to **https://www.pwabuilder.com**, enter your hosted URL, and it
  generates every icon size for you, or
- Any "SVG to PNG" tool / an image editor at those pixel sizes.

Drop the PNGs into `dist` next to `index.html`. (SVG-only already works for
install; the PNGs are what the Play Store requires.)

## 4. Publish to the Google Play Store (TWA)
A Trusted Web Activity wraps this hosted PWA as a native Android app.
1. Host the app on HTTPS (step 2) with the icons (step 3).
2. Create a **Google Play Developer account** — one-time **$25**.
3. Go to **https://www.pwabuilder.com**, enter your URL, choose **Android /
   package**, and download the generated `.aab` plus its signing key.
4. In the Play Console: create an app, upload the `.aab`, fill in store listing +
   privacy policy, and submit for review.
5. **Verify ownership:** PWABuilder gives you a signing SHA-256 fingerprint and
   package name. Put both into `.well-known/assetlinks.json`, redeploy, and the
   app opens full-screen with no browser bar.

iPhone: no App Store needed for basic use — Safari → Share → **Add to Home
Screen** installs it. (A real App Store listing needs an Apple Developer account,
$99/yr, and a wrapper like Capacitor — a later step if you want it.)

## 5. Cloud accounts (login + sync across devices) — optional
Without this, every phone keeps its own local data. Turn it on and each person
signs in and their data follows them to any device.

1. Create a project at **https://console.firebase.google.com**.
2. Add a **Web App**; copy the config values.
3. **Authentication → Sign-in method:** enable **Email/Password** (and **Google**
   if you want the "Continue with Google" button).
4. Create a **Firestore** database (Production mode).
5. Copy `firebase-config.example.js` to **`firebase-config.js`**, paste your
   values in, and deploy it next to `index.html`.
6. Paste these Firestore **security rules** (Console → Firestore → Rules) so each
   user can only touch their own data:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Each user can only read/write their own data.
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
       // Approved-users allow-list. A signed-in person may read only the entry
       // that matches their own email (to check if they're approved). Nobody can
       // edit the list from the app — you manage it in the Firebase console.
       match /allowlist/{email} {
         allow read: if request.auth != null
                     && request.auth.token.email.lower() == email;
         allow write: if false;
       }
     }
   }
   ```
7. Add your live domain under **Authentication → Settings → Authorized domains**.

## 6. Restrict who can use the app (login allow-list)
Publishing the app (or the Play Store listing) is harmless on its own: **nobody
gets past the login screen unless their account is on your approved-users list.**
You control that list from your own Firebase dashboard — no Google Play console
juggling — and it works identically on Android and iPhone.

How it works: on every sign-in the app looks for a document in the Firestore
**`allowlist`** collection whose ID is the person's email (lower-case). If it's
there, they're in; if not, they're immediately signed back out with a
"not approved yet" message. The security rules above stop anyone editing the
list from the app.

**To approve someone** (Firebase Console → Firestore Database → Data):
1. Click **Start collection** (first time) and name it exactly `allowlist`.
   After that, just **Add document** to the existing `allowlist` collection.
2. For **Document ID**, enter the person's email in **lower case**, e.g.
   `jane@example.com`. (Google sign-in and Email/Password both use the account's
   email, so one entry covers either sign-in method.)
3. You don't need any fields — an empty document is enough. (Optional: add a
   `name` or `note` field for your own reference.)
4. Save. They can now sign in. **To revoke access**, delete that document — they
   can't get past login on their next attempt.

Notes:
- Add yourself first, or you'll lock yourself out.
- Emails are matched lower-case, so always use lower case for the Document ID.
- Anyone can still *download* the app; the allow-list is what actually controls
  access.

Data model: each user's periods, rates, goal, and learned barcodes live in one
document at `users/{uid}/app/state`. Costs are tiny — well inside Firebase's free
tier for typical use. Because accounts collect user data, the **Play Store
listing will require a privacy policy** (a simple hosted page is enough).

The app auto-detects `firebase-config.js`: present → login + sync; absent →
fully local, no errors.

## Notes on the barcode scanner
- Uses the browser's built-in `BarcodeDetector` (Android Chrome). Where that
  isn't available, users can type the barcode number — same result.
- New barcodes are **looked up online automatically** (via UPCitemdb's free
  trial endpoint) to fill in the product name — no typing when the product is
  found. Not-found or offline falls back to a quick manual entry. The app then
  **remembers** the code, so every future scan is instant.
- The lookup uses a free trial with a light daily limit. For heavier use, swap in
  a paid UPC API key (edit `lookupProduct()` in `index.html`).
- Best suited to **accessories and physical add-ons** (activations, upgrades, and
  ports aren't barcoded products).
- Learned codes are stored on the device and included in **Export backup**.

## Data & privacy
All data is stored locally in the browser (`localStorage`). Nothing leaves the
device unless the user configures Google Sheets sync. Export a backup before
switching phones or clearing data.
