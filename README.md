# Therapease (Phase 1) – MERN Auth (JS Only)

Role-based authentication starter using Node.js, Express, MongoDB, React (Vite), and JWT.

## Features
- Users can register and login
- Roles: Normal User (`user`), `therapist`, `admin`
- Password hashing with `bcryptjs`
- JWT authentication with Bearer tokens
- Role-based protected routes (backend + frontend)
- Clean, modular structure with basic error handling
- Frontend built with Vite (React, JS only)

## Project Structure
```
Therapease/
├─ backend/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ utils/
│  ├─ config/
│  ├─ .env
│  ├─ package.json
│  └─ server.js
└─ frontend/
   ├─ index.html
   ├─ vite.config.js
   ├─ package.json
   └─ src/
      ├─ main.jsx
      ├─ App.js
      ├─ styles.css
      ├─ context/AuthContext.js
      ├─ components/
      │  ├─ Navbar.js
      │  └─ ProtectedRoute.js
      └─ pages/
         ├─ Home.js
         ├─ Login.js
         ├─ Signup.js
         ├─ Unauthorized.js
         ├─ DashboardUser.js
         ├─ DashboardTherapist.js
         └─ DashboardAdmin.js
```

## Prerequisites
- Node.js 16+
- MongoDB running locally (default connection string used)

## Backend Setup
1. Create the env file (already added at `backend/.env`). Adjust values if needed:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/therapease
JWT_SECRET=change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

2. Install and run:
```
cd backend
npm install
npm run dev
```
- API runs at: http://localhost:5000
- Health check: GET http://localhost:5000/api/health

## Frontend Setup (Vite + React)
1. Install and run dev server:
```
cd frontend
npm install
npm run dev
```
- App runs at: http://localhost:5173
- Vite dev proxy forwards `/api/*` to `http://localhost:5000`

## Usage
- Open http://localhost:5173
- Sign up with a role (Normal User, Therapist, Admin)
- Login and you will be redirected to the role-specific dashboard:
  - `/dashboard/user`
  - `/dashboard/therapist`
  - `/dashboard/admin`

## API Endpoints
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me` (protected)
- GET `/api/auth/logout` (protected)
- GET `/api/dashboard/user` (protected, role: user)
- GET `/api/dashboard/therapist` (protected, role: therapist)
- GET `/api/dashboard/admin` (protected, role: admin)

## Notes
- Frontend stores JWT in `localStorage` and sends it as `Authorization: Bearer <token>`.
- Backend also sets an httpOnly cookie, but frontend does not rely on it in this phase.
- MongoDB user schema is in `backend/models/User.js`.

## Scripts
Backend:
- `npm run dev` – start server with nodemon
- `npm start` – start server

Frontend:
- `npm run dev` – start Vite dev server
- `npm run build` – build for production
- `npm run preview` – preview production build

## Next Steps (Phase 2+)
- Add email verification and password reset
- Add therapist verification workflow and admin management
- Add real session/appointment models and stats
- Harden security (rate limiting, helmet, CSRF if cookies are used)
