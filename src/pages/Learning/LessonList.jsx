import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getDifficultyColor } from "../../utils/helpers";
import Sidebar from "../../components/common/Sidebar";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LessonList = () => {
  const { completedLessons } = useUser();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => { fetchLessons(); }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('geep_token');
      const res = await fetch(`${API_BASE}/lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setLessons(data.data.lessons);
      else setError(data.error?.message || 'Failed to load lessons');
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(lessons.map((l) => l.category))];
  const filteredLessons = selectedCategory === "All" ? lessons : lessons.filter((l) => l.category === selectedCategory);

  // FIX 1: Only count completedLessons IDs that actually exist in current DB lessons
  // This removes stale numeric IDs from the old JSON file that inflate the count
  const validLessonIds = new Set(lessons.map((l) => String(l._id)));
  const validCompletedCount = completedLessons.filter((id) => validLessonIds.has(String(id))).length;

  // FIX 2: Cap at 100%, guard division by zero
  const progress = lessons.length === 0 ? 0 : Math.min(100, Math.round((validCompletedCount / lessons.length) * 100));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">

            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Learning Modules</h1>
              <p className="text-sm sm:text-base text-gray-600">Explore environmental topics and expand your knowledge</p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Overall Progress</h2>
                <span className="text-xl sm:text-2xl font-bold text-primary-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-primary-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-gray-600 mt-2">{validCompletedCount} of {lessons.length} lessons completed</p>
            </div>

            {/* Category Filter */}
            {!loading && lessons.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button key={category} onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category ? "bg-primary-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}>
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4" />
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <span className="text-4xl mb-3 block">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
                <button onClick={fetchLessons} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Try Again</button>
              </div>
            )}

            {/* Empty — no lessons */}
            {!loading && !error && lessons.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-7xl mb-6">🌱</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-3">Lessons Coming Soon!</h2>
                <p className="text-gray-500 max-w-md text-base leading-relaxed">
                  Your teacher or admin hasn't added any lessons for your class yet. Check back soon!
                </p>
                <div className="mt-8 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-6 py-4">
                  <span className="text-2xl">📬</span>
                  <p className="text-green-700 text-sm font-medium">You'll be notified once new lessons are available.</p>
                </div>
              </div>
            )}

            {/* Empty — filter */}
            {!loading && !error && lessons.length > 0 && filteredLessons.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No lessons in this category</h3>
                <p className="text-gray-500">Try selecting a different category above.</p>
              </div>
            )}

            {/* Lessons Grid */}
            {!loading && !error && filteredLessons.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredLessons.map((lesson) => {
                  // FIX 3: String comparison handles ObjectId vs string mismatch
                  const isCompleted = completedLessons.some((id) => String(id) === String(lesson._id));
                  return (
                    <Link key={lesson._id} to={`/lessons/${lesson._id}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-5xl">{lesson.image}</div>
                          {isCompleted && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">✓ Done</span>
                          )}
                        </div>
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">{lesson.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{lesson.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>⏱️ {lesson.duration}</span>
                            <span className={`px-2 py-1 rounded ${getDifficultyColor(lesson.difficulty)}`}>{lesson.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-600 font-semibold text-sm">⭐ {lesson.points}</div>
                        </div>
                        {lesson.videoUrl && <div className="mt-3 flex items-center gap-1 text-xs text-blue-500"><span>🎥</span> Includes video</div>}
                        {lesson.quiz?.length > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-purple-500">
                            <span>📝</span> {lesson.quiz.length} quiz question{lesson.quiz.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default LessonList;