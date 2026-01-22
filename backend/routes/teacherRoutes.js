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
      status: 'pending'
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

export default router;
