# GEEP Frontend Setup Guide

## Installation

1. Install dependencies:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Features Implemented

✅ Authentication (Login/Register with role selection)
✅ Learning Modules (Lesson list and detail pages)
✅ Gamified Quizzes (Interactive MCQ quizzes with feedback)
✅ Eco Tasks (Task list and submission with image upload)
✅ Points & Badges System
✅ Leaderboard
✅ Teacher Analytics Dashboard (with charts)
✅ Responsive UI with Tailwind CSS
✅ Local storage for persistence

## Demo Credentials

- Use any email/password to login
- Add "teacher" in email (e.g., `teacher@example.com`) to access teacher role and analytics dashboard
- All data is stored in localStorage (mock data)

## Project Structure

- `/src/pages` - All page components
- `/src/components` - Reusable components
- `/src/data` - Mock JSON data files
- `/src/context` - React context for user state
- `/src/utils` - Helper functions and constants
