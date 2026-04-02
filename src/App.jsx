import { Outlet, Navigate, useLocation } from "react-router-dom";
import StudentGameTheme from "./components/common/StudentGameTheme";
import useStudentTheme from "./hooks/useStudentTheme";

import { UserProvider, useUser } from "./context/UserContext";
import Navbar from "./components/common/Navbar";

const AppContent = () => {
  const { user } = useUser();
  const location = useLocation();
  const pathname = location.pathname;
  useStudentTheme();

  const protectedRoutes = [
    "/lessons",
    "/tasks",
    "/badges",
    "/points",
    "/leaderboard",
    "/analytics",
    "/quiz",
    "/profile",
    "/teacher",
    "/admin",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (!user && isProtectedRoute) {
    return <Navigate to="/login" replace />;
  }

  const userStatus = user?.status || "approved";
  if (user && isProtectedRoute && userStatus !== "approved") {
    return <Navigate to="/login" replace />;
  }

  if (user && isAuthRoute) {
    const userStatus = user?.status || "approved";
    if (userStatus === "approved") {
      if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
      } else if (user.role === "teacher") {
        return <Navigate to="/teacher" replace />;
      } else {
        return <Navigate to="/lessons" replace />;
      }
    }
  }

  if (
    (pathname === "/analytics" || pathname === "/teacher") &&
    user?.role !== "teacher" &&
    user?.role !== "admin"
  ) {
    return <Navigate to="/lessons" replace />;
  }

  if (pathname === "/admin" && user?.role !== "admin") {
    return <Navigate to="/lessons" replace />;
  }

  if (pathname.startsWith("/tasks") && user?.role === "teacher") {
    return <Navigate to="/teacher" replace />;
  }

  if (user && !isAuthRoute) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <StudentGameTheme />
        <Navbar />
        <main className="flex-1 overflow-x-hidden relative flex flex-col pt-14 sm:pt-16">
          <Outlet />
        </main>
      </div>
    );
  }

  return <Outlet />;
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;