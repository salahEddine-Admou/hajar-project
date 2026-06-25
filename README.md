# Hajar — Maternal & Child Health Companion

A modern mobile app for mothers to track **pregnancy, childbirth, baby development, and maternal well‑being**, with an AI assistant and a supportive community.

- **Mobile app:** Flutter (Material 3, soft palette, multilingual EN / FR / AR with RTL)
- **Backend:** Node.js + Express REST API (JWT auth, **MongoDB** via Mongoose, PDF export, optional OpenAI)

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
| **Analytics** | Engagement overview endpoint for a dashboard |

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

## Tech notes
- **Persistence:** MongoDB via Mongoose (`src/db.js`). Each logical collection uses a flexible schema; documents carry a stable string `id` (UUID) used by the API and mobile client.
- **Security:** passwords hashed with bcrypt; routes protected by JWT; per‑user data isolation enforced in every handler.
- **i18n:** Arabic automatically renders right‑to‑left via Flutter's `Directionality`.
