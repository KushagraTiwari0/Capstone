import { createBrowserRouter, Navigate } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import App from "./App";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: <Navigate to="/login" replace />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "lessons",
          element: <LessonList />,
        },
        {
          path: "lessons/:id",
          element: <LessonDetail />,
        },
        {
          path: "quiz/:id",
          element: <QuizPage />,
        },
        {
          path: "quiz/:id/summary",
          element: <QuizSummary />,
        },
        {
          path: "tasks",
          element: <TaskList />,
        },
        {
          path: "tasks/:id/submit",
          element: <TaskSubmit />,
        },
        {
          path: "badges",
          element: <Badges />,
        },
        {
          path: "points",
          element: <Points />,
        },
        {
          path: "leaderboard",
          element: <Leaderboard />,
        },
        {
          path: "analytics",
          element: <AnalyticsDashboard />,
        },
        {
          path: "teacher",
          element: <TeacherDashboard />,
        },
        {
          path: "admin",
          element: <AdminDashboard />,
        },
        {
          path: "admin/lessons/create",
          element: <CreateLesson />,
        },
        {
          path: "admin/lessons/edit/:id",
          element: <EditLesson />,
        },
        {
          path: "profile",
          element: <Profile />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);