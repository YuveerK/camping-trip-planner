import { Router } from 'express';
import { getMembers, addMember, removeMember } from '../controllers/members.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTripAccess, requireOwner } from '../middleware/tripAccess.middleware';
import { validate } from '../middleware/validate.middleware';
import { addMemberSchema } from '../validators/members.validators';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

router.get('/', getMembers);
router.post('/', requireOwner, validate(addMemberSchema), addMember);
router.delete('/:memberId', requireOwner, removeMember);

export default router;
