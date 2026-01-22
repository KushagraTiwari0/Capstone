import express from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Badge from '../models/Badge.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Complete a task
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { taskId, taskData } = req.body;

    if (!taskId && !taskData) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Task ID or task data is required'
        }
      });
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    let task = null;
    let taskPoints = 0;
    let taskTitle = '';
    let taskDescription = '';
    let taskCategory = '';
    let taskDifficulty = '';
    let taskIcon = '✅';

    // If taskId is provided, try to find task in database
    if (taskId) {
      // Check if task already completed (using string comparison for both ObjectId and numeric IDs)
      const taskIdStr = taskId.toString();
      const isCompleted = user.completedTasks.some(completedId => 
        completedId.toString() === taskIdStr
      );

      if (isCompleted) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Task already completed'
          }
        });
      }

      // Try to find task in database
      task = await Task.findById(taskId);
      if (task) {
        taskPoints = task.points || 0;
        taskTitle = task.title;
        taskDescription = task.description;
        taskCategory = task.category;
        taskDifficulty = task.difficulty;
        taskIcon = task.icon || '✅';
        // Add task to completed tasks
        user.completedTasks.push(taskId);
      }
    }

    // If task not found in DB but taskData provided, use taskData
    if (!task && taskData) {
      taskPoints = taskData.points || 0;
      taskTitle = taskData.title || 'Task';
      taskDescription = taskData.description || '';
      taskCategory = taskData.category || 'General';
      taskDifficulty = taskData.difficulty || 'Easy';
      taskIcon = taskData.icon || '✅';
      
      // For JSON-based tasks, store the task ID as a string/number
      if (taskId) {
        // Check if already completed
        const taskIdStr = taskId.toString();
        const isCompleted = user.completedTasks.some(completedId => 
          completedId.toString() === taskIdStr
        );

        if (isCompleted) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Task already completed'
            }
          });
        }
        
        // Store taskId (could be numeric from JSON)
        user.completedTasks.push(taskId);
      }
    }

    if (!task && !taskData) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Task information is required'
        }
      });
    }

    // Add points
    user.points = (user.points || 0) + taskPoints;
    
    // Update level based on points
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

    // Send task completion email (don't wait for it to complete)
    sendEmail(user.email, 'taskCompletion', {
      ...user.toObject(),
      task: {
        title: taskTitle,
        description: taskDescription,
        category: taskCategory,
        difficulty: taskDifficulty,
        points: taskPoints,
        icon: taskIcon
      }
    }).catch(err => {
      console.error('Failed to send task completion email:', err);
    });

    res.json({
      success: true,
      message: 'Task completed successfully!',
      data: {
        points: user.points,
        level: user.level,
        completedTasks: user.completedTasks
      }
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while completing the task'
      }
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
        error: {
          message: 'Badge ID or badge data is required'
        }
      });
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    let badge = null;
    let badgeName = '';
    let badgeDescription = '';
    let badgeIcon = '🏆';
    let badgePoints = 0;

    // If badgeId is provided, try to find badge in database
    if (badgeId) {
      // Check if badge already earned
      const badgeIdStr = badgeId.toString();
      const alreadyEarned = user.badges.some(
        b => b.badgeId && b.badgeId.toString() === badgeIdStr
      );

      if (alreadyEarned) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Badge already earned'
          }
        });
      }

      // Try to find badge in database
      badge = await Badge.findById(badgeId);
      if (badge) {
        badgeName = badge.name;
        badgeDescription = badge.description;
        badgeIcon = badge.icon || '🏆';
        badgePoints = badge.points || 0;
        // Add badge to user
        user.badges.push({
          badgeId: badgeId,
          earnedAt: new Date()
        });
      }
    }

    // If badge not found in DB but badgeData provided, use badgeData
    if (!badge && badgeData) {
      badgeName = badgeData.name || 'Achievement';
      badgeDescription = badgeData.description || 'Well done!';
      badgeIcon = badgeData.icon || '🏆';
      badgePoints = badgeData.points || 0;
      
      // For JSON-based badges, store the badge ID as a string/number
      if (badgeId) {
        // Check if already earned
        const badgeIdStr = badgeId.toString();
        const alreadyEarned = user.badges.some(
          b => b.badgeId && b.badgeId.toString() === badgeIdStr
        );

        if (alreadyEarned) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Badge already earned'
            }
          });
        }
        
        // Store badgeId (could be numeric from JSON)
        user.badges.push({
          badgeId: badgeId,
          earnedAt: new Date()
        });
      }
    }

    if (!badge && !badgeData) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Badge information is required'
        }
      });
    }

    // Add badge points if any
    if (badgePoints > 0) {
      user.points = (user.points || 0) + badgePoints;
    }

    // Update level based on points
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

    // Send achievement email (don't wait for it to complete)
    sendEmail(user.email, 'achievement', {
      ...user.toObject(),
      badge: {
        name: badgeName,
        description: badgeDescription,
        icon: badgeIcon,
        points: badgePoints
      }
    }).catch(err => {
      console.error('Failed to send achievement email:', err);
    });

    res.json({
      success: true,
      message: 'Badge earned successfully!',
      data: {
        points: user.points,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while awarding the badge'
      }
    });
  }
});

export default router;
