# 🌿 GEEP Platform(SrishtiX) – Frontend Documentation

This repository contains the **frontend-only implementation** of the **GEEP (Green Eco Education Platform)**.  
The goal is to build a complete UI for the learning flow, gamified quizzes, eco-tasks, badges, leaderboard, and teacher analytics dashboards using **mock data only** (no backend yet).

---

## ✅ Overview

The GEEP platform aims to encourage environmental learning through:

- Gamified learning modules  
- Quizzes  
- Real-world eco tasks  
- Points & eco-badges  
- Leaderboards  
- Teacher analytics dashboard  

This frontend project provides the full user interface, allowing you to integrate backend APIs later.

---

## ✅ Working Flow of GEEP Platform

User Login → Learning Module → Gamified Quiz → Real-world Eco Tasks → Points & Badges → Leaderboard → Analytics Dashboard

---

## ✅ Features Included (Frontend Only)

### 1. Authentication UI
- Login & Registration  
- Role selection (Student/Teacher)  
- UI validation only  

### 2. Learning Module
- Waste management, biodiversity & renewable energy  
- Lesson list + detailed lesson views  
- Interactive UI + progress bars  

### 3. Gamified Quizzes
- MCQs  
- Correct/Incorrect feedback  
- Summary page  
- Local storage progress  

### 4. Eco Tasks
- Real-world tasks (tree planting, waste segregation, energy savings)  
- Submission UI: image preview, location input, reflection  
- Fake verification statuses  

### 5. Points & Eco-Badges
- Badge collection  
- Points counter  
- Earned badge animations  

### 6. Leaderboard
- Ranks  
- Points  
- Filters  
- Mock data driven  

### 7. Teacher Analytics Dashboard
- Learning progress analytics  
- Quiz accuracy charts  
- Task completion charts  
- Environmental impact score  

---

# 📁 Folder Structure

geep-frontend/
│
├── public/
│   └── icons, logos, images
│
├── src/
│   ├── assets/
│   │   └── images/, icons/, illustrations/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Modal.jsx
│   │   ├── learning/
│   │   ├── quiz/
│   │   ├── tasks/
│   │   ├── badges/
│   │   └── analytics/
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── Learning/
│   │   │   ├── LessonList.jsx
│   │   │   └── LessonDetail.jsx
│   │   │
│   │   ├── Quiz/
│   │   │   ├── QuizPage.jsx
│   │   │   └── QuizSummary.jsx
│   │   │
│   │   ├── Tasks/
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskSubmit.jsx
│   │   │
│   │   ├── Rewards/
│   │   │   ├── Badges.jsx
│   │   │   └── Points.jsx
│   │   │
│   │   ├── Leaderboard/
│   │   │   └── Leaderboard.jsx
│   │   │
│   │   ├── Teacher/
│   │   │   └── AnalyticsDashboard.jsx
│   │   │
│   │   └── NotFound.jsx
│   │
│   ├── data/
│   │   ├── lessons.json
│   │   ├── quizzes.json
│   │   ├── tasks.json
│   │   └── leaderboard.json
│   │
│   ├── hooks/
│   │   └── useLocalStorage.jsx
│   │
│   ├── context/
│   │   └── UserContext.jsx
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── router.jsx
│
└── package.json

---

# ✅ Future Backend Integration
You can later connect:
- Auth APIs  
- Lesson APIs  
- Quiz APIs  
- Task APIs  
- Leaderboard APIs  
- Analytics APIs  

---

