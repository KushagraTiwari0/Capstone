import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizzesData from "../../data/quizzes.json";
import { useUser } from "../../context/UserContext";
import Button from "../../components/common/Button";
import Sidebar from "../../components/common/Sidebar";

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { saveQuizScore, addPoints, addBadge } = useUser();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const foundQuiz = quizzesData.find((q) => q.id === parseInt(id));
    if (foundQuiz) {
      setQuiz(foundQuiz);
    }
  }, [id]);

  const handleAnswerSelect = (answerIndex) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const question = quiz.questions[currentQuestion];
    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setAnswers([
      ...answers,
      { questionId: question.id, answer: selectedAnswer, correct },
    ]);
  };

  const handleNext = async () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Create complete answers array including current answer
      // Note: answers state might not be updated yet, so we create it manually
      const currentAnswer = {
        questionId: quiz.questions[currentQuestion].id,
        answer: selectedAnswer,
        correct: isCorrect,
      };
      const allAnswers = [...answers, currentAnswer];

      // Calculate score from complete answers array
      const score = allAnswers.filter((a) => a.correct).length;
      const total = quiz.questions.length;
      const percentage = Math.round((score / total) * 100);

      // Save score (this will save to backend and add points)
      await saveQuizScore(quiz.id, score, percentage, total);

      // Award points (if quiz has points)
      if (quiz.points) {
        await addPoints(quiz.points);
      }

      // Award badge if 100%
      if (percentage === 100) {
        await addBadge({
          id: 2,
          name: "Quiz Master",
          description: "Score 100% on any quiz",
          icon: "🏆",
        });
      }

      navigate(`/quiz/${quiz.id}/summary`, {
        state: {
          score,
          total: quiz.questions.length,
          percentage,
          answers: allAnswers,
        },
      });
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Quiz not found
          </h2>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                    {quiz.title}
                  </h1>
                  <span className="text-base sm:text-lg font-semibold text-gray-600">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                  {question.question}
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {question.options.map((option, index) => {
                    let buttonClass =
                      "w-full text-left p-4 rounded-lg border-2 transition-all ";

                    if (showFeedback) {
                      if (index === question.correctAnswer) {
                        buttonClass +=
                          "bg-green-100 border-green-500 text-green-800";
                      } else if (index === selectedAnswer && !isCorrect) {
                        buttonClass += "bg-red-100 border-red-500 text-red-800";
                      } else {
                        buttonClass +=
                          "bg-gray-50 border-gray-200 text-gray-600";
                      }
                    } else {
                      buttonClass +=
                        selectedAnswer === index
                          ? "bg-primary-100 border-primary-500 text-primary-800"
                          : "bg-white border-gray-300 hover:border-primary-300 text-gray-700";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        className={buttonClass}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span>{option}</span>
                          {showFeedback && index === question.correctAnswer && (
                            <span className="ml-auto text-2xl">✓</span>
                          )}
                          {showFeedback &&
                            index === selectedAnswer &&
                            !isCorrect && (
                              <span className="ml-auto text-2xl">✗</span>
                            )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {showFeedback && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    isCorrect
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      isCorrect ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {isCorrect
                      ? "✓ Correct! Well done!"
                      : "✗ Incorrect. The correct answer is highlighted."}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                {!showFeedback ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    variant="primary"
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} variant="primary" size="lg">
                    {currentQuestion < quiz.questions.length - 1
                      ? "Next Question →"
                      : "View Results"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizPage;
