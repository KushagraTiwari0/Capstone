import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Middleware to check if user is teacher
const teacherMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Teacher privileges required.'
        }
      });
    }
    // Also check if teacher is approved (legacy users without status are treated as approved)
    const userStatus = user.status || 'approved';
    if (userStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Your account must be approved to perform this action.'
        }
      });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error verifying teacher access'
      }
    });
  }
};

// Get pending students
router.get('/pending-students', authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const pendingStudents = await User.find({
      role: 'student',
      status: 'pending',
      classLevel: req.user.classLevel
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        students: pendingStudents
      }
    });
  } catch (error) {
    console.error('Get pending students error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while fetching pending students'
      }
    });
  }
});

// Approve or reject student
router.put('/students/:id/approve', authMiddleware, teacherMiddleware, async (req, res) => {
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

    // Find student
    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student not found'
        }
      });
    }

    // Verify it's a student
    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Can only approve or reject students'
        }
      });
    }

    if (action === 'approve') {
      // APPROVE: Update status and send email
      student.status = 'approved';
      student.approvedBy = req.userId;
      student.approvedAt = new Date();
      await student.save();

      // Send approval email (don't wait for it to complete)
      sendEmail(student.email, 'approval', {
        name: student.name,
        role: student.role
      }).catch(err => {
        console.error('Failed to send approval email:', err);
      });

      res.json({
        success: true,
        message: 'Student approved successfully',
        data: {
          student: student.toJSON()
        }
      });
    } else {
      // REJECT: Send email first, then DELETE user permanently
      const studentEmail = student.email;
      const studentName = student.name;
      const studentRole = student.role;

      // Send rejection email FIRST (before deletion)
      try {
        await sendEmail(studentEmail, 'rejection', {
          name: studentName,
          role: studentRole
        });
        console.log(`✅ Rejection email sent to ${studentEmail}`);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Continue with deletion even if email fails
      }

      // AFTER email is sent, permanently DELETE the user
      await User.findByIdAndDelete(id);
      console.log(`🗑️  Deleted rejected student: ${studentEmail} (${id})`);

      res.json({
        success: true,
        message: 'Student rejected and removed from the system',
        data: {
          deleted: true,
          email: studentEmail
        }
      });
    }
  } catch (error) {
    console.error('Approve/reject student error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'An error occurred while processing the request'
      }
    });
  }
});

// Get pending task submissions for the teacher's class
router.get('/pending-submissions', authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const { default: TaskSubmission } = await import('../models/TaskSubmission.js');

    console.log("Teacher classLevel:", req.user.classLevel);

    const students = await User.find({
      role: "student",
      classLevel: req.user.classLevel
    });

    const studentIds = students.map(s => s._id);

    const submissions = await TaskSubmission.find({
      studentId: { $in: studentIds },
      status: "pending"
    })
    .populate("studentId", "name email classLevel")
    .populate("taskId", "title icon points difficulty description");

    console.log("Submissions found:", submissions.length);

    res.json({
      success: true,
      data: {
        submissions
      }
    });

  } catch (error) {
    console.error('Get pending submissions error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'An error occurred while fetching pending submissions'
      }
    });
  }
});

// Approve a student's task submission
router.put('/submissions/:id/approve', authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { awardedPoints, teacherRemarks } = req.body;

    if (!awardedPoints || awardedPoints <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid points must be awarded' }
      });
    }

    const { default: TaskSubmission } = await import('../models/TaskSubmission.js');

    // Find submission first to validate access
    const submission = await TaskSubmission.findById(id);

    if (!submission || submission.status !== 'pending' || submission.classLevel !== req.user.classLevel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Pending submission not found or access denied' }
      });
    }

    // ✅ FIX: Use findByIdAndUpdate to avoid re-validating the whole document
    // This prevents the "proof is required" error on old submissions that lack proof
    const updatedSubmission = await TaskSubmission.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'approved',
          awardedPoints: Number(awardedPoints),
          teacherRemarks: teacherRemarks || '',
          reviewedBy: req.userId,
          reviewedAt: new Date()
        }
      },
      { new: true, runValidators: false } // ✅ runValidators: false skips full doc validation
    );

    // Reward student
    const student = await User.findById(submission.studentId);
    if (student) {
      student.points = (student.points || 0) + Number(awardedPoints);

      // Compute leveling system
      if (student.points >= 1000) student.level = 'Expert';
      else if (student.points >= 500) student.level = 'Advanced';
      else if (student.points >= 200) student.level = 'Intermediate';
      else student.level = 'Beginner';

      // Ensure the canonical completed list updates too
      if (!student.completedTasks.includes(submission.taskId)) {
        student.completedTasks.push(submission.taskId);
      }

      await student.save();
    }

    res.json({
      success: true,
      message: 'Submission approved and points awarded',
      data: { submission: updatedSubmission }
    });
  } catch (error) {
    console.error('Approve submission error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'An error occurred while approving the submission' }
    });
  }
});

// Reject a student's task submission
router.put('/submissions/:id/reject', authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        error: { message: 'A rejection reason is required' }
      });
    }

    const { default: TaskSubmission } = await import('../models/TaskSubmission.js');

    // Find submission first to validate access
    const submission = await TaskSubmission.findById(id);

    if (!submission || submission.status !== 'pending' || submission.classLevel !== req.user.classLevel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Pending submission not found or access denied' }
      });
    }

    // ✅ FIX: Use findByIdAndUpdate to avoid re-validating the whole document
    // This prevents the "proof is required" error on old submissions that lack proof
    const updatedSubmission = await TaskSubmission.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'rejected',
          rejectionReason: rejectionReason,
          reviewedBy: req.userId,
          reviewedAt: new Date()
        }
      },
      { new: true, runValidators: false } // ✅ runValidators: false skips full doc validation
    );

    res.json({
      success: true,
      message: 'Submission rejected',
      data: { submission: updatedSubmission }
    });
  } catch (error) {
    console.error('Reject submission error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'An error occurred while rejecting the submission' }
    });
  }
});

export default router;