# Push notifications setup

What it does: the trainer gets a notification when a client writes (including the "Com'è andata?" comment); clients get one when Raphi writes, and a morning reminder when they have a workout they have not started. Android uses Firebase Cloud Messaging; iPhone uses Apple's push service directly (no Firebase iOS SDK needed).

This part cannot be tested without your own accounts, so test it on real phones once it is set up.

## 1. Database
Run `supabase/06_push.sql` in the Supabase SQL Editor.

## 2. Android (Firebase)
1. console.firebase.google.com > Add project (free). Analytics can be off.
2. Project overview > Add app > Android. Package name = the `appId` in `capacitor.config.ts`. Download **google-services.json** and put it in `android/app/` (after you run `npm run cap:add:android`).
3. Project settings > **Service accounts** > Generate new private key. This downloads a JSON file. Keep it secret; it becomes the `FCM_SERVICE_ACCOUNT` secret below (paste the whole JSON).

## 3. iPhone (Apple)
1. developer.apple.com > Certificates, Identifiers & Profiles > **Keys** > + > tick **Apple Push Notifications service (APNs)** > Continue > Register > download the **.p8** file (you can only download it once). Note the **Key ID**. Your **Team ID** is on the Membership page.
2. In Xcode (after `npm run cap:add:ios`): select the App target > Signing & Capabilities > + Capability > **Push Notifications**, and + Capability > **Background Modes** > tick **Remote notifications**.

## 4. Supabase functions
In a terminal in the project folder (needs Node):
```
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase secrets set PUSH_WEBHOOK_SECRET=make-up-a-long-random-string
npx supabase secrets set FCM_SERVICE_ACCOUNT='PASTE THE WHOLE JSON FILE CONTENT HERE'
npx supabase secrets set APNS_KEY_ID=ABCDE12345 APNS_TEAM_ID=TEAM123456 APNS_BUNDLE_ID=it.yourdomain.coachraphi APNS_ENV=production
npx supabase secrets set APNS_PRIVATE_KEY="$(cat AuthKey_ABCDE12345.p8)"
npx supabase functions deploy send-push --no-verify-jwt
npx supabase functions deploy daily-reminders --no-verify-jwt
```
The project ref is the code in your Supabase URL (https://REF.supabase.co). `APNS_BUNDLE_ID` must equal `appId`. Use `APNS_ENV=sandbox` only for apps installed straight from Xcode; TestFlight and the App Store use `production`.

## 5. Trigger on new messages
Supabase > Database > **Webhooks** > Create a new hook:
- Table: `messages`, Events: **Insert**
- Type: Supabase Edge Functions > `send-push`
- HTTP Headers: add `x-webhook-secret` = the same value as `PUSH_WEBHOOK_SECRET`

## 6. Morning reminder
Supabase > Database > Extensions: enable **pg_cron** and **pg_net**. Then in the SQL Editor (replace the two placeholders):
```sql
select cron.schedule('daily-reminders', '0 7 * * *', $$
  select net.http_post(
    url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/daily-reminders',
    headers := '{"x-webhook-secret": "YOUR-SECRET"}'::jsonb
  )
$$);
```
`0 7 * * *` is 07:00 UTC, which is 08:00 or 09:00 in Italy depending on the season.

## 7. Test
1. Install the app on an Android phone and an iPhone, log in as a client on one and as the trainer on the other. Accept the notification prompt.
2. Send a chat message from the trainer: the client's phone should buzz. Reply from the client: the trainer's phone should buzz. Tap the notification: it opens the chat.
3. Check Supabase > Edge Functions > send-push > Logs if nothing arrives. Common causes: wrong secret in the webhook header, `APNS_BUNDLE_ID` not equal to the app ID, missing google-services.json, or the Push Notifications capability not added in Xcode.

Log out removes the phone from the list, so the next person on the same phone does not get your notifications. Update the privacy text if you add other services.
