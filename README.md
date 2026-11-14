# Prokolpo Tracker (প্রকল্প ট্র্যাকার)
Static multi-page site (vanilla HTML/CSS/JS ES modules, seed JSON in /data). Synthetic demo data, not real government records. No build step, no backend, no external fonts/CDNs.

Routes (one folder + index.html each): /app /demo-user /demo-admin /admin /data /security /architecture /presentation /pitchdeck /audit /prompt /docs

Local test: `python3 -m http.server 8000`, then open http://localhost:8000/app/

Deploy (any static host): `npx vercel --prod` from this folder (Framework: Other; vercel.json sets trailingSlash), or upload the folder to a GitHub repo and enable Pages, or drag it into Netlify.

Seed dates are day offsets (-14 … -1) resolved against new Date() at load time, so the series always ends yesterday.
