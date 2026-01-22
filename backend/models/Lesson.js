import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  duration: {
    type: String,
    default: '15 min'
  },
  image: {
    type: String,
    default: '📚'
  },
  points: {
    type: Number,
    default: 50
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
