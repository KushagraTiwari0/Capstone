# 🌿 GEEP – Green Eco Education Platform

A full-stack web application that encourages environmental awareness through **gamified learning**, real-world eco tasks, quizzes, badges, leaderboards, and teacher analytics.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

---

## Overview

GEEP is a monorepo containing both the **React frontend** (Vite) and the **Express + MongoDB backend** in a single repository.

**User Roles:**
| Role | Capabilities |
|------|-------------|
| **Student** | Complete lessons, take quizzes, submit eco tasks, earn badges & points, view leaderboard |
| **Teacher** | Review task submissions, monitor student progress, view analytics |
| **Admin** | Manage users, approve registrations, manage content |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite 5 | Build tool & dev server |
| React Router v6 | Client-side routing |
| Recharts | Analytics charts |
| Tailwind CSS | Styling |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Nodemailer | Email notifications |
| dotenv | Environment configuration |

---

## Features

### 🎓 Student Features
- **Authentication** – Register/Login with role selection, admin approval flow
- **Learning Modules** – Lessons on waste management, biodiversity & renewable energy with progress tracking
- **Gamified Quizzes** – MCQ-based quizzes with instant feedback and summary results
- **Eco Tasks** – Submit real-world tasks (tree planting, waste segregation, energy saving) with image, location & reflection
- **Badges & Points** – Earn badges and accumulate eco-points upon task & quiz completion
- **Leaderboard** – View rankings across students with filters
- **Games** – Interactive educational mini-games

### 🧑‍🏫 Teacher Features
- **Task Review Dashboard** – View, approve or reject student task submissions
- **Analytics Dashboard** – Learning progress, quiz accuracy, task completion, and environmental impact charts

### 🛡️ Admin Features
- User management & approval
- Content management (lessons, quizzes, tasks, badges)

---

## Project Structure

```
GEEP capstone/
│
├── backend/
│   ├── config/          # Database connection
│   ├── middleware/       # Auth & role middleware
│   ├── models/          # Mongoose models (User, Task, TaskSubmission, Quiz, Lesson, Badge)
│   ├── routes/          # Express route handlers
│   ├── scripts/         # DB migration & admin creation scripts
│   └── utils/           # Helpers & utilities
│
├── src/                 # React frontend
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context (UserContext)
│   ├── data/            # Static/mock data (JSON)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components by role/feature
│   │   ├── Admin/
│   │   ├── Auth/
│   │   ├── Games/
│   │   ├── Landing/
│   │   ├── Leaderboard/
│   │   ├── Learning/
│   │   ├── Quiz/
│   │   ├── Rewards/
│   │   ├── Tasks/
│   │   ├── Teacher/
│   │   └── User/
│   ├── services/        # API service functions
│   ├── utils/           # Constants & helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── router.jsx
│
├── public/              # Static assets
├── server.js            # Express app entry point
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vercel.json          # Vercel deployment config
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- **MongoDB** (local or Atlas cloud instance)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd "GEEP capstone"

# 2. Install all dependencies
npm install
```

### Running Locally

**Start the backend server:**
```bash
npm run server:dev
# Runs Express on http://localhost:10000
```

**Start the frontend dev server (in a separate terminal):**
```bash
npm run dev
# Runs Vite on http://localhost:5173
```

> The Vite dev server proxies `/api/*` requests to `http://localhost:10000` automatically.

---

## Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=10000
NODE_ENV=development

# Email (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# CORS (production)
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

> ⚠️ Never commit `.env` to version control. It is already listed in `.gitignore`.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build locally |
| `npm run server` | Start Express backend (production) |
| `npm run server:dev` | Start Express backend with nodemon (hot reload) |
| `npm run test:db` | Test MongoDB connection |
| `npm run create:admin` | Create initial admin user |
| `npm run migrate:approve-users` | Migrate existing users to approved status |

---

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Register, login, logout |
| `/api/users` | User profile & management |
| `/api/tasks` | Eco task CRUD & submissions |
| `/api/teacher` | Teacher dashboard & task review |
| `/api/admin` | Admin user & content management |
| `/api/leaderboard` | Leaderboard rankings |
| `/api/analytics` | Learning & quiz analytics |
| `/api/lessons` | Lesson content |
| `/api/badges` | Badge management |
| `/api/games` | Game content |
| `/api/health` | Server health check |

---

## Deployment

The project is configured for:

- **Frontend** → [Vercel](https://vercel.com) (`vercel.json` is included)
- **Backend** → [Render](https://render.com) (configured via environment variables)

**Live URLs:**
- Frontend: `https://capstone-gray-alpha.vercel.app`
- Backend: `https://capstone-kfwu.onrender.com`

---

## 📄 License

This project is developed as a Capstone project for academic purposes.
