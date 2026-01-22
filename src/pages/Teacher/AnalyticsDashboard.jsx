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

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor student progress and platform engagement
              </p>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {overview?.totalStudents ?? (loading ? "..." : 0)}
                    </p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Active Students
                    </p>
                    <p className="text-3xl font-bold text-primary-600">
                      {overview?.activeStudents ?? (loading ? "..." : 0)}
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Score</p>
                    <p className="text-3xl font-bold text-green-600">
                      {overview?.averageScore ?? (loading ? "..." : 0)}%
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Completion Rate
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {overview?.completionRate ?? (loading ? "..." : 0)}%
                    </p>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Top Performers (Points)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPerformersChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="points" fill="#22c55e" name="Points" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Users by Role
                </h2>
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Top Performers
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Badges
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topPerformers.map((performer, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-2xl">
                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : `#${index + 1}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                          {performer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center space-x-1">
                            <span>⭐</span>
                            <span>{performer.points}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center space-x-1">
                            <span>🏆</span>
                            <span>{performer.badges ?? 0}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
