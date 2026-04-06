import prisma from '../utils/prisma.js';

function genPolicyNumber() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INS-${ts}-${rnd}`;
}

// POST /api/user/policies — purchase a plan
export async function purchase(req, res) {
  const { planId, sumInsured, familyConfig } = req.body;
  if (!planId || !sumInsured || !familyConfig)
    return res.status(400).json({ error: 'planId, sumInsured, and familyConfig are required' });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) return res.status(404).json({ error: 'Plan not found or inactive' });

  // Look up matching premium
  const premium = await prisma.premium.findFirst({
    where: { planId, sumInsured: Number(sumInsured), familyConfig },
  });
  if (!premium) return res.status(400).json({ error: 'No premium found for the selected sum insured and family config' });

  const policy = await prisma.policy.create({
    data: {
      userId:        req.userId,
      planId,
      policyNumber:  genPolicyNumber(),
      sumInsured:    Number(sumInsured),
      annualPremium: premium.annualPremium,
      familyConfig,
      status:        'PENDING',
    },
    include: { plan: { include: { insurer: true } } },
  });

  res.status(201).json(policy);
}

// GET /api/user/policies — list user's own policies
export async function listMine(req, res) {
  const policies = await prisma.policy.findMany({
    where:   { userId: req.userId },
    include: { plan: { include: { insurer: { select: { name: true, logoUrl: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(policies);
}
