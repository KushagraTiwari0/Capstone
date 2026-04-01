import express from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Badge from '../models/Badge.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/emailService.js';
import { checkAndAwardBadges } from './badgeRoutes.js';

const router = express.Router();

// Get tasks filtered by classLevel (for both Students and Teachers)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // Admins see all tasks natively, others see their classLevel tasks
    const query = {};
    if (user.role !== 'admin' && user.classLevel) {
      query.classLevel = user.classLevel;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.json({ success: true, data: { tasks } });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, error: { message: 'An error occurred while fetching tasks' } });
  }
});

// Get a single task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: { message: 'Task not found' } });
    }
    res.json({ success: true, data: { task } });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, error: { message: 'An error occurred while fetching the task' } });
  }
});

// Create a new task (Teacher only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ success: false, error: { message: 'Only teachers can create tasks' } });
    }

    const { title, description, category, difficulty, points, icon } = req.body;

    if (!title || !description || !points || !category) {
      return res.status(400).json({ success: false, error: { message: 'Title, description, category, and points are required' } });
    }

    const task = new Task({
      title,
      description,
      category,
      difficulty: difficulty || 'Medium',
      points: Number(points),
      icon: icon || '✅',
      classLevel: user.classLevel,
      teacherId: user._id
    });

    await task.save();

    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, error: { message: 'An error occurred while creating the task' } });
  }
});

// Submit a task for review
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { taskId, taskData } = req.body;

    const proof      = (taskData?.proof      ?? req.body.proof)      || '';
    const location   = (taskData?.location   ?? req.body.location)   || 'Not provided';
    const reflection = (taskData?.reflection ?? req.body.reflection) || 'No reflection provided';

    if (!taskId && !taskData) {
      return res.status(400).json({
        success: false,
        error: { message: 'Task ID or task data is required' }
      });
    }

    if (!proof || proof.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { message: 'Proof of task completion is required' }
      });
    }

    let task = null;
    if (taskId) {
      task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: { message: 'Task not found' }
        });
      }
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    const { default: TaskSubmission } = await import('../models/TaskSubmission.js');

    console.log("Task submission received:", req.body);

    const submission = new TaskSubmission({
      studentId:    req.userId,
      taskId:       taskId,
      proof:        proof,
      location:     location,
      reflection:   reflection,
      classLevel:   user.classLevel || 6,
      status:       'pending',
      awardedPoints: 0,
      submittedAt:  new Date()
    });

    console.log("Saving submission:", submission);
    await submission.save();

    res.status(201).json({
      success: true,
      message: 'Task submitted successfully',
      submission
    });

  } catch (error) {
    console.error("Submit task error:", error);
    res.status(500).json({
      success: false,
      message: 'Task submission failed',
      error: { message: error.message || 'An error occurred while submitting the task' }
    });
  }
});

// Award a badge
router.post('/badge', authMiddleware, async (req, res) => {
  try {
    const { badgeId, badgeData } = req.body;

    if (!badgeId && !badgeData) {
      return res.status(400).json({
        success: false,
        error: { message: 'Badge ID or badge data is required' }
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    let badge = null;
    let badgeName = '';
    let badgeDescription = '';
    let badgeIcon = '🏆';
    let badgePoints = 0;

    if (badgeId) {
      const badgeIdStr = badgeId.toString();
      const alreadyEarned = user.badges.some(
        b => b.badgeId && b.badgeId.toString() === badgeIdStr
      );

      if (alreadyEarned) {
        return res.status(400).json({
          success: false,
          error: { message: 'Badge already earned' }
        });
      }

      badge = await Badge.findById(badgeId);
      if (badge) {
        badgeName = badge.name;
        badgeDescription = badge.description;
        badgeIcon = badge.icon || '🏆';
        badgePoints = badge.points || 0;
        user.badges.push({
          badgeId: badgeId,
          earnedAt: new Date()
        });
      }
    }

    if (!badge && badgeData) {
      badgeName        = badgeData.name        || 'Achievement';
      badgeDescription = badgeData.description || 'Well done!';
      badgeIcon        = badgeData.icon        || '🏆';
      badgePoints      = badgeData.points      || 0;

      if (badgeId) {
        const badgeIdStr = badgeId.toString();
        const alreadyEarned = user.badges.some(
          b => b.badgeId && b.badgeId.toString() === badgeIdStr
        );

        if (alreadyEarned) {
          return res.status(400).json({
            success: false,
            error: { message: 'Badge already earned' }
          });
        }

        user.badges.push({
          badgeId: badgeId,
          earnedAt: new Date()
        });
      }
    }

    if (!badge && !badgeData) {
      return res.status(400).json({
        success: false,
        error: { message: 'Badge information is required' }
      });
    }

    if (badgePoints > 0) {
      user.points = (user.points || 0) + badgePoints;
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

    // ✅ Auto-check and award any newly unlocked badges
    await checkAndAwardBadges(req.userId);

    sendEmail(user.email, 'achievement', {
      ...user.toObject(),
      badge: {
        name:        badgeName,
        description: badgeDescription,
        icon:        badgeIcon,
        points:      badgePoints
      }
    }).catch(err => {
      console.error('Failed to send achievement email:', err);
    });

    res.json({
      success: true,
      message: 'Badge earned successfully!',
      data: {
        points: user.points,
        level:  user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while awarding the badge' }
    });
  }
});

export default router;