import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/games/stats — get all game stats for the current user
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('gameStats');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // Return as a map: { gameId: { opens, plays, lastPlayedAt } }
    const statsMap = {};
    (user.gameStats || []).forEach((s) => {
      statsMap[s.gameId] = {
        opens: s.opens,
        plays: s.plays,
        lastPlayedAt: s.lastPlayedAt,
      };
    });

    res.json({ success: true, data: { stats: statsMap } });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch game stats' } });
  }
});

// POST /api/games/open — record a game open
router.post('/open', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({ success: false, error: { message: 'gameId is required' } });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const existing = user.gameStats.find((s) => s.gameId === gameId);
    if (existing) {
      existing.opens += 1;
    } else {
      user.gameStats.push({ gameId, opens: 1, plays: 0, lastPlayedAt: null });
    }

    await user.save();
    res.json({ success: true, message: 'Game open recorded' });
  } catch (error) {
    console.error('Record game open error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to record game open' } });
  }
});

// POST /api/games/play — record a game play session
router.post('/play', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({ success: false, error: { message: 'gameId is required' } });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const existing = user.gameStats.find((s) => s.gameId === gameId);
    if (existing) {
      existing.plays += 1;
      existing.lastPlayedAt = new Date();
    } else {
      user.gameStats.push({ gameId, opens: 0, plays: 1, lastPlayedAt: new Date() });
    }

    await user.save();
    res.json({ success: true, message: 'Game play recorded' });
  } catch (error) {
    console.error('Record game play error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to record game play' } });
  }
});

export default router;