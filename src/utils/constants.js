export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

export const TASK_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

export const BADGES = [
  {
    id: 1,
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "🌱",
    points: 50
  },
  {
    id: 2,
    name: "Quiz Master",
    description: "Score 100% on any quiz",
    icon: "🏆",
    points: 100
  },
  {
    id: 3,
    name: "Task Champion",
    description: "Complete 5 eco tasks",
    icon: "⭐",
    points: 150
  },
  {
    id: 4,
    name: "Tree Planter",
    description: "Complete the tree planting task",
    icon: "🌳",
    points: 100
  },
  {
    id: 5,
    name: "Waste Warrior",
    description: "Complete waste segregation task",
    icon: "♻️",
    points: 75
  },
  {
    id: 6,
    name: "Energy Saver",
    description: "Complete energy audit task",
    icon: "⚡",
    points: 80
  },
  {
    id: 7,
    name: "Community Hero",
    description: "Complete community cleanup",
    icon: "🧹",
    points: 90
  },
  {
    id: 8,
    name: "Compost King",
    description: "Complete composting setup",
    icon: "🌿",
    points: 85
  },
  {
    id: 9,
    name: "Water Wise",
    description: "Complete water conservation challenge",
    icon: "💧",
    points: 70
  },
  {
    id: 10,
    name: "Top Performer",
    description: "Reach top 10 in leaderboard",
    icon: "👑",
    points: 200
  }
];

export const LEVELS = {
  BEGINNER: { min: 0, max: 500, name: "Beginner" },
  INTERMEDIATE: { min: 501, max: 1000, name: "Intermediate" },
  ADVANCED: { min: 1001, max: 1500, name: "Advanced" },
  EXPERT: { min: 1501, max: Infinity, name: "Expert" }
};

