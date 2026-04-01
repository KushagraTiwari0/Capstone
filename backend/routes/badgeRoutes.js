import express from 'express';
import Badge from '../models/Badge.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin middleware
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: { message: 'Error verifying admin access' } });
  }
};

// ─── Helper: check & award all eligible badges for a user ────────────────────
export const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const allBadges = await Badge.find().sort({ order: 1 });
    const earnedBadgeIds = new Set(user.badges.map(b => b.badgeId.toString()));

    const newlyAwarded = [];

    for (const badge of allBadges) {
      // Skip already earned
      if (earnedBadgeIds.has(badge._id.toString())) continue;

      const { pointsRequired, lessonsRequired, tasksRequired } = badge.criteria;

      const meetsPoints  = (pointsRequired  || 0) <= (user.points || 0);
      const meetsLessons = (lessonsRequired || 0) <= (user.completedLessons?.length || 0);
      const meetsTasks   = (tasksRequired   || 0) <= (user.completedTasks?.length  || 0);

      if (meetsPoints && meetsLessons && meetsTasks) {
        // Award badge
        user.badges.push({ badgeId: badge._id, earnedAt: new Date() });
        // Add badge bonus points
        if (badge.points > 0) {
          user.points = (user.points || 0) + badge.points;
        }
        newlyAwarded.push(badge);
      }
    }

    if (newlyAwarded.length > 0) {
      await user.save();
    }

    return newlyAwarded;
  } catch (err) {
    console.error('checkAndAwardBadges error:', err);
    return [];
  }
};

// GET /api/badges — all badges + which ones the student has earned
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const allBadges = await Badge.find().sort({ order: 1 });
    const earnedMap = new Map(
      user.badges.map(b => [b.badgeId.toString(), b.earnedAt])
    );

    const badgesWithStatus = allBadges.map(badge => ({
      ...badge.toObject(),
      earned: earnedMap.has(badge._id.toString()),
      earnedAt: earnedMap.get(badge._id.toString()) || null,
    }));

    res.json({
      success: true,
      data: {
        badges: badgesWithStatus,
        stats: {
          earned: earnedMap.size,
          total: allBadges.length,
          points: user.points || 0,
          completedLessons: user.completedLessons?.length || 0,
          completedTasks: user.completedTasks?.length || 0,
        }
      }
    });
  } catch (err) {
    console.error('Get badges error:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch badges' } });
  }
});

// POST /api/badges/check — trigger badge check for current user (call after points/lessons/tasks update)
router.post('/check', authMiddleware, async (req, res) => {
  try {
    const newlyAwarded = await checkAndAwardBadges(req.userId);
    res.json({
      success: true,
      data: { newlyAwarded },
      message: newlyAwarded.length > 0
        ? `You earned ${newlyAwarded.length} new badge${newlyAwarded.length > 1 ? 's' : ''}!`
        : 'No new badges yet — keep going!'
    });
  } catch (err) {
    console.error('Check badges error:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to check badges' } });
  }
});

// ── Admin: Create badge ───────────────────────────────────────────────────────
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, icon, points, criteria, order } = req.body;
    if (!name || !description || !icon) {
      return res.status(400).json({ success: false, error: { message: 'Name, description, and icon are required' } });
    }
    const badge = new Badge({ name, description, icon, points: points || 0, criteria: criteria || {}, order: order || 0 });
    await badge.save();
    res.status(201).json({ success: true, data: { badge }, message: 'Badge created' });
  } catch (err) {
    console.error('Create badge error:', err);
    res.status(500).json({ success: false, error: { message: err.message || 'Failed to create badge' } });
  }
});

// ── Admin: Update badge ───────────────────────────────────────────────────────
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!badge) return res.status(404).json({ success: false, error: { message: 'Badge not found' } });
    res.json({ success: true, data: { badge }, message: 'Badge updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: 'Failed to update badge' } });
  }
});

// ── Admin: Delete badge ───────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) return res.status(404).json({ success: false, error: { message: 'Badge not found' } });
    res.json({ success: true, message: 'Badge deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: 'Failed to delete badge' } });
  }
});

// ── Admin: Seed default badges ────────────────────────────────────────────────
router.post('/seed', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const defaultBadges = [
      // Points-based
      { name: 'First Steps',      icon: '🌱', description: 'Complete your first lesson',           points: 10,  criteria: { lessonsRequired: 1  },              order: 1  },
      { name: 'Point Collector',  icon: '⭐', description: 'Earn your first 50 points',            points: 15,  criteria: { pointsRequired: 50  },              order: 2  },
      { name: 'Rising Star',      icon: '🌟', description: 'Reach 200 points',                     points: 25,  criteria: { pointsRequired: 200 },              order: 3  },
      { name: 'Eco Warrior',      icon: '⚔️', description: 'Reach 500 points',                     points: 50,  criteria: { pointsRequired: 500 },              order: 4  },
      { name: 'Planet Champion',  icon: '🏆', description: 'Reach 1000 points',                    points: 100, criteria: { pointsRequired: 1000 },             order: 5  },
      // Lessons-based
      { name: 'Curious Learner',  icon: '📖', description: 'Complete 3 lessons',                   points: 20,  criteria: { lessonsRequired: 3  },              order: 6  },
      { name: 'Knowledge Seeker', icon: '🔬', description: 'Complete 5 lessons',                   points: 35,  criteria: { lessonsRequired: 5  },              order: 7  },
      { name: 'Eco Scholar',      icon: '🎓', description: 'Complete all lessons in your class',   points: 75,  criteria: { lessonsRequired: 10 },              order: 8  },
      // Tasks-based
      { name: 'Action Taker',     icon: '✅', description: 'Complete your first task',             points: 15,  criteria: { tasksRequired: 1   },              order: 9  },
      { name: 'Go-Getter',        icon: '🚀', description: 'Complete 3 tasks',                     points: 30,  criteria: { tasksRequired: 3   },              order: 10 },
      { name: 'Task Master',      icon: '💪', description: 'Complete 5 tasks',                     points: 60,  criteria: { tasksRequired: 5   },              order: 11 },
      // Combined
      { name: 'Well Rounded',     icon: '🌍', description: 'Earn 100 pts, 2 lessons & 2 tasks',   points: 40,  criteria: { pointsRequired: 100, lessonsRequired: 2, tasksRequired: 2 }, order: 12 },
      { name: 'Eco Legend',       icon: '🦁', description: 'Earn 500 pts, 5 lessons & 5 tasks',   points: 150, criteria: { pointsRequired: 500, lessonsRequired: 5, tasksRequired: 5 }, order: 13 },
    ];

    let created = 0;
    for (const b of defaultBadges) {
      const exists = await Badge.findOne({ name: b.name });
      if (!exists) { await Badge.create(b); created++; }
    }

    res.json({ success: true, message: `Seeded ${created} new badges (${defaultBadges.length - created} already existed)` });
  } catch (err) {
    console.error('Seed badges error:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to seed badges' } });
  }
});

export default router;