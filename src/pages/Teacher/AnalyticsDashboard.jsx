import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../../components/common/Sidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("geep_token");

        const [overviewRes, topRes, roleRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/overview`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/analytics/top-performers?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/analytics/role-distribution`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (overviewRes.ok) {
          const data = await overviewRes.json();
          if (data.success) setOverview(data.data);
        }
        if (topRes.ok) {
          const data = await topRes.json();
          if (data.success) setTopPerformers(data.data.users || []);
        }
        if (roleRes.ok) {
          const data = await roleRes.json();
          if (data.success) setRoleDistribution(data.data.roles || []);
        }
      } catch (e) {
        console.error("Analytics dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const topPerformersChart = useMemo(() => {
    return topPerformers.map((u) => ({
      name: (u.name || "").substring(0, 16),
      points: u.points || 0,
    }));
  }, [topPerformers]);

  const rolePieData = useMemo(() => {
    return roleDistribution.map((r) => ({ name: r._id, value: r.count }));
  }, [roleDistribution]);

  const COLORS = ["#43A047", "#26A69A", "#66BB6A", "#4FC3F7", "#8D6E63"];

  return (
    <div className="min-h-screen animated-bg">
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main flex-1">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold nature-gradient-text mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor student progress and platform engagement
              </p>
            </div>

            {/* Overall Stats */}
            <div className="stats-grid mb-6 sm:mb-8">
              <div className="eco-card environment-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {overview?.totalStudents ?? (loading ? "..." : 0)}
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl">👥</div>
                </div>
              </div>
              <div className="eco-card environment-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      Active Students
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                      {overview?.activeStudents ?? (loading ? "..." : 0)}
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl">✅</div>
                </div>
              </div>
              <div className="eco-card environment-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Score</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                      {overview?.averageScore ?? (loading ? "..." : 0)}%
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl">📊</div>
                </div>
              </div>
              <div className="eco-card environment-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      Completion Rate
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                      {overview?.completionRate ?? (loading ? "..." : 0)}%
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl">🎯</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            {loading ? (
              <div className="text-center py-12 mb-8">
                <div className="inline-block environment-spinner w-12 h-12 mb-4"></div>
                <p className="text-gray-600 font-medium flex items-center justify-center gap-2">
                  <span className="animate-pulse-slow">🌿</span>
                  Loading analytics...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
                <div className="eco-card">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                    Top Performers (Points)
                  </h2>
                  <div className="w-full" style={{ minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topPerformersChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#C8E6C9" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#2E7D32" />
                        <YAxis stroke="#2E7D32" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#F1F8F4', 
                            border: '1px solid #C8E6C9',
                            borderRadius: '8px'
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="points" fill="#43A047" name="Points" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="eco-card">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                    Users by Role
                  </h2>
                  <div className="w-full" style={{ minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={rolePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {rolePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#F1F8F4', 
                            border: '1px solid #C8E6C9',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Top Performers */}
            <div className="eco-card">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                Top Performers
              </h2>
              {topPerformers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🌿</div>
                  <p className="text-gray-600">No performers found.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gradient-to-r from-primary-50 to-primary-100">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-primary-800 uppercase">
                          Rank
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-primary-800 uppercase">
                          Student
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-primary-800 uppercase">
                          Points
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-primary-800 uppercase">
                          Badges
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topPerformers.map((performer, index) => (
                        <tr key={index} className="hover:bg-primary-50/50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="text-lg sm:text-2xl">
                              {index === 0
                                ? "🥇"
                                : index === 1
                                ? "🥈"
                                : index === 2
                                ? "🥉"
                                : `#${index + 1}`}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-semibold text-gray-800 text-sm sm:text-base">
                            {performer.name}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="flex items-center space-x-1">
                              <span>⭐</span>
                              <span className="text-sm sm:text-base">{performer.points}</span>
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="flex items-center space-x-1">
                              <span>🏆</span>
                              <span className="text-sm sm:text-base">{performer.badges ?? 0}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
