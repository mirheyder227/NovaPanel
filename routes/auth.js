// server/routes/auth.js
import express from 'express';
const router = express.Router();
import { login, signup, logout } from '../controllers/authController.js';

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);

export default router;