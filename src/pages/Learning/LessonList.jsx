import { useState } from "react";
import { Link } from "react-router-dom";
import lessonsData from "../../data/lessons.json";
import { useUser } from "../../context/UserContext";
import { getDifficultyColor, calculateProgress } from "../../utils/helpers";
import Sidebar from "../../components/common/Sidebar";

const LessonList = () => {
  const { completedLessons } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(lessonsData.map((lesson) => lesson.category)),
  ];

  const filteredLessons =
    selectedCategory === "All"
      ? lessonsData
      : lessonsData.filter((lesson) => lesson.category === selectedCategory);

  const progress = calculateProgress(
    completedLessons.length,
    lessonsData.length
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Learning Modules
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Explore environmental topics and expand your knowledge
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Overall Progress
                </h2>
                <span className="text-xl sm:text-2xl font-bold text-primary-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {completedLessons.length} of {lessonsData.length} lessons
                completed
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
              {filteredLessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    to={`/lessons/${lesson.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-5xl">{lesson.image}</div>
                        {isCompleted && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {lesson.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {lesson.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="mr-1">⏱️</span>
                            {lesson.duration}
                          </span>
                          <span
                            className={`px-2 py-1 rounded ${getDifficultyColor(
                              lesson.difficulty
                            )}`}
                          >
                            {lesson.difficulty}
                          </span>
                        </div>
                        <span className="text-primary-600 font-semibold">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LessonList;
