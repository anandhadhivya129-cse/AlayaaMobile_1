import { Router } from 'express';
import { forgotPassword, login, logout, me, register, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/customer/register', validate(registerSchema), register);
router.post('/broker/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/customer/login', validate(loginSchema), login);
router.post('/broker/login', validate(loginSchema), login);
router.post('/admin/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authenticate, validate(resetPasswordSchema), resetPassword);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
