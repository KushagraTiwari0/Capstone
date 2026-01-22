# 📦 Storage Locations in GEEP Platform

This document explains where all data is currently stored in the project.

---

## 🗄️ Storage Overview

The project uses **two main storage mechanisms**:
1. **Browser localStorage** - For user-specific data and session data
2. **JSON files** - For static/mock content data

---

## 💾 Browser localStorage Storage

All user-specific data is stored in the browser's **localStorage**. This data persists across browser sessions but is **specific to each browser/device**.

### Location: Browser DevTools → Application → Local Storage → `http://localhost:5173`

### Storage Keys Used:

#### 1. `geep_user` - Current User Data
```javascript
{
  id: number,
  name: string,
  email: string,
  role: 'student' | 'teacher' | 'admin',
  avatar: string,
  createdAt: string
}
```
**Used in:** `src/context/UserContext.jsx`
**Updated when:** User logs in, registers, or updates profile

---

#### 2. `geep_points` - User Points
```javascript
number // Total points earned
```
**Used in:** `src/context/UserContext.jsx`
**Updated when:** User completes lessons, quizzes, or tasks

---

#### 3. `geep_badges` - Earned Badges
```javascript
[
  {
    id: number,
    name: string,
    description: string,
    icon: string,
    points: number
  }
]
```
**Used in:** `src/context/UserContext.jsx`
**Updated when:** User earns a new badge

---

#### 4. `geep_completed_lessons` - Completed Lesson IDs
```javascript
[1, 2, 3, 5, 8] // Array of lesson IDs
```
**Used in:** `src/context/UserContext.jsx`
**Updated when:** User completes a lesson

---

#### 5. `geep_quiz_scores` - Quiz Scores History
```javascript
{
  "1": {
    score: 8,
    percentage: 80,
    date: "2024-01-15T10:30:00.000Z"
  },
  "2": {
    score: 10,
    percentage: 100,
    date: "2024-01-16T14:20:00.000Z"
  }
}
```
**Used in:** `src/context/UserContext.jsx`
**Updated when:** User completes a quiz

---

#### 6. `geep_completed_tasks` - Completed Task IDs
```javascript
[1, 3, 5] // Array of task IDs
```
**Used in:** `src/context/UserContext.jsx`
**Updated when:** User submits a task

---

#### 7. `geep_users` - User Database (Mock Backend)
```javascript
[
  {
    id: number,
    name: string,
    email: string,
    password: string, // ⚠️ Plain text - NOT secure!
    role: string,
    avatar: string,
    createdAt: string
  }
]
```
**Used in:** `src/services/authService.js`
**Updated when:** User registers or profile is updated
**Note:** This simulates a backend database. In production, this should be in a real database.

---

## 📁 JSON File Storage (Static Data)

Static content data is stored in JSON files in the `src/data/` directory. These files are **bundled with the application** and loaded at runtime.

### Location: `src/data/`

#### 1. `lessons.json` - Learning Content
```json
[
  {
    "id": 1,
    "title": "Introduction to Waste Management",
    "description": "...",
    "content": "...",
    "category": "Waste Management",
    "difficulty": "Easy",
    "duration": "15 min",
    "image": "🗑️"
  }
]
```
**Used in:** 
- `src/pages/Learning/LessonList.jsx`
- `src/pages/Learning/LessonDetail.jsx`
- `src/pages/Teacher/AnalyticsDashboard.jsx`

---

#### 2. `quizzes.json` - Quiz Questions
```json
[
  {
    "id": 1,
    "title": "Waste Management Quiz",
    "description": "...",
    "lessonId": 1,
    "difficulty": "Easy",
    "questions": [
      {
        "id": 1,
        "question": "What is recycling?",
        "options": ["...", "...", "...", "..."],
        "correctAnswer": 0
      }
    ]
  }
]
```
**Used in:**
- `src/pages/Quiz/QuizPage.jsx`
- `src/pages/Quiz/QuizSummary.jsx`
- `src/pages/Teacher/AnalyticsDashboard.jsx`

---

#### 3. `tasks.json` - Eco Tasks
```json
[
  {
    "id": 1,
    "title": "Plant a Tree",
    "description": "...",
    "category": "Conservation",
    "difficulty": "Medium",
    "points": 100,
    "icon": "🌳"
  }
]
```
**Used in:**
- `src/pages/Tasks/TaskList.jsx`
- `src/pages/Tasks/TaskSubmit.jsx`
- `src/pages/Teacher/TeacherDashboard.jsx`

---

#### 4. `leaderboard.json` - Leaderboard Data
```json
[
  {
    "id": 1,
    "name": "Eco Warrior",
    "avatar": "🌿",
    "points": 2500,
    "badges": 8,
    "rank": 1,
    "level": "Expert"
  }
]
```
**Used in:**
- `src/pages/Leaderboard/Leaderboard.jsx`
- `src/pages/Teacher/AnalyticsDashboard.jsx`

---

## 🔍 How to View Stored Data

### View localStorage Data:

1. **Open Browser DevTools** (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Local Storage**
4. Click on your domain (`http://localhost:5173`)
5. You'll see all the `geep_*` keys

### View JSON Files:

1. Navigate to `src/data/` folder in your project
2. Open any `.json` file
3. These are plain text files you can edit directly

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTIONS                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              React Components                           │
│  (Login, Register, Lessons, Quizzes, Tasks, etc.)       │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  UserContext     │          │  JSON Files      │
│  (localStorage)  │          │  (Static Data)   │
└──────────────────┘          └──────────────────┘
        │                               │
        ▼                               ▼
┌─────────────────────────────────────────────────────────┐
│              Browser localStorage                       │
│  • geep_user                                            │
│  • geep_points                                          │
│  • geep_badges                                          │
│  • geep_completed_lessons                               │
│  • geep_quiz_scores                                     │
│  • geep_completed_tasks                                 │
│  • geep_users (mock backend)                           │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Important Notes

### localStorage Limitations:

1. **Browser-Specific**: Data is stored per browser/device
   - If user switches browsers, data is lost
   - If user clears browser data, everything is lost

2. **Storage Limit**: ~5-10MB per domain
   - Current usage is minimal (~few KB)

3. **Security**: 
   - ⚠️ Passwords stored in plain text (NOT secure!)
   - ⚠️ No encryption
   - ⚠️ Accessible via JavaScript

4. **No Server Sync**: 
   - Data doesn't sync across devices
   - No backup
   - No data recovery

### JSON Files Limitations:

1. **Static**: Cannot be updated by users
2. **Bundled**: Included in build, increases bundle size
3. **No Dynamic Content**: Same for all users

---

## 🔄 What Happens on Logout?

When user logs out (`src/context/UserContext.jsx`):
```javascript
const logout = () => {
  setUser(null);           // Clears geep_user
  setPoints(0);            // Resets geep_points
  setBadges([]);           // Clears geep_badges
  setCompletedLessons([]); // Clears geep_completed_lessons
  setQuizScores({});       // Clears geep_quiz_scores
  setCompletedTasks([]);   // Clears geep_completed_tasks
};
```

**Note:** `geep_users` (mock backend) is NOT cleared on logout.

---

## 🗑️ How to Clear All Data

### Option 1: Clear via Browser DevTools
1. Open DevTools (F12)
2. Application → Local Storage → Your domain
3. Right-click → Clear

### Option 2: Clear via Code
```javascript
// Clear all GEEP data
localStorage.removeItem('geep_user');
localStorage.removeItem('geep_points');
localStorage.removeItem('geep_badges');
localStorage.removeItem('geep_completed_lessons');
localStorage.removeItem('geep_quiz_scores');
localStorage.removeItem('geep_completed_tasks');
localStorage.removeItem('geep_users');
```

### Option 3: Clear All Browser Data
- Chrome: Settings → Privacy → Clear browsing data
- Firefox: Settings → Privacy → Clear Data

---

## 📍 File Locations Summary

### localStorage Keys (Browser Storage):
- `geep_user` → Current logged-in user
- `geep_points` → User's total points
- `geep_badges` → User's earned badges
- `geep_completed_lessons` → Completed lesson IDs
- `geep_quiz_scores` → Quiz attempt history
- `geep_completed_tasks` → Completed task IDs
- `geep_users` → Mock user database

### JSON Files (Project Files):
- `src/data/lessons.json` → All lessons content
- `src/data/quizzes.json` → All quiz questions
- `src/data/tasks.json` → All eco tasks
- `src/data/leaderboard.json` → Leaderboard mock data

### Code Files Managing Storage:
- `src/context/UserContext.jsx` → Manages user state & localStorage
- `src/hooks/useLocalStorage.jsx` → localStorage hook
- `src/services/authService.js` → Manages user database (mock backend)

---

## 🚀 Migration to Real Backend

When migrating to a real backend:

1. **Replace localStorage with API calls**
   - User data → Backend API
   - Points/Badges → Backend API
   - Progress → Backend API

2. **Move JSON files to database**
   - Lessons → Database table
   - Quizzes → Database table
   - Tasks → Database table
   - Leaderboard → Calculated from database

3. **Remove localStorage dependencies**
   - Keep only for temporary/cache data
   - Use sessionStorage for session-only data

---

## 📝 Example: Viewing Your Data

### In Browser Console:
```javascript
// View current user
console.log(JSON.parse(localStorage.getItem('geep_user')));

// View all points
console.log(localStorage.getItem('geep_points'));

// View all badges
console.log(JSON.parse(localStorage.getItem('geep_badges')));

// View all users (mock backend)
console.log(JSON.parse(localStorage.getItem('geep_users')));
```

---

This document provides a complete overview of where all data is stored in the GEEP Platform project.
