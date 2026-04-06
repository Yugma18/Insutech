import { Router } from 'express';
import { createLead, quickCapture } from '../controllers/lead.controller.js';

const router = Router();

router.post('/quick-capture', quickCapture);
router.post('/', createLead);

export default router;
