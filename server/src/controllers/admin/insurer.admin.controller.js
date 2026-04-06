import prisma from '../../utils/prisma.js';

export async function list(req, res) {
  const insurers = await prisma.insurer.findMany({ orderBy: { name: 'asc' } });
  res.json(insurers);
}

export async function create(req, res) {
  const { name, category, logoUrl, description } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  const insurer = await prisma.insurer.create({ data: { name, category, logoUrl, description } });
  res.status(201).json(insurer);
}

export async function update(req, res) {
  const { name, category, logoUrl, description, isActive } = req.body;
  const insurer = await prisma.insurer.update({
    where: { id: req.params.id },
    data: { name, category, logoUrl, description, isActive },
  });
  res.json(insurer);
}

export async function remove(req, res) {
  await prisma.insurer.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
}
