import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import Sidebar from "../../components/common/Sidebar";
import Button from "../../components/common/Button";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRole, setFilterRole] = useState("");

  const fetchUsers = async (page = 1, role = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("geep_token");

      let url = `${API_BASE_URL}/admin/users?page=${page}&limit=50`;
      if (role) url += `&role=${role}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data?.success) {
        const approvedOnly = data.data.users.filter(
          (u) =>
            (u.role === "student" || u.role === "teacher") &&
            u.status === "approved"
        );
        setUsers(approvedOnly);
        setTotalPages(data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(usersPage, filterRole);
  }, [usersPage, filterRole]);

  return (
    <div className="min-h-screen animated-bg">
      <div className="dashboard-container">
        <Sidebar />

        <main className="dashboard-main flex-1">
          <div className="max-w-7xl mx-auto w-full">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold nature-gradient-text">
                👑 Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome, <span className="font-semibold">{user?.name}</span>
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={filterRole === "" ? "primary" : "outline"}
                onClick={() => setFilterRole("")}
              >
                🌍 All
              </Button>
              <Button
                variant={filterRole === "student" ? "primary" : "outline"}
                onClick={() => setFilterRole("student")}
              >
                👨‍🎓 Students
              </Button>
              <Button
                variant={filterRole === "teacher" ? "primary" : "outline"}
                onClick={() => setFilterRole("teacher")}
              >
                👨‍🏫 Teachers
              </Button>
            </div>

            {/* Table */}
            <div className="eco-card overflow-x-auto">
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <table className="w-full table-fixed border-collapse">
                  <thead className="bg-primary-100">
                    <tr>
                      <th className="w-[80px] px-4 py-3 text-left">Avatar</th>
                      <th className="w-[180px] px-4 py-3 text-left">Name</th>
                      <th className="w-[260px] px-4 py-3 text-left hidden md:table-cell">
                        Email
                      </th>
                      <th className="w-[140px] px-4 py-3 text-left">Role</th>
                      <th className="w-[120px] px-4 py-3 text-left">Points</th>
                      <th className="w-[160px] px-4 py-3 text-left hidden lg:table-cell">
                        Level
                      </th>
                      <th className="w-[160px] px-4 py-3 text-left hidden xl:table-cell">
                        Joined
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-10 text-gray-500"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr
                          key={u._id}
                          className="border-t hover:bg-primary-50"
                        >
                          {/* Avatar */}
                          <td className="px-4 py-4 align-middle">
                            <div className="w-10 h-10 flex items-center justify-center">
                              <span className="text-2xl">
                                {u.avatar || "👤"}
                              </span>
                            </div>
                          </td>

                          {/* Name */}
                          <td className="px-4 py-4 align-middle font-semibold">
                            {u.name}
                          </td>

                          {/* Email */}
                          <td className="px-4 py-4 align-middle hidden md:table-cell text-gray-600">
                            {u.email}
                          </td>

                          {/* Role */}
                          <td className="px-4 py-4 align-middle">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                u.role === "teacher"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {u.role === "teacher"
                                ? "👨‍🏫 Teacher"
                                : "👨‍🎓 Student"}
                            </span>
                          </td>

                          {/* Points */}
                          <td className="px-4 py-4 align-middle">
                            ⭐ {u.points || 0}
                          </td>

                          {/* Level */}
                          <td className="px-4 py-4 align-middle hidden lg:table-cell">
                            {u.level || "Beginner"}
                          </td>

                          {/* Joined */}
                          <td className="px-4 py-4 align-middle hidden xl:table-cell text-sm text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {users.length > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Page {usersPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={usersPage === 1}
                    onClick={() => setUsersPage((p) => p - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    disabled={usersPage >= totalPages}
                    onClick={() => setUsersPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
