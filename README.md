# MSME Scheme Assistant

A full-stack web portal that helps Indian MSMEs discover government schemes (Central and Tamil Nadu), check eligibility, apply, and track applications.

- **Frontend:** Angular 21 (SSR-ready) — [`frontend/`](frontend)
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth — [`backend/`](backend)

## Features

- Browse and filter MSME schemes by authority, category and business type
- Eligibility checker and profile-based scheme matching
- Apply to schemes and track application stages
- Notifications, user profile, contact form
- Chat widget, dashboard, document tracking
- Secure REST API: validation, JWT, bcrypt, helmet, rate limiting, input sanitization

## Project structure

```
.
├── backend/    # Express + MongoDB REST API
└── frontend/   # Angular app
```

## Prerequisites

- Node.js 20+ and npm
- MongoDB (local install or a free MongoDB Atlas cluster)

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run seed              # load starter schemes
npm run dev               # http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

### 2. Frontend

```bash
cd frontend
npm install
npm start                 # http://localhost:4200
```

The API URL is set in `frontend/src/environments/environment.ts` (default `http://localhost:5000/api`).

## Environment variables (backend)

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret for signing tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_ORIGIN` | Allowed CORS origin (Angular dev server) |

Never commit your real `.env` — only `.env.example` is tracked.

## Admin access

Register a normal user, then set `role: "admin"` on that user in MongoDB (see `backend/README.md`).

## More docs

- API reference and validation rules: [`backend/README.md`](backend/README.md)

## License

MIT
