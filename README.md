# UBK School Finance Portal - Supabase backend (Vercel or Netlify)

1. Supabase: SQL Editor > run supabase/schema.sql (creates the private table ubk_kv).
2. Supabase: Project Settings > API: copy the Project URL and the service_role key.
3. Hosting (Vercel: Project > Settings > Environment Variables / Netlify: Site configuration > Environment variables):
   SUPABASE_URL              = your Project URL
   SUPABASE_SERVICE_ROLE_KEY = your service_role key (keep secret, never put it in the website files)
   optional: AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
4. Redeploy. First sign-in: admin@umarschool.edu / 8vU2V47nG2EuvXeqmsI5 (change it immediately).

Layout: public/ website, api/ Vercel server, netlify/functions/ Netlify server, server/ shared logic, supabase/ database script.
