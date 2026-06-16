# BarterThat — Store Submission Runbook

Everything is wired for three stores. The **builds** are automated; the **final
submission clicks** are yours (only you can sign in to the developer accounts).

App identity (keep consistent everywhere):
- **Name:** BarterThat
- **Bundle / App ID:** `com.barterthat.app`
- **Version:** 1.0 (Android `versionCode` 1)
- **Live web app / PWA:** https://barterthat.vercel.app
- **Privacy policy:** https://barterthat.vercel.app/privacy.html
- **Support email:** founders@barterthat.com

> ⚠️ **One must-do for the live AI feature:** in Vercel → Project → Settings →
> Environment Variables, add `ANTHROPIC_API_KEY`, then redeploy. Without it the
> AI matchmaker silently falls back to local matching (app still works).

---

## 1) ANDROID — Google Play (automated AAB build)

**Build:** every push to `main` runs `.github/workflows/android-release.yml`,
which builds the web app, syncs Capacitor, signs, and uploads a release **AAB**
as a workflow artifact.

**One-time GitHub repo secrets** (Settings → Secrets and variables → Actions):
- `ANDROID_KEYSTORE_BASE64` — base64 of `android/barterthat-release.jks`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
(Generate base64: `base64 -w0 android/barterthat-release.jks > keystore.b64`)

**Steps:**
1. GitHub → **Actions** tab → confirm "Android Release (AAB)" went green.
2. Open the run → **Artifacts** → download `barterthat-release-aab` → unzip to get `app-release.aab`.
3. Google Play Console → **Create app** (or open existing) → choose category, default language.
4. Upload the AAB under **Production** (or start with **Internal testing** first — recommended).
5. Fill: store listing (use copy + icon + feature graphic + screenshots from `Downloads/`), **Data safety** form, **Content rating** questionnaire, target audience, privacy policy URL.
6. **Roll out**. First review is usually 1–7 days.

> Each new upload needs a **higher `versionCode`** — bump `versionCode` in
> `android/app/build.gradle` (1 → 2 → …) before re-pushing.

---

## 2) APPLE — App Store (Codemagic cloud-Mac build)

**Build:** `codemagic.yaml` workflow `ios-release` builds the IPA on a Mac and
auto-submits to **TestFlight**.

**One-time setup:**
1. Connect this GitHub repo at https://codemagic.io.
2. App Store Connect → Users and Access → **Integrations / Keys** → create an
   **App Store Connect API key**; add it in Codemagic and name the integration
   exactly **`BarterThat ASC Key`** (matches `codemagic.yaml`).
3. In App Store Connect, register the bundle ID `com.barterthat.app` and create
   the **app record** (My Apps → +).

**Steps:**
1. Codemagic → run the **`ios-release`** workflow → it builds, signs, and pushes to TestFlight.
2. App Store Connect → your app → fill: description, keywords, support URL,
   **privacy policy URL**, **App Privacy** questionnaire (data collected: account
   info you enter, locally-stored content; no selling of data), age rating.
3. Add **screenshots** at required sizes (you must provide real ones):
   - 6.7" iPhone — **1290 × 2796**
   - 6.5" iPhone — **1242 × 2688** (or 1284 × 2778)
   (Capture from the iOS Simulator running the app, or resize provided shots.)
4. Select the TestFlight build → **Submit for Review**. First review ~1–3 days.

> Native-permission strings for mic/camera/photos are already in
> `ios/App/App/Info.plist` (voice search + media uploads) so review won't flag them.

---

## 3) WINDOWS — Microsoft Store (PWA → MSIX via PWABuilder)

The site is now an installable PWA (manifest + service worker), so no native
Windows project is needed.

**One-time:** create a **Microsoft Partner Center** account
(https://partner.microsoft.com — individual is a ~$19 one-time fee) and, under
Apps, **reserve the name "BarterThat"**.

**Steps:**
1. Go to https://www.pwabuilder.com → enter `https://barterthat.vercel.app` → **Start**.
2. Review the score (manifest + service worker should both pass). Fix anything it flags.
3. **Package For Stores → Windows** → in options, paste your **Publisher display
   name**, **Publisher ID**, and **package identity** from Partner Center
   (Product → Product management → Product identity).
4. Download the generated **`.msixbundle`** (+ `.classmap`/assets).
5. Partner Center → your reserved app → **Packages** → upload the `.msixbundle`.
6. Fill listing (description, screenshots — desktop 1366×768+, category), age
   ratings, privacy policy URL → **Submit**. Review is usually hours–3 days.

---

## Assets you already have (in `Downloads/`)
- `barterthat-feature-graphic.png` (Play feature graphic, 1024×500)
- `barterthat-shot-01..05.png` (screenshots — may need resizing per store specs above)
- App icons: `public/logo192.png`, `public/logo512.png`, `public/favicon.png`

## Listing copy (reuse across stores)
- **Subtitle:** Swap skills & goods — no cash, just proof.
- **Short:** Trade everything — skills, goods, gear, even co-founders — without
  cash. AI finds the swap (or the chain of swaps) so everyone wins.
- **Keywords:** barter, swap, trade, marketplace, skills, services, gig, local,
  community, no cash, tokens, second-hand.
