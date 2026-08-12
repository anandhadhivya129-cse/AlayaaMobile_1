import { Router } from 'express';
import { tamilNaduCities } from '../controllers/locationController.js';

const router = Router();

router.get('/tamil-nadu/cities', tamilNaduCities);

export default router;
