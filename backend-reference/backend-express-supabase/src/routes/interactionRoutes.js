import { Router } from 'express';
import { compare, createInquiry, createVisit, listMyVisits } from '../controllers/interactionController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { compareSchema, inquirySchema, visitSchema } from '../validators/interactionValidators.js';

const router = Router();

router.post('/compare', validate(compareSchema), compare);
router.post('/inquiries', authenticate, validate(inquirySchema), createInquiry);
router.post('/visits', authenticate, validate(visitSchema), createVisit);
router.get('/visits/me', authenticate, listMyVisits);

export default router;
