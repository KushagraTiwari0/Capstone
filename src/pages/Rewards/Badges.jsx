import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import Sidebar from "../../components/common/Sidebar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Badges = () => {
  const { points, completedLessons, completedTasks } = useUser();
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newlyEarned, setNewlyEarned] = useState([]);

  useEffect(() => {
    fetchBadges();
    checkBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("geep_token");
      const res = await fetch(`${API_BASE}/badges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBadges(data.data.badges);
        setStats(data.data.stats);
      } else {
        setError(data.error?.message || "Failed to load badges");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Trigger server-side badge check, then refresh
  const checkBadges = async () => {
    try {
      const token = localStorage.getItem("geep_token");
      const res = await fetch(`${API_BASE}/badges/check`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.newlyAwarded?.length > 0) {
        setNewlyEarned(data.data.newlyAwarded);
        fetchBadges(); // refresh with newly earned
      }
    } catch (err) {
      // Silent fail — badge check is non-critical
    }
  };

  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);
  const progress = badges.length > 0
    ? Math.round((earned.length / badges.length) * 100)
    : 0;

  // Progress toward a badge's criteria (0–100)
  const getCriteriaProgress = (badge) => {
    const { pointsRequired = 0, lessonsRequired = 0, tasksRequired = 0 } = badge.criteria || {};
    const parts = [];
    if (pointsRequired > 0)  parts.push(Math.min(100, Math.round(((stats?.points || 0) / pointsRequired) * 100)));
    if (lessonsRequired > 0) parts.push(Math.min(100, Math.round(((stats?.completedLessons || 0) / lessonsRequired) * 100)));
    if (tasksRequired > 0)   parts.push(Math.min(100, Math.round(((stats?.completedTasks || 0) / tasksRequired) * 100)));
    if (parts.length === 0) return 100;
    return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  };

  const getCriteriaText = (badge) => {
    const { pointsRequired = 0, lessonsRequired = 0, tasksRequired = 0 } = badge.criteria || {};
    const parts = [];
    if (pointsRequired > 0)  parts.push(`${stats?.points || 0}/${pointsRequired} pts`);
    if (lessonsRequired > 0) parts.push(`${stats?.completedLessons || 0}/${lessonsRequired} lessons`);
    if (tasksRequired > 0)   parts.push(`${stats?.completedTasks || 0}/${tasksRequired} tasks`);
    return parts.join(" · ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Eco Badges
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Earn badges by accumulating points, completing lessons and tasks
              </p>
            </div>

            {/* Newly earned toast */}
            {newlyEarned.length > 0 && (
              <div className="mb-6 bg-green-50 border border-green-300 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                <span className="text-3xl">🎉</span>
                <div>
                  <p className="font-bold text-green-800">You just earned new badge{newlyEarned.length > 1 ? 's' : ''}!</p>
                  <p className="text-green-700 text-sm">{newlyEarned.map(b => `${b.icon} ${b.name}`).join(", ")}</p>
                </div>
                <button onClick={() => setNewlyEarned([])} className="ml-auto text-green-600 hover:text-green-800 text-xl">✕</button>
              </div>
            )}

            {/* Stats cards */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">⭐ {stats.points}</div>
                  <div className="text-xs text-gray-500 mt-1">Total Points</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">📚 {stats.completedLessons}</div>
                  <div className="text-xs text-gray-500 mt-1">Lessons Done</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">✅ {stats.completedTasks}</div>
                  <div className="text-xs text-gray-500 mt-1">Tasks Done</div>
                </div>
              </div>
            )}

            {/* Collection progress */}
            {!loading && badges.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Your Collection</h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {earned.length} of {badges.length} badges earned
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-primary-600">{progress}%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary-600 h-4 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-full mx-auto" />
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <span className="text-4xl block mb-2">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
                <button onClick={fetchBadges} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Retry</button>
              </div>
            )}

            {/* Empty — no badges seeded yet */}
            {!loading && !error && badges.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <span className="text-6xl mb-4">🏅</span>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No badges available yet</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  The admin hasn't set up any badges yet. Check back soon!
                </p>
              </div>
            )}

            {/* Earned Badges */}
            {!loading && !error && earned.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  🏆 Earned <span className="bg-green-100 text-green-700 text-sm px-2 py-0.5 rounded-full">{earned.length}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {earned.map(badge => (
                    <div key={badge._id}
                      className="bg-white rounded-xl shadow-md p-5 text-center border-2 border-primary-400 hover:shadow-lg hover:scale-105 transition-all"
                    >
                      <div className="text-5xl sm:text-6xl mb-3">{badge.icon}</div>
                      <h3 className="text-base font-bold text-gray-800 mb-1">{badge.name}</h3>
                      <p className="text-gray-500 text-xs mb-3">{badge.description}</p>
                      {badge.points > 0 && (
                        <div className="text-yellow-600 text-sm font-semibold mb-2">+{badge.points} pts bonus</div>
                      )}
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
                        ✓ Earned {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Badges */}
            {!loading && !error && locked.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  🔒 Locked <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">{locked.length}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {locked.map(badge => {
                    const pct = getCriteriaProgress(badge);
                    const criteriaText = getCriteriaText(badge);
                    return (
                      <div key={badge._id}
                        className="bg-white rounded-xl shadow p-5 text-center border-2 border-gray-200 opacity-80 hover:opacity-100 transition-all"
                      >
                        <div className="text-5xl sm:text-6xl mb-3 grayscale">{badge.icon}</div>
                        <h3 className="text-base font-bold text-gray-700 mb-1">{badge.name}</h3>
                        <p className="text-gray-400 text-xs mb-3">{badge.description}</p>

                        {/* Progress bar toward this badge */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-primary-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* What's needed */}
                        {criteriaText && (
                          <p className="text-xs text-gray-400 mt-1">{criteriaText}</p>
                        )}

                        {badge.points > 0 && (
                          <div className="text-yellow-500 text-xs font-semibold mt-2">+{badge.points} pts on earn</div>
                        )}

                        <div className="mt-3 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                          🔒 Locked
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Badges;