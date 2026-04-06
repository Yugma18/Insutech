import { Router } from 'express';
import { getPlans, getPlanById, comparePlans, getPlanPremiums } from '../controllers/plan.controller.js';

const router = Router();

router.get('/compare', comparePlans);
router.get('/', getPlans);
router.get('/:id', getPlanById);
router.get('/:id/premiums', getPlanPremiums);

export default router;
