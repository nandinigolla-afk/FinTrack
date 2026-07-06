# FinTrack — Financial Habit Builder & Wealth Growth Tracker

A full-stack MERN application (MongoDB, Express, React, Node.js) that helps people build
disciplined financial habits while tracking wealth growth over time — income & expense
logging, daily/weekly/monthly habit streaks, savings goals, an investment/net-worth
dashboard, and an admin panel.

Design concept: a digital **bank passbook** — deep ink/moss ledger tones, a gold "stamp"
accent, serif ledger numerals, and a signature stamp animation when a habit is checked
off, echoing a teller physically stamping a passbook.

## Project structure

```
fintrack/
├── backend/     Node.js + Express + MongoDB (Mongoose) REST API
└── frontend/    React (Vite) + Tailwind CSS + Framer Motion + Recharts
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set:
- `MONGO_URI` — your MongoDB Atlas (or local) connection string
- `JWT_SECRET` — any long random string
- `CLIENT_URL` — `http://localhost:5173` for local dev

Then run:

```bash
npm run dev        # starts the API on http://localhost:5000 with nodemon
npm run seed        # optional: creates an admin account admin@fintrack.com / Admin@123
```

### API overview

| Module | Base route | Notes |
|---|---|---|
| Auth | `/api/auth` | register, login, get/update profile (JWT) |
| Income | `/api/incomes` | CRUD |
| Expenses | `/api/expenses` | CRUD + `/summary` (category totals) |
| Habits | `/api/habits` | CRUD + `/:id/complete` (stamps streak) |
| Savings Goals | `/api/goals` | CRUD + `/:id/contribute` |
| Investments | `/api/investments` | CRUD + `/wealth-summary` (net worth) |
| Admin | `/api/admin` | `/analytics`, `/users` (protected, role=admin) |

All routes except register/login require `Authorization: Bearer <token>`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL if backend isn't on localhost:5000
npm run dev                # http://localhost:5173
```

Pages: Login, Register, Dashboard, Expense Tracker (+ income), Habit Tracker,
Savings Goals, Wealth Analytics, and an Admin Panel (visible only to `role: admin`
accounts).

## 3. Deploying

- **Backend**: deploy `backend/` to Render, Railway, or an EC2/VM. Set the same
  environment variables as `.env`. Point `CLIENT_URL` at your deployed frontend origin.
- **Frontend**: deploy `frontend/` to Vercel or Netlify. Set `VITE_API_URL` to your
  deployed backend's `/api` URL as a build-time environment variable.
- **Database**: use a MongoDB Atlas cluster; whitelist your backend host's IP (or
  `0.0.0.0/0` for platforms with dynamic IPs).

## Notes

- Passwords are hashed with bcrypt; auth uses JWT (7-day expiry by default).
- Habit streaks increment only when stamped on consecutive calendar days; missing a
  day resets the streak to 1 on the next stamp.
- Net worth = savings goal balances + investment current value + (total income −
  total expenses).
- Animations use Framer Motion throughout: page transitions, count-up stat numbers,
  animated progress bars, list enter/exit, and the signature habit "stamp".
