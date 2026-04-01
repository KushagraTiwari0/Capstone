import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import tasksData from "../../data/tasks.json";
import { useUser } from "../../context/UserContext";
import { completeTask, awardBadge } from "../../services/authService";
import Button from "../../components/common/Button";
import Sidebar from "../../components/common/Sidebar";

const TaskSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completeTask: completeTaskLocal, addPoints, addBadge, completedTasks, loadUserProgress } = useUser();
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    proof: "",
    location: "",
    reflection: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  useEffect(() => {
    const fetchTaskAndSubmission = async () => {
      let foundTask = tasksData.find((t) => t.id === parseInt(id));
      const token = localStorage.getItem("geep_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        if (!foundTask) {
          const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/tasks/${id}`, { headers });
          const data = await res.json();
          if (data.success && data.data.task) {
            foundTask = { ...data.data.task, id: data.data.task._id };
          }
        }
        
        if (foundTask) {
          setTask(foundTask);
          
          if (token) {
            const subRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users/me/task-submissions`, { headers });
            const subData = await subRes.json();
            if (subData.success) {
              const sub = subData.data.submissions.find(s => 
                s.taskId === foundTask.id || s.taskId === foundTask.id.toString()
              );
              if (sub) {
                setSubmissionData(sub);
              } else if (completedTasks.includes(foundTask.id)) {
                // Fallback for legacy completed tasks without submission records
                setSubmissionData({ status: 'approved', _legacy: true });
              }
            }
          }
        }
      } catch (e) {
        console.error("Error fetching task/submission:", e);
      }
    };
    fetchTaskAndSubmission();
  }, [id, completedTasks]);



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Complete task via backend API
      const taskResult = await completeTask(task.id, {
        taskId: task.id,
        taskData: {
          title: task.title,
          description: task.description,
          category: task.category,
          difficulty: task.difficulty,
          points: task.points,
          icon: task.icon,
          ...formData
        }
      });

      if (taskResult.success) {
        // Optimistically set pending
        setSubmissionData({
          status: 'pending',
          location: formData.location,
          reflection: formData.reflection,
          proof: formData.proof,
          submittedAt: new Date().toISOString()
        });
        
        // Reload user progress to sync local state
        if (loadUserProgress) {
          await loadUserProgress();
        }
        alert('Task submitted! It is now pending teacher review.');
      } else {
        alert(taskResult.error || 'Failed to submit task');
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Task not found
          </h2>
          <Link to="/tasks" className="text-primary-600 hover:text-primary-700">
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/tasks"
              className="text-primary-600 hover:text-primary-700 mb-4 inline-block text-sm sm:text-base"
            >
              ← Back to Tasks
            </Link>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="text-5xl sm:text-6xl">{task.icon}</div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                    {task.title}
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="bg-primary-100 text-primary-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      {task.category}
                    </span>
                    <span className="text-yellow-600 font-semibold text-sm sm:text-base">
                      ⭐ {task.points} points
                    </span>
                  </div>
                </div>
              </div>

              {submissionData?.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">✓</span>
                    <span className="text-green-800 font-semibold">
                      Task approved! You earned {submissionData.awardedPoints || task.points} points!
                    </span>
                  </div>
                  {submissionData.teacherRemarks && (
                    <p className="mt-2 text-green-700 italic">Teacher remarks: "{submissionData.teacherRemarks}"</p>
                  )}
                </div>
              )}
              
              {submissionData?.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <span className="text-2xl">✗</span>
                    <div>
                      <span className="text-red-800 font-semibold block">
                        Task returned for revision.
                      </span>
                      {submissionData.rejectionReason && (
                        <p className="mt-1 text-red-700">Reason: <span className="italic">"{submissionData.rejectionReason}"</span></p>
                      )}
                      <p className="mt-2 text-sm text-red-600 font-medium">Please review the feedback and submit again below.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {submissionData?.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">⏳</span>
                    <span className="text-yellow-800 font-semibold">
                      Task submitted and pending teacher review.
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-yellow-700">Points will be awarded once your teacher approves the submission.</p>
                </div>
              )}

              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  Instructions
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  {task.instructions ? task.instructions.map((instruction, index) => (
                    <li key={index} className="pl-2">
                      {instruction}
                    </li>
                  )) : (
                    <li className="pl-2">{task.description}</li>
                  )}
                </ol>
              </div>

              {(!submissionData || submissionData.status === 'rejected') ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="proof"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Proof / Evidence
                    </label>
                    <textarea
                      id="proof"
                      name="proof"
                      required
                      value={formData.proof}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="Describe what you did or paste a link to proof"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="Enter the location where you completed the task"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reflection"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Reflection
                    </label>
                    <textarea
                      id="reflection"
                      name="reflection"
                      value={formData.reflection}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="Share your experience and what you learned from this task..."
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : (submissionData?.status === 'rejected' ? "Resubmit Task" : "Submit Task")}
                  </Button>
                </form>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Your Submission Details
                  </h3>
                  {submissionData.proof && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Proof / Evidence:
                      </p>
                      <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-100 shadow-sm mt-1 whitespace-pre-wrap break-words">
                        {submissionData.proof}
                      </p>
                    </div>
                  )}
                  {submissionData.location && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Location:
                      </p>
                      <p className="text-gray-600">{submissionData.location}</p>
                    </div>
                  )}
                  {submissionData.reflection && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Reflection:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line bg-white p-3 rounded-lg border border-gray-100 shadow-sm mt-1">
                        "{submissionData.reflection}"
                      </p>
                    </div>
                  )}
                  {submissionData._legacy && (
                     <p className="text-sm text-gray-500 italic mt-4">Legacy submission record.</p>
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
