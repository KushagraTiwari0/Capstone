import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Leaderboard (defaults to students; excludes admins)
// GET /api/leaderboard?role=student|teacher&level=beginner|intermediate|advanced|expert&page=1&limit=20
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, level, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const requestedRole = (role || 'student').toString().toLowerCase();
    if (!['student', 'teacher'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        error: { message: 'role must be either "student" or "teacher"' },
      });
    }

    const baseQuery = { 
      role: requestedRole,
      status: 'approved' // Only show approved users in leaderboard
    };
    if (level) {
      baseQuery.level = new RegExp(`^${level}$`, 'i');
    }

    const total = await User.countDocuments(baseQuery);

    const users = await User.find(baseQuery)
      .select('name avatar points level badges role')
      .sort({ points: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const leaderboardUsers = users.map((u, idx) => ({
      id: u._id,
      name: u.name,
      avatar: u.avatar || '👤',
      points: u.points || 0,
      level: u.level || 'Beginner',
      role: u.role,
      badges: Array.isArray(u.badges) ? u.badges.length : 0,
      rank: skip + idx + 1,
    }));

    // Current user rank (among approved non-admin leaderboard users)
    let currentUserRank = null;
    if (req.userId) {
      const me = await User.findById(req.userId).select('points role status').lean();
      // Only show rank if user is approved and matches requested role
      if (me && me.role === requestedRole && (me.status === 'approved' || !me.status)) {
        const betterCount = await User.countDocuments({
          ...baseQuery,
          points: { $gt: me.points || 0 },
        });
        currentUserRank = betterCount + 1;
      }
    }

    res.json({
      success: true,
      data: {
        users: leaderboardUsers,
        currentUserRank,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while fetching leaderboard',
      },
    });
  }
});

// GET /api/leaderboard/top?limit=5
router.get('/top', authMiddleware, async (req, res) => {
  try {
    const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const requestedRole = ((req.query.role || 'student') + '').toLowerCase();
    if (!['student', 'teacher'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        error: { message: 'role must be either "student" or "teacher"' },
      });
    }

    const users = await User.find({ 
      role: requestedRole,
      status: 'approved' // Only show approved users
    })
      .select('name avatar points level badges role')
      .sort({ points: -1, updatedAt: -1 })
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        users: users.map((u, idx) => ({
          id: u._id,
          name: u.name,
          avatar: u.avatar || '👤',
          points: u.points || 0,
          level: u.level || 'Beginner',
          role: u.role,
          badges: Array.isArray(u.badges) ? u.badges.length : 0,
          rank: idx + 1,
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

export default router;

