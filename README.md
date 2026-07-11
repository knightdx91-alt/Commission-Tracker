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
       // An admin is anyone whose own allow-list entry has  admin: true.
       function isAdmin() {
         return request.auth != null
           && exists(/databases/$(database)/documents/allowlist/$(request.auth.token.email.lower()))
           && get(/databases/$(database)/documents/allowlist/$(request.auth.token.email.lower())).data.admin == true;
       }
       // Approved-users allow-list.
       //  - A normal user may read only their own entry (to check they're approved).
       //  - An admin may read the whole list and add/remove people (from the in-app
       //    Manage access panel). No one else can write to it.
       match /allowlist/{email} {
         allow read:  if request.auth != null
                      && (request.auth.token.email.lower() == email || isAdmin());
         allow write: if isAdmin();
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

### Easiest: manage people from inside the app (admin panel)
Once you're an **admin**, you never need the Firebase console again — a
**Manage access** button appears on the Account card (Settings tab, only for
admins). From there you can add people by email, tick "make them an admin", and
remove anyone with one tap.

**One-time bootstrap — make yourself the first admin** (Firebase Console →
Firestore Database → Data):
1. Click **Start collection**, name it exactly `allowlist`.
2. **Document ID** = your email in **lower case** (e.g. `you@example.com`).
3. Add one field: name `admin`, type **boolean**, value **true**. Save.
4. Sign in on the app → the **Manage access** panel is now available. Add/remove
   everyone else from there — no more console.

**Managing from the console instead** (if you ever want to): each approved person
is a document in `allowlist` whose ID is their lower-case email. An empty
document approves them as a normal user; add `admin: true` to make them an admin.
Delete the document to revoke access.

**Adding more admins later:** there's nothing special to do in the console —
sign in as an existing admin, open **Manage access**, add the person by email
and tick **"Also make them an admin"**. (If they were already added as a normal
user, just remove them and re-add them with the admin box ticked. Or, from the
console, open their document in `allowlist` and set the `admin` field to boolean
`true`.) A normal user has no `admin` field (or `admin: false`); an admin has
`admin: true` — that single flag is the only difference.

Notes:
- Make yourself admin first, or you'll have no way to manage the list in-app.
- Emails are matched lower-case, so always use lower case for the Document ID.
- Anyone can still *download* the app; the allow-list is what actually controls
  access.

### Hosting it on your own domain later (authorized domains)
Firebase only lets sign-in happen from domains you've approved. The GitHub Pages
domain (`knightdx91-alt.github.io`) is added during setup. If you later move the
app to a real domain (e.g. `app.yourbusiness.com`), sign-in will start failing
with an `auth/unauthorized-domain` error until you add the new domain:

1. Firebase Console → **Authentication** → **Settings** tab → **Authorized
   domains**.
2. Click **Add domain**, type just the bare hostname — **no `https://`, no
   trailing slash, no path** (e.g. `app.yourbusiness.com`, not
   `https://app.yourbusiness.com/`).
3. Add it and you're done — it takes effect immediately.

Keep the old domain in the list too if the app still loads there; adding a domain
never removes the others. `localhost` is always allowed automatically, so local
testing works without adding anything.

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
