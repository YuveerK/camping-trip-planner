import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createClaimSchema, updateClaimSchema } from './claims.schema';
import * as claimsController from './claims.controller';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', validate(createClaimSchema), claimsController.createClaim);
router.patch('/:claimId', validate(updateClaimSchema), claimsController.updateClaim);
router.delete('/:claimId', claimsController.deleteClaim);
router.patch('/:claimId/toggle-packed', claimsController.togglePacked);

export default router;
