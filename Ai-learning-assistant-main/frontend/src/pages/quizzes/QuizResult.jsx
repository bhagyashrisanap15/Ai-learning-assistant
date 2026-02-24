import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error("Failed to fetch quiz results.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results || !results.data) {
    return (
      <div className="text-center mt-10 text-slate-600">
        Quiz results not found.
      </div>
    );
  }

  const { quiz, results: detailedResults } = results.data;

  const total = detailedResults.length;
  const correct = detailedResults.filter((r) => r.isCorrect).length;
  const incorrect = total - correct;
  const score = quiz.score;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">

      {/* Back Button */}
      <Link
        to={`/documents/${quiz.document?._id}`}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Document
      </Link>

      {/* ================= SCORE CARD ================= */}
      <div className="bg-white border rounded-2xl shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-100 p-4 rounded-2xl">
            <Trophy className="w-7 h-7 text-emerald-600" />
          </div>
        </div>

        <p className="text-sm uppercase text-slate-500 mb-2">
          Your Score
        </p>

        <h2 className="text-5xl font-bold text-rose-500">
          {score}%
        </h2>

        <p className="mt-2 text-slate-600">
          {score >= 60 ? "Good job!" : "Keep practicing! 💪"}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
            <Target className="w-4 h-4 text-slate-600" />
            {total} Total
          </div>

          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            {correct} Correct
          </div>

          <div className="flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-xl">
            <XCircle className="w-4 h-4" />
            {incorrect} Incorrect
          </div>
        </div>
      </div>

      {/* ================= DETAILED REVIEW ================= */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold">Detailed Review</h3>
        </div>

        <div className="space-y-6">
          {detailedResults.map((item, index) => {
            const userAnswerIndex = item.options.findIndex(
              (opt) => opt === item.selectedAnswer
            );

            const correctAnswerIndex =
              item.options.findIndex(
                (opt) => opt === item.correctAnswer
              );

            return (
              <div
                key={index}
                className="bg-white border rounded-2xl p-6 shadow-sm relative"
              >
                {/* Question Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
                      Question {index + 1}
                    </span>

                    <h4 className="mt-2 font-semibold text-slate-900">
                      {item.question}
                    </h4>
                  </div>

                  {item.isCorrect ? (
                    <CheckCircle2 className="text-emerald-600" />
                  ) : (
                    <XCircle className="text-rose-600" />
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {item.options.map((option, i) => {
                    const isCorrectOption =
                      i === correctAnswerIndex;
                    const isUserAnswer =
                      i === userAnswerIndex;
                    const isWrongAnswer =
                      isUserAnswer && !item.isCorrect;

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${
                          isCorrectOption
                            ? "bg-emerald-50 border-emerald-300"
                            : isWrongAnswer
                            ? "bg-rose-50 border-rose-300"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{option}</span>

                          <div className="flex gap-2">
                            {isCorrectOption && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                Correct
                              </span>
                            )}

                            {isWrongAnswer && (
                              <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded">
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div className="mt-4 p-4 bg-slate-100 rounded-lg text-sm text-slate-700">
                    <span className="font-semibold">
                      Explanation:
                    </span>{" "}
                    {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Return Button */}
      <div className="text-center">
        <Link to={`/documents/${quiz.document?._id}`}>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg shadow-md">
            Return to Document
          </button>
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;