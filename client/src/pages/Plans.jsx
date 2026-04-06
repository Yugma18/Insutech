import { useState, useEffect } from 'react';
import PlanCard from '../components/plans/PlanCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getPlans } from '../services/planService.js';

const SUM_INSURED_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '₹3 Lakh+', value: 300000 },
  { label: '₹5 Lakh+', value: 500000 },
  { label: '₹10 Lakh+', value: 1000000 },
  { label: '₹25 Lakh+', value: 2500000 },
  { label: '₹50 Lakh+', value: 5000000 },
];

function FilterSection({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h4>
      {children}
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-primary-600"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [category, setCategory]     = useState('');
  const [planType, setPlanType]     = useState('');
  const [minSI, setMinSI]           = useState('');
  const [age, setAge]               = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = {};
    if (category) params.category = category;
    if (planType) params.planType = planType;
    if (minSI)    params.minSI    = minSI;
    if (age)      params.minAge   = age;

    getPlans(params)
      .then((res) => setPlans(res.data))
      .catch((err) => { if (!controller.signal.aborted) setError('Failed to load plans. Is the server running?'); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [category, planType, minSI, age]);

  const clearFilters = () => { setCategory(''); setPlanType(''); setMinSI(''); setAge(''); };
  const hasFilters   = category || planType || minSI || age;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Browse Health Insurance Plans</h1>
        <p className="text-gray-500 mt-1">
          {loading ? 'Loading…' : `${plans.length} plan${plans.length !== 1 ? 's' : ''} found`}
          {hasFilters && (
            <button onClick={clearFilters} className="ml-3 text-primary-600 text-sm hover:underline">
              Clear filters
            </button>
          )}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline">Clear all</button>
              )}
            </div>

            <FilterSection title="Insurer Type">
              <RadioGroup
                name="category"
                value={category}
                onChange={setCategory}
                options={[
                  { label: 'All', value: '' },
                  { label: 'Private (PVT)', value: 'PVT' },
                  { label: 'Public Sector (PSU)', value: 'PSU' },
                ]}
              />
            </FilterSection>

            <FilterSection title="Plan Type">
              <RadioGroup
                name="planType"
                value={planType}
                onChange={setPlanType}
                options={[
                  { label: 'All', value: '' },
                  { label: 'Individual', value: 'INDIVIDUAL' },
                  { label: 'Family Floater', value: 'FAMILY_FLOATER' },
                ]}
              />
            </FilterSection>

            <FilterSection title="Sum Insured">
              <RadioGroup
                name="minSI"
                value={String(minSI)}
                onChange={(v) => setMinSI(v)}
                options={SUM_INSURED_OPTIONS.map((o) => ({ ...o, value: String(o.value) }))}
              />
            </FilterSection>

            <FilterSection title="Your Age">
              <input
                type="number"
                min="18"
                max="80"
                placeholder="e.g. 35"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">Filters plans by entry age eligibility</p>
            </FilterSection>
          </div>
        </aside>

        {/* Plans grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Spinner className="w-8 h-8" />
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="text-red-500 font-medium">{error}</p>
              <p className="text-gray-400 text-sm mt-1">Make sure <code className="bg-gray-100 px-1 rounded">npm run dev</code> is running in the server folder.</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-500 font-medium">No plans match your filters.</p>
              <button onClick={clearFilters} className="mt-3 text-primary-600 text-sm hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
