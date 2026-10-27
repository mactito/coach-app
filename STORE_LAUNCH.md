# Putting Coach Raphi on Google Play and the App Store

The native apps are a thin shell (Capacitor) around your live website, so you build and review the app once, and most later changes go live through Vercel without a new store release.

## 0. Before you build
1. Deploy the website on Vercel and make sure it works (login, trainer, client).
2. Run all SQL files in `supabase/` in order (`schema.sql`, then 02 to 06).
3. Vercel > Settings > Environment Variables: add `SUPABASE_SERVICE_ROLE_KEY` (from Supabase > Project Settings > API, the *service_role* key). Keep it secret and never prefix it with `NEXT_PUBLIC`. Without it, in-app account deletion does not work. Redeploy.
4. Fill in every `[BRACKET]` in `app/privacy/page.tsx`, `app/supporto/page.tsx` and `app/consenso/page.tsx`, and have a lawyer review the privacy text (the app handles health information). Redeploy.
5. Test on a phone browser: sign up as a client, accept consent, answer the questionnaire, log a workout, send a message, upload a photo, delete the account.
6. Choose your permanent app ID in `capacitor.config.ts` (`appId`, e.g. `it.yourdomain.coachraphi`). It cannot change after publishing. Put your live address in `APP_URL`.

## 1. Accounts you need
- **Google Play Console**: one-time fee (about 25 USD, check at signup). Identity verification is required.
  - A **personal** account created after 13 Nov 2023 must run a **closed test with at least 12 testers opted in for 14 continuous days** before it can apply for production. Plan about 3 weeks. **Organization** accounts are exempt, so if Raphi has a registered business, use that.
- **Apple Developer Program**: yearly fee (about 99 USD, check at signup).
- **A Mac with Xcode 26** for the iPhone build. Since 28 April 2026 Apple only accepts apps built with Xcode 26 and the iOS 26 SDK. No Mac? Use a cloud Mac service (for example Codemagic or a rented Mac).
- **Android Studio** (Windows, Mac or Linux) for the Android build.

## 2. Android (Google Play)
```
npm install
npm run cap:add:android
npm run cap:assets          # makes all icon and splash sizes from /assets
npm run cap:sync
npm run cap:android         # opens Android Studio
```
1. In Android Studio: Build > Generate Signed App Bundle > Android App Bundle. Create an **upload keystore** and **back it up** (losing it makes updates painful). Keep `versionCode` increasing with every upload.
2. Play Console > Create app. Fill in the **App content** section: privacy policy URL (`https://YOUR-DOMAIN/privacy`), Data safety form (see table below), content rating questionnaire, target audience (adults), and any health-app declaration it asks for. For account deletion, give the in-app path (Impostazioni > Elimina il mio account) and the web page `https://YOUR-DOMAIN/supporto`.
3. Upload the `.aab` to a **Closed testing** track, add 12 or more testers (use 15 to 20 in case some drop out), and keep them opted in for 14 days. Then apply for production access.
4. Store listing: the 512x512 icon is `public/icons/icon-512.png`; add a 1024x500 feature graphic and at least 2 phone screenshots.

## 3. iPhone (App Store)
```
npm install
npm run cap:add:ios
npm run cap:assets
npm run cap:sync
npm run cap:ios             # opens Xcode (on a Mac)
```
1. Xcode: set your Team, the bundle ID (same as `appId`), version and build number. Product > Archive > Distribute App > App Store Connect.
2. App Store Connect: create the app, fill in **App Privacy** (see table), age rating, support URL (`/supporto`), privacy URL (`/privacy`), screenshots (iPhone sizes requested by App Store Connect), description.
3. **App Review Information**: give a **demo trainer account and a demo client account** with data already in them, and a live back end. Apple requires this when an app has a login.
4. Apple requires apps that allow account creation to offer **in-app account deletion**. This app has it (clients: Impostazioni > Elimina il mio account).
5. **Biggest risk: Guideline 4.2 (minimum functionality).** Apple can reject apps that are only a website in a frame. This app has real native pieces (haptics, splash, status bar) but the strongest fix is the **push notifications** that are now included (new message, workout reminder; see `PUSH_SETUP.md`). Set them up before submitting, and be ready to explain in the review notes that the app is a private coaching tool for Raphi's clients with accounts, training logs, camera/photo upload and chat.

## 4. Store disclosures (both stores)
| Data | Collected | Why | Shared with third parties |
|---|---|---|---|
| Name, email | Yes | Account | No (processors only: Supabase, Vercel) |
| Age, weight, height, goal, injuries | Yes (health and fitness) | Personalised coaching | No |
| Workouts, sets, progress | Yes (health and fitness) | Core feature | No |
| Meal plan | Yes | Core feature | No |
| Photos (check-in) | Yes, user-provided | Progress tracking | No |
| Messages | Yes | Chat with trainer | No |
| Device push token (identifier) | Yes | Notifications | Only Google (FCM) and Apple (APNs) as delivery services |
Data is encrypted in transit; users can delete their account and data in the app; no ads; no tracking; no purchases.

## 5. Review notes you can paste
> Coach Raphi is a private coaching app for the clients of a personal trainer. Trainer account: [EMAIL / PASSWORD]. Client account: [EMAIL / PASSWORD]. Clients log workouts, follow a nutrition plan, upload progress photos and chat with their trainer. Accounts can be deleted in Settings.

## 6. Italian store listing (edit freely)
- **Name:** Coach Raphi
- **Short description (80 characters):** Allenamenti, pasti e progressi con il tuo personal trainer.
- **Full description:** Con Coach Raphi hai il tuo percorso in tasca. Ogni giorno vedi l’allenamento che Raphi ha preparato per te, con video dimostrativi e timer di recupero per ogni esercizio. Registra serie e pesi, segui il piano alimentare di 7 giorni, carica le foto di controllo e scrivi a Raphi direttamente nell’app. Guarda i tuoi progressi settimana dopo settimana.
- **Keywords (iOS):** allenamento, personal trainer, palestra, fitness, dieta, piano alimentare, progressi, coach

## 7. After launch
- Website changes reach the apps instantly. Changes to the native shell (app ID, plugins, icons) need a new store build.
- Keep what the app does consistent with what you described to the stores.
- Each update: raise the version number, rebuild, upload.

## 8. Also worth doing
- Push notifications are included. Follow `PUSH_SETUP.md` before building the store apps.
- If the chat grows beyond trainer and client, Apple's user-content rules (report and block) may apply.
