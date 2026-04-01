import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import tasksData from "../../data/tasks.json";
import { useUser } from "../../context/UserContext";
import { getDifficultyColor } from "../../utils/helpers";
import Sidebar from "../../components/common/Sidebar";

const TaskList = () => {
  const { user, completedTasks } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dynamicTasks, setDynamicTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasksAndSubmissions = async () => {
      try {
        const token = localStorage.getItem("geep_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const [tasksRes, subRes] = await Promise.all([
           fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/tasks`, { headers }),
           token ? fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users/me/task-submissions`, { headers }) : Promise.resolve(null)
        ]);

        if (tasksRes.ok) {
          const data = await tasksRes.json();
          if (data.success) {
            const normalized = data.data.tasks.map(t => ({
              ...t,
              id: t._id // Use _id as id for frontend logic
            }));
            setDynamicTasks(normalized);
          }
        }

        if (subRes && subRes.ok) {
           const subData = await subRes.json();
           if (subData.success) {
             setSubmissions(subData.data.submissions || []);
           }
        }
      } catch (e) {
        console.error("Error fetching tasks/submissions:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasksAndSubmissions();
  }, []);

  const classFilteredTasks = user?.role !== 'admin' && user?.classLevel
    ? (tasksData || []).filter((task) => task.classLevel === user.classLevel)
    : (tasksData || []);

  const allFilteredTasks = [...classFilteredTasks, ...(dynamicTasks || [])];

  const categories = [
    "All",
    ...new Set(allFilteredTasks.map((task) => task.category)),
  ];

  const filteredTasks =
    selectedCategory === "All"
      ? allFilteredTasks
      : allFilteredTasks.filter((task) => task.category === selectedCategory);

  const getTaskStatusInfo = (taskId) => {
    // Check submissions first
    const submission = submissions.find(s => 
      s.taskId === taskId || s.taskId === taskId.toString()
    );

    if (submission) {
      if (submission.status === 'approved') return { label: '✓ Approved', color: 'bg-green-100 text-green-800', isDone: true };
      if (submission.status === 'rejected') return { label: '✗ Rejected', color: 'bg-red-100 text-red-800', isDone: false };
      return { label: '⏳ Pending Review', color: 'bg-yellow-100 text-yellow-800', isDone: true }; // Treat pending as done so they can't resubmit right away
    }

    // Fallback to legacy completed list
    if (completedTasks && completedTasks.includes(taskId)) {
      return { label: '✓ Completed', color: 'bg-green-100 text-green-800', isDone: true };
    }

    return { label: 'Pending', color: 'bg-gray-100 text-gray-800', isDone: false };
  };

  const getStatusBadge = (taskId) => {
    const { label, color } = getTaskStatusInfo(taskId);
    return (
      <span className={`${color} px-3 py-1 rounded-full text-sm font-semibold`}>
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Eco Tasks
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Complete real-world environmental tasks and earn points
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : allFilteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl shadow-sm border border-primary-100 text-center">
                <div className="text-6xl mb-4 animate-bounce-slow">🌱</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                  No Tasks Assigned Yet
                </h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8 text-sm sm:text-base">
                  Your teacher hasn't assigned any eco tasks for your class yet.
                  Check back later and keep learning about the environment!
                </p>
                <Link
                  to="/lessons"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Go to Lessons
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedCategory === category
                            ? "bg-primary-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500">
                    No tasks found for this category.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredTasks.map((task) => {
                      const statusInfo = getTaskStatusInfo(task.id);
                      const isCompletedOrPending = statusInfo.isDone;
                      return (
                        <div
                          key={task.id}
                          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="text-5xl">{task.icon}</div>
                              {getStatusBadge(task.id)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              {task.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3 text-sm">
                                <span
                                  className={`px-2 py-1 rounded ${getDifficultyColor(
                                    task.difficulty
                                  )}`}
                                >
                                  {task.difficulty}
                                </span>
                                <span className="flex items-center text-yellow-600 font-semibold">
                                  <span className="mr-1">⭐</span>
                                  {task.points} pts
                                </span>
                              </div>
                            </div>
                            <Link
                              to={`/tasks/${task.id}/submit`}
                              className={`block text-center py-2 rounded-lg font-semibold transition-colors ${
                                isCompletedOrPending
                                  ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                  : "bg-primary-600 text-white hover:bg-primary-700"
                              }`}
                            >
                              {isCompletedOrPending ? "View Details" : "Start Task"}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskList;
