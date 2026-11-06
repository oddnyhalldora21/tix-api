import { Router } from 'express';
import { getProfile, updateProfile, deleteAccount } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users/profile - Get current user profile
router.get('/profile', getProfile);

// PUT /api/users/profile - Update current user profile
router.put('/profile', updateProfile);

// DELETE /api/users/account - Delete user account
router.delete('/account', deleteAccount);

export default router;