import express from 'express';
import { body } from 'express-validator';
import {
    register,
    login,
    getprofile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import Protect from '../middleware/auth.js';

const routes = express.Router();

const registerValidation = [
    body('username')
        .trim()
        .isLength({ min:3 })
        .withMessage('Username must be at least 3 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('please enter valid email'),
    body('password')
        .isLength({ min:6 })
        .withMessage('password must be at least 9 character'),

];

const loginValidation = [
     body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('please enter valid email'),
    body('password')
        .notEmpty()
        .withMessage('password is required')


];

routes.post('/register',registerValidation, register);
routes.post('/login', loginValidation, login);


router.get('/profile',Protect,getprofile);
router.get('/profile',Protect,updateProfile);
router.post('/change-password',Protect,changePassword);

export default router;