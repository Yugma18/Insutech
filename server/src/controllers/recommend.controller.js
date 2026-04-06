import prisma from '../utils/prisma.js';
import { scorePlans } from '../services/recommendation.service.js';

export async function getRecommendations(req, res) {
  const userInput = req.body;

  const plans = await prisma.plan.findMany({
    where: { isActive: true, insurer: { isActive: true } },
    include: {
      insurer: { select: { id: true, name: true, category: true, logoUrl: true } },
      features: true,
      premiums: true,
    },
  });

  const recommendations = scorePlans(plans, userInput);
  res.json(recommendations);
}
