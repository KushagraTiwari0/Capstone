import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Helper: count only unique, valid earned badges ────────────────────────────
// The badges array stores { badgeId, earnedAt } objects.
// We deduplicate by badgeId string to avoid double-counting.
const countUniqueBadges = (badgesArr) => {
  if (!Array.isArray(badgesArr) || badgesArr.length === 0) return 0;
  const seen = new Set();
  for (const b of badgesArr) {
    if (b && b.badgeId) {
      seen.add(b.badgeId.toString());
    }
  }
  return seen.size;
};

// GET /api/leaderboard
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, level, page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const requestedRole = (role || 'student').toString().toLowerCase();
    if (!['student', 'teacher'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        error: { message: 'role must be either "student" or "teacher"' },
      });
    }

    let me = null;
    if (req.userId) {
      me = await User.findById(req.userId).select('points role status classLevel').lean();
    }

    const baseQuery = { role: requestedRole, status: 'approved' };

    // Students scoped to their classLevel (unless admin is viewing)
    if (requestedRole === 'student' && me?.classLevel && me?.role !== 'admin') {
      baseQuery.classLevel = me.classLevel;
    }
    if (level) {
      baseQuery.level = new RegExp(`^${level}$`, 'i');
    }

    const total = await User.countDocuments(baseQuery);

    const users = await User.find(baseQuery)
      .select('name avatar points level badges quizScores role')
      .sort({ points: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const leaderboardUsers = users.map((u, idx) => ({
      id:         u._id,
      name:       u.name,
      avatar:     u.avatar || '👤',
      points:     u.points || 0,
      level:      u.level  || 'Beginner',
      role:       u.role,
      // ✅ FIX: deduplicated badge count
      badges:     countUniqueBadges(u.badges),
      // ✅ FIX: correct average quiz score from quizScores array
      avgQuiz:    calcAvgQuiz(u.quizScores),
      rank:       skip + idx + 1,
    }));

    // Current user rank
    let currentUserRank = null;
    if (me && me.role === requestedRole && (me.status === 'approved' || !me.status)) {
      const betterCount = await User.countDocuments({
        ...baseQuery,
        points: { $gt: me.points || 0 },
      });
      currentUserRank = betterCount + 1;
    }

    res.json({
      success: true,
      data: {
        users: leaderboardUsers,
        currentUserRank,
        pagination: {
          total,
          page:  pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while fetching leaderboard' },
    });
  }
});

// GET /api/leaderboard/top?limit=5
router.get('/top', authMiddleware, async (req, res) => {
  try {
    const limitNum      = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const requestedRole = ((req.query.role || 'student') + '').toLowerCase();

    if (!['student', 'teacher'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        error: { message: 'role must be either "student" or "teacher"' },
      });
    }

    let me = null;
    if (req.userId) {
      me = await User.findById(req.userId).select('classLevel role').lean();
    }

    const baseQuery = { role: requestedRole, status: 'approved' };
    if (requestedRole === 'student' && me?.role !== 'admin' && me?.classLevel) {
      baseQuery.classLevel = me.classLevel;
    }

    const users = await User.find(baseQuery)
      .select('name avatar points level badges quizScores role')
      .sort({ points: -1, updatedAt: -1 })
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        users: users.map((u, idx) => ({
          id:      u._id,
          name:    u.name,
          avatar:  u.avatar || '👤',
          points:  u.points || 0,
          level:   u.level  || 'Beginner',
          role:    u.role,
          badges:  countUniqueBadges(u.badges),
          avgQuiz: calcAvgQuiz(u.quizScores),
          rank:    idx + 1,
        })),
      },
    });
  } catch (error) {
    console.error('Get top leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while fetching top users' },
    });
  }
});

// ── Helper: average quiz percentage from quizScores array ────────────────────
// quizScores is [{ quizId, score, total, percentage, date }]
// Returns rounded integer or null if no scores
function calcAvgQuiz(quizScores) {
  if (!Array.isArray(quizScores) || quizScores.length === 0) return null;
  const valid = quizScores.filter(q => typeof q.percentage === 'number');
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, q) => sum + q.percentage, 0) / valid.length);
}

export default router;