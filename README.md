# Hajar — Maternal & Child Health Companion

A modern mobile app for mothers to track **pregnancy, childbirth, baby development, and maternal well‑being**, with an AI assistant and a supportive community.

- **Mobile app:** Flutter (Material 3, soft palette, multilingual EN / FR / AR with RTL)
- **Web app / dashboard:** React + Vite (analytics dashboard, charts, multilingual EN / FR / AR with RTL)
- **Backend:** Node.js + Express REST API (JWT auth, **MongoDB** via Mongoose, Helmet, PDF export, optional OpenAI)

> ⚠️ Educational software. The medical content (weekly development, vaccination schedule, EPDS screening) is for guidance only and is **not** a substitute for professional medical advice.

---

## Features

| Domain | What's included |
| --- | --- |
| **Pregnancy** | Week & due‑date calculation, weekly baby development (fruit‑size + highlights), milestones, trimester progress |
| **Birth & postpartum** | Birth details (date, weight, height, delivery type), medication & healthcare reminders |
| **Baby growth** | Weight / height / head‑circumference tracking, growth charts, vaccination schedule, feeding / sleep / diaper logs |
| **Mental health** | Daily mood tracking, EPDS postpartum‑depression screening with scoring & risk flags, personalized wellness tips |
| **Health records** | Store medical document metadata, export a full **PDF** health report |
| **AI assistant** | Chatbot for pregnancy / newborn / breastfeeding / sleep / development questions (OpenAI or built‑in rule engine) |
| **Notifications** | Appointment, vaccination, medication & milestone data exposed for client‑side reminders |
| **Community** | Topic groups, posts, replies, likes, expert Q&A flag |
| **School** | Per-child profiles, grades with subject averages & trend, homework / exams, attendance tracking, weekly timetable, and a summary dashboard |
| **Tools** | Kick counter (fetal movement sessions) and contraction timer with saved history |
| **Daily tips** | Localized educational tip of the day (pregnancy / baby context) |
| **Analytics** | Engagement overview endpoint for a dashboard |

> **Languages:** the apps default to **Arabic** (RTL) and offer an **Arabic / French** switcher. The mobile app opens with a language picker, then onboarding slides, on first launch.

---

## 1. Backend

### Requirements
- Node.js 18+ (tested on Node 25)
- A MongoDB connection string (MongoDB Atlas or local)

### Setup
```bash
cd backend
npm install
cp .env.example .env        # set MONGODB_URI, JWT_SECRET, (optional) OPENAI_API_KEY
npm run seed                # creates demo data in MongoDB
npm start                   # http://localhost:4100
```

`MONGODB_URI` is read from `.env`. The default port is **4100**.

### Demo account
```
email:    demo@hajar.app
password: password123
```

### Key endpoints (all under `/api`, JWT via `Authorization: Bearer <token>`)
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /pregnancy/active?lang=en`, `POST /pregnancy`, `GET /pregnancy/milestones`
- `GET/POST /appointments`, `GET/POST /medications`
- `GET/POST /babies`, `…/growth`, `…/vaccinations?lang=fr`, `…/logs`
- `GET/POST /wellness/mood`, `GET/POST /wellness/screening/epds`, `GET /wellness/recommendations`
- `GET/POST /records`, `GET /records/export/pdf`
- `POST /ai/chat`, `GET /ai/history`
- `GET/POST /community/posts`, `…/replies`, `…/like`
- `GET /analytics/overview`
- `GET /notifications/upcoming?lang=en&days=60` (aggregated appointment / vaccination / medication / milestone reminders)
- `GET /tools/tips/daily?lang=ar&context=pregnancy|baby` (localized daily tip)
- `GET/POST/DELETE /tools/kicks` (kick counter sessions), `GET/POST/DELETE /tools/contractions` (contraction timer)
- `GET/POST/PATCH/DELETE /school/students`, `…/grades`, `…/assignments`, `…/attendance`, `…/timetable`, and `GET /school/students/:id/summary`

Robustness & security: `helmet` security headers and `express-async-errors` (async route rejections are routed to the error handler instead of hanging the request).

The AI assistant uses OpenAI when `OPENAI_API_KEY` is set, otherwise a built‑in multilingual rule engine — so it always works offline.

---

## 2. Mobile app (Flutter)

### Requirements
- Flutter 3.32+ (current stable recommended; uses the modern `*ThemeData` APIs)

### Generate platform folders & run
The repo ships `lib/`, `pubspec.yaml`, and analysis config. Generate the native
project folders once, then run:

```bash
cd mobile
flutter create --platforms=android,ios,web .   # adds android/ios/web (keeps lib & pubspec)
flutter pub get
flutter run
```

> If `flutter create` overwrites `pubspec.yaml`, restore this repo's version
> (it pins `provider`, `http`, `shared_preferences`, `intl`, `fl_chart`).

### Point the app at the backend
`lib/services/api_client.dart` defaults to:
- Android emulator → `http://10.0.2.2:4100/api`

Override at run time without editing code:
```bash
flutter run --dart-define=API_BASE_URL=http://localhost:4100/api      # iOS sim / web / desktop
flutter run --dart-define=API_BASE_URL=http://<your-LAN-ip>:4100/api  # physical device
```

### App structure
```
lib/
  main.dart                 app bootstrap + routing
  theme.dart                soft Material 3 theme
  l10n/app_localizations.dart  EN / FR / AR strings (RTL aware)
  providers/app_state.dart  auth + locale state (Provider)
  services/api_client.dart  typed HTTP client
  widgets/common.dart       shared UI (cards, gradient, states)
  screens/                  auth, dashboard, pregnancy, baby (+detail),
                            wellness, screening, appointments, medications,
                            records, AI chat, community, profile
```

---

## 3. Web app / dashboard (React + Vite)

### Requirements
- Node.js 18+

### Run
```bash
cd web
npm install
cp .env.example .env        # set VITE_API_BASE_URL (default http://localhost:4100/api)
npm run dev                 # http://localhost:5173
```
Log in with the demo account (`demo@hajar.app` / `password123`).

### What's included
- **Analytics dashboard** — engagement totals, 7‑day activity bar chart, users‑by‑language pie chart, and aggregated upcoming reminders.
- **Pregnancy** — week/progress, weekly development, milestones.
- **Babies** — growth line charts (weight/height/head) and an interactive vaccination schedule.
- **Wellness** — mood logging with sliders and a mood/stress/anxiety trend chart, plus recommendations.
- **Community** — browse/post/reply/like across topic groups.
- **AI Assistant** — chat UI backed by the same `/ai/chat` endpoint.
- **i18n** — English / French / Arabic with automatic RTL.

### Structure
```
web/src/
  main.jsx, App.jsx        bootstrap + routing + auth guard
  api.js                   axios client (token injection)
  auth.jsx                 auth context
  i18n.jsx                 EN/FR/AR strings + RTL
  components/              Layout (sidebar), shared UI
  pages/                   Login, Dashboard, Pregnancy, Babies, Wellness, Community, Assistant
```

---

## Tech notes
- **Persistence:** MongoDB via Mongoose (`src/db.js`). Each logical collection uses a flexible schema; documents carry a stable string `id` (UUID) used by the API and clients.
- **Security:** passwords hashed with bcrypt; routes protected by JWT; per‑user data isolation enforced in every handler.
- **i18n:** Arabic automatically renders right‑to‑left via Flutter's `Directionality`.
