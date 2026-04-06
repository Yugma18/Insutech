import prisma from '../utils/prisma.js';

// POST /leads/ping — silently increments visitCount for a returning user
export async function pingVisit(req, res) {
  const { phone } = req.body;
  if (!phone?.trim()) return res.status(400).json({ error: 'Phone required' });

  const lead = await prisma.lead.findUnique({ where: { phone: phone.trim() } });
  if (!lead) return res.status(404).json({ error: 'Not found' });

  await prisma.lead.update({
    where: { phone: phone.trim() },
    data:  { visitCount: { increment: 1 }, lastVisitAt: new Date() },
  });

  res.json({ ok: true });
}

// POST /leads/quick-capture — name + phone only, upserts by phone
export async function quickCapture(req, res) {
  const { name, phone } = req.body;

  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  if (!/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
  }

  const lead = await prisma.lead.upsert({
    where:  { phone: phone.trim() },
    create: { name: name.trim(), phone: phone.trim() },
    update: {
      name:        name.trim(),
      visitCount:  { increment: 1 },
      lastVisitAt: new Date(),
    },
  });

  res.status(200).json({ message: 'Got it! We will be in touch.', id: lead.id });
}

// POST /leads — full form, upserts by phone and enriches the lead
export async function createLead(req, res) {
  const {
    name, email, phone, dateOfBirth, gender,
    planTypeInterest, numFamilyMembers, sumInsuredPreference, city,
    isSmoker, hasDiabetes, hasBP, hasHeartCondition, hasThyroid,
    hasCancerHistory, hasKidneyDisease, hasOtherCondition, otherConditionDetail,
    recommendedPlanIds,
  } = req.body;

  if (!name || !phone || !dateOfBirth || !gender || !planTypeInterest) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  if (!/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
  }

  const dob = new Date(dateOfBirth);
  const age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  const fullData = {
    name:                name.trim(),
    email:               email?.trim() ?? null,
    phone:               phone.trim(),
    dateOfBirth:         dob,
    age,
    gender,
    planTypeInterest,
    numFamilyMembers:     numFamilyMembers     ?? null,
    sumInsuredPreference: sumInsuredPreference ?? null,
    city:                city?.trim()          ?? null,
    isSmoker:            isSmoker             ?? false,
    hasDiabetes:         hasDiabetes          ?? false,
    hasBP:               hasBP                ?? false,
    hasHeartCondition:   hasHeartCondition    ?? false,
    hasThyroid:          hasThyroid           ?? false,
    hasCancerHistory:    hasCancerHistory     ?? false,
    hasKidneyDisease:    hasKidneyDisease     ?? false,
    hasOtherCondition:   hasOtherCondition    ?? false,
    otherConditionDetail: otherConditionDetail ?? null,
    recommendedPlanIds:  recommendedPlanIds ? JSON.stringify(recommendedPlanIds) : null,
    lastVisitAt:         new Date(),
  };

  const lead = await prisma.lead.upsert({
    where:  { phone: phone.trim() },
    create: { ...fullData, visitCount: 1 },
    update: { ...fullData, visitCount: { increment: 1 } },
  });

  res.status(200).json({ message: 'Thank you! Our team will contact you shortly.', id: lead.id });
}
