import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, GitCompare } from 'lucide-react';
import Spinner from '../components/ui/Spinner.jsx';
import Badge from '../components/ui/Badge.jsx';
import useCompareStore from '../store/compareStore.js';
import { comparePlans } from '../services/planService.js';
import { formatCurrency, formatPremium, getPlanTypeLabel, getCategoryColor } from '../utils/formatters.js';

const CATEGORY_ORDER = [
  'Basic Info',
  'Waiting Periods',
  'Coverage',
  'Benefits',
  'Optional Covers',
  'Costs & Discounts',
];

// Values considered "not covered" — shown greyed out
const NOT_COVERED = ['not covered', 'na', 'n/a', 'not standard', 'not prominent', 'not applicable'];

function isNotCovered(value) {
  if (!value) return true;
  return NOT_COVERED.some((nc) => value.toLowerCase().trim() === nc);
}

function CellValue({ value }) {
  if (!value || isNotCovered(value)) {
    return <span className="text-gray-300 text-sm italic">Not covered</span>;
  }
  return <span className="text-sm text-gray-800 leading-snug">{value}</span>;
}

function PlanHeader({ plan, onRemove }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
            <span className="text-primary-600 font-bold text-xs">{plan.insurer?.name.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate leading-tight">{plan.insurer?.name}</p>
            <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
              {plan.name}{plan.variant ? ` · ${plan.variant}` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemove(plan.id)}
          className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
          title="Remove from compare"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        <Badge color={getCategoryColor(plan.insurer?.category)}>{plan.insurer?.category}</Badge>
        <Badge color="gray">{getPlanTypeLabel(plan.planType)}</Badge>
      </div>
      <p className="text-xs text-gray-500">
        SI: {formatCurrency(plan.minSumInsured)} – {formatCurrency(plan.maxSumInsured)}
      </p>
    </div>
  );
}

export default function Compare() {
  const { selectedPlans, removePlan } = useCompareStore();
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (selectedPlans.length < 2) { setData(null); return; }
    setLoading(true);
    setError(null);
    comparePlans(selectedPlans.map((p) => p.id))
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load comparison data.'))
      .finally(() => setLoading(false));
  }, [selectedPlans]);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (selectedPlans.length < 2) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <GitCompare size={32} className="text-primary-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Compare Plans</h1>
        <p className="text-gray-500 mb-6">
          Select at least 2 plans from the{' '}
          <Link to="/plans" className="text-primary-600 hover:underline">Browse Plans</Link>{' '}
          page to compare them side by side.
        </p>
        <Link
          to="/plans"
          className="inline-block bg-primary-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
        >
          Browse Plans
        </Link>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Spinner className="w-8 h-8" />
    </div>
  );

  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  if (!data) return null;

  const { plans, comparison } = data;

  // Group comparison rows by category
  const grouped = {};
  for (const row of comparison) {
    const cat = row.featureCategory || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(row);
  }

  const categories = CATEGORY_ORDER.filter((c) => grouped[c]);
  for (const c of Object.keys(grouped)) {
    if (!CATEGORY_ORDER.includes(c)) categories.push(c);
  }

  const planIds = plans.map((p) => p.id);
  const colCount = plans.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Plans</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Comparing {plans.length} plan{plans.length > 1 ? 's' : ''} side by side
          </p>
        </div>
        <Link to="/plans" className="text-sm text-primary-600 hover:underline">+ Add more plans</Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Sticky plan header row */}
        <div className="sticky top-16 z-30 bg-white border-b-2 border-gray-200 shadow-sm">
          <div
            className="grid"
            style={{ gridTemplateColumns: `220px repeat(${colCount}, 1fr)` }}
          >
            <div className="p-4 border-r border-gray-100 bg-gray-50" />
            {plans.map((plan) => (
              <div key={plan.id} className="p-4 border-r border-gray-100 last:border-0">
                <PlanHeader plan={plan} onRemove={removePlan} />
              </div>
            ))}
          </div>
        </div>

        {/* Premium row */}
        <div
          className="grid border-b border-gray-200 bg-primary-50"
          style={{ gridTemplateColumns: `220px repeat(${colCount}, 1fr)` }}
        >
          <div className="p-4 border-r border-gray-100 flex items-center">
            <span className="text-sm font-semibold text-gray-700">Starting Premium</span>
          </div>
          {plans.map((plan) => {
            const lowest = plan.premiums?.length
              ? Math.min(...plan.premiums.map((p) => p.annualPremium))
              : null;
            return (
              <div key={plan.id} className="p-4 border-r border-gray-100 last:border-0 flex items-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {lowest ? formatPremium(lowest) : '—'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Feature rows grouped by category */}
        {categories.map((cat) => (
          <div key={cat}>
            {/* Category header */}
            <div
              className="grid bg-gray-50 border-b border-gray-200"
              style={{ gridTemplateColumns: `220px repeat(${colCount}, 1fr)` }}
            >
              <div className="px-4 py-2 col-span-full">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{cat}</span>
              </div>
            </div>

            {/* Feature rows */}
            {grouped[cat].map((row, idx) => (
              <div
                key={row.featureKey}
                className={`grid border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                style={{ gridTemplateColumns: `220px repeat(${colCount}, 1fr)` }}
              >
                {/* Feature label */}
                <div className="p-4 border-r border-gray-100 flex items-start">
                  <span className="text-sm text-gray-600 font-medium leading-snug">{row.featureLabel}</span>
                </div>

                {/* Values per plan */}
                {planIds.map((planId) => {
                  const value = row.values[planId];
                  return (
                    <div key={planId} className="p-4 border-r border-gray-100 last:border-0 flex items-start">
                      <CellValue value={value} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        {/* Bottom CTA row */}
        <div
          className="grid border-t-2 border-gray-200 bg-gray-50"
          style={{ gridTemplateColumns: `220px repeat(${colCount}, 1fr)` }}
        >
          <div className="p-4 border-r border-gray-100" />
          {plans.map((plan) => (
            <div key={plan.id} className="p-4 border-r border-gray-100 last:border-0 flex flex-col gap-2">
              <Link
                to={`/get-quote?planId=${plan.id}`}
                className="block text-center text-sm font-medium py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Get Quote
              </Link>
              <Link
                to={`/plans/${plan.id}`}
                className="block text-center text-sm font-medium py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
