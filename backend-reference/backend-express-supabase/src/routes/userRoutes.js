import { Router } from 'express';
import { customerDashboard, recentlyViewed, recommendations, removeSavedProperty, saveProperty, updateProfile, wishlist } from '../controllers/userController.js';
import { ROLES } from '../config/constants.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { propertyIdSchema } from '../validators/propertyValidators.js';

const router = Router();

router.use(authenticate);
router.get('/dashboard', authorize(ROLES.CUSTOMER), customerDashboard);
router.patch('/profile', updateProfile);
router.get('/wishlist', wishlist);
router.post('/wishlist/:id', validate(propertyIdSchema), saveProperty);
router.delete('/wishlist/:id', validate(propertyIdSchema), removeSavedProperty);
router.get('/recently-viewed', recentlyViewed);
router.get('/recommendations', recommendations);

export default router;
