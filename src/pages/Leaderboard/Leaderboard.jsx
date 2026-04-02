import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../context/UserContext";
import { getRankIcon } from "../../utils/helpers";
import Sidebar from "../../components/common/Sidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Leaderboard = () => {
  const { user, points } = useUser();
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const levelQuery = useMemo(() => (filter === "all" ? "" : filter), [filter]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("geep_token");
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "25");
        params.set("role", "student");
        if (levelQuery) params.set("level", levelQuery);

        const res = await fetch(`${API_BASE_URL}/leaderboard?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLeaderboardUsers(data.data.users || []);
            setCurrentUserRank(data.data.currentUserRank ?? null);
            setTotalPages(data.data.pagination?.pages || 1);
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [page, levelQuery]);

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1); }, [filter]);

  return (
    <div className="min-h-screen animated-bg">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="mb-6 sm:mb-8 animate-slide-down">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold nature-gradient-text mb-2 flex items-center gap-3">
                <span className="text-4xl sm:text-5xl animate-bounce-slow">🏆</span>
                Leaderboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                <span className="text-lg">🌿</span>
                See how you rank among eco-learners
              </p>
            </div>

            {/* Your rank banner */}
            {currentUserRank && (
              <div className="bg-gradient-to-r from-primary-500 via-green-500 to-primary-600 rounded-xl shadow-nature-lg p-4 sm:p-6 mb-6 text-white animate-slide-up">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm opacity-90 mb-1">Your Rank</p>
                    <p className="text-2xl sm:text-4xl font-bold">#{currentUserRank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm opacity-90 mb-1">Your Points</p>
                    <p className="text-2xl sm:text-4xl font-bold">{points}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Level filter */}
            <div className="mb-6 animate-slide-up">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all",          label: "🌍 All"          },
                  { key: "beginner",     label: "🌱 Beginner"     },
                  { key: "intermediate", label: "🌿 Intermediate" },
                  { key: "advanced",     label: "🌳 Advanced"     },
                  { key: "expert",       label: "🌲 Expert"       },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md ${
                      filter === key
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-primary-50 border border-primary-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-nature-lg overflow-hidden border border-primary-100 animate-slide-up">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  <p className="mt-4 text-gray-600">Loading leaderboard...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Points</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Badges</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Avg Quiz</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {leaderboardUsers.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                              <span className="text-4xl block mb-2">🌱</span>
                              No students found
                            </td>
                          </tr>
                        ) : (
                          leaderboardUsers.map((u) => {
                            const isMe = user && String(u.id) === String(user?._id || user?.id);
                            return (
                              <tr
                                key={u.id}
                                className={`hover:bg-gray-50 transition-colors ${
                                  isMe ? "bg-primary-50 border-l-4 border-primary-500" : ""
                                }`}
                              >
                                {/* Rank */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                  {u.rank <= 3 ? (
                                    <span className="text-2xl">{getRankIcon(u.rank)}</span>
                                  ) : (
                                    <span className="text-base font-bold text-gray-700">#{u.rank}</span>
                                  )}
                                </td>

                                {/* Name */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{u.avatar}</span>
                                    <span className="font-semibold text-gray-800 text-sm">
                                      {u.name}
                                      {isMe && <span className="ml-2 text-xs text-primary-600 font-bold">(You)</span>}
                                    </span>
                                  </div>
                                </td>

                                {/* Points */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="text-yellow-500 mr-1">⭐</span>
                                  <span className="font-semibold text-gray-800">{u.points}</span>
                                </td>

                                {/* ✅ Badges — deduplicated count from backend */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="mr-1">🏅</span>
                                  <span className="font-semibold text-gray-800">{u.badges}</span>
                                </td>

                                {/* ✅ Avg Quiz Score */}
                                <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                                  {u.avgQuiz !== null && u.avgQuiz !== undefined ? (
                                    <span className={`font-semibold text-sm ${
                                      u.avgQuiz >= 80 ? "text-green-600" :
                                      u.avgQuiz >= 50 ? "text-yellow-600" : "text-red-500"
                                    }`}>
                                      {u.avgQuiz}%
                                    </span>
                                  ) : (
                                    <span className="text-gray-300 text-sm">—</span>
                                  )}
                                </td>

                                {/* Level */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                                    {u.level}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 disabled:opacity-40 hover:bg-gray-200 transition-colors"
                    >
                      ← Previous
                    </button>
                    <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 disabled:opacity-40 hover:bg-gray-200 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;