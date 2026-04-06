import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ShoppingCart, CheckCircle } from 'lucide-react';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Select from '../components/ui/Select.jsx';
import useCompareStore from '../store/compareStore.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getPlanById } from '../services/planService.js';
import { userPurchase } from '../services/userService.js';
import { formatCurrency, formatPremium, getPlanTypeLabel, getCategoryColor } from '../utils/formatters.js';

// Group features by category, preserving displayOrder
function groupFeatures(features) {
  const order = ['Basic Info', 'Waiting Periods', 'Coverage', 'Benefits', 'Optional Covers', 'Costs & Discounts'];
  const map = {};
  for (const f of features) {
    if (!map[f.featureCategory]) map[f.featureCategory] = [];
    map[f.featureCategory].push(f);
  }
  // Sort items within each group
  for (const cat of Object.keys(map)) {
    map[cat].sort((a, b) => a.displayOrder - b.displayOrder);
  }
  // Return in canonical order, then any extras
  const result = [];
  for (const cat of order) {
    if (map[cat]) result.push({ category: cat, features: map[cat] });
  }
  for (const cat of Object.keys(map)) {
    if (!order.includes(cat)) result.push({ category: cat, features: map[cat] });
  }
  return result;
}

function FeatureRow({ label, value }) {
  const isCovered   = value && !['not covered', 'not standard', 'na', 'n/a'].includes(value.toLowerCase());
  const isNotCovered = value && ['not covered', 'na', 'n/a'].some(v => value.toLowerCase().trim() === v);

  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 w-44 shrink-0">{label}</span>
      <span className={`text-sm flex-1 ${isNotCovered ? 'text-gray-400 italic' : 'text-gray-800'}`}>
        {isNotCovered ? 'Not covered' : value || '—'}
      </span>
    </div>
  );
}

function PremiumTable({ premiums }) {
  if (!premiums?.length) return <p className="text-gray-400 text-sm">No premium data available.</p>;

  // Group by familyConfig
  const configs = [...new Set(premiums.map((p) => p.familyConfig))];
  const ageGroups = [...new Set(premiums.map((p) => p.ageGroup))].sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 text-gray-500 font-medium">Age Group</th>
            {configs.map((c) => (
              <th key={c} className="text-right py-2 px-3 text-gray-500 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ageGroups.map((age) => (
            <tr key={age} className="border-b border-gray-100 last:border-0">
              <td className="py-2 pr-4 font-medium text-gray-800">Age {age}</td>
              {configs.map((config) => {
                const p = premiums.find((x) => x.ageGroup === age && x.familyConfig === config);
                return (
                  <td key={config} className="py-2 px-3 text-right text-gray-700">
                    {p ? formatPremium(p.annualPremium) : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">* Premiums are indicative as of Nov 2025. Actual premiums may vary.</p>
    </div>
  );
}

function BuyModal({ plan, onClose }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const premiums = plan.premiums || [];

  const sumOptions    = [...new Set(premiums.map((p) => p.sumInsured))].sort((a, b) => a - b);
  const configOptions = [...new Set(premiums.map((p) => p.familyConfig))];

  const [sumInsured,   setSumInsured]   = useState(sumOptions[0]   || '');
  const [familyConfig, setFamilyConfig] = useState(configOptions[0] || '');
  const [buying, setBuying]   = useState(false);
  const [done,   setDone]     = useState(null); // policy number on success
  const [err,    setErr]      = useState('');

  const matched = premiums.find(
    (p) => p.sumInsured === Number(sumInsured) && p.familyConfig === familyConfig
  );

  const handleBuy = async () => {
    if (!isLoggedIn) { navigate('/login', { state: { from: `/plans/${plan.id}` } }); return; }
    setBuying(true); setErr('');
    try {
      const { data } = await userPurchase({ planId: plan.id, sumInsured: Number(sumInsured), familyConfig });
      setDone(data.policyNumber);
    } catch (e) {
      setErr(e.response?.data?.error || 'Purchase failed. Please try again.');
    } finally { setBuying(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <CheckCircle size={44} className="text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Application Submitted!</h3>
            <p className="text-sm text-gray-500 mb-2">Our team will review and activate your policy shortly.</p>
            <p className="font-mono text-xs bg-gray-100 rounded-lg px-3 py-2 text-gray-700 mb-5">{done}</p>
            <div className="flex flex-col gap-2">
              <Link to="/account" className="block w-full text-center bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
                View My Policies
              </Link>
              <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-base font-bold text-gray-900 mb-4">Buy {plan.name}</h3>
            {err && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sum Insured</label>
                <Select value={sumInsured} onChange={(v) => setSumInsured(v)}>
                  {sumOptions.map((s) => <option key={s} value={s}>₹{(s / 100000).toFixed(0)} Lakh</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Configuration</label>
                <Select value={familyConfig} onChange={setFamilyConfig}>
                  {configOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              {matched ? (
                <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-primary-800">Annual Premium</span>
                  <span className="font-bold text-primary-700 text-lg">₹{matched.annualPremium.toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 text-center">
                  No premium data for this combination
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleBuy}
                disabled={buying || !matched}
                className="w-full bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {buying ? 'Submitting…' : isLoggedIn ? 'Confirm Purchase' : 'Sign In to Buy'}
              </button>
              <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PlanDetail() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuy, setShowBuy] = useState(false);
  const { addPlan, removePlan, isSelected } = useCompareStore();
  const selected = plan ? isSelected(plan.id) : false;

  useEffect(() => {
    setLoading(true);
    getPlanById(id)
      .then((res) => setPlan(res.data))
      .catch(() => setError('Plan not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Spinner className="w-8 h-8" />
    </div>
  );

  if (error || !plan) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500">{error || 'Plan not found.'}</p>
      <Link to="/plans" className="mt-4 inline-flex items-center gap-1 text-primary-600 hover:underline text-sm"><ArrowLeft size={14} /> Back to Plans</Link>
    </div>
  );

  const grouped = groupFeatures(plan.features || []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-5">
        <Link to="/plans" className="hover:text-primary-600">Plans</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">{plan.insurer?.name} — {plan.name}</span>
      </div>

      {/* Plan header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {plan.insurer?.logoUrl ? (
              <div className="w-14 h-14 rounded-xl border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                <img src={plan.insurer.logoUrl} alt={plan.insurer.name} className="w-full h-full object-contain p-1" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                <span className="text-primary-600 font-bold text-lg">{plan.insurer?.name.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge color={getCategoryColor(plan.insurer?.category)}>{plan.insurer?.category}</Badge>
                <Badge color="gray">{getPlanTypeLabel(plan.planType)}</Badge>
                {plan.variant && <Badge color="green">{plan.variant}</Badge>}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {plan.insurer?.name} — {plan.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Sum Insured: {formatCurrency(plan.minSumInsured)} – {formatCurrency(plan.maxSumInsured)}
                &nbsp;·&nbsp;
                Entry Age: {plan.minEntryAge} – {plan.maxEntryAge === 999 ? 'No limit' : plan.maxEntryAge} yrs
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <button
              onClick={() => selected ? removePlan(plan.id) : addPlan(plan)}
              className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
                selected
                  ? 'border-primary-500 bg-primary-50 text-primary-600 hover:bg-primary-100'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {selected ? <><Check size={14} className="inline mr-1" />Added to Compare</> : '+ Add to Compare'}
            </button>
            <button
              onClick={() => setShowBuy(true)}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <ShoppingCart size={14} /> Buy Now
            </button>
            <Link
              to={`/get-quote?planId=${plan.id}`}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors text-center"
            >
              Get Quote
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Features — left 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {grouped.map(({ category, features }) => (
            <div key={category} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-sm">{category}</h2>
              </div>
              <div className="px-5">
                {features.map((f) => (
                  <FeatureRow key={f.featureKey} label={f.featureLabel} value={f.featureValue} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Premiums — right 1/3 */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 text-sm">Premium Estimates</h2>
            </div>
            <div className="p-5">
              <PremiumTable premiums={plan.premiums} />
            </div>
          </div>

          {/* CTA */}
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 text-center">
            <p className="text-sm font-medium text-primary-900 mb-1">Interested in this plan?</p>
            <p className="text-xs text-primary-600 mb-4">Our team will help you get the best deal.</p>
            <Link
              to={`/get-quote?planId=${plan.id}`}
              className="block w-full bg-primary-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get a Free Quote
            </Link>
            <Link
              to="/recommend"
              className="block w-full mt-2 border border-primary-300 text-primary-700 text-sm font-medium py-2.5 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Compare with Other Plans
            </Link>
          </div>
        </div>
      </div>

      {showBuy && <BuyModal plan={plan} onClose={() => setShowBuy(false)} />}
    </div>
  );
}
