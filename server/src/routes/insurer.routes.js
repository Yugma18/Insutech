import { Router } from 'express';
import { getInsurers } from '../controllers/insurer.controller.js';

const router = Router();

router.get('/', getInsurers);

export default router;
