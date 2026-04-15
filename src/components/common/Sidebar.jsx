import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, points, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', label: 'Admin Panel', icon: '👑' });
  } else if (user?.role === 'teacher') {
    menuItems.push({ path: '/teacher', label: 'Dashboard', icon: '👨‍🏫' });
    menuItems.push({ path: '/analytics', label: 'Analytics', icon: '📈' });
  } else {
    menuItems.push({ path: '/lessons', label: 'Lessons', icon: '📚' });
    menuItems.push({ path: '/tasks', label: 'Tasks', icon: '✅' });
    menuItems.push({ path: '/games', label: 'Eco Games', icon: '🎮' });
    menuItems.push({ path: '/badges', label: 'My Badges', icon: '🏆' });
  }

  menuItems.push({ path: '/leaderboard', label: 'Leaderboard', icon: '📊' });
  menuItems.push({ path: '/profile', label: 'My Profile', icon: '👤' });

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Toggle Button - Z-index must be higher than Navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 right-4 z-[110] p-2 rounded-xl bg-primary-600 text-white shadow-lg transition-transform active:scale-90"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-[50] backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Layout Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0"></div>

      {/* Sidebar Content */}
      <aside
        className={`fixed left-0 z-[60] w-64 h-screen p-4 transform transition-transform duration-300 ease-in-out flex flex-col bg-white border-r border-primary-100 ${
          // Fixed: On Desktop (lg) it starts at top-16 (Navbar height)
          isOpen 
            ? 'translate-x-0 pt-20 top-0 shadow-2xl' 
            : '-translate-x-full lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-64px)]'
        }`}
      >
        {/* User Profile Summary */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl p-4 shadow-sm border border-primary-100">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{user?.avatar || '👤'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{user?.name}</p>
                <p className="text-[10px] uppercase font-black text-primary-600 tracking-tighter">{user?.role}</p>
              </div>
            </div>
            {user?.role === 'student' && (
              <div className="mt-3 pt-3 border-t border-primary-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Points</span>
                <span className="font-fredoka text-primary-700 text-lg">{points} ⭐</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout - Mobile only */}
        <div className="lg:hidden mt-auto pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold text-sm transition-all"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;