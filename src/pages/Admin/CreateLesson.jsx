import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EMOJI_OPTIONS = ['📚', '🌱', '🌍', '♻️', '💧', '🌊', '🌿', '🐾', '☀️', '🌬️', '🔬', '🌳'];
const CLASS_LEVELS = [6, 7, 8, 9, 10];
const CATEGORIES = ['Ecology', 'Climate', 'Water', 'Biodiversity', 'Energy', 'Waste', 'Soil', 'Air', 'Other'];

const CreateLesson = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    difficulty: 'Easy',
    duration: '15 min',
    image: '📚',
    points: 50,
    classLevel: 6,
    videoUrl: '',
  });

  const [quiz, setQuiz] = useState([]);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'quiz'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Quiz helpers
  const addQuestion = () => {
    setQuiz(prev => [...prev, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const updateQuestion = (qIdx, field, value) => {
    setQuiz(prev => prev.map((q, i) => i === qIdx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx, oIdx, value) => {
    setQuiz(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options];
      options[oIdx] = value;
      return { ...q, options };
    }));
  };

  const removeQuestion = (qIdx) => {
    setQuiz(prev => prev.filter((_, i) => i !== qIdx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.description || !form.content || !form.category) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate quiz
    for (let i = 0; i < quiz.length; i++) {
      const q = quiz[i];
      if (!q.question.trim()) { setError(`Question ${i + 1} is missing a question text.`); return; }
      if (q.options.some(o => !o.trim())) { setError(`Question ${i + 1} has empty options.`); return; }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('geep_token');
      const res = await fetch(`${API_BASE}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, quiz })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Lesson created successfully! 🎉');
        setTimeout(() => navigate('/admin/'), 1500);
      } else {
        setError(data.error?.message || 'Failed to create lesson');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Create New Lesson</h1>
                <p className="text-gray-500 mt-1">Add learning content for a specific class level</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                ← Back
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <span>✅</span> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic Info Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">
                  📋 Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Lesson Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Introduction to Ecosystems"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={2}
                      placeholder="A short summary shown on the lesson card"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Class Level */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Class Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="classLevel"
                      value={form.classLevel}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {CLASS_LEVELS.map(l => <option key={l} value={l}>Class {l}</option>)}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
                    <select
                      name="difficulty"
                      value={form.difficulty}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="e.g. 20 min"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Points */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Points</label>
                    <input
                      type="number"
                      name="points"
                      value={form.points}
                      onChange={handleChange}
                      min={10}
                      max={500}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      YouTube Video URL <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={form.videoUrl}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Emoji Icon */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lesson Icon</label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => setForm(prev => ({ ...prev, image: emoji }))}
                          className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                            form.image === emoji
                              ? 'border-primary-500 bg-primary-50 scale-110'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content / Quiz Tabs */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                      activeTab === 'content'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📄 Lesson Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                      activeTab === 'quiz'
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📝 Quiz Questions {quiz.length > 0 && `(${quiz.length})`}
                  </button>
                </div>

                <div className="p-6">
                  {/* Content Tab */}
                  {activeTab === 'content' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lesson Content <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-400 mb-3">
                        Write the full lesson material. Use line breaks to separate sections.
                      </p>
                      <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        rows={14}
                        placeholder="Write your lesson content here...&#10;&#10;Use blank lines to separate paragraphs.&#10;&#10;You can include facts, explanations, examples, and activities."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                      />
                    </div>
                  )}

                  {/* Quiz Tab */}
                  {activeTab === 'quiz' && (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="text-sm text-gray-500">
                            Add multiple-choice questions for students to answer after the lesson.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          + Add Question
                        </button>
                      </div>

                      {quiz.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                          <span className="text-4xl block mb-3">📝</span>
                          <p className="text-gray-500 font-medium">No quiz questions yet</p>
                          <p className="text-gray-400 text-sm mt-1">Click "Add Question" to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {quiz.map((q, qIdx) => (
                            <div key={qIdx} className="border border-gray-200 rounded-xl p-5">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-gray-700">Question {qIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(qIdx)}
                                  className="text-red-400 hover:text-red-600 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              <input
                                type="text"
                                value={q.question}
                                onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                                placeholder="Enter your question..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
                              />
                              <div className="space-y-2">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name={`correct-${qIdx}`}
                                      checked={q.correctAnswer === oIdx}
                                      onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                                      className="accent-purple-600 w-4 h-4 flex-shrink-0"
                                      title="Mark as correct answer"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                      className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                        q.correctAnswer === oIdx
                                          ? 'border-green-400 focus:ring-green-300 bg-green-50'
                                          : 'border-gray-300 focus:ring-purple-300'
                                      }`}
                                    />
                                    {q.correctAnswer === oIdx && (
                                      <span className="text-green-500 text-xs font-semibold whitespace-nowrap">✅ Correct</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                🔘 Select the radio button next to the correct answer
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-4 pb-8">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {loading ? '⏳ Creating...' : '🌱 Create Lesson'}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateLesson;
