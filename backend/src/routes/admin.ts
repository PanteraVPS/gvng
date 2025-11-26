import express from 'express';
import { getAllUsers, updateUser, banUser } from '../controllers/adminController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/users', authenticateToken, isAdmin, getAllUsers);
router.put('/users/:id', authenticateToken, isAdmin, updateUser);
router.post('/users/:id/ban', authenticateToken, isAdmin, banUser);

export default router;
