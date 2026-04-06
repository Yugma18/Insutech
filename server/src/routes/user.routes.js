import { Router } from 'express';
import { register, login, getMe, updateMe } from '../controllers/user.controller.js';
import { purchase, listMine } from '../controllers/policy.controller.js';
import { requireUser } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login',    login);

router.get('/me',       requireUser, getMe);
router.put('/me',       requireUser, updateMe);

router.post('/policies', requireUser, purchase);
router.get('/policies',  requireUser, listMine);

export default router;
