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

  const levelQuery = useMemo(() => {
    if (!filter || filter === "all") return "";
    return filter;
  }, [filter]);

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

        const response = await fetch(`${API_BASE_URL}/leaderboard?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
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

  return (
    <div className="min-h-screen animated-bg">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-6xl mx-auto">
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

            {currentUserRank && (
              <div className="bg-gradient-to-r from-primary-500 via-green-500 to-primary-600 rounded-xl shadow-nature-lg p-4 sm:p-6 mb-6 sm:mb-8 text-white environment-card animate-slide-up glow-effect">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm opacity-90 mb-1">Your Rank</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">#{currentUserRank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm opacity-90 mb-1">Your Points</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{points}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 animate-slide-up">
              <div className="flex flex-wrap gap-2">
                {["all", "beginner", "intermediate", "advanced", "expert"].map(
                  (level, index) => (
                    <button
                      key={level}
                      onClick={() => setFilter(level)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 capitalize shadow-md ${
                        filter === level
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                          : "bg-white text-gray-700 hover:bg-primary-50 border border-primary-200 hover:border-primary-300"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {level === 'all' && '🌍 '}
                      {level === 'beginner' && '🌱 '}
                      {level === 'intermediate' && '🌿 '}
                      {level === 'advanced' && '🌳 '}
                      {level === 'expert' && '🌲 '}
                      {level}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-nature-lg overflow-hidden border border-primary-100 environment-card animate-slide-up">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="mt-4 text-gray-600">Loading leaderboard...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Badges
                          </th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Level
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {leaderboardUsers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          leaderboardUsers.map((userItem) => {
                            const isCurrentUser = user && String(userItem.id) === String(user?._id || user?.id);
                            return (
                              <tr
                                key={userItem.id}
                                className={`hover:bg-gray-50 transition-colors ${
                                  isCurrentUser ? "bg-primary-50 border-l-4 border-primary-600" : ""
                                }`}
                              >
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {userItem.rank <= 3 ? (
                                      <span className="text-xl sm:text-2xl">
                                        {getRankIcon(userItem.rank)}
                                      </span>
                                    ) : (
                                      <span className="text-base sm:text-lg font-bold text-gray-800">
                                        #{userItem.rank}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2 sm:space-x-3">
                                    <span className="text-2xl sm:text-3xl">{userItem.avatar}</span>
                                    <div className="font-semibold text-sm sm:text-base text-gray-800">
                                      {userItem.name}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-1 sm:space-x-2">
                                    <span className="text-yellow-500 text-sm sm:text-base">⭐</span>
                                    <span className="font-semibold text-sm sm:text-base text-gray-800">
                                      {userItem.points}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-lg sm:text-xl">🏆</span>
                                    <span className="font-semibold text-sm sm:text-base text-gray-800">
                                      {userItem.badges}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-primary-100 text-primary-800">
                                    {userItem.level}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <div className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 disabled:opacity-50"
                    >
                      Next
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
