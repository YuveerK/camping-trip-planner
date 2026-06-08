import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireTripAccess, requireOwner } from '../../middleware/tripAccess.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addMemberSchema } from './members.schema';
import * as membersController from './members.controller';

const router = Router({ mergeParams: true });

router.use(authenticate, requireTripAccess);

router.get('/', membersController.getMembers);
router.post('/', requireOwner, validate(addMemberSchema), membersController.addMember);
router.delete('/:memberId', requireOwner, membersController.removeMember);

export default router;
