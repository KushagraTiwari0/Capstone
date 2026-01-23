import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, points } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [];

  // Admin users only see admin dashboard and profile
  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', label: 'Admin Dashboard', icon: '👑' });
    menuItems.push({ path: '/profile', label: 'Profile', icon: '👤' });
  } else {
    // Regular users see all menu items
    menuItems.push(
      { path: '/lessons', label: 'Lessons', icon: '📚' },
      { path: '/tasks', label: 'Tasks', icon: '✅' },
      { path: '/badges', label: 'Badges', icon: '🏆' },
      { path: '/leaderboard', label: 'Leaderboard', icon: '📊' },
      { path: '/profile', label: 'Profile', icon: '👤' }
    );

    if (user?.role === 'teacher') {
      menuItems.push({ path: '/teacher', label: 'Teacher Dashboard', icon: '👨‍🏫' });
      menuItems.push({ path: '/analytics', label: 'Analytics', icon: '📈' });
    }
  }

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-16 sm:top-4 left-4 z-50 p-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-white to-primary-50/30 min-h-screen p-4 transform transition-transform duration-300 ease-in-out border-r border-primary-100 shadow-lg lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-6 animate-slide-down">
          <div className="bg-gradient-to-br from-white to-primary-50 rounded-xl p-4 shadow-md environment-card border border-primary-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <span className="text-3xl animate-bounce-slow">{user?.avatar || '👤'}</span>
                <span className="absolute -top-1 -right-1 text-xs">🌿</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-primary-600 capitalize font-medium">{user?.role}</p>
              </div>
            </div>
            {user?.role !== 'admin' && (
              <div className="mt-3 pt-3 border-t border-primary-200">
                <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-yellow-100 px-3 py-2 rounded-lg border border-yellow-200">
                  <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                    <span className="text-yellow-500 animate-pulse-slow">⭐</span>
                    Points
                  </span>
                  <span className="font-bold text-primary-700 text-lg">{points}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 animate-slide-up environment-card ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-700 hover:bg-white hover:shadow-md border border-transparent hover:border-primary-200'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className={`text-xl ${isActive(item.path) ? 'animate-bounce-slow' : ''}`}>{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
              {isActive(item.path) && (
                <span className="ml-auto text-sm">→</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

