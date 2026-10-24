# Coach Raphi: Next.js + Supabase

Real accounts, a database, live chat and per-user security. The interface is in Italian.

## What works
- **Login, sign-up and email confirmation.** New sign-ups are clients; Raphi is promoted to trainer once (step 6 below).
- **Privacy consent.** Clients must accept a privacy notice before using the app (`app/consenso/page.tsx`). The time of consent is saved.
- **Trainer:** client list; build workouts from the exercise library (add your own exercises with video links) and assign them to several clients on a date; write each client's 7-day nutrition plan with calories and macros per meal, and see a daily total that turns orange when it is off target; chat with every client.
- **Client:** today's workout with set logging saved to the database; their 7-day meal plan; live chat with Raphi.
- **Security:** database rules (row-level security). A client can only read their own workouts, plan and messages. Only the trainer can create workouts and plans.

## Same look and behaviour as the prototype
- The stylesheet `app/globals.css` is the prototype's `style.css`, plus a few rules for links. The screens use the same class names, so the look matches.
- Bottom sheets (add exercise, create exercise, assign to clients, video demo, "Com'è andata?"), toast messages, and +/- steppers work as in the prototype.
- Photo banners and the login hero: put image files in `public/images/` and write their paths in `lib/images.ts` (`login`, `workout`, `coach`, `food`). Empty slots show gradient placeholders.
- Trainer: Clienti (cards with search, filters, status and week dots), client page (week, last workout, progress chart, scheduled workouts, photos, assign workout, message, nutrition plan), Allenamenti (build, edit, save as copy, assign to several clients), Messaggi, Alimentazione.
- Client: Oggi with a Mon-Sun strip and week arrows, "Ultima volta" column, rest timer, finish sheet; Progressi; Foto; Chat; Piano.

## Deleting and editing plans
- **Delete a workout** (Allenamenti > Elimina): it disappears from the library and from clients' future days, but sessions clients already did stay in their history.
- **Client page > week view:** the trainer can open any day. Past or started days are read-only and show what the client actually logged. Today (if not started) and future days can be edited for that client only: change sets and reps, add or remove exercises, swap the workout, or remove it from the day. Shared workout models are never changed by this.
- **Editing a model that clients have already done** saves a new version, so past sessions stay as they were.

## Not built yet
Password reset, push notifications, payments, invite-only sign-up, account deletion.

## Setup
1. Create a project at supabase.com.
2. In **SQL Editor**, run these in order: `supabase/schema.sql`, `supabase/02_nutrition_chat.sql`, `supabase/03_photos.sql`, `supabase/04_plan_edit.sql`. If you already ran some of them, run only the new ones. 
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
