import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import lessonsData from "../../data/lessons.json";
import quizzesData from "../../data/quizzes.json";
import { useUser } from "../../context/UserContext";
import { getDifficultyColor } from "../../utils/helpers";
import Button from "../../components/common/Button";
import Sidebar from "../../components/common/Sidebar";

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completeLesson, completedLessons, addPoints, addBadge } = useUser();
  const [lesson, setLesson] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const foundLesson = lessonsData.find((l) => l.id === parseInt(id));
    if (foundLesson) {
      setLesson(foundLesson);
      setIsCompleted(completedLessons.includes(foundLesson.id));
    }
  }, [id, completedLessons]);

  const handleComplete = async () => {
    if (!isCompleted && lesson) {
      try {
        // Complete lesson (this will save to backend and add points)
        await completeLesson(lesson.id, {
          title: lesson.title,
          points: 50
        });
        
        // Award badge if this is the first lesson
        if (completedLessons.length === 0) {
          await addBadge({
            id: 1,
            name: "First Steps",
            description: "Complete your first lesson",
            icon: "🌱",
          });
        }
        
        setIsCompleted(true);
      } catch (error) {
        console.error('Error completing lesson:', error);
        alert('Failed to complete lesson. Please try again.');
      }
    }
  };

  const relatedQuiz = quizzesData.find((q) => q.lessonId === lesson?.id);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Lesson not found
          </h2>
          <Link
            to="/lessons"
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/lessons"
              className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
            >
              ← Back to Lessons
            </Link>

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
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    {lesson.title}
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">
                    {lesson.description}
                  </p>
                  <div className="flex items-center space-x-4 text-gray-500">
                    <span className="flex items-center">
                      <span className="mr-1">⏱️</span>
                      {lesson.duration}
                    </span>
                    <span
                      className={`px-3 py-1 rounded ${getDifficultyColor(
                        lesson.difficulty
                      )}`}
                    >
                      {lesson.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {isCompleted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">✓</span>
                    <span className="text-green-800 font-semibold">
                      You've completed this lesson!
                    </span>
                  </div>
                </div>
              )}

              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {lesson.content}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  {!isCompleted && (
                    <Button
                      onClick={handleComplete}
                      variant="primary"
                      size="lg"
                    >
                      Mark as Complete
                    </Button>
                  )}
                  {relatedQuiz && (
                    <Link to={`/quiz/${relatedQuiz.id}`}>
                      <Button variant="success" size="lg">
                        Take Quiz →
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LessonDetail;
