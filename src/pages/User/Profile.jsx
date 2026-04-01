import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { calculateLevel } from "../../utils/helpers";
import { LEVELS } from "../../utils/constants";
import { updateUserProfile } from "../../services/authService";
import Sidebar from "../../components/common/Sidebar";
import Button from "../../components/common/Button";

const Profile = () => {
  const { user, points, badges, completedLessons, completedTasks, quizScores, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "👤",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const level = calculateLevel(points);
  const levelInfo = Object.values(LEVELS).find((l) => l.name === level);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await updateUserProfile(user._id || user.id, {
        name: formData.name,
        avatar: formData.avatar
      });

      if (result.success) {
        updateUser(result.user);
        setIsEditing(false);
        setSuccessMessage(result.message || "Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setSuccessMessage(result.error || "Failed to update profile");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setSuccessMessage("An error occurred. Please try again.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "👤",
    });
    setIsEditing(false);
  };

  const avatars = ["👤", "👨", "👩", "🧑", "👨‍🎓", "👩‍🎓", "🌿", "🌱"];

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen animated-bg">
      <Sidebar />
      <div className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {successMessage}
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                <div className="text-6xl sm:text-7xl lg:text-8xl">{formData.avatar}</div>
                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {user?.name}
                      </h2>
                      <p className="text-lg text-gray-600 mb-1">
                        {user?.email}
                      </p>
                      <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                        {user?.role}
                      </span>
                    </>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avatar
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {avatars.map((avatar) => (
                            <button
                              key={avatar}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, avatar })
                              }
                              className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                                formData.avatar === avatar
                                  ? "border-primary-600 bg-primary-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              {avatar}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button type="submit" variant="primary">
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {points}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {level}
                </div>
                <div className="text-sm text-gray-600">Current Level</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {completedLessons.length}
                </div>
                <div className="text-sm text-gray-600">Lessons</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {completedTasks.length}
                </div>
                <div className="text-sm text-gray-600">Tasks</div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Learning Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Lessons Completed
                    </span>
                    <span className="text-sm text-gray-600">
                      {completedLessons.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tasks Completed
                    </span>
                    <span className="text-sm text-gray-600">
                      {completedTasks.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Badges Earned
                    </span>
                    <span className="text-sm text-gray-600">
                      {badges.length} / 10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${(badges.length / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                {totalQuizzes > 0 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Average Quiz Score
                      </span>
                      <span className="text-sm text-gray-600">
                        {averageQuizScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${averageQuizScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Recent Achievements
              </h3>
              {badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.slice(-4).map((badge) => (
                    <div
                      key={badge.id}
                      className="text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="text-sm font-semibold text-gray-800">
                        {badge.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No achievements yet. Start learning to earn badges!
                </p>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
