import express from "express";
import { body, validationResult } from "express-validator";
import {
  register,
  login,
  getprofile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// 🔹 VALIDATION HANDLER (THIS WAS MISSING)
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }

  next();
};

// ================= REGISTER =================
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// ================= LOGIN =================
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// ✅ FIXED ROUTES
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);

router.get("/profile", protect, getprofile);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

export default router;
