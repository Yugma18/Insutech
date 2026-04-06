import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLocalUser from '../hooks/useLocalUser.js';
import {
  Cigarette, Droplets, Activity, Heart, Zap, Ribbon, Bean, Stethoscope,
  Baby, Clock, Star, Check, TriangleAlert, ArrowLeft, ArrowRight,
} from 'lucide-react';
import Spinner from '../components/ui/Spinner.jsx';
import Select from '../components/ui/Select.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getRecommendations } from '../services/leadService.js';
import { formatCurrency, formatPremium, getPlanTypeLabel, getCategoryColor } from '../utils/formatters.js';
import useCompareStore from '../store/compareStore.js';

// ── Step components ───────────────────────────────────────────────────────────

function StepPersonal({ data, onChange }) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">Tell us about yourself</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Age <span className="text-red-500">*</span></label>
        <input
          type="number" min="1" max="100"
          value={data.age}
          onChange={(e) => onChange('age', e.target.value)}
          placeholder="e.g. 32"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <div className="flex gap-3">
          {['MALE', 'FEMALE', 'OTHER'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange('gender', g)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                data.gender === g ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {g.charAt(0) + g.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Insurer preference</label>
        <div className="flex gap-3">
          {[
            { label: 'No preference', value: '' },
            { label: 'Private (PVT)', value: 'PVT' },
            { label: 'Public (PSU)', value: 'PSU' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('categoryPreference', opt.value)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                data.categoryPreference === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPlanType({ data, onChange }) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">What type of plan do you need?</h2>

      <div className="grid grid-cols-1 gap-4">
        {[
          {
            value: 'INDIVIDUAL',
            title: 'Individual Plan',
            desc: 'Covers only you. Best if you\'re single or looking for personal coverage.',
          },
          {
            value: 'FAMILY_FLOATER',
            title: 'Family Floater Plan',
            desc: 'One plan covers your entire family. Shared sum insured.',
          },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange('planType', opt.value)}
            className={`text-left p-5 rounded-xl border-2 transition-colors ${
              data.planType === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="font-semibold text-gray-900 mb-1">{opt.title}</p>
            <p className="text-sm text-gray-500">{opt.desc}</p>
          </button>
        ))}
      </div>

      {data.planType === 'FAMILY_FLOATER' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of family members</label>
          <input
            type="number" min="2" max="10"
            value={data.numFamilyMembers}
            onChange={(e) => onChange('numFamilyMembers', e.target.value)}
            placeholder="e.g. 4"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Desired Sum Insured (₹)
        </label>
        <Select value={data.sumInsuredPreference} onChange={(v) => onChange('sumInsuredPreference', Number(v))}>
          <option value="">Select…</option>
          <option value={300000}>₹3 Lakh</option>
          <option value={500000}>₹5 Lakh</option>
          <option value={1000000}>₹10 Lakh</option>
          <option value={2500000}>₹25 Lakh</option>
          <option value={5000000}>₹50 Lakh</option>
          <option value={10000000}>₹1 Crore</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Annual premium budget (₹)
        </label>
        <Select value={data.budget} onChange={(v) => onChange('budget', Number(v))}>
          <option value="">Select…</option>
          <option value={10000}>Up to ₹10,000/yr</option>
          <option value={20000}>Up to ₹20,000/yr</option>
          <option value={35000}>Up to ₹35,000/yr</option>
          <option value={50000}>Up to ₹50,000/yr</option>
          <option value={100000}>Up to ₹1,00,000/yr</option>
          <option value={9999999}>No budget limit</option>
        </Select>
      </div>
    </div>
  );
}

function StepHealth({ data, onChange }) {
  const conditions = [
    { key: 'isSmoker',          label: 'Do you smoke?',                       icon: Cigarette },
    { key: 'hasDiabetes',       label: 'Do you have Diabetes?',               icon: Droplets },
    { key: 'hasBP',             label: 'Do you have Blood Pressure (BP)?',    icon: Activity },
    { key: 'hasHeartCondition', label: 'Any heart condition?',                icon: Heart },
    { key: 'hasThyroid',        label: 'Do you have Thyroid issues?',         icon: Zap },
    { key: 'hasCancerHistory',  label: 'Any cancer history?',                 icon: Ribbon },
    { key: 'hasKidneyDisease',  label: 'Do you have kidney disease?',         icon: Bean },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Any health conditions?</h2>
        <p className="text-sm text-gray-500 mt-1">
          This helps us recommend plans with the best coverage for your needs. All details are confidential.
        </p>
      </div>

      <div className="space-y-3">
        {conditions.map(({ key, label, icon: Icon }) => (
          <label
            key={key}
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              data[key] ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="text-gray-500 shrink-0" size={20} />
              <span className="text-sm font-medium text-gray-800">{label}</span>
            </div>
            <input
              type="checkbox"
              checked={!!data[key]}
              onChange={(e) => onChange(key, e.target.checked)}
              className="accent-primary-600 w-4 h-4"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function StepPriorities({ data, onChange }) {
  const priorities = [
    { key: 'priorityMaternity',   label: 'Maternity coverage',        icon: Baby,        desc: 'Planning to have a baby' },
    { key: 'priorityOPD',         label: 'OPD / Outpatient cover',    icon: Stethoscope, desc: 'Regular doctor visits & medicines' },
    { key: 'priorityLowWaiting',  label: 'Shorter waiting periods',   icon: Clock,       desc: 'Want coverage to start quickly' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">What matters most to you?</h2>
        <p className="text-sm text-gray-500 mt-1">Select all that apply. We'll prioritize plans accordingly.</p>
      </div>

      <div className="space-y-3">
        {priorities.map(({ key, label, icon: Icon, desc }) => (
          <label
            key={key}
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              data[key] ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="text-gray-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={!!data[key]}
              onChange={(e) => onChange(key, e.target.checked)}
              className="accent-primary-600 w-4 h-4"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ result, rank }) {
  const { plan, score, reasons, warnings } = result;
  const { addPlan, isSelected } = useCompareStore();

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden ${rank === 0 ? 'border-primary-500' : 'border-gray-200'}`}>
      {rank === 0 && (
        <div className="bg-primary-600 text-white text-xs font-semibold px-4 py-1.5 text-center tracking-wide flex items-center justify-center gap-1">
          <Star size={12} className="fill-white" /> BEST MATCH
        </div>
      )}
      <div className="p-5">
        {/* Plan info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
            <span className="text-primary-600 font-bold text-xs">{plan.insurer?.name.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <Badge color={getCategoryColor(plan.insurer?.category)}>{plan.insurer?.category}</Badge>
              <Badge color="gray">{getPlanTypeLabel(plan.planType)}</Badge>
            </div>
            <p className="text-xs text-gray-500">{plan.insurer?.name}</p>
            <p className="font-semibold text-gray-900 text-sm">
              {plan.name}{plan.variant ? ` · ${plan.variant}` : ''}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              SI: {formatCurrency(plan.minSumInsured)} – {formatCurrency(plan.maxSumInsured)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-primary-600">{score}</div>
            <div className="text-xs text-gray-400">match score</div>
          </div>
        </div>

        {/* Why this plan */}
        {reasons.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">WHY THIS PLAN</p>
            <ul className="space-y-1">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check size={14} className="text-green-500 mt-0.5 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">THINGS TO NOTE</p>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <TriangleAlert size={14} className="shrink-0 mt-0.5" /> {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => addPlan(plan)}
            disabled={isSelected(plan.id)}
            className="flex-1 text-sm font-medium py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            {isSelected(plan.id) ? <><Check size={14} className="inline mr-1" />Added</> : '+ Compare'}
          </button>
          <Link
            to={`/plans/${plan.id}`}
            className="flex-1 text-center text-sm font-medium py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            View Details
          </Link>
        </div>
        <Link
          to={`/get-quote?planId=${plan.id}`}
          className="block mt-2 text-center text-sm font-medium py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Get Quote for This Plan
        </Link>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const STEPS = ['About You', 'Plan Type', 'Health', 'Priorities'];

const DEFAULT_FORM = {
  age: '',
  gender: 'MALE',
  categoryPreference: '',
  planType: 'INDIVIDUAL',
  numFamilyMembers: '',
  sumInsuredPreference: '',
  budget: '',
  isSmoker: false,
  hasDiabetes: false,
  hasBP: false,
  hasHeartCondition: false,
  hasThyroid: false,
  hasCancerHistory: false,
  hasKidneyDisease: false,
  priorityMaternity: false,
  priorityOPD: false,
  priorityLowWaiting: false,
};

function ageFromDob(dob) {
  if (!dob) return '';
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  return age > 0 && age < 120 ? String(age) : '';
}

export default function Recommend() {
  const { localUser } = useLocalUser();
  const [step, setStep]             = useState(0);
  const [form, setForm]             = useState(() => ({
    ...DEFAULT_FORM,
    age:    ageFromDob(localUser?.dateOfBirth),
    gender: localUser?.gender || 'MALE',
  }));
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const canNext = () => {
    if (step === 0) return !!form.age;
    if (step === 1) return !!form.planType;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
    // Last step → submit
    setLoading(true);
    setError(null);
    getRecommendations({
      ...form,
      age: Number(form.age),
      sumInsuredPreference: form.sumInsuredPreference ? Number(form.sumInsuredPreference) : undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      numFamilyMembers: form.numFamilyMembers ? Number(form.numFamilyMembers) : undefined,
    })
      .then((res) => setResults(res.data))
      .catch(() => setError('Something went wrong. Please try again.'))
      .finally(() => setLoading(false));
  };

  const reset = () => { setStep(0); setForm(DEFAULT_FORM); setResults(null); setError(null); };

  // ── Results view ────────────────────────────────────────────────────────
  if (results) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Recommendations</h1>
          <p className="text-gray-500">
            Based on your profile, here are the top {results.length} plans for you.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No matching plans found. Try adjusting your preferences.</p>
            <button onClick={reset} className="text-primary-600 hover:underline text-sm">Start over</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {results.map((result, i) => (
                <RecommendationCard key={result.plan.id} result={result} rank={i} />
              ))}
            </div>
            <div className="text-center space-y-3">
              <p className="text-gray-500 text-sm">Want to see all options?</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link to="/plans" className="text-sm text-primary-600 border border-primary-300 px-5 py-2 rounded-lg hover:bg-primary-50 transition-colors">
                  Browse All Plans
                </Link>
                <button onClick={reset} className="text-sm text-gray-600 border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Start Over
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Wizard ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Plan</h1>
        <p className="text-gray-500 text-sm">Answer a few quick questions and we'll recommend the best plan.</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full transition-colors ${i <= step ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <span className={`text-xs ${i === step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        {step === 0 && <StepPersonal  data={form} onChange={update} />}
        {step === 1 && <StepPlanType  data={form} onChange={update} />}
        {step === 2 && <StepHealth    data={form} onChange={update} />}
        {step === 3 && <StepPriorities data={form} onChange={update} />}
      </div>

      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : null}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-0 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canNext() || loading}
          className="bg-primary-600 text-white font-medium px-8 py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <><Spinner className="w-4 h-4" /> Finding plans…</> : step === STEPS.length - 1 ? 'Get Recommendations' : <><span>Next</span><ArrowRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}
