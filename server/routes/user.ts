import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMe, updateMe, changePassword, deleteMe } from '../controllers/userController.js';

const router = Router();

// All routes below require a valid JWT
router.use(requireAuth);

router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/password', changePassword);
router.delete('/me', deleteMe);

export default router;
