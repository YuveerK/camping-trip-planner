import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireTripAccess, requireOwner } from '../../middleware/tripAccess.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTripSchema, updateTripSchema } from './trips.schema';
import * as tripsController from './trips.controller';

const router = Router();

router.use(authenticate);

router.get('/', tripsController.getTrips);
router.post('/', validate(createTripSchema), tripsController.createTrip);
router.get('/:tripId', requireTripAccess, tripsController.getTrip);
router.patch('/:tripId', requireTripAccess, requireOwner, validate(updateTripSchema), tripsController.updateTrip);
router.delete('/:tripId', requireTripAccess, requireOwner, tripsController.deleteTrip);

export default router;
