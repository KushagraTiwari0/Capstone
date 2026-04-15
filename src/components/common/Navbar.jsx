import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Navbar = () => {
  const { user, logout, points } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-3xl animate-bounce-slow group-hover:animate-spin-slow transition-transform">🌿</span>
              <span className="text-xl font-bold nature-gradient-text">GEEP Platform</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-primary-50">
                Login
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 px-3 sm:px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isStudent = user.role === 'student';
  const isTeacher = user.role === 'teacher';
  const isAdmin   = user.role === 'admin';

  const navLink = (to, label, onClick) => (
    <Link
      to={to}
      onClick={onClick}
      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-primary-50 hover:scale-105 relative group"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
    </Link>
  );

  const mobileLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-md border-b border-primary-200 fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">

          {/* Logo — students go to /lessons, teachers to /teacher, admin to /admin */}
          <Link
            to={isAdmin ? '/admin' : isTeacher ? '/teacher' : '/lessons'}
            className="flex items-center space-x-2 group"
          >
            <span className="text-3xl animate-bounce-slow group-hover:animate-spin-slow transition-transform">🌿</span>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              GEEP Platform
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center space-x-6">

            {/* Points badge — students only */}
            {isStudent && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-yellow-100 px-4 py-2 rounded-full border border-yellow-200 shadow-sm">
                <span className="text-yellow-500 text-xl animate-pulse-slow">⭐</span>
                <span className="font-bold text-gray-800">{points}</span>
                <span className="text-xs text-gray-600 font-medium">pts</span>
              </div>
            )}

            <div className="flex items-center space-x-2">

              {/* ✅ Student-only links */}
              {isStudent && (
                <>
                  {navLink('/lessons', '📚 Lessons')}
                  {navLink('/tasks',   '✅ Tasks')}
                  {navLink('/games',   '🎮 Games')}
                  {navLink('/leaderboard', '📊 Leaderboard')}
                </>
              )}

              {/* ✅ Teacher-only links — NO Lessons, NO Tasks */}
              {isTeacher && (
                <>
                  {navLink('/teacher',     '👨‍🏫 Teacher')}
                  {navLink('/analytics',   '📈 Analytics')}
                  
                  {navLink('/leaderboard', '📊 Leaderboard')}
                </>
              )}

              {/* ✅ Admin-only links */}
              {isAdmin && (
                navLink('/admin', '👑 Admin')
              )}

              {/* Profile — everyone */}
              {navLink('/profile', '👤 Profile')}

              <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-200">
                <span className="text-gray-700 text-sm font-medium">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-red-50 hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* ── Mobile top bar ── */}
          <div className="lg:hidden flex items-center space-x-2">
            {isStudent && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-yellow-500 text-lg sm:text-xl">⭐</span>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">{points}</span>
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown ── */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2 px-4">

              {/* ✅ Student-only */}
              {isStudent && (
                <>
                  {mobileLink('/lessons',     '📚 Lessons')}
                  {mobileLink('/tasks',       '✅ Tasks')}
                  {mobileLink('/games',       '🎮 Eco Games')}
                  {mobileLink('/badges',      '🏆 Badges')}
                  {mobileLink('/leaderboard', '📊 Leaderboard')}
                </>
              )}

              {/* ✅ Teacher-only — NO Lessons, NO Tasks, NO Badges, NO Points */}
              {isTeacher && (
                <>
                  {mobileLink('/teacher',     '👨‍🏫 Teacher')}
                  {mobileLink('/analytics',   '📈 Analytics')}
                  {mobileLink('/leaderboard', '📊 Leaderboard')}
                </>
              )}

              {/* ✅ Admin-only */}
              {isAdmin && mobileLink('/admin', '👑 Admin')}

              {/* Profile — everyone */}
              {mobileLink('/profile', '👤 Profile')}

              <div className="pt-2 border-t border-gray-200">
                <div className="px-3 py-2 text-sm text-gray-600">{user.name}</div>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;