import mongoose from 'mongoose';

const taskSubmissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proof: {
    type: String,
    required: true,
    default: 'No proof provided' // ✅ Prevents validation failure on old/legacy docs
  },
  location: {
    type: String,
    required: true,
    default: 'Not provided' // ✅ Same fix
  },
  reflection: {
    type: String,
    required: true,
    default: 'No reflection provided' // ✅ Same fix
  },
  classLevel: {
    type: Number,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  teacherRemarks: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  awardedPoints: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

export default TaskSubmission;