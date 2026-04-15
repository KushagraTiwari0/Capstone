import express from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Badge from '../models/Badge.js';
import mongoose from 'mongoose'; // Added to validate ObjectIds
import authMiddleware from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/emailService.js';
import { checkAndAwardBadges } from './badgeRoutes.js';

const router = express.Router();

// Get tasks filtered by classLevel
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid Task ID format' } });
    }
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

    const { title, description, category, difficulty, points, icon, classLevel } = req.body;

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
      classLevel: classLevel || user.classLevel,
      teacherId: user._id
    });

    await task.save();
    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    console.error('Create task error:', error);
    // 🌟 FIX: Handle Mongoose Validation Error (like Class Level > 8)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: { message: error.message } });
    }
    res.status(500).json({ success: false, error: { message: 'An error occurred while creating the task' } });
  }
});

// Submit a task for review
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { taskId, taskData } = req.body;
    const proof = (taskData?.proof ?? req.body.proof) || '';
    const location = (taskData?.location ?? req.body.location) || 'Not provided';
    const reflection = (taskData?.reflection ?? req.body.reflection) || 'No reflection provided';

    if (!taskId && !taskData) {
      return res.status(400).json({ success: false, error: { message: 'Task ID or task data is required' } });
    }

    if (!proof || proof.trim() === '') {
      return res.status(400).json({ success: false, error: { message: 'Proof of task completion is required' } });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const { default: TaskSubmission } = await import('../models/TaskSubmission.js');

    const submission = new TaskSubmission({
      studentId: req.userId,
      taskId: taskId || null,
      proof,
      location,
      reflection,
      classLevel: user.classLevel || 6,
      status: 'pending',
      awardedPoints: 0,
      submittedAt: new Date()
    });

    await submission.save();
    res.status(201).json({ success: true, message: 'Task submitted successfully', submission });
  } catch (error) {
    console.error("Submit task error:", error);
    res.status(500).json({ success: false, message: 'Task submission failed', error: { message: error.message } });
  }
});

// Award a badge
router.post('/badge', authMiddleware, async (req, res) => {
  try {
    const { badgeId, badgeData } = req.body;

    if (!badgeId && !badgeData) {
      return res.status(400).json({ success: false, error: { message: 'Badge ID or badge data is required' } });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // 🌟 FIX: Validate Badge ID format before querying
    if (badgeId && !mongoose.Types.ObjectId.isValid(badgeId)) {
       return res.status(400).json({ success: false, error: { message: 'Invalid Badge ID format. Please use a valid MongoDB ID.' } });
    }

    let badgeName = badgeData?.name || 'Achievement';
    let badgeDescription = badgeData?.description || 'Well done!';
    let badgeIcon = badgeData?.icon || '🏆';
    let badgePoints = badgeData?.points || 0;

    if (badgeId) {
      const alreadyEarned = user.badges.some(b => b.badgeId && b.badgeId.toString() === badgeId.toString());
      if (alreadyEarned) {
        return res.status(400).json({ success: false, error: { message: 'Badge already earned' } });
      }

      const foundBadge = await Badge.findById(badgeId);
      if (foundBadge) {
        badgeName = foundBadge.name;
        badgeDescription = foundBadge.description;
        badgeIcon = foundBadge.icon || '🏆';
        badgePoints = foundBadge.points || 0;
      }
      
      user.badges.push({ badgeId: badgeId, earnedAt: new Date() });
    }

    if (badgePoints > 0) {
      user.points = (user.points || 0) + badgePoints;
    }

    // Update level
    if (user.points >= 1000) user.level = 'Expert';
    else if (user.points >= 500) user.level = 'Advanced';
    else if (user.points >= 200) user.level = 'Intermediate';
    else user.level = 'Beginner';

    await user.save();
    await checkAndAwardBadges(req.userId);

    // 🌟 Email sending won't crash the response anymore
    sendEmail(user.email, 'achievement', {
      ...user.toObject(),
      badge: { name: badgeName, description: badgeDescription, icon: badgeIcon, points: badgePoints }
    }).catch(err => console.error('Email background fail:', err));

    res.json({ success: true, message: 'Badge earned!', data: { points: user.points, level: user.level, badges: user.badges } });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;