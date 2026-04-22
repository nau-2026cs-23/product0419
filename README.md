# 计忆·日程 — 学考提醒助手

A mobile-first academic exam reminder app for CS students, featuring pre-loaded exam schedules, manual task management, countdown timers, and a statistics dashboard.

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── constants.ts          # Server config
│   ├── middleware/
│   │   └── errorHandler.ts       # Global error handler
│   ├── routes/
│   │   └── feedback.ts           # Feedback & analytics API
│   └── server.ts                 # Express entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── custom/
│       │   │   ├── HomeView.tsx       # Main task list + countdown + system exams
│       │   │   ├── CalendarView.tsx   # Monthly calendar with event dots
│       │   │   ├── StatsView.tsx      # Statistics & analytics dashboard
│       │   │   ├── SettingsView.tsx   # Settings toggles + feedback form
│       │   │   └── OmniflowBadge.tsx  # Branding badge
│       │   └── ui/                    # shadcn/ui components
│       ├── config/
│       │   └── constants.ts           # API_BASE_URL
│       ├── lib/
│       │   ├── data.ts                # System exam data + utility functions
│       │   └── utils.ts               # Tailwind merge utils
│       ├── pages/
│       │   └── Index.tsx              # App shell: nav, state, modals
│       ├── types/
│       │   └── index.ts               # All TypeScript types
│       ├── App.tsx                    # HashRouter setup
│       └── index.css                  # Tailwind v4 + green academic theme
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Routing**: React Router DOM (HashRouter)
- **State**: useState + localStorage persistence
- **Notifications**: Sonner toast

## Key Features

1. **Task Management** - Add/complete/delete manual tasks in under 30 seconds
2. **System Exam Calendar** - 12 pre-loaded exams (CET-4/6, NCRE, 软考, PSC)
3. **Countdown Banner** - Shows days until next upcoming exam
4. **Category Filters** - All / Week / Exam / Registration / Homework / History
5. **Visual Distinction** - Computer icon for system items, note icon for manual
6. **Historical Archive** - Expired exams auto-archived at bottom
7. **Settings Toggles** - Enable/disable system reminders and push notifications
8. **Feedback Form** - Submit suggestions or error reports via API
9. **Statistics View** - Completion rate, category breakdown, urgent tasks
10. **Calendar View** - Monthly grid with event dots and 30-day upcoming list

## API Routes

- `POST /api/feedback` - Submit user feedback
- `POST /api/feedback/analytics` - Track behavior events (exam toggle, etc.)
- `GET /api/feedback/analytics` - Get analytics summary

## Data Architecture

- All task data persisted in `localStorage` (keys: `jimemo_tasks`, `jimemo_settings`, `jimemo_exams`)
- System exam data defined in `frontend/src/lib/data.ts` (SYSTEM_EXAMS array)
- Feedback stored in-memory on backend (no DB required for MVP)

## Code Generation Guidelines

- All navigation state lives in `Index.tsx` (activeTab, modals)
- View components receive data via props, emit events via callbacks
- System exams filtered by `isExpired()` before display
- Use `getDaysUntil()` for countdown calculations
- Color palette: primary `#81a470`, accent `#25743a`, bg `#ecffe9`, surface `#94be91`, muted `#0a4313`
