import { Router } from 'express';
import { getTrips, getTrip, createTrip, updateTrip, deleteTrip } from '../controllers/trips.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTripAccess, requireOwner } from '../middleware/tripAccess.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTripSchema, updateTripSchema } from '../validators/trips.validators';

const router = Router();

router.use(authenticate);

router.get('/', getTrips);
router.post('/', validate(createTripSchema), createTrip);
router.get('/:tripId', requireTripAccess, getTrip);
router.patch('/:tripId', requireTripAccess, requireOwner, validate(updateTripSchema), updateTrip);
router.delete('/:tripId', requireTripAccess, requireOwner, deleteTrip);

export default router;
