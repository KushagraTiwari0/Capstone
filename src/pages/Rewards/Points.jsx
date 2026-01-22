import { useUser } from "../../context/UserContext";
import { calculateLevel } from "../../utils/helpers";
import { LEVELS } from "../../utils/constants";
import Sidebar from "../../components/common/Sidebar";

const Points = () => {
  const { points, badges, completedLessons, completedTasks, quizScores } =
    useUser();
  const level = calculateLevel(points);
  const levelInfo = Object.values(LEVELS).find((l) => l.name === level);
  const nextLevel = Object.values(LEVELS).find((l) => l.min > points);
  const progressToNext = nextLevel
    ? ((points - levelInfo.min) / (nextLevel.min - levelInfo.min)) * 100
    : 100;

  const totalQuizzes = Object.keys(quizScores).length;
  const averageQuizScore =
    totalQuizzes > 0
      ? Math.round(
          Object.values(quizScores).reduce(
            (sum, score) => sum + score.percentage,
            0
          ) / totalQuizzes
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Points & Progress
              </h1>
              <p className="text-gray-600">
                Track your eco-learning journey and achievements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">⭐</div>
                  <div className="text-5xl font-bold text-primary-600 mb-2">
                    {points}
                  </div>
                  <p className="text-xl text-gray-600">Total Points</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <div className="text-5xl font-bold text-yellow-600 mb-2">
                    {level}
                  </div>
                  <p className="text-xl text-gray-600">Current Level</p>
                </div>
              </div>
            </div>

            {nextLevel && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Progress to {nextLevel.name}
                  </h2>
                  <span className="text-lg font-semibold text-gray-600">
                    {points} / {nextLevel.min} pts
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressToNext, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {nextLevel.min - points} more points needed to reach{" "}
                  {nextLevel.name}
                </p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {completedLessons.length}
                  </div>
                  <div className="text-sm text-gray-600">Lessons</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {completedTasks.length}
                  </div>
                  <div className="text-sm text-gray-600">Tasks</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {totalQuizzes}
                  </div>
                  <div className="text-sm text-gray-600">Quizzes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {badges.length}
                  </div>
                  <div className="text-sm text-gray-600">Badges</div>
                </div>
              </div>
            </div>

            {totalQuizzes > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Quiz Performance
                </h2>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    {averageQuizScore}%
                  </div>
                  <p className="text-gray-600">Average Quiz Score</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Points;
