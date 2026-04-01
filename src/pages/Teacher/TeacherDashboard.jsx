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
        if (!token) {
          setError("Session expired. Please login again.");
          return;
        }

        const [overviewRes, topRes, pendingRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/overview`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/analytics/top-performers?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/teacher/pending-submissions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (overviewRes.ok) {
          const data = await overviewRes.json();
          if (data.success) setStats(data.data);
        } else {
          const text = await overviewRes.text();
          console.error("overview error:", overviewRes.status, text);
        }
        if (topRes.ok) {
          const data = await topRes.json();
          if (data.success) setTopUsers(data.data.users || []);
        } else {
          const text = await topRes.text();
          console.error("top-performers error:", topRes.status, text);
        }
        if (pendingRes.ok) {
          const data = await pendingRes.json();
          if (data.success) setPendingSubmissions(data.data.submissions || []);
        } else {
          const text = await pendingRes.text();
          console.error("pending-submissions error:", pendingRes.status, text);
        }
      } catch (e) {
        console.error("Teacher dashboard load error:", e);
        setError("Failed to load teacher dashboard data. Please check backend server is running.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadTeacherLeaderboard = async () => {
      try {
        const token = localStorage.getItem("geep_token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/leaderboard/top?role=teacher&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) setTeacherLeaderboard(data.data.users || []);
        }
      } catch (e) {
        console.error("Teacher leaderboard load error:", e);
      }
    };
    loadTeacherLeaderboard();
  }, []);

  // Load pending students
  useEffect(() => {
    const loadPendingStudents = async () => {
      try {
        setLoadingApprovals(true);
        const token = localStorage.getItem("geep_token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/teacher/pending-students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) setPendingStudents(data.data.students || []);
        }
      } catch (e) {
        console.error("Pending students load error:", e);
      } finally {
        setLoadingApprovals(false);
      }
    };
    loadPendingStudents();
  }, []);

  const handleStudentAction = async (studentId, action) => {
    try {
      const token = localStorage.getItem("geep_token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/teacher/students/${studentId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Remove student from pending list
          setPendingStudents(prev => prev.filter(s => s._id !== studentId));
          alert(`Student ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error?.message || 'Failed to process request');
      }
    } catch (e) {
      console.error("Student action error:", e);
      alert('An error occurred. Please try again.');
    }
  };

  const openReviewModal = (submission, type) => {
    setReviewModal({ isOpen: true, type, submissionId: submission._id });
    setReviewForm({
      awardedPoints: submission.taskId?.points || 0,
      teacherRemarks: "",
      rejectionReason: ""
    });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, type: null, submissionId: null });
  };

  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("geep_token");
      if (!token) return;

      const endpoint = reviewModal.type === 'approve'
        ? `/teacher/submissions/${reviewModal.submissionId}/approve`
        : `/teacher/submissions/${reviewModal.submissionId}/reject`;

      const payload = reviewModal.type === 'approve'
        ? { awardedPoints: reviewForm.awardedPoints, teacherRemarks: reviewForm.teacherRemarks }
        : { rejectionReason: reviewForm.rejectionReason };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert(`Submission ${reviewModal.type === 'approve' ? 'approved' : 'rejected'} successfully.`);
        setPendingSubmissions(prev => prev.filter(sub => sub._id !== reviewModal.submissionId));
        closeReviewModal();
      } else {
        alert(data.error?.message || "Action failed.");
      }
    } catch (err) {
      console.error("Review action error:", err);
      alert("Error processing review.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen animated-bg">
      <Sidebar />
      <div className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Welcome back, <span className="font-semibold text-primary-700">{user?.name}</span>! Manage your classes and students
            </p>
          </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Quick Stats */}
            <div className="stats-grid mb-6 sm:mb-8">
              <div className="eco-card environment-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {stats?.totalStudents ?? (loading ? "..." : 0)}
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
                      {stats?.activeStudents ?? (loading ? "..." : 0)}
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl">✅</div>
                </div>
              </div>
              <div className="eco-card environment-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      Pending Reviews
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                      {stats?.pendingTaskReviews ?? (loading ? "..." : 0)}
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl">📝</div>
                </div>
              </div>
              <div className="eco-card environment-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Score</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                      {stats?.averageScore ?? (loading ? "..." : 0)}%
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl">📊</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="eco-card mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex flex-wrap space-x-2 sm:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
                  {[
                    { id: "overview", label: "Overview", icon: "📊" },
                    { id: "approvals", label: "Student Approvals", icon: "👥" },
                    { id: "students", label: "Students", icon: "👥" },
                    { id: "tasks", label: "Task Reviews", icon: "✅" },
                    { id: "create-task", label: "Create Task", icon: "➕" },
                    { id: "teachers", label: "Teacher Leaderboard", icon: "🏆" },
                    { id: "content", label: "Content", icon: "📚" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        selectedTab === tab.id
                          ? "border-primary-600 text-primary-700"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-base sm:text-lg">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4 sm:p-6">
                {selectedTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                        Quick Actions
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link to="/analytics">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="text-3xl mb-2">📈</div>
                            <h3 className="text-xl font-semibold mb-1">
                              View Analytics
                            </h3>
                            <p className="text-blue-100">
                              Check detailed analytics and reports
                            </p>
                          </div>
                        </Link>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                          <div className="text-3xl mb-2">➕</div>
                          <h3 className="text-xl font-semibold mb-1">
                            Create Lesson
                          </h3>
                          <p className="text-green-100">
                            Add new learning content
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                          <div className="text-3xl mb-2">📝</div>
                          <h3 className="text-xl font-semibold mb-1">
                            Review Tasks
                          </h3>
                          <p className="text-purple-100">
                            Review student submissions
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                        Content Summary
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="eco-card bg-gradient-to-br from-primary-50 to-primary-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600">Lessons</p>
                              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                                {stats?.totalLessons ?? 0}
                              </p>
                            </div>
                            <span className="text-2xl sm:text-3xl">📚</span>
                          </div>
                        </div>
                        <div className="eco-card bg-gradient-to-br from-primary-50 to-primary-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600">Quizzes</p>
                              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                                {stats?.totalQuizzes ?? 0}
                              </p>
                            </div>
                            <span className="text-2xl sm:text-3xl">📝</span>
                          </div>
                        </div>
                        <div className="eco-card bg-gradient-to-br from-primary-50 to-primary-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600">Tasks</p>
                              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                                {stats?.totalTasks ?? 0}
                              </p>
                            </div>
                            <span className="text-2xl sm:text-3xl">✅</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === "approvals" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                      Pending Student Approvals
                    </h2>
                    {loadingApprovals ? (
                      <div className="text-center py-8">
                        <div className="inline-block environment-spinner w-8 h-8 mb-4"></div>
                        <p className="text-gray-600">Loading pending students...</p>
                      </div>
                    ) : pendingStudents.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">🌿</div>
                        <p className="text-gray-600">No pending student approvals.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingStudents.map((student) => (
                          <div
                            key={student._id}
                            className="eco-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className="text-2xl sm:text-3xl">{student.avatar || "👤"}</div>
                              <div>
                                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{student.name}</h3>
                                <p className="text-xs sm:text-sm text-gray-600">{student.email}</p>
                                <p className="text-xs text-gray-500">
                                  Registered: {new Date(student.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleStudentAction(student._id, 'approve')}
                              >
                                ✓ Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to reject this student?')) {
                                    handleStudentAction(student._id, 'reject');
                                  }
                                }}
                              >
                                ✗ Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === "students" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                      Top Students
                    </h2>
                    {topUsers.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">🌿</div>
                        <p className="text-gray-600">No students found.</p>
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
                                Name
                              </th>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-primary-800 uppercase">
                                Points
                              </th>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-primary-800 uppercase">
                                Badges
                              </th>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-primary-800 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {topUsers.map((student, index) => (
                              <tr key={index} className="hover:bg-primary-50/50 transition-colors">
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="text-lg sm:text-xl">
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
                                  {student.name}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="flex items-center space-x-1">
                                    <span>⭐</span>
                                    <span className="text-sm sm:text-base">{student.points}</span>
                                  </span>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="flex items-center space-x-1">
                                    <span>🏆</span>
                                    <span className="text-sm sm:text-base">{student.badges ?? 0}</span>
                                  </span>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === "tasks" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                      Pending Task Reviews
                    </h2>
                    <div className="space-y-4">
                      {pendingSubmissions.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-state-icon">🌿</div>
                          <p className="text-gray-600">No pending submissions.</p>
                        </div>
                      ) : (
                        pendingSubmissions.map((submission, index) => (
                        <div
                          key={index}
                          className="eco-card p-4 flex flex-col gap-4 text-sm sm:text-base border border-gray-100"
                        >
                          <div className="flex items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className="text-2xl flex-shrink-0 bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center">
                                {submission.taskId?.icon || "✅"}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {submission.taskId?.title || "Task"}
                                </h3>
                                <p className="text-gray-600">
                                  By <span className="font-medium text-gray-700">{submission.studentId?.name || "Student"}</span> on {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                               <Button variant="primary" size="sm" onClick={() => openReviewModal(submission, 'approve')}>
                                 ✓ Approve
                               </Button>
                               <Button variant="outline" size="sm" onClick={() => openReviewModal(submission, 'reject')}>
                                 ✗ Reject
                               </Button>
                            </div>
                          </div>
                          
                          <div className="text-gray-700 bg-gray-50 rounded-lg p-4 grid gap-3">
                            <div>
                               <p className="font-semibold text-gray-800 mb-1">Reflection:</p>
                               <p className="italic bg-white p-3 rounded shadow-sm">"{submission.reflection}"</p>
                            </div>
                            <div>
                               <p className="font-semibold text-gray-800 mb-1">Proof:</p>
                               <p className="bg-white p-3 rounded shadow-sm">
                                 {submission.proof && (submission.proof.startsWith('http') ? (
                                   <a href={submission.proof} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">
                                     {submission.proof}
                                   </a>
                                 ) : (
                                   <span className="break-words whitespace-pre-line">{submission.proof}</span>
                                 ))}
                               </p>
                            </div>
                            <div>
                               <p className="font-semibold text-gray-800 mb-1">Location:</p>
                               <p className="bg-white px-3 py-2 rounded shadow-sm">{submission.location}</p>
                            </div>
                          </div>
                        </div>
                      ))
                      )}
                    </div>
                  </div>
                )}

                {selectedTab === "create-task" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                      Create Eco Task
                    </h2>
                    <form 
                      className="eco-card space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const taskData = {
                          title: formData.get('title'),
                          description: formData.get('description'),
                          category: formData.get('category'),
                          difficulty: formData.get('difficulty'),
                          points: formData.get('points'),
                          icon: formData.get('icon') || '✅',
                        };
                        try {
                          const token = localStorage.getItem("geep_token");
                          const res = await fetch(`${API_BASE_URL}/tasks`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(taskData)
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert('Task created successfully');
                            e.target.reset();
                            setSelectedTab("overview");
                          } else {
                            alert(data.error?.message || 'Failed to create task');
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Error creating task');
                        }
                      }}
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input name="title" required className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Plant a Tree" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" required rows="3" className="w-full px-4 py-2 border rounded-lg" placeholder="Describe the task..."></textarea>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <input name="category" required className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Planting" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                          <select name="difficulty" className="w-full px-4 py-2 border rounded-lg">
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                          <input name="points" type="number" required min="10" defaultValue="50" className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                          <select name="icon" defaultValue="🌱" className="w-full px-4 py-2 border rounded-lg">
                            <option value="🌱">🌱 Seedling</option>
                            <option value="🌳">🌳 Tree</option>
                            <option value="♻️">♻️ Recycle</option>
                            <option value="🌍">🌍 Earth</option>
                            <option value="🌿">🌿 Herb</option>
                            <option value="✅">✅ Check</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button type="submit" variant="primary">Create Task</Button>
                      </div>
                    </form>
                  </div>
                )}

                {selectedTab === "teachers" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                      Teacher Leaderboard (Teachers Only)
                    </h2>
                    {teacherLeaderboard.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">🌿</div>
                        <p className="text-gray-600">No teachers found</p>
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
                                Teacher
                              </th>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-primary-800 uppercase">
                                Points
                              </th>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-primary-800 uppercase">
                                Level
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {teacherLeaderboard.map((t, idx) => (
                              <tr key={t.id} className="hover:bg-primary-50/50 transition-colors">
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-semibold text-sm sm:text-base">
                                  {idx + 1 <= 3 ? ["🥇", "🥈", "🥉"][idx] : `#${idx + 1}`}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-semibold text-gray-800">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl">{t.avatar || "👤"}</span>
                                    <span className="text-sm sm:text-base">{t.name}</span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="flex items-center space-x-1">
                                    <span>⭐</span>
                                    <span className="text-sm sm:text-base">{t.points || 0}</span>
                                  </span>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                                    {t.level || "Beginner"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === "content" && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                      Manage Content
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="eco-card bg-gradient-to-br from-primary-50 to-primary-100 text-center">
                        <div className="text-3xl sm:text-4xl mb-3">📚</div>
                        <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                          Lessons
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                          {stats?.totalLessons ?? 0} lessons available
                        </p>
                        <Button variant="outline" size="sm">
                          Manage Lessons
                        </Button>
                      </div>
                      <div className="eco-card bg-gradient-to-br from-primary-50 to-primary-100 text-center">
                        <div className="text-3xl sm:text-4xl mb-3">📝</div>
                        <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                          Quizzes
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                          {stats?.totalQuizzes ?? 0} quizzes available
                        </p>
                        <Button variant="outline" size="sm">
                          Manage Quizzes
                        </Button>
                      </div>
                      <div className="eco-card bg-gradient-to-br from-primary-50 to-primary-100 text-center">
                        <div className="text-3xl sm:text-4xl mb-3">✅</div>
                        <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                          Tasks
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                          {stats?.totalTasks ?? 0} tasks available
                        </p>
                        <Button variant="outline" size="sm">
                          Manage Tasks
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
      
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
             <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {reviewModal.type === 'approve' ? 'Approve Task' : 'Reject Task'}
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  {reviewModal.type === 'approve' ? 'Award points and provide optional remarks.' : 'Provide a reason for rejecting this submission.'}
                </p>
                
                <form onSubmit={handleReviewSubmission} className="space-y-4">
                  {reviewModal.type === 'approve' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points to Award</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={reviewForm.awardedPoints}
                          onChange={(e) => setReviewForm({...reviewForm, awardedPoints: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Remarks (Optional)</label>
                        <textarea
                          rows="3"
                          value={reviewForm.teacherRemarks}
                          onChange={(e) => setReviewForm({...reviewForm, teacherRemarks: e.target.value})}
                          placeholder="e.g., Excellent work!"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </>
                  )}
                  {reviewModal.type === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                      <textarea
                        required
                        rows="3"
                        value={reviewForm.rejectionReason}
                        onChange={(e) => setReviewForm({...reviewForm, rejectionReason: e.target.value})}
                        placeholder="e.g., The proof image is unclear."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={closeReviewModal}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      {reviewModal.type === 'approve' ? 'Approve' : 'Reject'}
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
