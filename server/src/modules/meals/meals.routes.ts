import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireTripAccess } from '../../middleware/tripAccess.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createMealSchema, updateMealSchema } from './meals.schema';
import * as mealsController from './meals.controller';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

router.get('/', mealsController.getMeals);
router.post('/', validate(createMealSchema), mealsController.createMeal);
router.patch('/:mealId', validate(updateMealSchema), mealsController.updateMeal);
router.delete('/:mealId', mealsController.deleteMeal);

export default router;
