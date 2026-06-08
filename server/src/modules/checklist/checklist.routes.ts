import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  createChecklistItemSchema,
  updateChecklistItemSchema,
  visibilitySchema,
} from './checklist.schema';
import * as checklistController from './checklist.controller';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Static routes must come before /:param routes to avoid Express param collision
router.get('/owner', checklistController.getOwnerItems);
router.patch('/visibility', validate(visibilitySchema), checklistController.setVisibility);

// Category routes
router.post('/categories', validate(createCategorySchema), checklistController.createCategory);
router.patch('/categories/:categoryId', validate(updateCategorySchema), checklistController.updateCategory);
router.delete('/categories/:categoryId', checklistController.deleteCategory);

// Item routes
router.get('/', checklistController.getItems);
router.post('/', validate(createChecklistItemSchema), checklistController.createItem);
router.patch('/:itemId', validate(updateChecklistItemSchema), checklistController.updateItem);
router.delete('/:itemId', checklistController.deleteItem);

export default router;
