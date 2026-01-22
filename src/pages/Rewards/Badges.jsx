import { BADGES } from "../../utils/constants";
import { useUser } from "../../context/UserContext";
import Sidebar from "../../components/common/Sidebar";

const Badges = () => {
  const { badges } = useUser();
  const earnedBadgeIds = badges.map((b) => b.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Eco Badges
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Collect badges by completing lessons, quizzes, and tasks
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                    Your Collection
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    You've earned {earnedBadgeIds.length} out of {BADGES.length}{" "}
                    badges
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-primary-600">
                  {Math.round((earnedBadgeIds.length / BADGES.length) * 100)}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div
                  className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${(earnedBadgeIds.length / BADGES.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {BADGES.map((badge) => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`bg-white rounded-lg shadow-md p-4 sm:p-6 text-center transition-all ${
                      isEarned
                        ? "border-2 border-primary-500 transform hover:scale-105"
                        : "opacity-50 border-2 border-gray-200"
                    }`}
                  >
                    <div
                      className={`text-5xl sm:text-6xl mb-3 sm:mb-4 ${isEarned ? "" : "grayscale"}`}
                    >
                      {badge.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                      {badge.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {badge.description}
                    </p>
                    <div className="flex items-center justify-center space-x-1 text-yellow-600">
                      <span>⭐</span>
                      <span className="font-semibold">{badge.points} pts</span>
                    </div>
                    {isEarned && (
                      <div className="mt-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                        ✓ Earned
                      </div>
                    )}
                    {!isEarned && (
                      <div className="mt-4 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                        Locked
                      </div>
                    )}
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

export default Badges;
