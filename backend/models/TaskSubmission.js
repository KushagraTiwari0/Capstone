import mongoose from 'mongoose';

const taskSubmissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String, // URL to uploaded image
    required: true
  },
  location: {
    type: String,
    required: true
  },
  reflection: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'verified', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    type: String
  },
  pointsAwarded: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);

export default TaskSubmission;
