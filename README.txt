# ElastoClash – Installationsguide (Noob Edition 🚀)

## 1. Sådan kører og uploader du spillet

- **Træk hele mappen (eller en ZIP) ind på [https://app.netlify.com/](https://app.netlify.com/)**
- Netlify hoster dit spil gratis, og du får et link (fx `https://elastoclash.netlify.app`)

## 2. Forbind til din Supabase backend
- Åbn filen `js/config.js`
- Indsæt din `SUPABASE_URL` og `SUPABASE_KEY` (findes i Supabase dashboard)
- Hvis du vil have multiplayer, indsæt din multiplayer-server-url

## 3. Installer som mobil-app (PWA)
- Åbn din spilside på mobilen i Safari (iPhone) eller Chrome (Android)
- Tryk på del/indstillinger → "Føj til hjemmeskærm"
- Nu har du ElastoClash som app!

## 4. Multiplayer support
- Sæt en Socket.IO server op (fx via Render.com, Railway.app, eller din egen VPS)
- Indsæt url i `js/config.js` (fx `https://dinserver.onrender.com`)

## 5. Filer og struktur
elastoclash/
├── index.html
├── style.css
├── manifest.json
├── service-worker.js
├── README.txt
├── assets/
│ ├── icon-192.png
│ ├── icon-512.png
│ ├── drive.mp3
│ ├── crash.mp3
│ └── win.mp3
└── js/
│   ├── achievements.js
│   ├── auth.js
│   ├── bike.js
│   ├── config.js
│   ├── controls.js
│   ├── daily.js
│   ├── effects.js
│   ├── game.js
│   ├── game2.js
│   ├── ghost-share.js
│   ├── leaderboard-ui.js
│   ├── leaderboard.js
│   ├── level-editor.js
│   ├── level.js
│   ├── main.js
│   ├── multiplayer.js
│   ├── particles.js
│   ├── pause-ui.js
│   ├── powerup-config.js
│   ├── powerups.js
│   ├── replay.js
│   ├── sound-config.js
│   ├── sound-engine.js
│   ├── sounds.js
│   ├── springs.js
│   ├── stars.js
│   ├── terrain-effects.js
│   ├── terrain.js
│   └── touch-controls.js
├── server.js
├── package.json

## 6. Problem eller spørgsmål?
Bare spørg din AI assistent (eller send mig et screenshot) – jeg guider dig videre!

**God fornøjelse med ElastoClash!**