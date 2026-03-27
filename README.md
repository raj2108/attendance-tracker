# Smart Attendance Tracker

A mobile-first, offline-capable attendance tracker web app for students.

## Implemented MVP Features
- Subject setup with:
  - subject name
  - classes attended and total
  - per-subject threshold (default configurable in settings)
  - subject type (theory/lab)
- Attendance dashboard with color risk states:
  - Green (`>75%`)
  - Yellow (`70%–75%`)
  - Red (`<70%`)
- Safe bunk + recovery calculator
- One-tap quick update actions:
  - Present
  - Absent
  - Cancelled
- In-app smart alerts for:
  - below 85%, 80%, and 75%
  - only 1 safe bunk left
  - active recovery required
- Optional browser notifications and daily reminder time
- Local persistence using `localStorage`
- Basic PWA support (`manifest.webmanifest` + `sw.js`)

## Run Locally
Because this repository has no package dependencies, you can serve it with any static HTTP server.

Examples:

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

## Key Files
- `index.html` — mobile-first app shell, screens, forms, navigation
- `styles.css` — responsive UI styling and color-coded risk cards
- `app.js` — state management, calculations, alerts, persistence, interactions
- `manifest.webmanifest` — installable PWA metadata
- `sw.js` — offline asset caching service worker
- `PRD.md` — source product requirements document
