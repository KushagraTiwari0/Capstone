import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import quizzesData from "../../data/quizzes.json";
import Button from "../../components/common/Button";
import Sidebar from "../../components/common/Sidebar";

const QuizSummary = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, percentage, answers } = location.state || {};

  const quiz = quizzesData.find((q) => q.id === parseInt(id));

  if (!quiz || !score) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No results found
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

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = () => {
    if (percentage === 100) return "Perfect! You're a Quiz Master! 🏆";
    if (percentage >= 80) return "Excellent work! 🌟";
    if (percentage >= 60) return "Good job! Keep learning! 👍";
    return "Keep practicing! You'll improve! 💪";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Quiz Complete!
                </h1>
                <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
                  {percentage}%
                </div>
                <p className="text-xl text-gray-600 mb-2">
                  You scored {score} out of {total} questions
                </p>
                <p className="text-lg text-gray-700 font-semibold">
                  {getScoreMessage()}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Question Review
                </h2>
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer?.correct;

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border-2 ${
                          isCorrect
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">
                            Question {index + 1}: {question.question}
                          </h3>
                          <span
                            className={`text-2xl ${
                              isCorrect ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isCorrect ? "✓" : "✗"}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">Your answer:</span>{" "}
                            <span
                              className={
                                isCorrect ? "text-green-700" : "text-red-700"
                              }
                            >
                              {question.options[userAnswer?.answer]}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">
                                Correct answer:
                              </span>{" "}
                              <span className="text-green-700">
                                {question.options[question.correctAnswer]}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Link to="/lessons">
                  <Button variant="secondary" size="lg">
                    Back to Lessons
                  </Button>
                </Link>
                <Button
                  onClick={() => navigate(`/quiz/${id}`)}
                  variant="primary"
                  size="lg"
                >
                  Retake Quiz
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizSummary;
