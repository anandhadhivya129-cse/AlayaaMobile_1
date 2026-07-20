import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import interactionRoutes from './interactionRoutes.js';
import locationRoutes from './locationRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'ALAYAA API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', interactionRoutes);
router.use('/locations', locationRoutes);

router.get('/docs', (_req, res) => {
  res.json({
    success: true,
    message: 'See backend/API_DOCUMENTATION.md and backend/postman/alayaa.postman_collection.json'
  });
});

export default router;
