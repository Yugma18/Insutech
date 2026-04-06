import express, { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdmin } from '../middleware/auth.middleware.js';
import * as insurerCtrl from '../controllers/admin/insurer.admin.controller.js';
import * as planCtrl from '../controllers/admin/plan.admin.controller.js';
import * as leadCtrl from '../controllers/admin/lead.admin.controller.js';
import * as policyCtrl from '../controllers/admin/policy.admin.controller.js';
import { logoUpload } from '../middleware/upload.js';
import prisma from '../utils/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = Router();

// All admin routes require JWT
router.use(requireAdmin);

// Insurers
router.get('/insurers', insurerCtrl.list);
router.post('/insurers', insurerCtrl.create);
router.put('/insurers/:id', insurerCtrl.update);
router.delete('/insurers/:id', insurerCtrl.remove);

// Logo upload — must be before /:id routes
router.post('/insurers/:id/logo', logoUpload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const logoUrl = req.file.path; // Cloudinary secure URL
  await prisma.insurer.update({ where: { id: req.params.id }, data: { logoUrl } });
  res.json({ logoUrl });
});

// Plans
router.get('/plans', planCtrl.list);
router.post('/plans', planCtrl.create);
router.put('/plans/:id', planCtrl.update);
router.delete('/plans/:id', planCtrl.remove);

// Features (per plan)
router.post('/plans/:planId/features', planCtrl.upsertFeature);
router.delete('/plans/:planId/features/:featureKey', planCtrl.deleteFeature);

// Bulk import
router.get('/plans/:planId/features/template', planCtrl.featuresTemplate);
router.post('/plans/:planId/features/import', express.text({ type: '*/*', limit: '2mb' }), planCtrl.importFeatures);
router.get('/plans/:planId/premiums/template', planCtrl.premiumsTemplate);
router.post('/plans/:planId/premiums/import', express.text({ type: '*/*', limit: '2mb' }), planCtrl.importPremiums);

// Premiums
router.post('/plans/:planId/premiums', planCtrl.createPremium);
router.put('/premiums/:id', planCtrl.updatePremium);
router.delete('/premiums/:id', planCtrl.deletePremium);

// Leads
router.get('/leads/export', leadCtrl.exportCSV);
router.get('/leads', leadCtrl.list);
router.get('/leads/:id', leadCtrl.getById);
router.put('/leads/:id', leadCtrl.update);

// Policies
router.get('/policies', policyCtrl.list);
router.put('/policies/:id', policyCtrl.update);

// Dashboard stats
router.get('/stats', async (req, res) => {
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const [totalLeads, newLeads, totalPlans, totalInsurers, totalPolicies, expiringPolicies] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.insurer.count({ where: { isActive: true } }),
    prisma.policy.count({ where: { status: 'ACTIVE' } }),
    prisma.policy.count({ where: { status: 'ACTIVE', endDate: { lte: thirtyDaysFromNow, gte: new Date() } } }),
  ]);
  res.json({ totalLeads, newLeads, totalPlans, totalInsurers, totalPolicies, expiringPolicies });
});

export default router;
