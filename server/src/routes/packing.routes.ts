import { Router } from 'express';
import {
  getCategories, getItems, getMissingItems,
  createItem, updateItem, deleteItem, createCategory
} from '../controllers/packing.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTripAccess } from '../middleware/tripAccess.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPackingItemSchema, updatePackingItemSchema, createCategorySchema } from '../validators/packing.validators';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

router.get('/categories', getCategories);
router.post('/categories', validate(createCategorySchema), createCategory);
router.get('/', getItems);
router.get('/missing', getMissingItems);
router.post('/', validate(createPackingItemSchema), createItem);
router.patch('/:itemId', validate(updatePackingItemSchema), updateItem);
router.delete('/:itemId', deleteItem);

export default router;
