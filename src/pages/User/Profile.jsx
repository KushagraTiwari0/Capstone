import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { updateUserProfile } from "../../services/authService";
import Sidebar from "../../components/common/Sidebar";
import Button from "../../components/common/Button";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AVATARS = ["👤", "👨", "👩", "🧑", "👨‍🎓", "👩‍🎓", "🌿", "🌱", "🦁", "🐯", "🦊", "🐧"];

// Points → level thresholds
const LEVEL_THRESHOLDS = [
  { name: "Expert",       min: 1000, color: "text-purple-600", bg: "bg-purple-100", icon: "🏆" },
  { name: "Advanced",     min: 500,  color: "text-blue-600",   bg: "bg-blue-100",   icon: "⚡" },
  { name: "Intermediate", min: 200,  color: "text-green-600",  bg: "bg-green-100",  icon: "🌟" },
  { name: "Beginner",     min: 0,    color: "text-gray-600",   bg: "bg-gray-100",   icon: "🌱" },
];

const getLevelInfo = (points) =>
  LEVEL_THRESHOLDS.find((l) => points >= l.min) || LEVEL_THRESHOLDS[3];

const nextLevelInfo = (points) => {
  const idx = LEVEL_THRESHOLDS.findIndex((l) => points >= l.min);
  return idx > 0 ? LEVEL_THRESHOLDS[idx - 1] : null; // null = already at max
};

const Profile = () => {
  const { user, points, badges, completedLessons, completedTasks, quizScores, updateUser } = useUser();

  // Live profile data fetched from API
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", avatar: "👤" });

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("geep_token");
      const [profileRes, progressRes] = await Promise.all([
        fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/users/me/progress`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const profileJson  = await profileRes.json();
      const progressJson = await progressRes.json();

      if (profileJson.success) {
        const u = profileJson.user;
        
        // 🌟 FIX: Use `exp` (Converted Points) instead of raw `totalPoints`
        const lessonPoints = progressJson.data?.points ?? u.points ?? 0;
        const gameExp = progressJson.data?.exp ?? u.exp ?? 0;
        
        setProfileData({
          ...u,
          points:           lessonPoints + gameExp, // This now safely equals your correct total!
          level:            progressJson.data?.level            ?? u.level  ?? "Beginner",
          badges:           progressJson.data?.badges           ?? [],
          completedLessons: progressJson.data?.completedLessons ?? [],
          completedTasks:   progressJson.data?.completedTasks   ?? [],
          quizScores:       progressJson.data?.quizScores       ?? {},
        });
        setFormData({ name: u.name, avatar: u.avatar || "👤" });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, msg) => {
    if (type === "success") { setSuccessMsg(msg); setErrorMsg(""); }
    else                    { setErrorMsg(msg);   setSuccessMsg(""); }
    setTimeout(() => { setSuccessMsg(""); setErrorMsg(""); }, 3500);
  };

  // ── Save profile ─────────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { showMsg("error", "Name cannot be empty"); return; }
    setSavingProfile(true);
    try {
      const result = await updateUserProfile(user._id || user.id, {
        name: formData.name.trim(),
        avatar: formData.avatar,
      });
      if (result.success) {
        updateUser(result.user);
        setProfileData(prev => ({ ...prev, name: result.user.name, avatar: result.user.avatar }));
        setIsEditing(false);
        showMsg("success", "Profile updated successfully!");
      } else {
        showMsg("error", result.error || "Failed to update profile");
      }
    } catch (err) {
      showMsg("error", "An error occurred. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) { showMsg("error", "New password must be at least 6 characters"); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { showMsg("error", "Passwords do not match"); return; }
    setSavingPassword(true);
    try {
      const token = localStorage.getItem("geep_token");
      const res = await fetch(`${API_BASE}/users/me/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
        showMsg("success", "Password changed successfully!");
      } else {
        showMsg("error", data.error?.message || "Failed to change password");
      }
    } catch (err) {
      showMsg("error", "An error occurred. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row w-full min-h-screen animated-bg">
        <Sidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="bg-white rounded-xl p-8 space-y-4">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const p = profileData;
  if (!p) return null;

  const totalPts   = p.points || 0;
  const levelInfo  = getLevelInfo(totalPts);
  const nextLevel  = nextLevelInfo(totalPts);
  const ptsToNext  = nextLevel ? nextLevel.min - totalPts : 0;
  const levelPct   = nextLevel
    ? Math.min(100, Math.round(((totalPts - levelInfo.min) / (nextLevel.min - levelInfo.min)) * 100))
    : 100;

  const earnedBadges  = p.badges?.filter(b => b.earned || b.badgeId) || [];
  const totalLessons  = p.completedLessons?.length || 0;
  const totalTasks    = p.completedTasks?.length   || 0;
  const quizScoreArr  = Object.values(p.quizScores || {});
  const avgQuiz       = quizScoreArr.length > 0
    ? Math.round(quizScoreArr.reduce((s, q) => s + (q.percentage || 0), 0) / quizScoreArr.length)
    : null;

  const isStudent = p.role === "student";
  const isTeacher = p.role === "teacher";
  const isAdmin   = p.role === "admin";

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen animated-bg">
      <Sidebar />
      <div className="flex-1 w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto w-full space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-1">
              My Profile
            </h1>
            <p className="text-sm text-gray-500">Manage your account and view your progress</p>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <span>✅</span> {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {/* ── Profile Card ─────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            {!isEditing ? (
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="text-7xl">{p.avatar || "👤"}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-800">{p.name}</h2>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                      isAdmin ? "bg-yellow-100 text-yellow-700" :
                      isTeacher ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {isAdmin ? "👑 Admin" : isTeacher ? "👨‍🏫 Teacher" : "👨‍🎓 Student"}
                    </span>
                    {!isAdmin && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                        Class {p.classLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{p.email}</p>
                  <p className="text-gray-400 text-xs">
                    Member since {new Date(p.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>

                  {/* Level badge for students */}
                  {isStudent && (
                    <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-sm font-semibold ${levelInfo.bg} ${levelInfo.color}`}>
                      {levelInfo.icon} {levelInfo.name}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>✏️ Edit Profile</Button>
                  <Button variant="outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                    🔒 {showPasswordForm ? "Cancel" : "Change Password"}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Profile</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text" value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map(av => (
                      <button type="button" key={av}
                        onClick={() => setFormData(p => ({ ...p, avatar: av }))}
                        className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                          formData.avatar === av ? "border-primary-500 bg-primary-50 scale-110" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >{av}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setFormData({ name: p.name, avatar: p.avatar }); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Password change form */}
            {showPasswordForm && !isEditing && (
              <form onSubmit={handlePasswordSave} className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <h3 className="text-base font-bold text-gray-800">Change Password</h3>
                {[
                  { key: "currentPassword", label: "Current Password", placeholder: "Your current password" },
                  { key: "newPassword",     label: "New Password",     placeholder: "At least 6 characters" },
                  { key: "confirmPassword", label: "Confirm New Password", placeholder: "Repeat new password" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="password" value={passwordData[key]} placeholder={placeholder}
                      onChange={e => setPasswordData(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      required
                    />
                  </div>
                ))}
                <Button type="submit" variant="primary" disabled={savingPassword}>
                  {savingPassword ? "Saving..." : "Update Password"}
                </Button>
              </form>
            )}
          </div>

          {/* ── Student-specific sections ────────────────────────────── */}
          {isStudent && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: "⭐", value: totalPts,     label: "Total Points",   color: "text-yellow-600" },
                  { icon: "📚", value: totalLessons,  label: "Lessons Done",   color: "text-blue-600"   },
                  { icon: "✅", value: totalTasks,    label: "Tasks Done",     color: "text-green-600"  },
                  { icon: "🏅", value: earnedBadges.length, label: "Badges Earned", color: "text-purple-600" },
                ].map(({ icon, value, label, color }) => (
                  <div key={label} className="bg-white rounded-xl shadow p-5 text-center">
                    <div className="text-3xl mb-1">{icon}</div>
                    <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>

              {/* Level progress */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800">Level Progress</h3>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${levelInfo.bg} ${levelInfo.color}`}>
                    {levelInfo.icon} {levelInfo.name}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${levelPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {nextLevel
                    ? `${ptsToNext} more points to reach ${nextLevel.icon} ${nextLevel.name}`
                    : "🎉 Maximum level reached!"}
                </p>
              </div>

              {/* Learning progress */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-5">Learning Progress</h3>
                <div className="space-y-4">
                  {[
                    { label: "Lessons Completed", value: totalLessons,  max: 10, pct: Math.min(100, (totalLessons / 10) * 100),  color: "bg-blue-500"   },
                    { label: "Tasks Completed",   value: totalTasks,    max: 10, pct: Math.min(100, (totalTasks   / 10) * 100),  color: "bg-green-500"  },
                    { label: "Badges Earned",     value: `${earnedBadges.length}`, max: 13, pct: Math.min(100, (earnedBadges.length / 13) * 100), color: "bg-yellow-500" },
                    ...(avgQuiz !== null ? [{ label: "Avg Quiz Score", value: `${avgQuiz}%`, max: 100, pct: avgQuiz, color: "bg-purple-500" }] : []),
                  ].map(({ label, value, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <span className="text-sm text-gray-500">{value}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent badges */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Badges</h3>
                {earnedBadges.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {earnedBadges.slice(-4).map((b, i) => {
                      const badge = b.badgeId || b;
                      return (
                        <div key={i} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="text-4xl mb-2">{badge.icon || "🏅"}</div>
                          <div className="text-xs font-semibold text-gray-700 line-clamp-2">{badge.name || "Badge"}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <span className="text-4xl block mb-2">🏅</span>
                    <p className="text-sm">No badges yet — complete lessons and tasks to earn them!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Teacher-specific sections ─────────────────────────────── */}
          {isTeacher && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5">Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full Name",    value: p.name },
                  { label: "Email",        value: p.email },
                  { label: "Role",         value: "Teacher" },
                  { label: "Class Level",  value: `Class ${p.classLevel}` },
                  { label: "Status",       value: p.status === "approved" ? "✅ Approved" : "⏳ Pending" },
                  { label: "Member Since", value: new Date(p.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
                    <p className="text-gray-800 font-semibold text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Admin-specific sections ───────────────────────────────── */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5">Admin Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full Name",    value: p.name },
                  { label: "Email",        value: p.email },
                  { label: "Role",         value: "👑 Administrator" },
                  { label: "Status",       value: "✅ Active" },
                  { label: "Member Since", value: new Date(p.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
                    <p className="text-gray-800 font-semibold text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;