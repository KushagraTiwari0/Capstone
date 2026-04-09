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
    "/lessons", "/tasks", "/badges", "/points", "/leaderboard",
    "/analytics", "/quiz", "/profile", "/teacher", "/admin", "/games",
  ];
  const isProtectedRoute = protectedRoutes.some(r => pathname.startsWith(r));
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  // ✅ Landing page is "/" — public, no navbar
  const isLandingPage = pathname === "/";

  // Not logged in + trying protected route → login
  if (!user && isProtectedRoute) return <Navigate to="/login" replace />;

  // Pending/rejected user trying protected route → login
  const userStatus = user?.status || "approved";
  if (user && isProtectedRoute && userStatus !== "approved") {
    return <Navigate to="/login" replace />;
  }

  // Logged in + approved + trying auth route → redirect to their home
  if (user && isAuthRoute && userStatus === "approved") {
    if (user.role === "admin")   return <Navigate to="/admin"   replace />;
    if (user.role === "teacher") return <Navigate to="/teacher" replace />;
    return <Navigate to="/lessons" replace />;
  }

  // Logged in + approved + on landing page → redirect to their home
  if (user && isLandingPage && userStatus === "approved") {
    if (user.role === "admin")   return <Navigate to="/admin"   replace />;
    if (user.role === "teacher") return <Navigate to="/teacher" replace />;
    return <Navigate to="/lessons" replace />;
  }

  // Role-based guards
  if ((pathname === "/analytics" || pathname === "/teacher") &&
    user?.role !== "teacher" && user?.role !== "admin") {
    return <Navigate to="/lessons" replace />;
  }
  if (pathname === "/admin" && user?.role !== "admin") {
    return <Navigate to="/lessons" replace />;
  }
  if (pathname.startsWith("/tasks") && user?.role === "teacher") {
    return <Navigate to="/teacher" replace />;
  }
  if (pathname.startsWith("/games") && user?.role !== "student") {
    if (user?.role === "teacher") return <Navigate to="/teacher" replace />;
    if (user?.role === "admin")   return <Navigate to="/admin"   replace />;
    return <Navigate to="/lessons" replace />;
  }

  // ✅ Landing page and auth pages — no Navbar
  if (isLandingPage || isAuthRoute) {
    return <Outlet />;
  }

  // Logged-in pages — with Navbar
  if (user) {
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

const App = () => (
  <UserProvider>
    <AppContent />
  </UserProvider>
);

export default App;