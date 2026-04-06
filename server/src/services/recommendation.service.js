/**
 * Rule-based recommendation engine.
 * Input: user profile + plans from DB
 * Output: top 3 plans with scores and reasons
 */
export function scorePlans(plans, userInput) {
  const {
    age,
    planType,
    sumInsuredPreference,
    isSmoker,
    hasDiabetes,
    hasBP,
    hasHeartCondition,
    hasThyroid,
    hasCancerHistory,
    hasKidneyDisease,
    hasOtherCondition,
    priorityMaternity,
    priorityOPD,
    priorityLowWaiting,
    categoryPreference, // 'PVT' | 'PSU' | null
    budget,             // annual premium budget
  } = userInput;

  const hasPED = hasDiabetes || hasBP || hasHeartCondition || hasThyroid || hasCancerHistory || hasKidneyDisease || hasOtherCondition;

  const results = [];

  for (const plan of plans) {
    // Skip mismatched plan type
    if (planType && plan.planType !== planType) continue;

    let score = 0;
    const reasons = [];
    const warnings = [];

    const getFeature = (key) => plan.features.find((f) => f.featureKey === key)?.featureValue ?? null;

    // RULE 1 — Age eligibility
    if (age < plan.minEntryAge || (plan.maxEntryAge !== 999 && age > plan.maxEntryAge)) {
      continue; // disqualify
    }

    // RULE 2 — Sum insured match
    if (sumInsuredPreference) {
      if (sumInsuredPreference >= plan.minSumInsured) {
        score += 10;
        reasons.push('Matches your sum insured preference');
      }
    }

    // RULE 3 — PED waiting period (lower is better)
    const pedWaiting = getFeature('waiting_period_ped');
    if (hasPED && pedWaiting) {
      if (pedWaiting.toLowerCase().includes('day 1') || pedWaiting.includes('0')) {
        score += 20;
        reasons.push('PED covered from Day 1 — ideal for your health conditions');
      } else if (pedWaiting.includes('24') || pedWaiting.includes('2 yr') || pedWaiting.includes('2yrs')) {
        score += 15;
        reasons.push('Shorter PED waiting period (24 months) — good for pre-existing conditions');
      } else if (pedWaiting.includes('36') || pedWaiting.includes('3 yr') || pedWaiting.includes('3yrs')) {
        score += 5;
        warnings.push('PED waiting period is 36 months — longer wait for pre-existing conditions');
      } else if (pedWaiting.includes('48') || pedWaiting.includes('4 yr') || pedWaiting.includes('4yrs')) {
        score += 0;
        warnings.push('PED waiting period is 48 months — longest among available plans');
      }
    }

    // RULE 4 — Smoker: prefer critical illness cover
    if (isSmoker) {
      const ci = getFeature('critical_illness');
      if (ci && ci.toLowerCase() !== 'not covered' && ci.toLowerCase() !== 'no') {
        score += 10;
        reasons.push('Includes critical illness cover — recommended for smokers');
      }
    }

    // RULE 5 — Maternity priority
    if (priorityMaternity) {
      const maternity = getFeature('maternity_cover');
      if (maternity && maternity.toLowerCase() !== 'not covered' && maternity.toLowerCase() !== 'na') {
        score += 15;
        reasons.push('Maternity cover available');
        const maternityWait = getFeature('waiting_period_maternity');
        if (maternityWait && maternityWait.includes('24')) {
          score += 5;
          reasons.push('Shorter maternity waiting period (24 months)');
        }
      } else {
        warnings.push('No maternity cover in this plan');
      }
    }

    // RULE 6 — OPD priority
    if (priorityOPD) {
      const opd = getFeature('opd_coverage');
      if (opd && opd.toLowerCase() !== 'not covered' && opd.toLowerCase() !== 'na') {
        score += 15;
        reasons.push('OPD / outpatient coverage included');
      } else {
        warnings.push('OPD coverage not available in this plan');
      }
    }

    // RULE 7 — Restore benefit (always good)
    const restore = getFeature('restore_benefit');
    if (restore && restore.toLowerCase() !== 'not covered') {
      score += 8;
      reasons.push('Restore/Recharge benefit available — SI reinstated if exhausted');
    }

    // RULE 8 — Co-pay
    const coPay = getFeature('co_pay');
    if (coPay && (coPay.toLowerCase() === 'no' || coPay.toLowerCase() === 'na' || coPay === '')) {
      score += 5;
      reasons.push('No co-payment required');
    } else if (coPay && coPay.toLowerCase() !== 'no') {
      if (age >= 60) {
        score -= 5;
        warnings.push(`Co-payment applicable: ${coPay}`);
      }
    }

    // RULE 9 — Category preference
    if (categoryPreference && plan.insurer.category === categoryPreference) {
      score += 5;
    }

    // RULE 10 — Low waiting period priority
    if (priorityLowWaiting) {
      const pedW = getFeature('waiting_period_ped');
      if (pedW && (pedW.includes('24') || pedW.includes('day 1'))) {
        score += 10;
        reasons.push('Shorter overall waiting periods');
      }
    }

    // RULE 11 — Premium budget match
    if (budget && plan.premiums?.length > 0) {
      const closestPremium = plan.premiums
        .filter((p) => Math.abs(p.ageGroup - age) <= 10)
        .sort((a, b) => Math.abs(a.ageGroup - age) - Math.abs(b.ageGroup - age))[0];

      if (closestPremium) {
        if (closestPremium.annualPremium <= budget) {
          score += 10;
          reasons.push(`Premium (₹${closestPremium.annualPremium.toLocaleString()}/yr) fits your budget`);
        } else if (closestPremium.annualPremium <= budget * 1.2) {
          score += 3;
          warnings.push(`Premium slightly above budget (₹${closestPremium.annualPremium.toLocaleString()}/yr)`);
        } else {
          score -= 10;
          warnings.push(`Premium (₹${closestPremium.annualPremium.toLocaleString()}/yr) exceeds your budget`);
        }
      }
    }

    results.push({ plan, score, reasons, warnings });
  }

  // Sort by score descending, return top 3
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ plan, score, reasons, warnings }) => ({
      plan: {
        id: plan.id,
        name: plan.name,
        planType: plan.planType,
        variant: plan.variant,
        minSumInsured: plan.minSumInsured,
        maxSumInsured: plan.maxSumInsured,
        insurer: plan.insurer,
      },
      score,
      reasons,
      warnings,
    }));
}
