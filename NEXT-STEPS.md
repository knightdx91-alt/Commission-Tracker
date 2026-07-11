# Commission Tracker — Next Steps

Everything already done, plus the roadmap to turn this into a full business app.

**Live site:** https://knightdx91-alt.github.io/Commission-Tracker/
**Repo:** https://github.com/knightdx91-alt/Commission-Tracker

---

## ✅ Already done
- App built and hosted on GitHub Pages (auto-redeploys on every push to `main`).
- Works offline and installs to a phone home screen (PWA).
- Barcode scanner, editable payout rates, monthly goal, history + charts,
  CSV export, and JSON backup/restore.
- Optional login + cloud sync is **wired in** — it just needs a Firebase config
  to switch on (Step 1 below).

---

## Step 1 — Turn on accounts (login + cloud sync)
Without this, each phone keeps its own local data. With it, people sign in and
their data follows them to any device.

1. Go to https://console.firebase.google.com and create a project.
2. Add a **Web App** to it; copy the config values it shows you.
3. **Authentication → Sign-in method:** enable **Email/Password** (and **Google**
   if you want the "Continue with Google" button).
4. Create a **Firestore** database (Production mode).
5. In the repo, copy `firebase-config.example.js` to **`firebase-config.js`**,
   paste in your values, and push. (See README section 5 for the exact steps and
   the security-rules block to paste.)

**Result:** the Account card on the Settings tab becomes a working login.

---

## Step 2 — Publish to the Google Play Store
The live site can be wrapped into a real Android app.

1. Make sure Step 1 is done (or skip it if launching without accounts first).
2. Create a **Google Play Developer account** — one-time **$25**.
3. Go to https://www.pwabuilder.com, enter the live URL, choose **Android**, and
   download the generated app package (`.aab`) plus its signing key. PWABuilder
   also generates all the required icon sizes for you.
4. In the Play Console: create the app, upload the `.aab`, fill in the store
   listing, and submit for review.
5. **Verify ownership:** PWABuilder gives you a package name + signing
   fingerprint. Put both into `.well-known/assetlinks.json`, push, and the app
   opens full-screen with no browser bar.

(README section 3–4 has the icon + hosting detail. iPhone needs no store for
basic use — Safari → Share → Add to Home Screen.)

---

## Restricting who can download / use the app
So not just anyone can get in. Two layers — Layer 2 is the one to rely on.

**Layer 1 — restrict the download (Play Console / TestFlight)**
- **Internal / Closed testing:** upload an allow-list of Google account emails
  (up to 100 internal; more via a Google Group for closed). Only those accounts
  can install from the Store. Apple's equivalent is **TestFlight** (invite by
  email). Good for the early team; fiddly as you grow.
- **Managed Google Play private app:** if you have a Google Workspace org, publish
  an app visible only to your org's users.

**Layer 2 — gate the app with your own login allow-list (recommended)**
- Publish normally, but nobody gets past the login screen unless their account is
  in your **approved-users list** in Firestore. Downloading without approval is
  harmless.
- Works the same on Android and iPhone, and you add/remove people from your own
  data — no Google console juggling.
- Needs Step 1 (accounts) first. ✅ **This gate is now built in** — sign-in
  checks the Firestore `allowlist` collection and blocks anyone not on it. See
  README section 6 ("Restrict who can use the app") for how to add/remove people.

## Step 3 — Privacy policy (required once you have accounts)
The Play Store requires a privacy policy the moment the app collects user data
(i.e. after Step 1). A simple hosted page is enough — it can even live in this
same repo at `/privacy.html`. **Claude can draft this for you.**

---

## Step 4 — Nice-to-have improvements (optional)
- A screen to **review, rename, or delete learned barcodes**.
- Per-store or per-employee reporting once accounts are live.
- A custom domain (e.g. `app.yourbusiness.com`) instead of the github.io URL.

---

## How to update the app
Edit the files in this repo and push to `main`. GitHub Actions redeploys the
live site in about a minute — nothing else to configure.

## Good to know
- **Cost:** free for a handful of users. Firebase only charges at real scale;
  this app's usage is light. Play Store is a one-time $25.
- **Data location:** without Step 1, all data is local to each device — remind
  users to use **Export backup** before switching phones.
