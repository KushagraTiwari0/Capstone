import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Button from "../../components/common/Button";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'lessons'

  // --- Users State ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRole, setFilterRole] = useState("");

  // --- Lessons State ---
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [deletingId, setDeletingId] = useState(null);

  // ─── Fetch Users ────────────────────────────────────────────────
  const fetchUsers = async (page = 1, role = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("geep_token");

      if (role === "pending") {
        const res = await fetch(`${API_BASE_URL}/admin/pending-teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.success) {
          setUsers(data.data.teachers || []);
          setTotalPages(1);
        }
      } else {
        let url = `${API_BASE_URL}/admin/users?page=${page}&limit=50`;
        if (role) url += `&role=${role}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherAction = async (id, action) => {
    if (action === "reject" && !window.confirm("Are you sure you want to reject this teacher?")) return;
    try {
      const token = localStorage.getItem("geep_token");
      const res = await fetch(`${API_BASE_URL}/admin/teachers/${id}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data?.success) {
        fetchUsers(usersPage, filterRole);
      } else {
        alert(data.error?.message || "Failed to perform action");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating teacher status");
    }
  };

  useEffect(() => {
    fetchUsers(usersPage, filterRole);
  }, [usersPage, filterRole]);

  // ─── Fetch Lessons ───────────────────────────────────────────────
  const fetchLessons = async () => {
    try {
      setLessonsLoading(true);
      setLessonsError("");
      const token = localStorage.getItem("geep_token");
      const res = await fetch(`${API_BASE_URL}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success) {
        setLessons(data.data.lessons);
      } else {
        setLessonsError(data.error?.message || "Failed to load lessons");
      }
    } catch (err) {
      setLessonsError("Failed to connect to server");
    } finally {
      setLessonsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "lessons") fetchLessons();
  }, [activeTab]);

  const handleDeleteLesson = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      const token = localStorage.getItem("geep_token");
      const res = await fetch(`${API_BASE_URL}/lessons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success) {
        setLessons((prev) => prev.filter((l) => l._id !== id));
      } else {
        alert(data.error?.message || "Failed to delete lesson");
      }
    } catch (err) {
      alert("Error deleting lesson");
    } finally {
      setDeletingId(null);
    }
  };

  const classLevels = ["All", ...new Set(lessons.map((l) => l.classLevel).sort())];
  const filteredLessons =
    filterClass === "All" ? lessons : lessons.filter((l) => String(l.classLevel) === String(filterClass));

  const difficultyColor = (d) => {
    if (d === "Easy") return "bg-green-100 text-green-700";
    if (d === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen animated-bg">
      <Sidebar />
      <div className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full space-y-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold nature-gradient-text">👑 Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition-colors ${
                activeTab === "users"
                  ? "bg-white border border-b-white border-gray-200 text-primary-700 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab("lessons")}
              className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition-colors ${
                activeTab === "lessons"
                  ? "bg-white border border-b-white border-gray-200 text-primary-700 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📚 Lessons
            </button>
          </div>

          {/* ══════════ USERS TAB ══════════ */}
          {activeTab === "users" && (
            <>
              {/* Role Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button variant={filterRole === "" ? "primary" : "outline"} onClick={() => setFilterRole("")}>
                  🌍 All
                </Button>
                <Button variant={filterRole === "student" ? "primary" : "outline"} onClick={() => setFilterRole("student")}>
                  👨‍🎓 Students
                </Button>
                <Button variant={filterRole === "teacher" ? "primary" : "outline"} onClick={() => setFilterRole("teacher")}>
                  👨‍🏫 Teachers
                </Button>
                <Button variant={filterRole === "pending" ? "primary" : "outline"} onClick={() => setFilterRole("pending")}>
                  ⏳ Pending Teachers
                </Button>
              </div>

              {/* Users Table */}
              <div className="eco-card overflow-hidden !px-0 sm:!px-0">
                {loading ? (
                  <div className="text-center py-12 text-gray-500 font-medium">Loading...</div>
                ) : (
                  <div className="table-wrapper px-4 sm:px-6 scrollbar-thin">
                    <table className="w-full border-collapse">
                      <thead className="bg-primary-100 text-primary-800 border-b-2 border-primary-200">
                        <tr>
                          <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Avatar</th>
                          <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Name</th>
                          <th className="whitespace-nowrap px-4 py-4 text-left font-semibold hidden md:table-cell">Email</th>
                          <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Role</th>
                          <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Class</th>
                          <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Points</th>
                          <th className="whitespace-nowrap px-4 py-4 text-left font-semibold hidden lg:table-cell">Level</th>
                          <th className="whitespace-nowrap px-4 py-4 text-left font-semibold hidden xl:table-cell">Joined</th>
                          {filterRole === "pending" && (
                            <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-10 text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u._id} className="border-t hover:bg-primary-50">
                              <td className="px-4 py-4 align-middle">
                                <div className="w-10 h-10 flex items-center justify-center">
                                  <span className="text-2xl">{u.avatar || "👤"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 align-middle font-semibold">{u.name}</td>
                              <td className="px-4 py-4 align-middle hidden md:table-cell text-gray-600">{u.email}</td>
                              <td className="px-4 py-4 align-middle">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  u.role === "teacher" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                                }`}>
                                  {u.role === "teacher" ? "👨‍🏫 Teacher" : "👨‍🎓 Student"}
                                </span>
                              </td>
                              <td className="px-4 py-4 align-middle">{u.classLevel ? `Class ${u.classLevel}` : "-"}</td>
                              <td className="px-4 py-4 align-middle">⭐ {u.points || 0}</td>
                              <td className="px-4 py-4 align-middle hidden lg:table-cell">{u.level || "Beginner"}</td>
                              <td className="px-4 py-4 align-middle hidden xl:table-cell text-sm text-gray-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              {filterRole === "pending" && (
                                <td className="px-4 py-4 align-middle whitespace-nowrap">
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="primary" onClick={() => handleTeacherAction(u._id, "approve")}>Accept</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleTeacherAction(u._id, "reject")}>Reject</Button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {users.length > 0 && (
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Page {usersPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={usersPage === 1} onClick={() => setUsersPage((p) => p - 1)}>Prev</Button>
                    <Button variant="outline" disabled={usersPage >= totalPages} onClick={() => setUsersPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══════════ LESSONS TAB ══════════ */}
          {activeTab === "lessons" && (
            <>
              {/* Lessons Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Manage Lessons</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} across all classes
                  </p>
                </div>
                <button
                  onClick={() => navigate("/admin/lessons/create")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <span className="text-lg">＋</span> Create Lesson
                </button>
              </div>

              {/* Class Level Filter Pills */}
              {!lessonsLoading && lessons.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {classLevels.map((cl) => (
                    <button
                      key={cl}
                      onClick={() => setFilterClass(cl === "All" ? "All" : cl)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                        String(filterClass) === String(cl)
                          ? "bg-primary-600 text-white border-primary-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-primary-400"
                      }`}
                    >
                      {cl === "All" ? "🌍 All Classes" : `Class ${cl}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading */}
              {lessonsLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {!lessonsLoading && lessonsError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <span className="text-4xl block mb-2">⚠️</span>
                  <p className="text-red-700 font-medium">{lessonsError}</p>
                  <button onClick={fetchLessons} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                    Retry
                  </button>
                </div>
              )}

              {/* Empty — No lessons at all */}
              {!lessonsLoading && !lessonsError && lessons.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <span className="text-6xl mb-4">🌱</span>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No lessons yet</h3>
                  <p className="text-gray-400 max-w-sm text-sm mb-6">
                    Create your first lesson and it will appear for students in the selected class level.
                  </p>
                  <button
                    onClick={() => navigate("/admin/lessons/create")}
                    className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    ＋ Create First Lesson
                  </button>
                </div>
              )}

              {/* Empty — Filter shows nothing */}
              {!lessonsLoading && !lessonsError && lessons.length > 0 && filteredLessons.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
                  <span className="text-5xl mb-3">🔍</span>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No lessons for Class {filterClass}</h3>
                  <p className="text-gray-400 text-sm mb-5">Create a lesson specifically for this class level.</p>
                  <button
                    onClick={() => navigate("/admin/lessons/create")}
                    className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    ＋ Create Lesson for Class {filterClass}
                  </button>
                </div>
              )}

              {/* Lessons Grid */}
              {!lessonsLoading && !lessonsError && filteredLessons.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredLessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="bg-white rounded-xl shadow hover:shadow-lg transition-all border border-gray-100 flex flex-col"
                    >
                      <div className="p-5 flex-1">
                        {/* Icon + Class badge */}
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-4xl">{lesson.image || "📚"}</span>
                          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            Class {lesson.classLevel}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2">{lesson.title}</h3>

                        {/* Description */}
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{lesson.description}</p>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${difficultyColor(lesson.difficulty)}`}>
                            {lesson.difficulty}
                          </span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{lesson.category}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">⏱ {lesson.duration}</span>
                          <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">⭐ {lesson.points} pts</span>
                        </div>

                        {/* Extras */}
                        <div className="flex gap-3 mt-2">
                          {lesson.videoUrl && (
                            <span className="text-xs text-blue-500 flex items-center gap-1">🎥 Video</span>
                          )}
                          {lesson.quiz?.length > 0 && (
                            <span className="text-xs text-purple-500 flex items-center gap-1">
                              📝 {lesson.quiz.length} Q
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="border-t border-gray-100 px-5 py-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/lessons/edit/${lesson._id}`)}
                          className="flex-1 text-sm font-semibold text-primary-600 hover:text-primary-800 hover:bg-primary-50 py-1.5 rounded-lg transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson._id)}
                          disabled={deletingId === lesson._id}
                          className="flex-1 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === lesson._id ? "Deleting..." : "🗑️ Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;