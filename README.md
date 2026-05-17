# CodeTracker v2

> Built by **Team FutureMind-Coder** · 6th Semester

A competitive programming progress tracker with a real database, five-platform sync, activity heatmap, streak tracking, problem journal, and a Chrome extension with a built-in Pomodoro timer.

---

## What's inside

```
FutureMind-Coder/
├── app/                        # Next.js 15 App Router (web)
│   ├── (auth)/                 # Login, signup pages
│   ├── (app)/                  # Authed pages (all behind middleware)
│   │   ├── dashboard/          # Overview with stats + heatmap preview
│   │   ├── activity/           # Full 52-week contribution heatmap
│   │   ├── goals/              # Daily/weekly targets with live progress
│   │   ├── journal/            # Markdown problem notes
│   │   ├── platforms/          # Connect + sync LeetCode/CF/GH/CC/AtCoder
│   │   └── settings/           # Profile, password
│   ├── api/extension/timer/    # REST endpoint used by Chrome extension
│   └── page.tsx                # Landing page
├── components/                 # UI primitives + feature components
├── lib/
│   ├── supabase/               # Client, server, middleware, types
│   ├── platforms/              # Platform API fetchers (one file each)
│   ├── streak.ts               # Streak + heatmap logic
│   └── utils.ts
├── supabase/
│   └── schema.sql              # Run once in Supabase SQL editor
├── extension/                  # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js           # Service worker — tab tracking + Pomodoro
│   ├── popup.html / popup.js   # Extension popup
│   └── setup.md
├── .env.example
└── README.md
```

---

## Tech stack

| Layer | What |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions, TypeScript) |
| Styling | Tailwind CSS 4 (CSS-first config, custom OKLCH palette) |
| UI | Shadcn-style components, Geist Sans + Instrument Serif |
| Auth + DB | Supabase (email/password, Postgres, Row Level Security) |
| Charts | Recharts |
| Extension | Chrome Manifest V3, vanilla JS |
| Platforms | LeetCode GraphQL, Codeforces API, GitHub GraphQL, CodeChef unofficial, AtCoder/kenkoooo |

---

## Getting started

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `supabase/schema.sql` in full.
3. Copy your project URL and anon key.

### 2. Environment

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# Optionally: GITHUB_TOKEN for full GitHub stats (otherwise public repos count is used)
```

### 3. Run

```bash
npm install
npm run dev          # → http://localhost:3000
```

### 4. Chrome extension

1. `chrome://extensions` → toggle **Developer mode** on
2. **Load unpacked** → select the `extension/` folder
3. See `extension/setup.md` for API URL + auth token wiring

---

## Features

| Feature | Status |
|---|---|
| Email auth (Supabase) | ✅ |
| Dashboard (stats, charts, heatmap preview) | ✅ |
| 52-week activity heatmap | ✅ |
| Streaks (current + longest) | ✅ |
| Goals (daily problems, weekly problems, weekly minutes) | ✅ |
| Problem journal with Markdown editor | ✅ |
| LeetCode stats sync | ✅ |
| Codeforces stats sync | ✅ |
| GitHub stats sync | ✅ |
| CodeChef stats sync | ✅ |
| AtCoder stats sync | ✅ |
| Chrome extension — tab time tracking | ✅ |
| Chrome extension — Pomodoro timer | ✅ |
| Chrome extension — syncs seconds to Supabase | ✅ |
| Light + dark mode | ✅ |
| Landing page | ✅ |
| Profile + password settings | ✅ |

---

## What's left / next phase

These are **not built yet** — pick up from here on another machine:

### High priority
- [ ] **Extension icons** — add `icons/icon16.png`, `icon48.png`, `icon128.png` (the extension won't load without them — generate from [favicon.io](https://favicon.io))
- [ ] **Extension auth wiring** — popup needs a settings screen where the user pastes their `apiUrl` + `authToken` into `chrome.storage.local` (right now they have to do it manually via DevTools)
- [ ] **Mobile sidebar** — the sidebar is hidden on `< md`; add a hamburger + sheet/drawer for mobile
- [ ] **Sync all platforms button** — one-click sync on the platforms page (calls `syncPlatform` for each connected account in sequence)

### Medium priority
- [ ] **Search / filter in journal** — search by title, filter by platform/tag/difficulty
- [ ] **Journal tags page** — `/journal/tags/[tag]` filtered view
- [ ] **Weekly digest card** — "This week vs last week" summary section on dashboard
- [ ] **Timezone-aware streaks** — currently uses UTC; should respect `profiles.timezone`
- [ ] **AtCoder recent daily** — `atcoder.ts` returns empty `recentDaily`; wire up the kenkoooo submissions API
- [ ] **Error boundaries** — no error UI exists yet; add `error.tsx` files per route segment

### Nice to have
- [ ] **OG image** — dynamic OpenGraph image for the landing page
- [ ] **PWA manifest** — make the web app installable
- [ ] **Export to CSV** — download your activity data
- [ ] **Leaderboard** — compare with friends (requires public profiles)
- [ ] **Vercel deployment guide** in README

---

## Database schema (summary)

| Table | Purpose |
|---|---|
| `profiles` | Display name, handle, timezone — auto-created on signup |
| `platform_accounts` | One row per connected platform per user |
| `daily_activity` | Rolled-up solves + seconds per day per platform |
| `goals` | User-set daily/weekly targets |
| `journal_entries` | Markdown notes per problem |
| `focus_sessions` | Raw session rows from the extension |

All tables have Row Level Security — users can only read/write their own data.

---

## Contributing

```bash
git checkout -b feature/my-feature
# make changes
git commit -m "add: my feature"
git push
```
