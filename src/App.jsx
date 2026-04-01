import { Outlet, Navigate, useLocation } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";
import Navbar from "./components/common/Navbar";

const AppContent = () => {
  const { user } = useUser();
  const location = useLocation();
  const pathname = location.pathname;

  // Protected routes
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

  // Redirect to login if not authenticated and trying to access protected routes
  if (!user && isProtectedRoute) {
    return <Navigate to="/login" replace />;
  }

  // Block pending or rejected users from accessing protected routes
  // Legacy users (without status) are treated as approved
  const userStatus = user?.status || 'approved';
  if (user && isProtectedRoute && userStatus !== 'approved') {
    // Redirect to login with appropriate message
    return <Navigate to="/login" replace />;
  }

  // Redirect to lessons if authenticated and on login/register
  if (user && isAuthRoute) {
    // Only redirect if user is approved (legacy users without status are treated as approved)
    const userStatus = user?.status || 'approved';
    if (userStatus === 'approved') {
      if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (user.role === 'teacher') {
        return <Navigate to="/teacher" replace />;
      } else {
        return <Navigate to="/lessons" replace />;
      }
    }
  }

  // Check teacher routes
  if ((pathname === "/analytics" || pathname === "/teacher") && user?.role !== "teacher" && user?.role !== "admin") {
    return <Navigate to="/lessons" replace />;
  }

  // Check admin routes
  if (pathname === "/admin" && user?.role !== "admin") {
    return <Navigate to="/lessons" replace />;
  }

  // Block teachers from accessing /tasks
  if (pathname.startsWith("/tasks") && user?.role === "teacher") {
    return <Navigate to="/teacher" replace />;
  }

  // Show navbar only if authenticated and not on auth pages
  if (user && !isAuthRoute) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 overflow-x-hidden relative flex flex-col pt-14 sm:pt-16">
          <Outlet />
        </main>
      </div>
    );
  }

  // For auth pages or root, just render outlet
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
