import express from 'express';
import User from '../models/User.js';
import TaskSubmission from '../models/TaskSubmission.js';
import Task from '../models/Task.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Middleware to check if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Admin privileges required.'
        }
      });
    }
    // Admins are always approved, but check status for consistency
    // Legacy users (without status) are treated as approved
    const userStatus = user.status || 'approved';
    if (userStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Admin account must be approved.'
        }
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error verifying admin access'
      }
    });
  }
};

// Get admin dashboard statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Get user counts by role - ONLY approved users (admins are always approved)
    const totalUsers = await User.countDocuments({
      $or: [
        { status: 'approved' },
        { role: 'admin' }, // Admins are always approved
        { status: { $exists: false } } // Legacy users without status
      ]
    });
    const totalStudents = await User.countDocuments({ 
      role: 'student',
      status: 'approved'
    });
    const totalTeachers = await User.countDocuments({ 
      role: 'teacher',
      status: 'approved'
    });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Get active users (users who have logged in recently - last 30 days) - only approved
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      $or: [
        { status: 'approved' },
        { role: 'admin' },
        { status: { $exists: false } }
      ],
      updatedAt: { $gte: thirtyDaysAgo }
    });

    // Get pending task submissions
    const pendingSubmissions = await TaskSubmission.countDocuments({ 
      status: 'pending' 
    });

    // Get verified submissions
    const verifiedSubmissions = await TaskSubmission.countDocuments({ 
      status: 'verified' 
    });

    // Get rejected submissions
    const rejectedSubmissions = await TaskSubmission.countDocuments({ 
      status: 'rejected' 
    });

    // Get total task submissions
    const totalSubmissions = await TaskSubmission.countDocuments();

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers || 0,
          students: totalStudents || 0,
          teachers: totalTeachers || 0,
          admins: totalAdmins || 0,
          active: activeUsers || 0
        },
        submissions: {
          total: totalSubmissions || 0,
          pending: pendingSubmissions || 0,
          verified: verifiedSubmissions || 0,
          rejected: rejectedSubmissions || 0
        }
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while fetching statistics'
      }
    });
  }
});

// Get all users (with pagination and filters)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role, page = 1, limit = 50, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query - exclude admins by default, only show APPROVED students and teachers
    const query = {
      status: 'approved' // Only show approved users
    };
    if (role) {
      // If specific role is requested, use it
      query.role = role;
    } else {
      // By default, only show approved students and teachers (exclude admins)
      query.role = { $in: ['student', 'teacher'] };
    }
    if (search) {
      // Add search conditions
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while fetching users'
      }
    });
  }
});

// Get all task submissions (with filters)
router.get('/submissions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Get submissions with populated user and task data
    // Only show submissions from approved users
    const submissions = await TaskSubmission.find(query)
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
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out submissions from null users (pending/rejected users)
    const validSubmissions = submissions.filter(sub => sub.userId !== null);

    // Get total count - only count submissions from approved users
    // We need to count manually since populate doesn't affect countDocuments
    const allSubmissions = await TaskSubmission.find(query)
      .populate({
        path: 'userId',
        match: { 
          $or: [
            { status: 'approved' },
            { status: { $exists: false } }
          ]
        }
      })
      .lean();
    const total = allSubmissions.filter(sub => sub.userId !== null).length;

    res.json({
      success: true,
      data: {
        submissions: validSubmissions || [],
        pagination: {
          total: total || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((total || 0) / parseInt(limit)) || 1
        }
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while fetching submissions'
      }
    });
  }
});

// Approve or reject task submission
router.put('/submissions/:id/review', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Status must be either "verified" or "rejected"'
        }
      });
    }

    // Find submission
    const submission = await TaskSubmission.findById(id)
      .populate('userId')
      .populate('taskId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Task submission not found'
        }
      });
    }

    // Update submission
    submission.status = status;
    submission.reviewedBy = req.userId;
    if (feedback) {
      submission.feedback = feedback;
    }

    // If verified, award points to user
    if (status === 'verified' && submission.taskId) {
      const user = submission.userId;
      const task = submission.taskId;
      
      // Calculate points to award
      const pointsToAward = task.points || 0;
      submission.pointsAwarded = pointsToAward;

      // Add points to user
      user.points = (user.points || 0) + pointsToAward;

      // Update user level based on points
      if (user.points >= 1000) {
        user.level = 'Expert';
      } else if (user.points >= 500) {
        user.level = 'Advanced';
      } else if (user.points >= 200) {
        user.level = 'Intermediate';
      } else {
        user.level = 'Beginner';
      }

      // Add task to completed tasks if not already there
      const taskIdStr = task._id.toString();
      const isCompleted = user.completedTasks.some(completedId => 
        completedId.toString() === taskIdStr
      );

      if (!isCompleted) {
        user.completedTasks.push(task._id);
      }

      await user.save();
    }

    await submission.save();

    // Populate for response
    await submission.populate('userId', 'name email avatar role');
    await submission.populate('taskId', 'title description points');
    await submission.populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Task submission ${status === 'verified' ? 'approved' : 'rejected'} successfully`,
      data: {
        submission,
        pointsAwarded: status === 'verified' ? submission.pointsAwarded : 0
      }
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while reviewing submission'
      }
    });
  }
});

// Get analytics data
router.get('/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // User growth over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Task submissions by status
    const submissionsByStatus = await TaskSubmission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average points by role
    const avgPointsByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          avgPoints: { $avg: '$points' },
          totalUsers: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userGrowth,
        usersByRole,
        submissionsByStatus,
        avgPointsByRole
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while fetching analytics'
      }
    });
  }
});

// Get pending teachers
router.get('/pending-teachers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pendingTeachers = await User.find({
      role: 'teacher',
      status: 'pending'
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        teachers: pendingTeachers
      }
    });
  } catch (error) {
    console.error('Get pending teachers error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while fetching pending teachers'
      }
    });
  }
});

// Approve or reject teacher
router.put('/teachers/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Action must be either "approve" or "reject"'
        }
      });
    }

    // Find teacher
    const teacher = await User.findById(id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Teacher not found'
        }
      });
    }

    // Verify it's a teacher
    if (teacher.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Can only approve or reject teachers'
        }
      });
    }

    if (action === 'approve') {
      // APPROVE: Update status and send email
      teacher.status = 'approved';
      teacher.approvedBy = req.userId;
      teacher.approvedAt = new Date();
      await teacher.save();

      // Send approval email (don't wait for it to complete)
      sendEmail(teacher.email, 'approval', {
        name: teacher.name,
        role: teacher.role
      }).catch(err => {
        console.error('Failed to send approval email:', err);
      });

      res.json({
        success: true,
        message: 'Teacher approved successfully',
        data: {
          teacher: teacher.toJSON()
        }
      });
    } else {
      // REJECT: Send email first, then DELETE user permanently
      const teacherEmail = teacher.email;
      const teacherName = teacher.name;
      const teacherRole = teacher.role;

      // Send rejection email FIRST (before deletion)
      try {
        await sendEmail(teacherEmail, 'rejection', {
          name: teacherName,
          role: teacherRole
        });
        console.log(`✅ Rejection email sent to ${teacherEmail}`);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Continue with deletion even if email fails
      }

      // AFTER email is sent, permanently DELETE the user
      await User.findByIdAndDelete(id);
      console.log(`🗑️  Deleted rejected teacher: ${teacherEmail} (${id})`);

      res.json({
        success: true,
        message: 'Teacher rejected and removed from the system',
        data: {
          deleted: true,
          email: teacherEmail
        }
      });
    }
  } catch (error) {
    console.error('Approve/reject teacher error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while processing the request'
      }
    });
  }
});

export default router;
