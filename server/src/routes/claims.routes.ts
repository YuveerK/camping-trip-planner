import { Router } from 'express';
import { createClaim, updateClaim, deleteClaim, togglePacked } from '../controllers/claims.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createClaimSchema, updateClaimSchema } from '../validators/claims.validators';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', validate(createClaimSchema), createClaim);
router.patch('/:claimId', validate(updateClaimSchema), updateClaim);
router.delete('/:claimId', deleteClaim);
router.patch('/:claimId/packed', togglePacked);

export default router;
