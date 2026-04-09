import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Sidebar from "../../components/common/Sidebar";
import Button from "../../components/common/Button";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TeacherDashboard = () => {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [teacherLeaderboard, setTeacherLeaderboard] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);

  const [reviewModal, setReviewModal] = useState({ isOpen: false, type: null, submissionId: null });
  const [reviewForm, setReviewForm] = useState({ awardedPoints: 0, teacherRemarks: "", rejectionReason: "" });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("geep_token");
        if (!token) { setError("Session expired. Please login again."); return; }

        const [overviewRes, topRes, pendingRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/overview`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/analytics/top-performers?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/teacher/pending-submissions`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (overviewRes.ok) { const d = await overviewRes.json(); if (d.success) setStats(d.data); }
        if (topRes.ok)      { const d = await topRes.json();      if (d.success) setTopUsers(d.data.users || []); }
        if (pendingRes.ok)  { const d = await pendingRes.json();  if (d.success) setPendingSubmissions(d.data.submissions || []); }
      } catch (e) {
        setError("Failed to load dashboard data. Please check backend server is running.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("geep_token");
        const res = await fetch(`${API_BASE_URL}/leaderboard/top?role=teacher&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { const d = await res.json(); if (d.success) setTeacherLeaderboard(d.data.users || []); }
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingApprovals(true);
        const token = localStorage.getItem("geep_token");
        const res = await fetch(`${API_BASE_URL}/teacher/pending-students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { const d = await res.json(); if (d.success) setPendingStudents(d.data.students || []); }
      } catch (e) { console.error(e); }
      finally { setLoadingApprovals(false); }
    };
    load();
  }, []);

  const handleStudentAction = async (studentId, action) => {
    try {
      const token = localStorage.getItem("geep_token");
      const res = await fetch(`${API_BASE_URL}/teacher/students/${studentId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingStudents(prev => prev.filter(s => s._id !== studentId));
        alert(`Student ${action === "approve" ? "approved" : "rejected"} successfully!`);
      } else {
        alert(data.error?.message || "Failed to process request");
      }
    } catch (e) { alert("An error occurred. Please try again."); }
  };

  const openReviewModal = (submission, type) => {
    setReviewModal({ isOpen: true, type, submissionId: submission._id });
    setReviewForm({ awardedPoints: submission.taskId?.points || 0, teacherRemarks: "", rejectionReason: "" });
  };
  const closeReviewModal = () => setReviewModal({ isOpen: false, type: null, submissionId: null });

  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("geep_token");
      const endpoint = reviewModal.type === "approve"
        ? `/teacher/submissions/${reviewModal.submissionId}/approve`
        : `/teacher/submissions/${reviewModal.submissionId}/reject`;
      const payload = reviewModal.type === "approve"
        ? { awardedPoints: reviewForm.awardedPoints, teacherRemarks: reviewForm.teacherRemarks }
        : { rejectionReason: reviewForm.rejectionReason };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Submission ${reviewModal.type === "approve" ? "approved" : "rejected"} successfully.`);
        setPendingSubmissions(prev => prev.filter(s => s._id !== reviewModal.submissionId));
        closeReviewModal();
      } else {
        alert(data.error?.message || "Action failed.");
      }
    } catch (err) { alert("Error processing review."); }
  };

  const TABS = [
    { id: "overview",   label: "Overview",            icon: "📊" },
    { id: "approvals",  label: "Student Approvals",   icon: "✅" },
    { id: "students",   label: "Top Students",         icon: "👥" },
    { id: "tasks",      label: "Task Reviews",         icon: "📝" },
    { id: "create-task",label: "Create Task",          icon: "➕" },
    { id: "teachers",   label: "Teacher Leaderboard",  icon: "🏆" },
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen animated-bg">
      <Sidebar />
      <div className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full space-y-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Welcome back, <span className="font-semibold text-primary-700">{user?.name}</span>! Manage your class and students.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}

          {/* Stats — removed "Pending Reviews" card */}
          <div className="stats-grid">
            {[
              { label: "Total Students",  value: stats?.totalStudents  ?? (loading ? "…" : 0), icon: "👥", color: "text-gray-800"    },
              { label: "Active Students", value: stats?.activeStudents ?? (loading ? "…" : 0), icon: "✅", color: "text-primary-600" },
              { label: "Average Score",   value: `${stats?.averageScore ?? (loading ? "…" : 0)}%`, icon: "📊", color: "text-primary-600" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="eco-card environment-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">{label}</p>
                    <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
                  </div>
                  <div className="text-3xl sm:text-4xl">{icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab panel */}
          <div className="eco-card">
            {/* Tab nav */}
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap gap-1 px-4 sm:px-6 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                      selectedTab === tab.id
                        ? "border-primary-600 text-primary-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.id === "approvals" && pendingStudents.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                        {pendingStudents.length}
                      </span>
                    )}
                    {tab.id === "tasks" && pendingSubmissions.length > 0 && (
                      <span className="bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                        {pendingSubmissions.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 sm:p-6">

              {/* ── Overview ── */}
              {selectedTab === "overview" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link to="/analytics">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className="text-3xl mb-2">📈</div>
                          <h3 className="text-xl font-semibold mb-1">View Analytics</h3>
                          <p className="text-blue-100 text-sm">Detailed reports and charts</p>
                        </div>
                      </Link>
                      <button onClick={() => setSelectedTab("tasks")} className="text-left">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className="text-3xl mb-2">📝</div>
                          <h3 className="text-xl font-semibold mb-1">Review Tasks</h3>
                          <p className="text-purple-100 text-sm">
                            {pendingSubmissions.length > 0
                              ? `${pendingSubmissions.length} submission${pendingSubmissions.length > 1 ? "s" : ""} waiting`
                              : "No pending submissions"}
                          </p>
                        </div>
                      </button>
                      <button onClick={() => setSelectedTab("approvals")} className="text-left">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className="text-3xl mb-2">👥</div>
                          <h3 className="text-xl font-semibold mb-1">Student Approvals</h3>
                          <p className="text-green-100 text-sm">
                            {pendingStudents.length > 0
                              ? `${pendingStudents.length} student${pendingStudents.length > 1 ? "s" : ""} waiting`
                              : "No pending approvals"}
                          </p>
                        </div>
                      </button>
                      <button onClick={() => setSelectedTab("create-task")} className="text-left">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className="text-3xl mb-2">➕</div>
                          <h3 className="text-xl font-semibold mb-1">Create Task</h3>
                          <p className="text-orange-100 text-sm">Assign a new eco task</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Class Summary — removed "Pending Reviews" item */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Class Summary</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Total Tasks", value: stats?.totalTasks   ?? 0, icon: "✅" },
                        { label: "Avg Score",   value: `${stats?.averageScore ?? 0}%`, icon: "📊" },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="eco-card bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600">{label}</p>
                            <p className="text-xl font-bold text-gray-800">{value}</p>
                          </div>
                          <span className="text-3xl">{icon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Student Approvals ── */}
              {selectedTab === "approvals" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Pending Student Approvals
                    {pendingStudents.length > 0 && (
                      <span className="ml-2 bg-red-100 text-red-700 text-sm px-2 py-0.5 rounded-full">{pendingStudents.length}</span>
                    )}
                  </h2>
                  {loadingApprovals ? (
                    <div className="text-center py-8"><div className="inline-block environment-spinner w-8 h-8" /></div>
                  ) : pendingStudents.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">🌿</div>
                      <p className="text-gray-600">No pending student approvals.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingStudents.map(student => (
                        <div key={student._id} className="eco-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{student.avatar || "👤"}</div>
                            <div>
                              <p className="font-semibold text-gray-800">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.email}</p>
                              <p className="text-xs text-gray-400">Class {student.classLevel} · Registered {new Date(student.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="primary" size="sm" onClick={() => handleStudentAction(student._id, "approve")}>✓ Approve</Button>
                            <Button variant="outline" size="sm" onClick={() => { if (window.confirm("Reject this student?")) handleStudentAction(student._id, "reject"); }}>✗ Reject</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Top Students ── */}
              {selectedTab === "students" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Students</h2>
                  {topUsers.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🌿</div><p className="text-gray-600">No students found.</p></div>
                  ) : (
                    <div className="table-wrapper">
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-gradient-to-r from-primary-50 to-primary-100">
                          <tr>
                            {["Rank","Name","Points","Badges"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-primary-800 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {topUsers.map((s, i) => (
                            <tr key={i} className="hover:bg-primary-50/50 transition-colors">
                              <td className="px-4 py-3">{i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}</td>
                              <td className="px-4 py-3 font-semibold text-gray-800">{s.name}</td>
                              <td className="px-4 py-3">⭐ {s.points}</td>
                              <td className="px-4 py-3">🏅 {s.badges ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Task Reviews ── */}
              {selectedTab === "tasks" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Pending Task Reviews
                    {pendingSubmissions.length > 0 && (
                      <span className="ml-2 bg-yellow-100 text-yellow-700 text-sm px-2 py-0.5 rounded-full">{pendingSubmissions.length}</span>
                    )}
                  </h2>
                  {pendingSubmissions.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🌿</div><p className="text-gray-600">No pending submissions. All caught up!</p></div>
                  ) : (
                    <div className="space-y-4">
                      {pendingSubmissions.map((sub, i) => (
                        <div key={i} className="eco-card border border-gray-100 space-y-4">
                          <div className="flex items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                                {sub.taskId?.icon || "✅"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{sub.taskId?.title || "Task"}</p>
                                <p className="text-sm text-gray-500">
                                  By <span className="font-medium">{sub.studentId?.name || "Student"}</span> · {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button variant="primary" size="sm" onClick={() => openReviewModal(sub, "approve")}>✓ Approve</Button>
                              <Button variant="outline" size="sm" onClick={() => openReviewModal(sub, "reject")}>✗ Reject</Button>
                            </div>
                          </div>
                          <div className="grid gap-3 bg-gray-50 rounded-lg p-4 text-sm">
                            {[
                              { label: "Proof",      value: sub.proof      },
                              { label: "Location",   value: sub.location   },
                              { label: "Reflection", value: sub.reflection },
                            ].map(({ label, value }) => value ? (
                              <div key={label}>
                                <p className="font-semibold text-gray-700 mb-1">{label}:</p>
                                <p className="bg-white p-3 rounded shadow-sm text-gray-600 whitespace-pre-wrap break-words">
                                  {label === "Proof" && value.startsWith("http") ? (
                                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{value}</a>
                                  ) : value}
                                </p>
                              </div>
                            ) : null)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Create Task ── */}
              {selectedTab === "create-task" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Eco Task</h2>
                  <form
                    className="eco-card space-y-4 max-w-2xl"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.target);
                      try {
                        const token = localStorage.getItem("geep_token");
                        const res = await fetch(`${API_BASE_URL}/tasks`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify({
                            title:       fd.get("title"),
                            description: fd.get("description"),
                            category:    fd.get("category"),
                            difficulty:  fd.get("difficulty"),
                            points:      fd.get("points"),
                            icon:        fd.get("icon") || "✅",
                          }),
                        });
                        const data = await res.json();
                        if (data.success) { alert("Task created successfully!"); e.target.reset(); setSelectedTab("overview"); }
                        else alert(data.error?.message || "Failed to create task");
                      } catch (err) { alert("Error creating task"); }
                    }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                      <input name="title" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g., Plant a Tree" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                      <textarea name="description" required rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Describe the task and what students need to do..." />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                        <input name="category" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g., Conservation" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                        <select name="difficulty" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                        <input name="points" type="number" min="10" defaultValue="50" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                        <select name="icon" defaultValue="🌱" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          {["🌱 Seedling","🌳 Tree","♻️ Recycle","🌍 Earth","🌿 Herb","💧 Water","🧹 Cleanup","✅ Complete"].map(o => {
                            const [icon, ...rest] = o.split(" ");
                            return <option key={icon} value={icon}>{o}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button type="submit" variant="primary">Create Task</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── Teacher Leaderboard ── */}
              {selectedTab === "teachers" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Teacher Leaderboard</h2>
                  {teacherLeaderboard.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🌿</div><p className="text-gray-600">No teachers found.</p></div>
                  ) : (
                    <div className="table-wrapper">
                      <table className="w-full min-w-[400px]">
                        <thead className="bg-gradient-to-r from-primary-50 to-primary-100">
                          <tr>
                            {["Rank","Teacher","Points","Level"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-primary-800 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {teacherLeaderboard.map((t, i) => (
                            <tr key={t.id} className="hover:bg-primary-50/50 transition-colors">
                              <td className="px-4 py-3">{i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{t.avatar || "👤"}</span>
                                  <span className="font-semibold text-gray-800">{t.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">⭐ {t.points || 0}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">{t.level || "Beginner"}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {reviewModal.type === "approve" ? "✓ Approve Submission" : "✗ Reject Submission"}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {reviewModal.type === "approve" ? "Award points and add optional remarks." : "Provide a reason so the student can improve."}
              </p>
              <form onSubmit={handleReviewSubmission} className="space-y-4">
                {reviewModal.type === "approve" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Points to Award</label>
                      <input type="number" required min="1"
                        value={reviewForm.awardedPoints}
                        onChange={e => setReviewForm(f => ({ ...f, awardedPoints: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
                      <textarea rows={3}
                        value={reviewForm.teacherRemarks}
                        onChange={e => setReviewForm(f => ({ ...f, teacherRemarks: e.target.value }))}
                        placeholder="e.g., Great effort!"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                    <textarea required rows={3}
                      value={reviewForm.rejectionReason}
                      onChange={e => setReviewForm(f => ({ ...f, rejectionReason: e.target.value }))}
                      placeholder="e.g., Proof image is unclear."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={closeReviewModal}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    {reviewModal.type === "approve" ? "Approve" : "Reject"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;