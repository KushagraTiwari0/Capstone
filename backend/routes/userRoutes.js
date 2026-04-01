import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/emailService.js';
import { checkAndAwardBadges } from './badgeRoutes.js';

const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred' }
    });
  }
});

// Update user profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    sendEmail(user.email, 'profileUpdate', { ...user.toObject(), updates }).catch(err => {
      console.error('Failed to send profile update email:', err);
    });

    res.json({ success: true, user, message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred' }
    });
  }
});

// Change password
router.put('/me/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password and new password are required' }
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 6 characters' }
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Current password is incorrect' }
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred' }
    });
  }
});

// Complete a lesson
router.post('/me/complete-lesson', authMiddleware, async (req, res) => {
  try {
    const { lessonId, lessonData } = req.body;

    if (!lessonId && !lessonData) {
      return res.status(400).json({
        success: false,
        error: { message: 'Lesson ID or lesson data is required' }
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    const lessonIdStr = lessonId.toString();
    const isCompleted = user.completedLessons.some(
      completedId => completedId.toString() === lessonIdStr
    );

    if (isCompleted) {
      return res.status(400).json({
        success: false,
        error: { message: 'Lesson already completed' }
      });
    }

    user.completedLessons.push(lessonId);

    const pointsToAdd = lessonData?.points || 50;
    user.points = (user.points || 0) + pointsToAdd;

    if (user.points >= 1000) {
      user.level = 'Expert';
    } else if (user.points >= 500) {
      user.level = 'Advanced';
    } else if (user.points >= 200) {
      user.level = 'Intermediate';
    } else {
      user.level = 'Beginner';
    }

    await user.save();

    // ✅ Auto-check and award any newly unlocked badges
    await checkAndAwardBadges(req.userId);

    res.json({
      success: true,
      message: 'Lesson completed successfully!',
      data: {
        points: user.points,
        level: user.level,
        completedLessons: user.completedLessons
      }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while completing the lesson' }
    });
  }
});

// Save quiz score
router.post('/me/quiz-score', authMiddleware, async (req, res) => {
  try {
    const { quizId, score, total, percentage, quizData } = req.body;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Quiz ID is required' }
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    const quizIdStr = quizId.toString();
    const existingScoreIndex = user.quizScores.findIndex(
      qs => qs.quizId && qs.quizId.toString() === quizIdStr
    );

    if (existingScoreIndex >= 0) {
      const existingScore = user.quizScores[existingScoreIndex];
      if (percentage > (existingScore.percentage || 0)) {
        user.quizScores[existingScoreIndex] = {
          quizId,
          score: score || 0,
          total: total || 0,
          percentage: percentage || 0,
          date: new Date()
        };
      }
    } else {
      user.quizScores.push({
        quizId,
        score: score || 0,
        total: total || 0,
        percentage: percentage || 0,
        date: new Date()
      });
    }

    const pointsToAdd = quizData?.points || 0;
    if (pointsToAdd > 0) {
      user.points = (user.points || 0) + pointsToAdd;
    }

    if (user.points >= 1000) {
      user.level = 'Expert';
    } else if (user.points >= 500) {
      user.level = 'Advanced';
    } else if (user.points >= 200) {
      user.level = 'Intermediate';
    } else {
      user.level = 'Beginner';
    }

    await user.save();

    // ✅ Auto-check and award any newly unlocked badges after quiz points
    if (pointsToAdd > 0) {
      await checkAndAwardBadges(req.userId);
    }

    res.json({
      success: true,
      message: 'Quiz score saved successfully!',
      data: {
        points: user.points,
        level: user.level,
        quizScores: user.quizScores
      }
    });
  } catch (error) {
    console.error('Save quiz score error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while saving quiz score' }
    });
  }
});

// Update user points (general endpoint for adding points)
router.post('/me/points', authMiddleware, async (req, res) => {
  try {
    const { points } = req.body;

    if (points === undefined || points === null) {
      return res.status(400).json({
        success: false,
        error: { message: 'Points value is required' }
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    user.points = (user.points || 0) + points;

    if (user.points >= 1000) {
      user.level = 'Expert';
    } else if (user.points >= 500) {
      user.level = 'Advanced';
    } else if (user.points >= 200) {
      user.level = 'Intermediate';
    } else {
      user.level = 'Beginner';
    }

    await user.save();

    // ✅ Auto-check and award any newly unlocked badges after points update
    await checkAndAwardBadges(req.userId);

    res.json({
      success: true,
      message: 'Points updated successfully!',
      data: {
        points: user.points,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while updating points' }
    });
  }
});

// Get user progress
router.get('/me/progress', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    let populatedBadges = [];
    let populatedTasks = [];

    try {
      if (user.badges && user.badges.length > 0) {
        const userWithBadges = await User.findById(req.userId)
          .populate('badges.badgeId')
          .select('-password');
        populatedBadges = userWithBadges?.badges || [];
      }
    } catch (populateError) {
      console.warn('Could not populate badges:', populateError.message);
      populatedBadges = user.badges || [];
    }

    const populatedLessons = user.completedLessons || [];

    try {
      if (user.completedTasks && user.completedTasks.length > 0) {
        const userWithTasks = await User.findById(req.userId)
          .populate('completedTasks')
          .select('-password');
        populatedTasks = userWithTasks?.completedTasks || [];
      }
    } catch (populateError) {
      console.warn('Could not populate tasks:', populateError.message);
      populatedTasks = user.completedTasks || [];
    }

    let formattedQuizScores = {};
    if (user.quizScores && Array.isArray(user.quizScores)) {
      user.quizScores.forEach((quizScore) => {
        if (quizScore.quizId) {
          formattedQuizScores[quizScore.quizId.toString()] = {
            score: quizScore.score || 0,
            percentage: quizScore.percentage || 0,
            date: quizScore.date || new Date().toISOString()
          };
        }
      });
    }

    res.json({
      success: true,
      data: {
        points: user.points || 0,
        level: user.level || 'Beginner',
        badges: populatedBadges,
        completedLessons: populatedLessons,
        completedTasks: populatedTasks,
        quizScores: formattedQuizScores
      }
    });
  } catch (error) {
    console.error('❌ Get progress error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while fetching user progress',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// Get user's task submissions
router.get('/me/task-submissions', authMiddleware, async (req, res) => {
  try {
    const { default: TaskSubmission } = await import('../models/TaskSubmission.js');

    const submissions = await TaskSubmission.find({ studentId: req.userId }).sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    console.error('Get task submissions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'An error occurred fetching task submissions' }
    });
  }
});

export default router;