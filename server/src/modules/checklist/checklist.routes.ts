import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createChecklistItemSchema, updateChecklistItemSchema } from './checklist.schema';
import * as checklistController from './checklist.controller';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', checklistController.getItems);
router.post('/', validate(createChecklistItemSchema), checklistController.createItem);
router.patch('/:itemId', validate(updateChecklistItemSchema), checklistController.updateItem);
router.delete('/:itemId', checklistController.deleteItem);

export default router;
