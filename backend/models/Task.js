import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Navbar = () => {
  const { user, logout, points } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-primary-100 fixed top-0 left-0 right-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-3xl animate-bounce-slow">🌿</span>
              <span className="text-xl font-bold nature-gradient-text">GEEP Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all">
                Login
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md transition-all transform hover:scale-105">
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

  const navLink = (to, label) => (
    <Link
      to={to}
      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-primary-50 relative group"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
    </Link>
  );

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-md border-b border-primary-200 fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          
          {/* Logo Section - Always visible now */}
          <Link
            to={isAdmin ? '/admin' : isTeacher ? '/teacher' : '/lessons'}
            className="flex items-center space-x-2 group"
          >
            <span className="text-2xl sm:text-3xl animate-bounce-slow">🌿</span>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              GEEP Platform
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-4">
            {isStudent && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-yellow-100 px-4 py-1.5 rounded-full border border-yellow-200 shadow-sm mr-2">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="font-bold text-gray-800">{points}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">pts</span>
              </div>
            )}
            
            {isStudent && (
              <>
                {navLink('/lessons', '📚 Lessons')}
                {navLink('/tasks',   '✅ Tasks')}
                {navLink('/games',   '🎮 Games')}
                {navLink('/leaderboard', '📊 Leaderboard')}
              </>
            )}
            {isTeacher && (
              <>
                {navLink('/teacher', '👨‍🏫 Dashboard')}
                {navLink('/analytics', '📈 Analytics')}
                {navLink('/leaderboard', '📊 Leaderboard')}
              </>
            )}
            {isAdmin && navLink('/admin', '👑 Admin')}
            {navLink('/profile', '👤 Profile')}

            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-bold transition-all ml-2"
            >
              Logout
            </button>
          </div>

          {/* Mobile Right-Side */}
          <div className="lg:hidden flex items-center">
            {isStudent && (
              <div className="flex items-center space-x-1 mr-12 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <span className="text-yellow-500">⭐</span>
                <span className="font-bold text-gray-700 text-sm">{points}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;