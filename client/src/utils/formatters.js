export function formatCurrency(amount) {
  if (!amount) return '—';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(0)} Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(0)} L`;
  if (amount >= 1000)     return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export function formatPremium(amount) {
  if (!amount) return '—';
  return `₹${amount.toLocaleString('en-IN')}/yr`;
}

export function getPlanTypeLabel(type) {
  return type === 'INDIVIDUAL' ? 'Individual' : 'Family Floater';
}

export function getCategoryColor(category) {
  return category === 'PVT' ? 'primary' : 'orange';
}

// Get the lowest premium from a plan's premiums array
export function getStartingPremium(premiums) {
  if (!premiums?.length) return null;
  return Math.min(...premiums.map((p) => p.annualPremium));
}
