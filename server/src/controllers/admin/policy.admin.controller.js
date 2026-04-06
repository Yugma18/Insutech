import prisma from '../../utils/prisma.js';

// GET /api/admin/policies — all policies, sorted by soonest expiry first
export async function list(req, res) {
  const { status, search } = req.query;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { policyNumber: { contains: search, mode: 'insensitive' } },
        { user: { name:  { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const policies = await prisma.policy.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      plan: { include: { insurer: { select: { name: true, logoUrl: true } } } },
    },
    orderBy: [
      // Active policies with endDate bubble to top sorted by soonest expiry
      { endDate: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  res.json(policies);
}

// PUT /api/admin/policies/:id — update status, startDate, endDate
export async function update(req, res) {
  const { status, startDate, endDate } = req.body;

  const data = {
    ...(status    && { status }),
    ...(startDate && { startDate: new Date(startDate) }),
    ...(endDate   && { endDate:   new Date(endDate)   }),
  };

  // If activating and no endDate provided, default to 1 year from start
  if (status === 'ACTIVE' && !endDate) {
    const start = startDate ? new Date(startDate) : new Date();
    data.startDate = data.startDate || start;
    data.endDate   = new Date(new Date(start).setFullYear(start.getFullYear() + 1));
  }

  const policy = await prisma.policy.update({
    where:   { id: req.params.id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      plan: { include: { insurer: { select: { name: true, logoUrl: true } } } },
    },
  });
  res.json(policy);
}
