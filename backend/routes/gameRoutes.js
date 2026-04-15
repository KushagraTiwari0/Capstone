import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/games/stats — get all game stats for the current user
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('gameStats totalPoints exp');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const statsMap = {};
    (user.gameStats || []).forEach((s) => {
      statsMap[s.gameId] = {
        opens: s.opens || 0,
        plays: s.plays || 0,
        points: s.points || 0,
        bestScore: s.bestScore || 0,
        lastPlayedAt: s.lastPlayedAt,
      };
    });

    res.json({ 
      success: true, 
      data: { 
        stats: statsMap,
        totalPoints: user.totalPoints || 0,
        exp: user.exp || 0
      } 
    });
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

    const statIndex = user.gameStats.findIndex((s) => s.gameId === gameId);
    if (statIndex !== -1) {
      user.gameStats[statIndex].opens += 1;
    } else {
      user.gameStats.push({ gameId, opens: 1, plays: 0, points: 0, bestScore: 0, lastPlayedAt: null });
    }

    user.markModified('gameStats'); 
    await user.save();
    
    res.json({ success: true, message: 'Game open recorded' });
  } catch (error) {
    console.error('Record game open error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to record game open' } });
  }
});

// POST /api/games/play — STRICT ANTI-FARMING LOGIC & CAP
router.post('/play', authMiddleware, async (req, res) => {
  try {
    const { gameId, pointsEarned = 0 } = req.body; 
    
    if (!gameId) {
      return res.status(400).json({ success: false, error: { message: 'gameId is required' } });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // MAXIMUM CAP: Prevent astronomical scores from exploiting the system
    const MAX_SCORE_PER_GAME = 1000;
    const earned = Math.min(Number(pointsEarned), MAX_SCORE_PER_GAME);

    const statIndex = user.gameStats.findIndex((s) => s.gameId === gameId);
    let oldBest = 0;
    
    if (statIndex !== -1) {
      oldBest = user.gameStats[statIndex].bestScore || 0;
      user.gameStats[statIndex].plays += 1;
      user.gameStats[statIndex].points = (user.gameStats[statIndex].points || 0) + earned;
      user.gameStats[statIndex].lastPlayedAt = new Date();

      // RULE 1 & 2: Only update bestScore if the new score is higher
      if (earned > oldBest) {
        user.gameStats[statIndex].bestScore = earned;
      }
    } else {
      user.gameStats.push({ 
        gameId, 
        opens: 0, 
        plays: 1, 
        points: earned,
        bestScore: earned,
        lastPlayedAt: new Date() 
      });
    }

    // RULE 3 & 4: Recalculate total points from SCRATCH based ONLY on BEST SCORES
    const totalBestScores = user.gameStats.reduce((sum, stat) => {
      return sum + Math.min(stat.bestScore || 0, MAX_SCORE_PER_GAME);
    }, 0);

    user.totalPoints = totalBestScores;
    
    // INSTANT RATIO: 100 points = 1 EXP
    user.exp = Math.floor(user.totalPoints / 100);

    user.markModified('gameStats'); 
    await user.save();
    
    const newBest = Math.max(oldBest, earned);
    const beatHighScore = earned > oldBest;
    const gameConvertedExp = Math.floor(newBest / 100); // EXP just for this game

    // Return the calculated data to the frontend
    res.json({ 
      success: true, 
      message: 'Game play recorded',
      data: {
        lastScore: earned,
        bestScore: newBest,
        gameConvertedExp: gameConvertedExp,
        beatHighScore: beatHighScore,
        newExp: user.exp,
        newTotalPoints: user.totalPoints
      }
    });
  } catch (error) {
    console.error('Record game play error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to record game play' } });
  }
});

export default router;