import { Router } from 'express';
import { destroy, featured, index, map, patch, show, store } from '../controllers/propertyController.js';
import { listAmenities } from '../controllers/interactionController.js';
import { propertyAnalytics, trackClick } from '../controllers/analyticsController.js';
import { ROLES } from '../config/constants.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { createPropertySchema, propertyIdSchema, updatePropertySchema } from '../validators/propertyValidators.js';

const router = Router();

router.get('/', index);
router.get('/featured', featured);
router.get('/map', map);
router.get('/:id', validate(propertyIdSchema), show);
router.get('/:id/amenities', validate(propertyIdSchema), listAmenities);
router.get('/:id/analytics', authenticate, authorize(ROLES.ADMIN, ROLES.BROKER), validate(propertyIdSchema), propertyAnalytics);
router.post('/:id/click', validate(propertyIdSchema), trackClick);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.BROKER), upload.array('images', 12), validate(createPropertySchema), store);
router.patch('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.BROKER), validate(updatePropertySchema), patch);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.BROKER), validate(propertyIdSchema), destroy);

export default router;
