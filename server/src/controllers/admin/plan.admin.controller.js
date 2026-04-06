import prisma from '../../utils/prisma.js';
import { FEATURE_MASTER, FEATURE_KEY_SET } from '../../utils/featureMaster.js';

// ── CSV helpers ───────────────────────────────────────────────────────────────

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape  = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\r\n');
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map((line) => {
    // Handle quoted fields that may contain commas
    const values = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur); cur = ''; }
      else { cur += ch; }
    }
    values.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]));
  });
}

export async function list(req, res) {
  const plans = await prisma.plan.findMany({
    include: { insurer: { select: { id: true, name: true, category: true } } },
    orderBy: [{ insurer: { name: 'asc' } }, { name: 'asc' }],
  });
  res.json(plans);
}

export async function create(req, res) {
  const { insurerId, name, planType, variant, minSumInsured, maxSumInsured, minEntryAge, maxEntryAge } = req.body;
  const plan = await prisma.plan.create({
    data: { insurerId, name, planType, variant, minSumInsured, maxSumInsured, minEntryAge, maxEntryAge },
  });
  res.status(201).json(plan);
}

export async function update(req, res) {
  const { name, planType, variant, minSumInsured, maxSumInsured, minEntryAge, maxEntryAge, isActive } = req.body;
  const plan = await prisma.plan.update({
    where: { id: req.params.id },
    data: { name, planType, variant, minSumInsured, maxSumInsured, minEntryAge, maxEntryAge, isActive },
  });
  res.json(plan);
}

export async function remove(req, res) {
  await prisma.plan.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
}

export async function upsertFeature(req, res) {
  const { planId } = req.params;
  const { featureKey, featureLabel, featureValue, featureCategory, displayOrder } = req.body;
  const feature = await prisma.planFeature.upsert({
    where: { planId_featureKey: { planId, featureKey } },
    update: { featureLabel, featureValue, featureCategory, displayOrder: displayOrder ?? 0 },
    create: { planId, featureKey, featureLabel, featureValue, featureCategory, displayOrder: displayOrder ?? 0 },
  });
  res.json(feature);
}

export async function deleteFeature(req, res) {
  const { planId, featureKey } = req.params;
  await prisma.planFeature.delete({ where: { planId_featureKey: { planId, featureKey } } });
  res.json({ message: 'Deleted' });
}

export async function createPremium(req, res) {
  const { planId } = req.params;
  const { ageGroup, familyConfig, sumInsured, annualPremium } = req.body;
  const premium = await prisma.premium.create({
    data: { planId, ageGroup, familyConfig, sumInsured, annualPremium },
  });
  res.status(201).json(premium);
}

export async function updatePremium(req, res) {
  const { ageGroup, familyConfig, sumInsured, annualPremium } = req.body;
  const premium = await prisma.premium.update({
    where: { id: req.params.id },
    data: { ageGroup, familyConfig, sumInsured, annualPremium },
  });
  res.json(premium);
}

export async function deletePremium(req, res) {
  await prisma.premium.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
}

// ── Bulk import ───────────────────────────────────────────────────────────────

// GET /admin/plans/:planId/features/template
// Returns a CSV pre-filled with all standard feature keys — admin only fills featureValue
export async function featuresTemplate(req, res) {
  const plan = await prisma.plan.findUnique({
    where: { id: req.params.planId },
    include: { insurer: { select: { name: true } }, features: true },
  });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  // Merge master list with existing values so re-download pre-fills what's already saved
  const existingMap = Object.fromEntries(plan.features.map((f) => [f.featureKey, f.featureValue]));

  const rows = FEATURE_MASTER.map((f) => ({
    featureKey:      f.featureKey,
    featureLabel:    f.featureLabel,
    featureCategory: f.featureCategory,
    displayOrder:    f.displayOrder,
    featureValue:    existingMap[f.featureKey] ?? '',
  }));

  const csv      = toCSV(rows);
  const filename = `features_${plan.insurer.name}_${plan.name}`.replace(/\s+/g, '_') + '.csv';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

// POST /admin/plans/:planId/features/import
// Body: raw CSV text (Content-Type: text/plain or multipart)
// Upserts only rows where featureValue is non-empty and featureKey is in master list
export async function importFeatures(req, res) {
  const { planId } = req.params;
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const rows = parseCSV(req.body);
  if (!rows.length) return res.status(400).json({ error: 'No data found in CSV' });

  const errors   = [];
  const toUpsert = [];

  for (const row of rows) {
    const key   = row.featureKey?.trim();
    const value = row.featureValue?.trim();

    if (!key)   { errors.push(`Row missing featureKey`); continue; }
    if (!value) continue; // skip blank values silently

    if (!FEATURE_KEY_SET.has(key)) {
      errors.push(`Unknown featureKey: "${key}" — not in master list`);
      continue;
    }

    // Use canonical label/category/order from master
    const master = FEATURE_MASTER.find((f) => f.featureKey === key);
    toUpsert.push({ planId, featureKey: key, featureValue: value, featureLabel: master.featureLabel, featureCategory: master.featureCategory, displayOrder: master.displayOrder });
  }

  if (errors.length && !toUpsert.length) {
    return res.status(400).json({ error: 'All rows failed validation', details: errors });
  }

  // Bulk upsert
  let saved = 0;
  for (const f of toUpsert) {
    await prisma.planFeature.upsert({
      where:  { planId_featureKey: { planId: f.planId, featureKey: f.featureKey } },
      update: { featureValue: f.featureValue, featureLabel: f.featureLabel, featureCategory: f.featureCategory, displayOrder: f.displayOrder },
      create: f,
    });
    saved++;
  }

  res.json({ saved, skipped: rows.length - toUpsert.length - errors.length, errors });
}

// GET /admin/plans/:planId/premiums/template
export async function premiumsTemplate(req, res) {
  const plan = await prisma.plan.findUnique({
    where: { id: req.params.planId },
    include: { insurer: { select: { name: true } }, premiums: { orderBy: [{ ageGroup: 'asc' }, { familyConfig: 'asc' }] } },
  });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  // If premiums already exist, pre-fill them; otherwise give example rows
  const rows = plan.premiums.length
    ? plan.premiums.map(({ ageGroup, familyConfig, sumInsured, annualPremium }) => ({ ageGroup, familyConfig, sumInsured, annualPremium }))
    : [
        { ageGroup: 25, familyConfig: '1A',    sumInsured: 500000,  annualPremium: '' },
        { ageGroup: 25, familyConfig: '2A',    sumInsured: 500000,  annualPremium: '' },
        { ageGroup: 25, familyConfig: '2A+2C', sumInsured: 500000,  annualPremium: '' },
        { ageGroup: 35, familyConfig: '1A',    sumInsured: 500000,  annualPremium: '' },
        { ageGroup: 35, familyConfig: '2A',    sumInsured: 500000,  annualPremium: '' },
        { ageGroup: 35, familyConfig: '2A+2C', sumInsured: 500000,  annualPremium: '' },
      ];

  const csv      = toCSV(rows);
  const filename = `premiums_${plan.insurer.name}_${plan.name}`.replace(/\s+/g, '_') + '.csv';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

// POST /admin/plans/:planId/premiums/import
// Clears existing premiums for this plan and inserts all rows from CSV
export async function importPremiums(req, res) {
  const { planId } = req.params;
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const rows = parseCSV(req.body);
  if (!rows.length) return res.status(400).json({ error: 'No data found in CSV' });

  const errors  = [];
  const toInsert = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ageGroup      = Number(row.ageGroup);
    const familyConfig  = row.familyConfig?.trim();
    const sumInsured    = Number(row.sumInsured);
    const annualPremium = Number(row.annualPremium);

    if (!ageGroup || !familyConfig || !sumInsured || !annualPremium) {
      errors.push(`Row ${i + 2}: missing or invalid value (ageGroup, familyConfig, sumInsured, annualPremium all required)`);
      continue;
    }
    toInsert.push({ planId, ageGroup, familyConfig, sumInsured, annualPremium });
  }

  if (errors.length && !toInsert.length) {
    return res.status(400).json({ error: 'All rows failed validation', details: errors });
  }

  // Delete existing and re-insert (clean slate for premiums)
  await prisma.premium.deleteMany({ where: { planId } });
  await prisma.premium.createMany({ data: toInsert });

  res.json({ saved: toInsert.length, errors });
}
