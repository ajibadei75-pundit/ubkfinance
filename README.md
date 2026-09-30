# UBK School Finance Portal - Supabase backend (Vercel or Netlify)

Database: Supabase project "umar-bn-l-khattob-results" (table ubk_kv, already created and locked with RLS).
The only setting you must add in your hosting project:

  UBK_DB_SECRET = <the secret given to you in chat>

Vercel: Project > Settings > Environment Variables > add for Production, Preview, Development > Redeploy.
Netlify: already set on the ubkfinance site. Deploy with the command, or link the Git repo.

Sign in: admin@umarschool.edu with the new password given in chat. Change it on Administration > Change my password.
Layout: public/ website, api/ Vercel server, netlify/functions/ Netlify server, server/ shared logic, supabase/ database notes.
