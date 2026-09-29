# UBK School Finance – deployment
Netlify env vars required: AUTH_SECRET (long random string), ADMIN_PASSWORD (first admin password), optional ADMIN_EMAIL.
Deploy: connect this folder's Git repo to the Netlify site, or run `npm install && npx netlify-cli deploy --prod`.
Every push to the repo redeploys the site.
