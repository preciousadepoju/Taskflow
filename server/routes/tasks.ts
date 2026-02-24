import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    toggleComplete,
    getTaskStats,
} from '../controllers/taskController.js';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

router.get('/stats', getTaskStats);        // GET  /api/tasks/stats
router.get('/', getTasks);                 // GET  /api/tasks?tab=inbox&priority=High&search=...
router.post('/', createTask);              // POST /api/tasks
router.get('/:id', getTaskById);           // GET  /api/tasks/:id
router.put('/:id', updateTask);            // PUT  /api/tasks/:id
router.delete('/:id', deleteTask);         // DELETE /api/tasks/:id
router.patch('/:id/complete', toggleComplete); // PATCH /api/tasks/:id/complete

export default router;
