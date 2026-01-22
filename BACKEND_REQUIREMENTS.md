# 🔧 Backend Requirements for GEEP Platform

This document outlines all the backend APIs and services needed to replace the current mock/localStorage implementation.

---

## 📋 Current State

**What's Currently Using Mock Data:**
- ✅ Authentication (localStorage mock - `authService.js`)
- ❌ Lessons (JSON files - `src/data/lessons.json`)
- ❌ Quizzes (JSON files - `src/data/quizzes.json`)
- ❌ Tasks (JSON files - `src/data/tasks.json`)
- ❌ Leaderboard (JSON files - `src/data/leaderboard.json`)
- ❌ User progress (localStorage)
- ❌ Points & Badges (localStorage)
- ❌ Analytics (mock calculations)

---

## 🔐 1. Authentication APIs

### Base URL: `/api/auth`

#### 1.1 User Registration
```
POST /api/auth/register
Body: {
  name: string,
  email: string,
  password: string,
  role?: 'student' | 'teacher' | 'admin'
}
Response: {
  success: boolean,
  user: UserObject,
  token: string,
  message: string
}
```

#### 1.2 User Login
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  success: boolean,
  user: UserObject,
  token: string,
  message: string
}
```

#### 1.3 Check Email Exists
```
GET /api/auth/check-email?email=user@example.com
Response: {
  exists: boolean
}
```

#### 1.4 Logout
```
POST /api/auth/logout
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  message: string
}
```

#### 1.5 Refresh Token
```
POST /api/auth/refresh-token
Body: {
  refreshToken: string
}
Response: {
  success: boolean,
  token: string,
  refreshToken: string
}
```

#### 1.6 Password Reset Request
```
POST /api/auth/password-reset-request
Body: {
  email: string
}
Response: {
  success: boolean,
  message: string
}
```

#### 1.7 Password Reset Confirm
```
POST /api/auth/password-reset-confirm
Body: {
  token: string,
  newPassword: string
}
Response: {
  success: boolean,
  message: string
}
```

---

## 👤 2. User Management APIs

### Base URL: `/api/users`

#### 2.1 Get Current User Profile
```
GET /api/users/me
Headers: { Authorization: 'Bearer <token>' }
Response: {
  id: number,
  name: string,
  email: string,
  role: string,
  avatar: string,
  createdAt: string,
  updatedAt: string
}
```

#### 2.2 Update User Profile
```
PUT /api/users/me
Headers: { Authorization: 'Bearer <token>' }
Body: {
  name?: string,
  avatar?: string
}
Response: {
  success: boolean,
  user: UserObject,
  message: string
}
```

#### 2.3 Change Password
```
PUT /api/users/me/password
Headers: { Authorization: 'Bearer <token>' }
Body: {
  currentPassword: string,
  newPassword: string
}
Response: {
  success: boolean,
  message: string
}
```

#### 2.4 Get User Progress
```
GET /api/users/me/progress
Headers: { Authorization: 'Bearer <token>' }
Response: {
  points: number,
  badges: Badge[],
  completedLessons: number[],
  completedTasks: number[],
  quizScores: { [quizId: string]: QuizScore }
}
```

#### 2.5 Get All Users (Admin Only)
```
GET /api/users
Headers: { Authorization: 'Bearer <admin_token>' }
Query: {
  role?: 'student' | 'teacher' | 'admin',
  page?: number,
  limit?: number,
  search?: string
}
Response: {
  users: UserObject[],
  total: number,
  page: number,
  limit: number
}
```

#### 2.6 Create User (Admin Only)
```
POST /api/users
Headers: { Authorization: 'Bearer <admin_token>' }
Body: {
  name: string,
  email: string,
  password: string,
  role: 'student' | 'teacher' | 'admin'
}
Response: {
  success: boolean,
  user: UserObject,
  message: string
}
```

#### 2.7 Update User (Admin Only)
```
PUT /api/users/:id
Headers: { Authorization: 'Bearer <admin_token>' }
Body: {
  name?: string,
  email?: string,
  role?: string,
  avatar?: string
}
Response: {
  success: boolean,
  user: UserObject,
  message: string
}
```

#### 2.8 Delete User (Admin Only)
```
DELETE /api/users/:id
Headers: { Authorization: 'Bearer <admin_token>' }
Response: {
  success: boolean,
  message: string
}
```

---

## 📚 3. Lessons APIs

### Base URL: `/api/lessons`

#### 3.1 Get All Lessons
```
GET /api/lessons
Query: {
  category?: string,
  difficulty?: 'easy' | 'medium' | 'hard',
  page?: number,
  limit?: number
}
Response: {
  lessons: Lesson[],
  total: number,
  page: number,
  limit: number
}
```

#### 3.2 Get Lesson by ID
```
GET /api/lessons/:id
Response: {
  id: number,
  title: string,
  description: string,
  content: string,
  category: string,
  difficulty: string,
  duration: string,
  image: string,
  createdAt: string,
  updatedAt: string
}
```

#### 3.3 Create Lesson (Teacher/Admin Only)
```
POST /api/lessons
Headers: { Authorization: 'Bearer <token>' }
Body: {
  title: string,
  description: string,
  content: string,
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  duration: string,
  image: string
}
Response: {
  success: boolean,
  lesson: Lesson,
  message: string
}
```

#### 3.4 Update Lesson (Teacher/Admin Only)
```
PUT /api/lessons/:id
Headers: { Authorization: 'Bearer <token>' }
Body: {
  title?: string,
  description?: string,
  content?: string,
  category?: string,
  difficulty?: string,
  duration?: string,
  image?: string
}
Response: {
  success: boolean,
  lesson: Lesson,
  message: string
}
```

#### 3.5 Delete Lesson (Admin Only)
```
DELETE /api/lessons/:id
Headers: { Authorization: 'Bearer <admin_token>' }
Response: {
  success: boolean,
  message: string
}
```

#### 3.6 Mark Lesson as Complete
```
POST /api/lessons/:id/complete
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  pointsAwarded: number,
  badgeEarned?: Badge,
  message: string
}
```

---

## 📝 4. Quizzes APIs

### Base URL: `/api/quizzes`

#### 4.1 Get All Quizzes
```
GET /api/quizzes
Query: {
  lessonId?: number,
  difficulty?: string,
  page?: number,
  limit?: number
}
Response: {
  quizzes: Quiz[],
  total: number
}
```

#### 4.2 Get Quiz by ID
```
GET /api/quizzes/:id
Response: {
  id: number,
  title: string,
  description: string,
  lessonId: number,
  difficulty: string,
  questions: Question[],
  createdAt: string
}
```

#### 4.3 Create Quiz (Teacher/Admin Only)
```
POST /api/quizzes
Headers: { Authorization: 'Bearer <token>' }
Body: {
  title: string,
  description: string,
  lessonId: number,
  difficulty: string,
  questions: Question[]
}
Response: {
  success: boolean,
  quiz: Quiz,
  message: string
}
```

#### 4.4 Update Quiz (Teacher/Admin Only)
```
PUT /api/quizzes/:id
Headers: { Authorization: 'Bearer <token>' }
Body: {
  title?: string,
  description?: string,
  questions?: Question[]
}
Response: {
  success: boolean,
  quiz: Quiz,
  message: string
}
```

#### 4.5 Delete Quiz (Admin Only)
```
DELETE /api/quizzes/:id
Headers: { Authorization: 'Bearer <admin_token>' }
Response: {
  success: boolean,
  message: string
}
```

#### 4.6 Submit Quiz Answers
```
POST /api/quizzes/:id/submit
Headers: { Authorization: 'Bearer <token>' }
Body: {
  answers: { questionId: number, answerIndex: number }[]
}
Response: {
  success: boolean,
  score: number,
  total: number,
  percentage: number,
  pointsAwarded: number,
  badgeEarned?: Badge,
  correctAnswers: number[],
  userAnswers: number[]
}
```

#### 4.7 Get User Quiz Scores
```
GET /api/quizzes/scores
Headers: { Authorization: 'Bearer <token>' }
Response: {
  scores: {
    [quizId: string]: {
      score: number,
      percentage: number,
      date: string
    }
  }
}
```

---

## ✅ 5. Tasks APIs

### Base URL: `/api/tasks`

#### 5.1 Get All Tasks
```
GET /api/tasks
Query: {
  category?: string,
  difficulty?: string,
  status?: 'pending' | 'submitted' | 'verified' | 'rejected',
  page?: number,
  limit?: number
}
Response: {
  tasks: Task[],
  total: number
}
```

#### 5.2 Get Task by ID
```
GET /api/tasks/:id
Response: {
  id: number,
  title: string,
  description: string,
  category: string,
  difficulty: string,
  points: number,
  icon: string,
  createdAt: string
}
```

#### 5.3 Create Task (Teacher/Admin Only)
```
POST /api/tasks
Headers: { Authorization: 'Bearer <token>' }
Body: {
  title: string,
  description: string,
  category: string,
  difficulty: string,
  points: number,
  icon: string
}
Response: {
  success: boolean,
  task: Task,
  message: string
}
```

#### 5.4 Update Task (Teacher/Admin Only)
```
PUT /api/tasks/:id
Headers: { Authorization: 'Bearer <token>' }
Body: {
  title?: string,
  description?: string,
  points?: number
}
Response: {
  success: boolean,
  task: Task,
  message: string
}
```

#### 5.5 Delete Task (Admin Only)
```
DELETE /api/tasks/:id
Headers: { Authorization: 'Bearer <admin_token>' }
Response: {
  success: boolean,
  message: string
}
```

#### 5.6 Submit Task
```
POST /api/tasks/:id/submit
Headers: { Authorization: 'Bearer <token>' }
Body: {
  image: File (multipart/form-data),
  location: string,
  reflection: string
}
Response: {
  success: boolean,
  submission: TaskSubmission,
  message: string
}
```

#### 5.7 Get User Task Submissions
```
GET /api/tasks/submissions
Headers: { Authorization: 'Bearer <token>' }
Response: {
  submissions: TaskSubmission[]
}
```

#### 5.8 Review Task Submission (Teacher/Admin Only)
```
PUT /api/tasks/submissions/:id/review
Headers: { Authorization: 'Bearer <token>' }
Body: {
  status: 'verified' | 'rejected',
  feedback?: string
}
Response: {
  success: boolean,
  submission: TaskSubmission,
  pointsAwarded?: number,
  message: string
}
```

#### 5.9 Get Pending Task Reviews (Teacher/Admin Only)
```
GET /api/tasks/reviews/pending
Headers: { Authorization: 'Bearer <token>' }
Response: {
  submissions: TaskSubmission[],
  total: number
}
```

---

## 🏆 6. Points & Badges APIs

### Base URL: `/api/rewards`

#### 6.1 Get User Points
```
GET /api/rewards/points
Headers: { Authorization: 'Bearer <token>' }
Response: {
  points: number,
  level: string,
  nextLevelPoints: number,
  progress: number
}
```

#### 6.2 Get User Badges
```
GET /api/rewards/badges
Headers: { Authorization: 'Bearer <token>' }
Response: {
  earned: Badge[],
  available: Badge[],
  totalEarned: number,
  totalAvailable: number
}
```

#### 6.3 Get All Available Badges
```
GET /api/rewards/badges/all
Response: {
  badges: Badge[]
}
```

#### 6.4 Award Points
```
POST /api/rewards/points
Headers: { Authorization: 'Bearer <token>' }
Body: {
  amount: number,
  reason: string,
  source: 'lesson' | 'quiz' | 'task' | 'admin'
}
Response: {
  success: boolean,
  newTotal: number,
  levelUp?: boolean,
  newLevel?: string,
  message: string
}
```

#### 6.5 Award Badge
```
POST /api/rewards/badges
Headers: { Authorization: 'Bearer <token>' }
Body: {
  badgeId: number
}
Response: {
  success: boolean,
  badge: Badge,
  message: string
}
```

---

## 📊 7. Leaderboard APIs

### Base URL: `/api/leaderboard`

#### 7.1 Get Leaderboard
```
GET /api/leaderboard
Query: {
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  page?: number,
  limit?: number
}
Response: {
  users: LeaderboardUser[],
  currentUserRank: number,
  total: number,
  page: number
}
```

#### 7.2 Get Top Users
```
GET /api/leaderboard/top
Query: {
  limit?: number (default: 10)
}
Response: {
  users: LeaderboardUser[]
}
```

#### 7.3 Get User Rank
```
GET /api/leaderboard/rank
Headers: { Authorization: 'Bearer <token>' }
Response: {
  rank: number,
  points: number,
  level: string,
  percentile: number
}
```

---

## 📈 8. Analytics APIs

### Base URL: `/api/analytics`

#### 8.1 Get Overall Statistics (Teacher/Admin Only)
```
GET /api/analytics/overview
Headers: { Authorization: 'Bearer <token>' }
Response: {
  totalStudents: number,
  activeStudents: number,
  totalLessons: number,
  totalQuizzes: number,
  totalTasks: number,
  averageScore: number,
  completionRate: number
}
```

#### 8.2 Get Learning Progress Analytics (Teacher/Admin Only)
```
GET /api/analytics/learning-progress
Headers: { Authorization: 'Bearer <token>' }
Query: {
  lessonId?: number,
  startDate?: string,
  endDate?: string
}
Response: {
  data: {
    lessonId: number,
    lessonTitle: string,
    completed: number,
    total: number,
    percentage: number
  }[]
}
```

#### 8.3 Get Quiz Accuracy Analytics (Teacher/Admin Only)
```
GET /api/analytics/quiz-accuracy
Headers: { Authorization: 'Bearer <token>' }
Query: {
  quizId?: number,
  startDate?: string,
  endDate?: string
}
Response: {
  data: {
    quizId: number,
    quizTitle: string,
    averageScore: number,
    totalAttempts: number,
    passRate: number
  }[]
}
```

#### 8.4 Get Task Completion Analytics (Teacher/Admin Only)
```
GET /api/analytics/task-completion
Headers: { Authorization: 'Bearer <token>' }
Query: {
  taskId?: number,
  status?: string
}
Response: {
  data: {
    taskId: number,
    taskTitle: string,
    completed: number,
    pending: number,
    verified: number,
    rejected: number
  }[]
}
```

#### 8.5 Get Category Distribution (Teacher/Admin Only)
```
GET /api/analytics/category-distribution
Headers: { Authorization: 'Bearer <token>' }
Response: {
  categories: {
    name: string,
    count: number,
    percentage: number
  }[]
}
```

#### 8.6 Get Top Performers (Teacher/Admin Only)
```
GET /api/analytics/top-performers
Headers: { Authorization: 'Bearer <token>' }
Query: {
  limit?: number (default: 10)
}
Response: {
  users: {
    id: number,
    name: string,
    points: number,
    badges: number,
    rank: number
  }[]
}
```

#### 8.7 Get Student Progress (Teacher/Admin Only)
```
GET /api/analytics/student/:id
Headers: { Authorization: 'Bearer <token>' }
Response: {
  student: UserObject,
  points: number,
  badges: Badge[],
  completedLessons: number,
  completedTasks: number,
  quizScores: QuizScore[],
  progress: {
    lessons: number,
    quizzes: number,
    tasks: number
  }
}
```

---

## 🔔 9. Notifications APIs (Optional)

### Base URL: `/api/notifications`

#### 9.1 Get User Notifications
```
GET /api/notifications
Headers: { Authorization: 'Bearer <token>' }
Query: {
  unreadOnly?: boolean,
  page?: number,
  limit?: number
}
Response: {
  notifications: Notification[],
  unreadCount: number,
  total: number
}
```

#### 9.2 Mark Notification as Read
```
PUT /api/notifications/:id/read
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  message: string
}
```

---

## 🗄️ 10. Database Schema Requirements

### Users Table
```sql
- id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- role (student/teacher/admin)
- avatar
- points (default: 0)
- level (default: 'Beginner')
- createdAt
- updatedAt
```

### Lessons Table
```sql
- id (Primary Key)
- title
- description
- content (Text/HTML)
- category
- difficulty
- duration
- image
- createdBy (Foreign Key -> Users)
- createdAt
- updatedAt
```

### Quizzes Table
```sql
- id (Primary Key)
- title
- description
- lessonId (Foreign Key -> Lessons)
- difficulty
- questions (JSON)
- createdBy (Foreign Key -> Users)
- createdAt
- updatedAt
```

### Tasks Table
```sql
- id (Primary Key)
- title
- description
- category
- difficulty
- points
- icon
- createdBy (Foreign Key -> Users)
- createdAt
- updatedAt
```

### Task Submissions Table
```sql
- id (Primary Key)
- taskId (Foreign Key -> Tasks)
- userId (Foreign Key -> Users)
- image (File URL)
- location
- reflection
- status (pending/submitted/verified/rejected)
- reviewedBy (Foreign Key -> Users)
- feedback
- pointsAwarded
- createdAt
- updatedAt
```

### User Progress Table
```sql
- id (Primary Key)
- userId (Foreign Key -> Users)
- lessonId (Foreign Key -> Lessons, nullable)
- quizId (Foreign Key -> Quizzes, nullable)
- taskId (Foreign Key -> Tasks, nullable)
- completedAt
- pointsEarned
```

### Quiz Scores Table
```sql
- id (Primary Key)
- userId (Foreign Key -> Users)
- quizId (Foreign Key -> Quizzes)
- score
- total
- percentage
- answers (JSON)
- completedAt
```

### Badges Table
```sql
- id (Primary Key)
- name
- description
- icon
- pointsRequired
- criteria (JSON)
```

### User Badges Table (Junction)
```sql
- id (Primary Key)
- userId (Foreign Key -> Users)
- badgeId (Foreign Key -> Badges)
- earnedAt
```

---

## 🔒 11. Security Requirements

### Authentication
- JWT tokens for authentication
- Token expiration (e.g., 24 hours)
- Refresh tokens for long-term sessions
- Password hashing (bcrypt/argon2)

### Authorization
- Role-based access control (RBAC)
- Route protection middleware
- Resource ownership validation

### Data Validation
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- File upload validation (for task images)

### Rate Limiting
- API rate limiting
- Login attempt limiting
- Request throttling

---

## 📡 12. API Configuration

### Base Configuration
```javascript
{
  baseURL: 'https://api.geep-platform.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}
```

### Environment Variables Needed
```
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- API_PORT
- NODE_ENV
- CORS_ORIGIN
- FILE_UPLOAD_PATH
- EMAIL_SERVICE_API_KEY (for password reset)
```

---

## 🚀 13. Implementation Priority

### Phase 1 (Critical - MVP)
1. ✅ Authentication APIs (Login, Register)
2. ✅ User Management APIs (Profile, Update)
3. ✅ Lessons APIs (Get All, Get by ID)
4. ✅ Quizzes APIs (Get All, Get by ID, Submit)
5. ✅ Tasks APIs (Get All, Get by ID, Submit)
6. ✅ Points & Badges APIs (Get, Award)
7. ✅ Leaderboard API (Get)

### Phase 2 (Important)
8. ✅ Analytics APIs (Overview, Learning Progress)
9. ✅ Task Review APIs (For Teachers)
10. ✅ Content Management APIs (Create, Update, Delete)

### Phase 3 (Nice to Have)
11. ✅ Notifications APIs
12. ✅ Password Reset APIs
13. ✅ Advanced Analytics
14. ✅ Search Functionality
15. ✅ File Upload Optimization

---

## 📝 14. API Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🔗 15. Integration Steps

1. **Create API Service Layer**
   - Create `src/services/api.js` for API client
   - Create individual service files for each domain
   - Replace localStorage calls with API calls

2. **Update Components**
   - Replace JSON imports with API calls
   - Add loading states
   - Add error handling
   - Update UserContext to sync with backend

3. **Add Authentication**
   - Store JWT tokens securely
   - Add token refresh logic
   - Handle token expiration

4. **File Upload**
   - Implement image upload for tasks
   - Add progress indicators
   - Handle upload errors

5. **Real-time Updates** (Optional)
   - WebSocket for leaderboard updates
   - Push notifications for badges/points

---

## 📚 16. Recommended Tech Stack

### Backend Framework Options
- **Node.js + Express** (Recommended)
- **Python + Django/FastAPI**
- **Java + Spring Boot**
- **PHP + Laravel**

### Database Options
- **PostgreSQL** (Recommended)
- **MySQL**
- **MongoDB** (if using NoSQL)

### Authentication
- **JWT** (JSON Web Tokens)
- **Passport.js** (for Node.js)

### File Storage
- **AWS S3** (Recommended)
- **Cloudinary**
- **Local Storage** (for development)

---

This document provides a complete overview of all backend APIs needed to replace the current mock implementation.
