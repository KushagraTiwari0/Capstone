import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useUser } from "./context/UserContext"; // Adjust path if necessary

// --- Page Imports ---
import App from "./App";
import LandingPage from "./pages/Landing/Landingpage ";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import LessonList from "./pages/Learning/LessonList";
import LessonDetail from "./pages/Learning/LessonDetail";
import QuizPage from "./pages/Quiz/QuizPage";
import QuizSummary from "./pages/Quiz/QuizSummary";
import TaskList from "./pages/Tasks/TaskList";
import TaskSubmit from "./pages/Tasks/TaskSubmit";
import Badges from "./pages/Rewards/Badges";
import Points from "./pages/Rewards/Points";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import AnalyticsDashboard from "./pages/Teacher/AnalyticsDashboard";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CreateLesson from "./pages/Admin/CreateLesson";
import EditLesson from "./pages/Admin/EditLesson";
import Profile from "./pages/User/Profile";
import GamesPage from "./pages/Games/GamesPage";
import NotFound from "./pages/NotFound";

// --- Route Guards (Security) ---

// 1. Blocks users who are NOT logged in
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useUser();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  // Not logged in? Send to login.
  if (!user) return <Navigate to="/login" replace />;
  
  // Logged in but wrong role? Send to home.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// 2. Blocks users who ARE logged in (prevents accessing Login/Register if already authenticated)
const PublicOnlyRoute = () => {
  const { user, loading } = useUser();
  if (loading) return null;
  return user ? <Navigate to="/lessons" replace /> : <Outlet />;
};

// --- Router Configuration ---

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        // 🟢 Public Routes (Anyone can see)
        { index: true, element: <LandingPage /> },
        
        // 🟠 Auth Routes (Only for logged-OUT users)
        {
          element: <PublicOnlyRoute />,
          children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
          ]
        },

        // 🔵 Protected Routes (Requires ANY logged-in user)
        {
          element: <ProtectedRoute />,
          children: [
            { path: "lessons", element: <LessonList /> },
            { path: "lessons/:id", element: <LessonDetail /> },
            { path: "quiz/:id", element: <QuizPage /> },
            { path: "quiz/:id/summary", element: <QuizSummary /> },
            { path: "tasks", element: <TaskList /> },
            { path: "tasks/:id/submit", element: <TaskSubmit /> },
            { path: "badges", element: <Badges /> },
            { path: "points", element: <Points /> },
            { path: "leaderboard", element: <Leaderboard /> },
            { path: "games", element: <GamesPage /> },
            { path: "profile", element: <Profile /> },
          ]
        },

        // 🟣 Teacher Routes (Requires 'teacher' or 'admin' role)
        {
          element: <ProtectedRoute allowedRoles={['teacher', 'admin']} />,
          children: [
            { path: "analytics", element: <AnalyticsDashboard /> },
            { path: "teacher", element: <TeacherDashboard /> },
          ]
        },

        // 🔴 Admin Routes (Requires 'admin' role)
        {
          element: <ProtectedRoute allowedRoles={['admin']} />,
          children: [
            { path: "admin", element: <AdminDashboard /> },
            { path: "admin/lessons/create", element: <CreateLesson /> },
            { path: "admin/lessons/edit/:id", element: <EditLesson /> },
          ]
        },

        // ⬛ 404 Catch-All
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  { 
    future: { 
      v7_startTransition: true,
      v7_relativeSplatPath: true, // Recommended to suppress v7 console warnings
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    } 
  }
);