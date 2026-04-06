import { Router } from 'express';
import { getRecommendations } from '../controllers/recommend.controller.js';

const router = Router();

router.post('/', getRecommendations);

export default router;
