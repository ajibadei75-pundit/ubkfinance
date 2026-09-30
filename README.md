# UBK School Finance Portal

Folder layout (keep as is):
- public/index.html            website (all pages, charts, receipts, PDF reports)
- public/manifest.webmanifest, icon-192.png, icon-512.png   installable app
- netlify/functions/api.mjs    secure server: login, shared data, user management
- netlify.toml, package.json   Netlify settings and the one dependency (@netlify/blobs)

Required Netlify environment variables (already set on the ubkfinance site):
AUTH_SECRET, ADMIN_PASSWORD (optional: ADMIN_EMAIL)

Deploy (run inside this folder, Node.js required):
  npx -y @netlify/mcp@latest --site-id <SITE_ID> --proxy-path "<PROXY_URL>"
or connect this folder's Git repository to the Netlify site (auto-deploys on every push).
Do not use drag-and-drop: the server dependency would not be installed.
