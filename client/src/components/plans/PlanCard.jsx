import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import useCompareStore from '../../store/compareStore.js';
import { formatCurrency, formatPremium, getPlanTypeLabel, getCategoryColor, getStartingPremium } from '../../utils/formatters.js';

// Key features to highlight on the card (featureKey → display label)
const HIGHLIGHT_FEATURES = [
  { key: 'waiting_period_ped',       label: 'PED Waiting' },
  { key: 'restore_benefit',          label: 'Restore Benefit' },
  { key: 'pre_hospitalization_days', label: 'Pre-Hosp' },
  { key: 'post_hospitalization_days',label: 'Post-Hosp' },
  { key: 'room_limit',               label: 'Room Rent' },
  { key: 'co_pay',                   label: 'Co-pay' },
];

function InsurerAvatar({ name, logoUrl }) {
  if (logoUrl) {
    return (
      <div className="w-10 h-10 rounded-lg border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden">
        <img src={logoUrl} alt={name} className="w-full h-full object-contain p-0.5" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
      <span className="text-primary-600 font-bold text-sm">{name.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

export default function PlanCard({ plan }) {
  const { addPlan, removePlan, isSelected } = useCompareStore();
  const selected = isSelected(plan.id);

  const highlights = HIGHLIGHT_FEATURES
    .map(({ key, label }) => {
      const feat = plan.features?.find((f) => f.featureKey === key);
      return feat ? { label, value: feat.featureValue } : null;
    })
    .filter(Boolean)
    .slice(0, 4);

  const startingPremium = getStartingPremium(plan.premiums);

  const handleCompare = (e) => {
    e.preventDefault();
    selected ? removePlan(plan.id) : addPlan(plan);
  };

  return (
    <div className={`bg-white rounded-2xl border transition-shadow hover:shadow-md flex flex-col ${selected ? 'border-primary-400 ring-1 ring-primary-400' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <InsurerAvatar name={plan.insurer?.name ?? 'IN'} logoUrl={plan.insurer?.logoUrl} />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">{plan.insurer?.name}</p>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {plan.name}
                {plan.variant && <span className="text-gray-500 font-normal"> · {plan.variant}</span>}
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge color={getCategoryColor(plan.insurer?.category)}>{plan.insurer?.category}</Badge>
            <Badge color="gray">{getPlanTypeLabel(plan.planType)}</Badge>
          </div>
        </div>

        {/* SI range */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Sum Insured</span>
          <span className="font-medium text-gray-800">
            {formatCurrency(plan.minSumInsured)} – {formatCurrency(plan.maxSumInsured)}
          </span>
        </div>
      </div>

      {/* Key features */}
      <div className="p-5 flex-1">
        {highlights.length > 0 ? (
          <ul className="space-y-2">
            {highlights.map(({ label, value }) => (
              <li key={label} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="text-gray-800 text-right font-medium leading-tight line-clamp-2">{value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">Feature details loading…</p>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-100">
        {startingPremium && (
          <p className="text-xs text-gray-500 mb-3">
            Starting from <span className="text-gray-900 font-semibold text-sm">{formatPremium(startingPremium)}</span>
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleCompare}
            className={`flex-1 text-sm font-medium py-2 rounded-lg border transition-colors ${
              selected
                ? 'border-primary-500 bg-primary-50 text-primary-600 hover:bg-primary-100'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
            }`}
          >
            {selected ? <><Check size={14} className="inline mr-1" />Added</> : '+ Compare'}
          </button>
          <Link
            to={`/plans/${plan.id}`}
            className="flex-1 text-center text-sm font-medium py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
