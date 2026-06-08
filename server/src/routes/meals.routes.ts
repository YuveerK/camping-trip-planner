import { Router } from 'express';
import { getMeals, createMeal, updateMeal, deleteMeal } from '../controllers/meals.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTripAccess } from '../middleware/tripAccess.middleware';
import { validate } from '../middleware/validate.middleware';
import { createMealSchema, updateMealSchema } from '../validators/meals.validators';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

router.get('/', getMeals);
router.post('/', validate(createMealSchema), createMeal);
router.patch('/:mealId', validate(updateMealSchema), updateMeal);
router.delete('/:mealId', deleteMeal);

export default router;
