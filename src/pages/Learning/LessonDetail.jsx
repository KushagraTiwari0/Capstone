import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getDifficultyColor } from "../../utils/helpers";
import Button from "../../components/common/Button";
import Sidebar from "../../components/common/Sidebar";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Convert YouTube URL to embeddable format
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const LessonDetail = () => {
  const { id } = useParams();
  const { completeLesson, completedLessons, addBadge } = useUser();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  useEffect(() => {
    if (lesson) {
      setIsCompleted(completedLessons.includes(lesson._id));
    }
  }, [lesson, completedLessons]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('geep_token');
      const res = await fetch(`${API_BASE}/lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLesson(data.data.lesson);
      } else {
        setError(data.error?.message || 'Lesson not found');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!isCompleted && lesson) {
      try {
        await completeLesson(lesson._id, {
          title: lesson.title,
          points: lesson.points || 50
        });
        if (completedLessons.length === 0) {
          await addBadge({ id: 1, name: "First Steps", description: "Complete your first lesson", icon: "🌱" });
        }
        setIsCompleted(true);
      } catch (error) {
        console.error('Error completing lesson:', error);
        alert('Failed to complete lesson. Please try again.');
      }
    }
  };

  const handleQuizAnswer = (questionIdx, answerIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionIdx]: answerIdx }));
  };

  const handleQuizSubmit = () => {
    if (!lesson?.quiz) return;
    let correct = 0;
    lesson.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) correct++;
    });
    setQuizScore(correct);
    setQuizSubmitted(true);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error / Not found
  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">📭</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lesson not found</h2>
          <p className="text-gray-500 mb-6">{error || 'This lesson may have been removed.'}</p>
          <Link to="/lessons" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);
  const allQuestionsAnswered = lesson.quiz?.length > 0 &&
    Object.keys(quizAnswers).length === lesson.quiz.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">

            <Link to="/lessons" className="text-primary-600 hover:text-primary-700 mb-4 inline-block font-medium">
              ← Back to Lessons
            </Link>

            {/* Lesson Header */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-6xl">{lesson.image}</span>
                    <div>
                      <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {lesson.category}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">{lesson.title}</h1>
                  <p className="text-xl text-gray-600 mb-4">{lesson.description}</p>
                  <div className="flex items-center space-x-4 text-gray-500 flex-wrap gap-y-2">
                    <span className="flex items-center">⏱️ {lesson.duration}</span>
                    <span className={`px-3 py-1 rounded ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                    <span className="text-yellow-600 font-semibold">⭐ {lesson.points} pts</span>
                    <span className="text-gray-400 text-sm">Class {lesson.classLevel}</span>
                  </div>
                </div>
              </div>

              {isCompleted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">✅</span>
                    <span className="text-green-800 font-semibold">You've completed this lesson!</span>
                  </div>
                </div>
              )}

              {/* Lesson Content */}
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                  {lesson.content}
                </div>
              </div>
            </div>

            {/* Video Section */}
            {embedUrl && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🎥 Video Lesson
                </h2>
                <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={embedUrl}
                    title={lesson.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Quiz Section */}
            {lesson.quiz?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  📝 Knowledge Check
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Test what you've learned — {lesson.quiz.length} question{lesson.quiz.length > 1 ? 's' : ''}
                </p>

                {!quizStarted ? (
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Start Quiz →
                  </button>
                ) : (
                  <div className="space-y-6">
                    {lesson.quiz.map((q, qIdx) => (
                      <div key={qIdx} className="border border-gray-100 rounded-xl p-5">
                        <p className="font-semibold text-gray-800 mb-4">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((option, oIdx) => {
                            let btnClass = "w-full text-left px-4 py-3 rounded-lg border transition-all text-sm font-medium ";
                            if (!quizSubmitted) {
                              btnClass += quizAnswers[qIdx] === oIdx
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700";
                            } else {
                              if (oIdx === q.correctAnswer) {
                                btnClass += "border-green-500 bg-green-50 text-green-700";
                              } else if (quizAnswers[qIdx] === oIdx && oIdx !== q.correctAnswer) {
                                btnClass += "border-red-400 bg-red-50 text-red-600";
                              } else {
                                btnClass += "border-gray-200 text-gray-400";
                              }
                            }
                            return (
                              <button
                                key={oIdx}
                                className={btnClass}
                                onClick={() => handleQuizAnswer(qIdx, oIdx)}
                              >
                                <span className="mr-2 font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                                {option}
                                {quizSubmitted && oIdx === q.correctAnswer && (
                                  <span className="ml-2">✅</span>
                                )}
                                {quizSubmitted && quizAnswers[qIdx] === oIdx && oIdx !== q.correctAnswer && (
                                  <span className="ml-2">❌</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Quiz Result */}
                    {quizSubmitted && (
                      <div className={`rounded-xl p-5 text-center ${
                        quizScore === lesson.quiz.length
                          ? 'bg-green-50 border border-green-200'
                          : quizScore >= Math.ceil(lesson.quiz.length / 2)
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="text-4xl mb-2">
                          {quizScore === lesson.quiz.length ? '🎉' : quizScore >= Math.ceil(lesson.quiz.length / 2) ? '👍' : '📚'}
                        </div>
                        <p className="text-xl font-bold text-gray-800">
                          {quizScore} / {lesson.quiz.length} correct
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {quizScore === lesson.quiz.length
                            ? 'Perfect score! Amazing work!'
                            : quizScore >= Math.ceil(lesson.quiz.length / 2)
                            ? 'Good job! Review the ones you missed.'
                            : 'Keep studying and try again!'}
                        </p>
                        <button
                          onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); }}
                          className="mt-4 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Retry Quiz
                        </button>
                      </div>
                    )}

                    {!quizSubmitted && (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={!allQuestionsAnswered}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                          allQuestionsAnswered
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Submit Answers
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Complete Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                {!isCompleted ? (
                  <Button onClick={handleComplete} variant="primary" size="lg">
                    ✅ Mark as Complete (+{lesson.points} pts)
                  </Button>
                ) : (
                  <span className="text-green-600 font-semibold text-lg">✅ Lesson Completed!</span>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default LessonDetail;
