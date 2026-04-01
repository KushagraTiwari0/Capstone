import express from 'express';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only middleware
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Admin privileges required.' }
      });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Error verifying admin access' } });
  }
};

// GET /api/lessons
// - Admin: sees ALL lessons, optionally filtered by ?classLevel=6
// - Student/Teacher: only sees their own classLevel lessons
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const query = {};

    if (user.role === 'admin') {
      // ✅ Admin can filter by classLevel via query param, or see all
      if (req.query.classLevel && req.query.classLevel !== 'All') {
        query.classLevel = Number(req.query.classLevel);
      }
    } else {
      // ✅ Students (and teachers if they ever access this) only see their classLevel
      if (user.classLevel) {
        query.classLevel = user.classLevel;
      }
    }

    // Optional category filter for everyone
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    const lessons = await Lesson.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { lessons } });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch lessons' } });
  }
});

// GET /api/lessons/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('createdBy', 'name');
    if (!lesson) {
      return res.status(404).json({ success: false, error: { message: 'Lesson not found' } });
    }
    res.json({ success: true, data: { lesson } });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch lesson' } });
  }
});

// POST /api/lessons — admin creates lesson
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      title, description, content, category,
      difficulty, duration, image, points,
      classLevel, videoUrl, quiz
    } = req.body;

    if (!title || !description || !content || !category || !classLevel) {
      return res.status(400).json({
        success: false,
        error: { message: 'Title, description, content, category, and classLevel are required' }
      });
    }

    const lesson = new Lesson({
      title,
      description,
      content,
      category,
      difficulty: difficulty || 'Easy',
      duration: duration || '15 min',
      image: image || '📚',
      points: Number(points) || 50,
      classLevel: Number(classLevel),
      videoUrl: videoUrl || '',
      quiz: quiz || [],
      createdBy: req.userId
    });

    await lesson.save();
    res.status(201).json({ success: true, data: { lesson }, message: 'Lesson created successfully' });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to create lesson' } });
  }
});

// PUT /api/lessons/:id — admin updates lesson
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!lesson) {
      return res.status(404).json({ success: false, error: { message: 'Lesson not found' } });
    }
    res.json({ success: true, data: { lesson }, message: 'Lesson updated successfully' });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to update lesson' } });
  }
});

// DELETE /api/lessons/:id — admin deletes lesson
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, error: { message: 'Lesson not found' } });
    }
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to delete lesson' } });
  }
});

export default router;