# Athlete 365

Athlete 365 is a local-first fitness RPG web app for a structured 365-day calisthenics program. It combines daily training, workout completion, readiness logging, XP, skill levels, achievements, equipment substitutions, progress charts, and data export.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```powershell
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Tests

Use Node 18+:

```powershell
node tests/program.test.mjs
```

## What is implemented

- Deterministic 365-day program across 13 blocks
- Daily workout screen with set completion, notes, readiness, bodyweight, pain, and soreness
- RuneScape-inspired XP and skill levels
- Calendar list for all 365 days
- Program overview, progress charts, exercise library, and settings
- Equipment substitutions for unavailable equipment
- Local persistence using `localStorage`
- JSON and CSV export
- Basic automated validation tests

## Current limitations

This first version is dependency-free and browser-local. It does not yet use Next.js, Prisma, SQLite, server accounts, PDF export, or true push notifications. The 365-day plan is generated from deterministic templates and can be inspected in `src/program.js`.
