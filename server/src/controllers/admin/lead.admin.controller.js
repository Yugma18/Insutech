import prisma from '../../utils/prisma.js';

export async function list(req, res) {
  const { status, page = 1, limit = 20 } = req.query;
  const where = status ? { status } : {};
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.lead.count({ where }),
  ]);
  res.json({ leads, total, page: parseInt(page), limit: parseInt(limit) });
}

export async function getById(req, res) {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
}

export async function update(req, res) {
  const { status, notes } = req.body;
  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { status, notes },
  });
  res.json(lead);
}

export async function exportCSV(req, res) {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });

  const headers = [
    'ID', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'City',
    'Plan Type', 'Sum Insured Pref', 'Status',
    'Smoker', 'Diabetes', 'BP', 'Heart', 'Thyroid', 'Cancer', 'Kidney', 'Other',
    'Notes', 'Created At',
  ];

  const rows = leads.map((l) => [
    l.id, l.name, l.email, l.phone, l.age, l.gender, l.city ?? '',
    l.planTypeInterest, l.sumInsuredPreference ?? '', l.status,
    l.isSmoker, l.hasDiabetes, l.hasBP, l.hasHeartCondition,
    l.hasThyroid, l.hasCancerHistory, l.hasKidneyDisease, l.hasOtherCondition,
    (l.notes ?? '').replace(/,/g, ';'),
    l.createdAt.toISOString(),
  ]);

  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
  res.send(csv);
}
