import express from 'express';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Task from '../models/Task.js';
import TaskSubmission from '../models/TaskSubmission.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const teacherOrAdminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role');
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Teacher/Admin privileges required.' },
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error verifying access' },
    });
  }
};

// GET /api/analytics/overview
router.get('/overview', authMiddleware, teacherOrAdminMiddleware, async (req, res) => {
  try {
    // Only count approved students
    const totalStudents = await User.countDocuments({ 
      role: 'student',
      status: 'approved'
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeStudents = await User.countDocuments({
      role: 'student',
      status: 'approved',
      updatedAt: { $gte: thirtyDaysAgo },
    });

    const [totalLessons, totalQuizzes, totalTasks, pendingTaskReviews] = await Promise.all([
      Lesson.countDocuments(),
      Quiz.countDocuments(),
      Task.countDocuments(),
      TaskSubmission.countDocuments({ status: 'pending' }),
    ]);

    // Avg quiz score across approved students (percentage)
    const avgScoreAgg = await User.aggregate([
      { $match: { role: 'student', status: 'approved' } },
      { $unwind: { path: '$quizScores', preserveNullAndEmptyArrays: false } },
      { $group: { _id: null, avg: { $avg: '$quizScores.percentage' } } },
    ]);
    const averageScore = Math.round(avgScoreAgg?.[0]?.avg || 0);

    // Completion rate (avg completedLessons / totalLessons) - only for approved students
    let completionRate = 0;
    if (totalLessons > 0) {
      const completionAgg = await User.aggregate([
        { $match: { role: 'student', status: 'approved' } },
        {
          $project: {
            completedCount: { $size: { $ifNull: ['$completedLessons', []] } },
          },
        },
        { $group: { _id: null, avgCompleted: { $avg: '$completedCount' } } },
      ]);
      const avgCompleted = completionAgg?.[0]?.avgCompleted || 0;
      completionRate = Math.round((avgCompleted / totalLessons) * 100);
    }

    res.json({
      success: true,
      data: {
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalLessons: totalLessons || 0,
        totalQuizzes: totalQuizzes || 0,
        totalTasks: totalTasks || 0,
        pendingTaskReviews: pendingTaskReviews || 0,
        averageScore: averageScore || 0,
        completionRate: completionRate || 0,
      },
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while fetching analytics overview' },
    });
  }
});

// GET /api/analytics/role-distribution
router.get('/role-distribution', authMiddleware, teacherOrAdminMiddleware, async (req, res) => {
  try {
    // Only count approved users (admins are always approved)
    const data = await User.aggregate([
      { 
        $match: { 
          role: { $in: ['student', 'teacher', 'admin'] },
          $or: [
            { status: 'approved' },
            { role: 'admin' }, // Admins are always approved
            { status: { $exists: false } } // Legacy users without status
          ]
        } 
      },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: { roles: data || [] } });
  } catch (error) {
    console.error('Role distribution error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while fetching role distribution' },
    });
  }
});

// GET /api/analytics/top-performers?limit=5
router.get('/top-performers', authMiddleware, teacherOrAdminMiddleware, async (req, res) => {
  try {
    const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 5));

    // Only show approved students and teachers
    const users = await User.find({ 
      role: { $in: ['student', 'teacher'] },
      status: 'approved'
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
    console.error('Top performers error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while fetching top performers' },
    });
  }
});

// GET /api/analytics/pending-submissions?limit=5
router.get('/pending-submissions', authMiddleware, teacherOrAdminMiddleware, async (req, res) => {
  try {
    const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 5));

    // Get pending submissions, but only from approved users
    const submissions = await TaskSubmission.find({ status: 'pending' })
      .populate({
        path: 'userId',
        match: { 
          $or: [
            { status: 'approved' },
            { status: { $exists: false } } // Legacy users
          ]
        },
        select: 'name email avatar role status'
      })
      .populate('taskId', 'title description points category difficulty icon')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    // Filter out submissions from null users (pending/rejected users)
    const validSubmissions = submissions.filter(sub => sub.userId !== null);

    res.json({ success: true, data: { submissions: validSubmissions || [] } });
  } catch (error) {
    console.error('Pending submissions error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'An error occurred while fetching pending submissions' },
    });
  }
});

export default router;

