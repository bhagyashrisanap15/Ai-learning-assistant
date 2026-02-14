import express from "express";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";
import protect from '../middleware/auth.js';

const router = express.Router();

router.post("/", protect, createTodo);
router.get("/", protect, getTodos);
router.patch("/:id", protect, updateTodo);
router.delete("/:id", protect, deleteTodo);

export default router;
