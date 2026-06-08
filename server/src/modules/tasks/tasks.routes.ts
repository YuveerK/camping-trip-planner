import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireTripAccess } from '../../middleware/tripAccess.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from './tasks.schema';
import * as tasksController from './tasks.controller';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

router.get('/', tasksController.getTasks);
router.post('/', validate(createTaskSchema), tasksController.createTask);
router.patch('/:taskId', validate(updateTaskSchema), tasksController.updateTask);
router.delete('/:taskId', tasksController.deleteTask);

export default router;
