import { useState } from "react";
import { Link } from "react-router-dom";
import tasksData from "../../data/tasks.json";
import { useUser } from "../../context/UserContext";
import { getDifficultyColor } from "../../utils/helpers";
import Sidebar from "../../components/common/Sidebar";

const TaskList = () => {
  const { completedTasks } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(tasksData.map((task) => task.category)),
  ];

  const filteredTasks =
    selectedCategory === "All"
      ? tasksData
      : tasksData.filter((task) => task.category === selectedCategory);

  const getStatusBadge = (taskId) => {
    if (completedTasks.includes(taskId)) {
      return (
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
          ✓ Completed
        </span>
      );
    }
    return (
      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
        Pending
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredTasks.map((task) => {
                const isCompleted = completedTasks.includes(task.id);
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
                          isCompleted
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "bg-primary-600 text-white hover:bg-primary-700"
                        }`}
                      >
                        {isCompleted ? "View Details" : "Start Task"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskList;
