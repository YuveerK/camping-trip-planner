import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTripAccess } from '../middleware/tripAccess.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../validators/tasks.validators';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

router.get('/', getTasks);
router.post('/', validate(createTaskSchema), createTask);
router.patch('/:taskId', validate(updateTaskSchema), updateTask);
router.delete('/:taskId', deleteTask);

export default router;
