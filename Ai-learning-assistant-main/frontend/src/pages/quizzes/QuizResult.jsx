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
    <div className="max-w-4xl mx-auto py-10 space-y-10">

      {/* ================= BACK BUTTON ================= */}
      <Link
        to={`/documents/${quiz.document?._id}`}
        className="flex items-center gap-2 text-slate-600 hover:text-black transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Document
      </Link>

      {/* ================= SCORE CARD ================= */}
      <div className="bg-white border rounded-3xl shadow-lg p-10 text-center">

        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-5 rounded-2xl shadow-inner">
            <Trophy className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <p className="uppercase text-sm text-slate-500 tracking-wide">
          Your Score
        </p>

        <h2
          className={`text-6xl font-bold mt-3 ${
            score >= 60 ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          {score}%
        </h2>

        <p className="mt-3 text-slate-600 text-lg">
          {score >= 60 ? "Great job! 🎉" : "Keep practicing! 💪"}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-6 mt-8">
          <div className="bg-slate-100 px-5 py-3 rounded-xl flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-600" />
            <span className="font-medium">{total} Total</span>
          </div>

          <div className="bg-emerald-100 text-emerald-700 px-5 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">{correct} Correct</span>
          </div>

          <div className="bg-rose-100 text-rose-700 px-5 py-3 rounded-xl flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            <span className="font-medium">{incorrect} Incorrect</span>
          </div>
        </div>
      </div>

      {/* ================= DETAILED REVIEW ================= */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-slate-700" />
          <h3 className="text-xl font-semibold">Detailed Review</h3>
        </div>

        <div className="space-y-8">
          {detailedResults.map((item, index) => {
            const userAnswerIndex = item.options.findIndex(
              (opt) => opt === item.selectedAnswer
            );

            const correctAnswerIndex = item.options.findIndex(
              (opt) => opt === item.correctAnswer
            );

            return (
              <div
                key={index}
                className="bg-white border rounded-2xl p-8 shadow-sm"
              >
                {/* Question Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
                      Question {index + 1}
                    </span>

                    <h4 className="mt-3 font-semibold text-lg text-slate-900">
                      {item.question}
                    </h4>
                  </div>

                  {item.isCorrect ? (
                    <CheckCircle2 className="text-emerald-600 w-6 h-6" />
                  ) : (
                    <XCircle className="text-rose-600 w-6 h-6" />
                  )}
                </div>

                {/* Options */}
                <div className="space-y-4">
                  {item.options.map((option, i) => {
                    const isCorrectOption = i === correctAnswerIndex;
                    const isUserAnswer = i === userAnswerIndex;
                    const isWrongAnswer = isUserAnswer && !item.isCorrect;

                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border transition ${
                          isCorrectOption
                            ? "bg-emerald-50 border-emerald-400"
                            : isWrongAnswer
                            ? "bg-rose-50 border-rose-400"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-slate-800">{option}</span>

                          <div className="flex gap-2">
                            {isCorrectOption && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                                Correct
                              </span>
                            )}

                            {isWrongAnswer && (
                              <span className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
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
                  <div className="mt-6 bg-slate-100 p-5 rounded-xl text-sm text-slate-700">
                    <span className="font-semibold">Explanation:</span>{" "}
                    {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= RETURN BUTTON ================= */}
      <div className="text-center pt-6">
        <Link to={`/documents/${quiz.document?._id}`}>
          <button className="bg-emerald-500 hover:bg-emerald-600 transition text-white px-10 py-3 rounded-xl shadow-md">
            Return to Document
          </button>
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;
