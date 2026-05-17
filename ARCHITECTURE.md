# Architecture — CodeTracker v2

> Built by Team FutureMind-Coder · 6th Semester

---

## Overview

CodeTracker v2 is a full-stack web app + Chrome extension that tracks a developer's competitive programming activity across five platforms. It has no separate backend server — everything runs through Next.js 15 (Server Actions + Route Handlers) with Supabase as the database and auth provider.

```
Browser / Extension
       │
       ▼
  Next.js 15 (App Router)
  ├── Server Components  ← read DB, render HTML
  ├── Server Actions     ← mutate DB (forms, buttons)
  ├── Route Handlers     ← REST API for extension
  └── Middleware         ← auth guard on every request
       │
       ▼
   Supabase (Postgres + Auth)
   ├── auth.users        ← managed by Supabase
   ├── profiles
   ├── platform_accounts
   ├── daily_activity
   ├── goals
   ├── journal_entries
   └── focus_sessions
```

---

## Directory Structure

```
FutureMind-Coder/
├── app/
│   ├── (auth)/                  # Public — login, signup
│   ├── (app)/                   # Protected — all authed pages
│   │   ├── layout.tsx           # Injects Sidebar + Topbar + MobileNav
│   │   ├── dashboard/           # Overview: stats, chart, heatmap preview
│   │   ├── activity/            # Full 52-week heatmap
│   │   ├── goals/               # Daily / weekly targets
│   │   ├── journal/             # Markdown problem notes
│   │   ├── platforms/           # Connect, sync, manage platforms
│   │   └── settings/            # Profile + password
│   ├── api/
│   │   └── extension/timer/     # POST endpoint consumed by the Chrome extension
│   ├── auth/callback/           # Supabase OAuth callback (email confirm)
│   ├── globals.css              # Tailwind 4 + OKLCH design tokens
│   ├── layout.tsx               # Root layout (fonts, theme provider)
│   └── page.tsx                 # Landing page (public)
│
├── components/
│   ├── shell/
│   │   ├── sidebar.tsx          # Desktop sidebar (md+)
│   │   ├── mobile-nav.tsx       # Hamburger + slide-in drawer (< md)
│   │   ├── topbar.tsx           # Sticky header (New entry, theme, sign-out)
│   │   └── sign-out-button.tsx
│   ├── dashboard/               # Stat cards, area chart, heatmap, platform row
│   ├── journal/                 # Markdown write/preview editor
│   ├── theme-provider.tsx       # next-themes wrapper
│   ├── theme-toggle.tsx
│   └── ui/                      # Primitive components (Button, Card, Input…)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser-side Supabase client
│   │   ├── server.ts            # Server-side Supabase client (cookies)
│   │   ├── middleware.ts        # Session refresh + route guard logic
│   │   └── types.ts             # TypeScript types from DB schema
│   ├── platforms/
│   │   ├── index.ts             # fetchStats() dispatcher
│   │   ├── leetcode.ts          # LeetCode GraphQL API
│   │   ├── codeforces.ts        # Codeforces REST API
│   │   ├── github.ts            # GitHub GraphQL API
│   │   ├── codechef.ts          # CodeChef unofficial scrape
│   │   └── atcoder.ts           # AtCoder via kenkoooo API
│   ├── streak.ts                # computeStreak() + buildHeatmap()
│   ├── nav.ts                   # Shared nav item definitions
│   └── utils.ts                 # cn(), relativeTime(), etc.
│
├── extension/
│   ├── manifest.json            # Manifest V3
│   ├── background.js            # Service worker: tab tracking + Pomodoro
│   ├── popup.html / popup.js    # Extension popup UI + settings panel
│   ├── gen-icons.js             # Icon generator script (Node, no deps)
│   └── icons/                   # icon16/48/128.png
│
├── supabase/
│   └── schema.sql               # Full Postgres schema (run once in Supabase)
│
├── middleware.ts                 # Next.js middleware entry — calls updateSession()
└── next.config.ts
```

---

## Request Lifecycle

### 1. Every HTTP request — Auth Middleware

```
Request → middleware.ts
           └── updateSession()
                 ├── Refresh Supabase session cookie (keeps JWT alive)
                 ├── No user + protected route  → redirect /login
                 └── Logged-in user + auth page → redirect /dashboard
```

The middleware runs on **every route except** `_next/static`, images, and `/api/extension/*` (the extension endpoint is auth-checked inside the handler instead, so it is excluded from cookie-based session refresh).

---

### 2. Page render — Server Components

```
Browser → GET /dashboard
  └── AppLayout (server)
        ├── supabase.auth.getUser()  — if null → redirect /login
        ├── fetch profile row
        ├── render <Sidebar> + <MobileNav> + <Topbar>
        └── render <DashboardPage> (server)
              ├── fetch daily_activity (last 365 days)
              ├── fetch platform_accounts
              ├── fetch goals
              ├── computeStreak(rows)     ← lib/streak.ts
              ├── buildHeatmap(rows)      ← lib/streak.ts
              └── stream HTML to browser
```

No client-side data fetching for the initial render — everything is server-rendered. Client components (`"use client"`) are used only for interactivity: chart hover, editor, form transitions, mobile drawer.

---

### 3. Mutations — Server Actions

All write operations are Server Actions (`"use server"` functions called directly from client components via `startTransition`).

```
User clicks "Sync" on a platform card
  └── syncPlatform(platform)          ← app/(app)/platforms/actions.ts
        ├── getUser()                  — auth check
        ├── fetchStats(platform, username)   ← lib/platforms/index.ts
        │     └── platform-specific fetcher (LeetCode GraphQL, CF API, etc.)
        ├── upsert into daily_activity (historical + today)
        ├── update platform_accounts.metadata + last_synced_at
        └── revalidatePath() → Next.js re-renders /platforms, /dashboard, /activity
```

The "Sync All" button runs `syncAllPlatforms()` which calls `syncPlatform()` for each connected account via `Promise.allSettled` — failures on one platform don't block others.

---

### 4. Chrome Extension → API

```
Extension background.js (service worker)
  │
  ├── Tab focus/navigation detected
  │     └── detectPlatform(url) → "leetcode" | "codeforces" | …
  │
  ├── Every second (setInterval)
  │     ├── buffer[platform]++
  │     ├── persist totals → chrome.storage.local (popup reads this)
  │     └── every 60s: flushPlatform()
  │           └── POST /api/extension/timer
  │                 { platform, seconds, action: "ping" }
  │                 Authorization: Bearer <authToken>
  │
  └── Pomodoro: 25-min countdown, chrome.notifications on finish

POST /api/extension/timer   (app/api/extension/timer/route.ts)
  ├── supabase.auth.getUser()  — validates the Bearer token via cookie/JWT
  ├── action === "start"  → insert focus_sessions row, return session_id
  ├── action === "stop"   → update focus_sessions.ended_at
  └── seconds > 0         → upsert daily_activity.seconds_spent (additive)
```

The extension is configured via the popup settings panel (⚙):
- **Dashboard URL** — e.g. `https://your-app.vercel.app`
- **Auth token** — found in Dashboard → Settings → Extension

Both values are stored in `chrome.storage.local` and read by `background.js` on every flush.

---

## Database Schema

All tables live in the `public` schema with **Row Level Security** enabled. Every policy checks `auth.uid() = user_id`, so users can only ever read or write their own rows.

### Tables

```
auth.users (Supabase managed)
     │
     └─[trigger: handle_new_user]──► profiles
                                        │
                          ┌─────────────┼──────────────┐
                          ▼             ▼               ▼
               platform_accounts   daily_activity     goals
                                        │
                          ┌─────────────┘
                          ▼
                     journal_entries
                     focus_sessions
```

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id`, `display_name`, `handle`, `timezone` | Auto-created by DB trigger on signup |
| `platform_accounts` | `user_id`, `platform`, `username`, `metadata jsonb`, `last_synced_at` | Unique on `(user_id, platform)`. `metadata` stores totalSolved, rating, rank, contestsAttended, profileUrl |
| `daily_activity` | `user_id`, `day date`, `platform`, `problems_solved`, `seconds_spent` | Unique on `(user_id, day, platform)`. Upserted on every sync and every extension flush |
| `goals` | `user_id`, `kind goal_kind`, `target int` | Unique on `(user_id, kind)`. Kinds: `daily_problems`, `weekly_problems`, `weekly_minutes` |
| `journal_entries` | `user_id`, `title`, `platform`, `difficulty`, `tags text[]`, `body_md`, `time_spent_seconds` | GIN index on `tags` for future tag filtering |
| `focus_sessions` | `user_id`, `platform`, `started_at`, `ended_at`, `duration_seconds` | `duration_seconds` is a **generated stored column** (no app-side math needed) |

### Streak view

```sql
-- streak_summary (security_invoker = on → RLS applied automatically)
-- Returns: current_streak, longest_streak
-- Uses a gap-and-island algorithm on distinct active days
```

`computeStreak()` in `lib/streak.ts` replicates the same logic in TypeScript for cases where the view is not used.

---

## Auth Flow

```
Signup
  → supabase.auth.signUp()
  → Supabase sends confirmation email
  → User clicks link → /auth/callback (exchanges code for session)
  → DB trigger fires → profiles row auto-created
  → redirect /dashboard

Login
  → supabase.auth.signInWithPassword()
  → Supabase sets httpOnly session cookies
  → middleware refreshes cookies on every request (sliding expiry)

Sign-out
  → supabase.auth.signOut()
  → Cookies cleared → middleware redirects to /login
```

---

## Platform Sync — Data Flow

```
lib/platforms/index.ts  fetchStats(platform, username)
      │
      ├── leetcode.ts   → LeetCode GraphQL  (graphql.leetcode.com)
      ├── codeforces.ts → codeforces.com/api/user.rating + user.status
      ├── github.ts     → api.github.com GraphQL (contributionsCollection)
      ├── codechef.ts   → codechef.com/users/<handle> (unofficial scrape)
      └── atcoder.ts    → kenkoooo.com/atcoder/atcoder-api (submissions)

Returns: PlatformStats {
  totalSolved, rating, rank, contestsAttended, profileUrl,
  recentDaily: [{ day: "YYYY-MM-DD", solved: number }]
}
      │
      ▼
syncPlatform() → upserts recentDaily rows into daily_activity
              → updates platform_accounts.metadata (totalSolved, rating…)
              → revalidatePath() triggers re-render of dashboard + activity
```

---

## Design System

Tailwind 4 with a CSS-first config — no `tailwind.config.js`. Design tokens are CSS custom properties defined in `globals.css`:

```
--color-background        warm off-white / near-black
--color-surface           card backgrounds
--color-surface-2         hover / active states
--color-border            subtle dividers
--color-foreground        primary text
--color-foreground-muted  secondary text
--color-primary           #B5532E (warm amber-red, OKLCH)
--color-danger            destructive actions
```

Light and dark values are set in `@media (prefers-color-scheme)` and toggled via `next-themes` (class strategy).

Fonts: **Geist Sans** (body) + **Instrument Serif** (display headings, `.font-display`).

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| No separate backend | Server Actions replace REST for all mutations; reduces infra and eliminates CORS |
| Supabase over Firebase | Relational schema, SQL queries, RLS, real migrations — needed for daily_activity joins and streak logic |
| Row Level Security everywhere | Data isolation at the DB layer; even a compromised server action cannot leak another user's data |
| `daily_activity` as the single source of truth | Both platform syncs and extension time-tracking write here; dashboard, heatmap, streaks, and goals all read from it |
| Extension excluded from middleware | The extension sends a Bearer token, not session cookies — auth is handled inside the Route Handler |
| `Promise.allSettled` for Sync All | One slow/failing platform API doesn't block the others |
| `duration_seconds` as generated column | Prevents drift between `ended_at - started_at` and an app-maintained counter |
