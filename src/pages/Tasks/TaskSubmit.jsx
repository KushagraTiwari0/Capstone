import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Button from "../../components/common/Button";
import Sidebar from "../../components/common/Sidebar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TaskSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadUserProgress } = useUser();

  const [task, setTask] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ proof: "", location: "", reflection: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTaskAndSubmission();
  }, [id]);

  const fetchTaskAndSubmission = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("geep_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch task from API only — no JSON fallback
      const taskRes = await fetch(`${API_BASE}/tasks/${id}`, { headers });
      const taskData = await taskRes.json();

      if (!taskData.success || !taskData.data?.task) {
        setLoading(false);
        return;
      }
      setTask(taskData.data.task);

      // Fetch existing submission for this task
      const subRes = await fetch(`${API_BASE}/users/me/task-submissions`, { headers });
      const subData = await subRes.json();
      if (subData.success) {
        const existing = subData.data.submissions.find(
          (s) => String(s.taskId) === String(id)
        );
        if (existing) setSubmissionData(existing);
      }
    } catch (e) {
      console.error("Error fetching task/submission:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.proof.trim()) {
      setError("Proof / Evidence is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("geep_token");
      const res = await fetch(`${API_BASE}/tasks/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: task._id,
          taskData: {
            title: task.title,
            description: task.description,
            category: task.category,
            difficulty: task.difficulty,
            points: task.points,
            icon: task.icon,
            proof: formData.proof,
            location: formData.location,
            reflection: formData.reflection,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmissionData({
          status: "pending",
          proof: formData.proof,
          location: formData.location,
          reflection: formData.reflection,
          submittedAt: new Date().toISOString(),
        });
        if (loadUserProgress) await loadUserProgress();
      } else {
        setError(data.error?.message || data.message || "Failed to submit task.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  // Task not found
  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">📭</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Task not found</h2>
          <p className="text-gray-500 mb-4">This task may have been removed.</p>
          <Link to="/tasks" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const canResubmit = submissionData?.status === "rejected";
  const showForm = !submissionData || canResubmit;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-4xl mx-auto">

            <Link to="/tasks" className="text-primary-600 hover:text-primary-700 mb-4 inline-block text-sm font-medium">
              ← Back to Tasks
            </Link>

            {/* Task header */}
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <div className="text-5xl sm:text-6xl">{task.icon}</div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{task.title}</h1>
                  <p className="text-gray-600 mb-4">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {task.category}
                    </span>
                    <span className="text-yellow-600 font-semibold text-sm">⭐ {task.points} points</span>
                    {task.classLevel && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        Class {task.classLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status banners */}
              {submissionData?.status === "approved" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <span className="text-green-800 font-semibold">
                      Task approved! You earned {submissionData.awardedPoints || task.points} points!
                    </span>
                  </div>
                  {submissionData.teacherRemarks && (
                    <p className="mt-2 text-green-700 italic text-sm">
                      Teacher remarks: "{submissionData.teacherRemarks}"
                    </p>
                  )}
                </div>
              )}

              {submissionData?.status === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className="text-red-800 font-semibold">Task returned for revision.</p>
                      {submissionData.rejectionReason && (
                        <p className="mt-1 text-red-700 text-sm">
                          Reason: <span className="italic">"{submissionData.rejectionReason}"</span>
                        </p>
                      )}
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        Please review the feedback and submit again below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {submissionData?.status === "pending" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="text-yellow-800 font-semibold">Submitted — pending teacher review.</p>
                      <p className="text-yellow-700 text-sm mt-0.5">
                        Points will be awarded once your teacher approves.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {task.instructions?.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">Instructions</h2>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
                    {task.instructions.map((instruction, i) => (
                      <li key={i} className="pl-2">{instruction}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Submission form */}
              {showForm && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      ⚠️ {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proof / Evidence <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="proof"
                      required
                      value={formData.proof}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="Describe what you did or paste a link to your proof"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="Where did you complete this task?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reflection</label>
                    <textarea
                      name="reflection"
                      value={formData.reflection}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="Share your experience and what you learned..."
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : canResubmit ? "Resubmit Task" : "Submit Task"}
                  </Button>
                </form>
              )}

              {/* Submission details (approved or pending) */}
              {!showForm && submissionData && (
                <div className="bg-gray-50 rounded-lg p-6 mt-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Submission</h3>
                  {submissionData.proof && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Proof / Evidence:</p>
                      <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-100 text-sm whitespace-pre-wrap">
                        {submissionData.proof}
                      </p>
                    </div>
                  )}
                  {submissionData.location && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Location:</p>
                      <p className="text-gray-600 text-sm">{submissionData.location}</p>
                    </div>
                  )}
                  {submissionData.reflection && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Reflection:</p>
                      <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-100 text-sm whitespace-pre-line">
                        {submissionData.reflection}
                      </p>
                    </div>
                  )}
                  {submissionData.submittedAt && (
                    <p className="text-xs text-gray-400 mt-4">
                      Submitted on {new Date(submissionData.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskSubmit;