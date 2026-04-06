import prisma from '../utils/prisma.js';

export async function getInsurers(req, res) {
  const insurers = await prisma.insurer.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  res.json(insurers);
}
