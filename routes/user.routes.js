import express from 'express';
import { getUser, updateUser, signup, login, logout } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/user.middleware.js'

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.get('/users', authenticate, getUser);
router.put('/update-user', authenticate, updateUser);

export default router