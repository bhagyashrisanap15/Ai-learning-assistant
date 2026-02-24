import express from "express";
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
} from "../controllers/quizController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// ✅ Specific routes FIRST
router.get("/quiz/:id", getQuizById);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", getQuizResults);
router.delete("/:id", deleteQuiz);

// ✅ Generic route LAST
router.get("/:documentId", getQuizzes);

export default router;
