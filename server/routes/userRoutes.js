import express from 'express';
import { checkAuth, login, signup, updateProfile, logout } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.post('/update-profile', protectRoute, updateProfile);
userRouter.post('/check', protectRoute, checkAuth );
userRouter.post('/logout', logout);

export default userRouter;


