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
    image: null,
    imagePreview: null,
    location: "",
    reflection: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const foundTask = tasksData.find((t) => t.id === parseInt(id));
    if (foundTask) {
      setTask(foundTask);
      setSubmitted(completedTasks.includes(foundTask.id));
    }
  }, [id, completedTasks]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
      if (!completedTasks.includes(task.id)) {
        const taskResult = await completeTask(task.id, {
          taskId: task.id,
          taskData: {
            title: task.title,
            description: task.description,
            category: task.category,
            difficulty: task.difficulty,
            points: task.points,
            icon: task.icon
          }
        });

        if (taskResult.success) {
          // Update local state for immediate UI feedback
          completeTaskLocal(task.id);
          
          // Reload user progress from backend (this will update points, level, etc.)
          if (loadUserProgress) {
            await loadUserProgress();
          }

          // Award specific badges based on task
          let badgeToAward = null;
          if (task.id === 1) {
            badgeToAward = {
              id: 4,
              name: "Tree Planter",
              description: "Complete the tree planting task",
              icon: "🌳",
            };
          } else if (task.id === 2) {
            badgeToAward = {
              id: 5,
              name: "Waste Warrior",
              description: "Complete waste segregation task",
              icon: "♻️",
            };
          } else if (task.id === 3) {
            badgeToAward = {
              id: 6,
              name: "Energy Saver",
              description: "Complete energy audit task",
              icon: "⚡",
            };
          } else if (task.id === 4) {
            badgeToAward = {
              id: 7,
              name: "Community Hero",
              description: "Complete community cleanup",
              icon: "🧹",
            };
          } else if (task.id === 5) {
            badgeToAward = {
              id: 8,
              name: "Compost King",
              description: "Complete composting setup",
              icon: "🌿",
            };
          } else if (task.id === 6) {
            badgeToAward = {
              id: 9,
              name: "Water Wise",
              description: "Complete water conservation challenge",
              icon: "💧",
            };
          }

          // Award badge via backend API if applicable
          if (badgeToAward) {
            const badgeResult = await awardBadge(badgeToAward.id, {
              badgeId: badgeToAward.id,
              badgeData: badgeToAward
            });

            if (badgeResult.success) {
              addBadge(badgeToAward);
              // Reload user progress again to get updated badge info
              if (loadUserProgress) {
                await loadUserProgress();
              }
            }
          }
        } else {
          alert(taskResult.error || 'Failed to complete task');
        }
      }

      setIsSubmitting(false);
      setSubmitted(true);
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

              {submitted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">✓</span>
                    <span className="text-green-800 font-semibold">
                      Task submitted successfully! You earned {task.points}{" "}
                      points!
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  Instructions
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  {task.instructions.map((instruction, index) => (
                    <li key={index} className="pl-2">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="image"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Upload Photo Evidence
                    </label>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {formData.imagePreview && (
                      <div className="mt-4">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full max-w-md rounded-lg shadow-md"
                        />
                      </div>
                    )}
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
                    {isSubmitting ? "Submitting..." : "Submit Task"}
                  </Button>
                </form>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Submission Details
                  </h3>
                  {formData.imagePreview && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Photo:
                      </p>
                      <img
                        src={formData.imagePreview}
                        alt="Submission"
                        className="max-w-md rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  {formData.location && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Location:
                      </p>
                      <p className="text-gray-600">{formData.location}</p>
                    </div>
                  )}
                  {formData.reflection && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Reflection:
                      </p>
                      <p className="text-gray-600 whitespace-pre-line">
                        {formData.reflection}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Status:</span> Pending
                      verification
                    </p>
                  </div>
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
