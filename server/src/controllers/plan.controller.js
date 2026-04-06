import prisma from '../utils/prisma.js';

export async function getPlans(req, res) {
  const { category, planType, minAge, maxSI, minSI } = req.query;

  const where = {
    isActive: true,
    ...(planType && { planType }),
    ...(minAge && { minEntryAge: { lte: parseInt(minAge) }, maxEntryAge: { gte: parseInt(minAge) } }),
    ...(minSI && { minSumInsured: { lte: parseInt(minSI) } }),
    ...(maxSI && { maxSumInsured: { gte: parseInt(maxSI) } }),
    insurer: {
      isActive: true,
      ...(category && { category }),
    },
  };

  const CARD_FEATURE_KEYS = [
    'waiting_period_ped', 'restore_benefit',
    'pre_hospitalization_days', 'post_hospitalization_days',
    'room_limit', 'co_pay',
  ];

  const plans = await prisma.plan.findMany({
    where,
    include: {
      insurer: { select: { id: true, name: true, category: true, logoUrl: true } },
      features: { where: { featureKey: { in: CARD_FEATURE_KEYS } } },
      premiums: true,
    },
    orderBy: [{ insurer: { category: 'asc' } }, { insurer: { name: 'asc' } }],
  });

  res.json(plans);
}

export async function getPlanById(req, res) {
  const plan = await prisma.plan.findUnique({
    where: { id: req.params.id },
    include: {
      insurer: true,
      features: { orderBy: [{ featureCategory: 'asc' }, { displayOrder: 'asc' }] },
      premiums: { orderBy: [{ ageGroup: 'asc' }] },
    },
  });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json(plan);
}

export async function comparePlans(req, res) {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: 'ids query param required' });

  const idList = ids.split(',').filter(Boolean);
  if (idList.length < 2) return res.status(400).json({ error: 'At least 2 plan ids required' });

  const plans = await prisma.plan.findMany({
    where: { id: { in: idList } },
    include: {
      insurer: { select: { id: true, name: true, category: true, logoUrl: true } },
      features: { orderBy: [{ featureCategory: 'asc' }, { displayOrder: 'asc' }] },
      premiums: true,
    },
  });

  // Get all unique feature keys across these plans
  const allFeatureKeys = [
    ...new Set(plans.flatMap((p) => p.features.map((f) => f.featureKey))),
  ];

  // Build comparison matrix
  const comparison = allFeatureKeys.map((key) => {
    const row = { featureKey: key, featureLabel: '', featureCategory: '', values: {} };
    plans.forEach((plan) => {
      const feat = plan.features.find((f) => f.featureKey === key);
      if (feat) {
        row.featureLabel = feat.featureLabel;
        row.featureCategory = feat.featureCategory;
        row.values[plan.id] = feat.featureValue;
      } else {
        row.values[plan.id] = null;
      }
    });
    return row;
  });

  res.json({ plans, comparison });
}

export async function getPlanPremiums(req, res) {
  const premiums = await prisma.premium.findMany({
    where: { planId: req.params.id },
    orderBy: [{ ageGroup: 'asc' }],
  });
  res.json(premiums);
}
