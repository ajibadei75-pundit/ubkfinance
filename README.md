# UBK School Finance Portal (works on Vercel and Netlify)

## Vercel
1. Import this folder (GitHub, or `npx vercel --prod` inside it).
2. Project > Storage > Create Database > Upstash Redis (free) > Connect to this project (all environments).
   This adds the KV_REST_API_URL / KV_REST_API_TOKEN variables automatically.
3. Redeploy. Sign in: admin@umarschool.edu / 8vU2V47nG2EuvXeqmsI5, then change the password.
Optional variables: AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD.

## Netlify
Run `npx -y @netlify/mcp@latest --site-id <ID> --proxy-path "<URL>"` inside this folder, or link the Git repo.

Layout: public/ (website), api/ (Vercel server), netlify/functions/ (Netlify server), server/ (shared logic).
