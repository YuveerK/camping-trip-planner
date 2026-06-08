import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireTripAccess } from '../../middleware/tripAccess.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createPackingItemSchema, updatePackingItemSchema, createCategorySchema } from './packing.schema';
import * as packingController from './packing.controller';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

// Static routes before /:itemId
router.get('/categories', packingController.getCategories);
router.post('/categories', validate(createCategorySchema), packingController.createCategory);
router.get('/missing', packingController.getMissingItems);
router.post('/template', packingController.loadTemplate);
router.get('/', packingController.getItems);
router.post('/', validate(createPackingItemSchema), packingController.createItem);
router.patch('/:itemId', validate(updatePackingItemSchema), packingController.updateItem);
router.delete('/:itemId', packingController.deleteItem);

export default router;
