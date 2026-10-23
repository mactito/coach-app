# Coach Raphi: Next.js + Supabase

Real accounts, a database, live chat and per-user security. The interface is in Italian.

## What works
- **Login, sign-up and email confirmation.** New sign-ups are clients; Raphi is promoted to trainer once (step 6 below).
- **Privacy consent.** Clients must accept a privacy notice before using the app (`app/consenso/page.tsx`). The time of consent is saved.
- **Trainer:** client list; build workouts from the exercise library (add your own exercises with video links) and assign them to several clients on a date; write each client's 7-day nutrition plan with calories and macros per meal, and see a daily total that turns orange when it is off target; chat with every client.
- **Client:** today's workout with set logging saved to the database; their 7-day meal plan; live chat with Raphi.
- **Security:** database rules (row-level security). A client can only read their own workouts, plan and messages. Only the trainer can create workouts and plans.

## Also included (matches the prototype)
- Photo banners and a login hero. Put image files in `public/images/` and write their paths in `lib/images.ts` (`login`, `workout`, `coach`, `food`). Empty slots show gradient placeholders.
- Trainer: client cards with search and filters, "In regola / Da sentire" status and a week of dots; per-client page with week strip, progress chart, scheduled workouts, check-in photos, chat and nutrition plan; edit and duplicate workouts, video link per exercise.
- Client: Mon-Sun strip on Oggi (tap a day to preview it; only today can be logged), rest timer, "Com'è andata?" comment sent to Raphi's chat, Progressi tab, Foto tab (before/after, stored privately), Piano and Chat tabs.

## Not built yet
Password reset, push notifications, payments, invite-only sign-up, account deletion.

## Setup
1. Create a project at supabase.com.
2. In **SQL Editor**, run these in order: `supabase/schema.sql`, `supabase/02_nutrition_chat.sql`, `supabase/03_photos.sql`. (If you already ran the first two, run only the third.)
3. **Project Settings > API:** copy the URL and anon key into `.env.local` (copy `.env.local.example`).
4. `npm install` then `npm run dev`, open http://localhost:3000
5. Sign up with Raphi's email.
6. Make her the trainer (SQL Editor):
   ```sql
   update profiles set role = 'trainer'
   where id = (select id from auth.users where email = 'RAPHI-EMAIL-HERE');
   ```
   Sign out and in again.

## Going live so real clients can use it
1. **Privacy text.** Replace the bracketed placeholders in `app/consenso/page.tsx` and have a lawyer approve the text. Clients' workout, meal and message data can reveal health information, so GDPR applies.
2. **Deploy.** Push to GitHub, import the repo in Vercel. Before the first deploy, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under Settings > Environment Variables (Production and Preview). If you add them after a deploy, redeploy: these values are baked in at build time. A `500 MIDDLEWARE_INVOCATION_FAILED` page almost always means these are missing or wrong.
3. **Supabase > Authentication > URL Configuration:** set Site URL to your Vercel address (or domain) and add `https://YOUR-DOMAIN/auth/callback` to Redirect URLs.
4. **Email confirmation:** keep "Confirm email" ON. Supabase's built-in sender is limited to a few emails an hour, so set up your own SMTP (Authentication > SMTP) with a service such as Resend before inviting clients.
5. **Backups.** Check what your Supabase plan includes. Paid plans have daily backups.
6. **Sign-up is open** to anyone with the link, but each person only ever sees their own data. If you want invite-only, tell me and I will add an invite code.
7. Test with one friendly client first: sign up, accept consent, assign a workout, log sets, exchange messages.

## Structure
- `supabase/`: database tables and security rules
- `middleware.ts`: sends logged-out visitors to /login
- `lib/`: Supabase clients, role check, nutrition helpers
- `components/`: Chat, nutrition editor and viewer, shared shell
- `app/trainer/`: clients, workouts, messages
- `app/oggi`, `app/alimentazione`, `app/chat`: client screens
