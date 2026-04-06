import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Cigarette, Droplets, Activity, Heart, Zap, Ribbon, Bean, Stethoscope,
  CheckCircle, ArrowLeft, ArrowRight,
} from 'lucide-react';
import Spinner from '../components/ui/Spinner.jsx';
import Select from '../components/ui/Select.jsx';
import { submitLead } from '../services/leadService.js';
import useLocalUser from '../hooks/useLocalUser.js';

const STEPS = ['Contact Details', 'Health Profile', 'Submit'];

const DEFAULT_FORM = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'MALE',
  city: '',
  planTypeInterest: 'INDIVIDUAL',
  numFamilyMembers: '',
  sumInsuredPreference: '',
  isSmoker: false,
  hasDiabetes: false,
  hasBP: false,
  hasHeartCondition: false,
  hasThyroid: false,
  hasCancerHistory: false,
  hasKidneyDisease: false,
  hasOtherCondition: false,
  otherConditionDetail: '',
};

function Input({ label, required, error, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  );
}

function SelectInput({ value, onChange, children }) {
  return <Select value={value} onChange={onChange}>{children}</Select>;
}

function CheckRow({ label, icon: Icon, checked, onChange }) {
  return (
    <label className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${checked ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-gray-500 shrink-0" />}
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-primary-600 w-4 h-4" />
    </label>
  );
}

function StepContact({ form, update, errors }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your Contact Details</h2>

      <Input label="Full Name" required error={errors.name}>
        <TextInput value={form.name} onChange={(v) => update('name', v)} placeholder="e.g. Rahul Sharma" />
      </Input>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Email" required error={errors.email}>
          <TextInput type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="rahul@example.com" />
        </Input>
        <Input label="Phone" required error={errors.phone}>
          <TextInput type="tel" value={form.phone} onChange={(v) => update('phone', v)} placeholder="10-digit mobile" />
        </Input>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Date of Birth" required error={errors.dateOfBirth}>
          <TextInput type="date" value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} />
        </Input>
        <Input label="Gender" required>
          <SelectInput value={form.gender} onChange={(v) => update('gender', v)}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </SelectInput>
        </Input>
      </div>

      <Input label="City">
        <TextInput value={form.city} onChange={(v) => update('city', v)} placeholder="e.g. Mumbai" />
      </Input>

      <Input label="Plan Type" required>
        <div className="flex gap-3">
          {[
            { value: 'INDIVIDUAL',     label: 'Individual' },
            { value: 'FAMILY_FLOATER', label: 'Family Floater' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('planTypeInterest', opt.value)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                form.planTypeInterest === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Input>

      {form.planTypeInterest === 'FAMILY_FLOATER' && (
        <Input label="Number of Family Members">
          <TextInput type="number" min="2" value={form.numFamilyMembers} onChange={(v) => update('numFamilyMembers', v)} placeholder="e.g. 4" />
        </Input>
      )}

      <Input label="Preferred Sum Insured">
        <SelectInput value={form.sumInsuredPreference} onChange={(v) => update('sumInsuredPreference', v)}>
          <option value="">Select…</option>
          <option value="300000">₹3 Lakh</option>
          <option value="500000">₹5 Lakh</option>
          <option value="1000000">₹10 Lakh</option>
          <option value="2500000">₹25 Lakh</option>
          <option value="5000000">₹50 Lakh</option>
          <option value="10000000">₹1 Crore</option>
        </SelectInput>
      </Input>
    </div>
  );
}

function StepHealth({ form, update }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Health Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Helps us find plans best suited to your health needs.</p>
      </div>

      <div className="space-y-2">
        <CheckRow label="I smoke or use tobacco"       icon={Cigarette}   checked={form.isSmoker}          onChange={(v) => update('isSmoker', v)} />
        <CheckRow label="Diabetes"                      icon={Droplets}    checked={form.hasDiabetes}        onChange={(v) => update('hasDiabetes', v)} />
        <CheckRow label="Blood Pressure (BP)"           icon={Activity}    checked={form.hasBP}              onChange={(v) => update('hasBP', v)} />
        <CheckRow label="Heart condition"               icon={Heart}       checked={form.hasHeartCondition}  onChange={(v) => update('hasHeartCondition', v)} />
        <CheckRow label="Thyroid"                       icon={Zap}         checked={form.hasThyroid}          onChange={(v) => update('hasThyroid', v)} />
        <CheckRow label="Cancer history"                icon={Ribbon}      checked={form.hasCancerHistory}   onChange={(v) => update('hasCancerHistory', v)} />
        <CheckRow label="Kidney disease"                icon={Bean}        checked={form.hasKidneyDisease}    onChange={(v) => update('hasKidneyDisease', v)} />
        <CheckRow label="Other health condition"        icon={Stethoscope} checked={form.hasOtherCondition}   onChange={(v) => update('hasOtherCondition', v)} />
      </div>

      {form.hasOtherCondition && (
        <Input label="Please describe">
          <TextInput
            value={form.otherConditionDetail}
            onChange={(v) => update('otherConditionDetail', v)}
            placeholder="Brief description of the condition"
          />
        </Input>
      )}
    </div>
  );
}

function StepReview({ form }) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
        <Row label="Name"       value={form.name} />
        <Row label="Email"      value={form.email} />
        <Row label="Phone"      value={form.phone} />
        <Row label="DOB"        value={form.dateOfBirth} />
        <Row label="City"       value={form.city || '—'} />
        <Row label="Plan Type"  value={form.planTypeInterest === 'INDIVIDUAL' ? 'Individual' : 'Family Floater'} />
        {form.sumInsuredPreference && <Row label="Sum Insured" value={`₹${Number(form.sumInsuredPreference).toLocaleString('en-IN')}`} />}
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm text-primary-800">
        By submitting, you agree to be contacted by INSUTECH Insurance Broking Services Pvt. Ltd. regarding your insurance enquiry.
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function validate(step, form) {
  const errors = {};
  if (step === 0) {
    if (!form.name.trim())      errors.name = 'Required';
    if (!form.email.trim())     errors.email = 'Required';
    if (!/^\d{10}$/.test(form.phone)) errors.phone = 'Enter a valid 10-digit number';
    if (!form.dateOfBirth)      errors.dateOfBirth = 'Required';
  }
  return errors;
}

export default function GetQuote() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const { localUser, saveUser } = useLocalUser();

  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState(() => ({
    ...DEFAULT_FORM,
    name:        localUser?.name        || '',
    phone:       localUser?.phone       || '',
    email:       localUser?.email       || '',
    dateOfBirth: localUser?.dateOfBirth || '',
    gender:      localUser?.gender      || 'MALE',
    city:        localUser?.city        || '',
  }));
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleNext = () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (step < STEPS.length - 1) { setStep(step + 1); return; }

    // Submit
    setLoading(true);
    setApiError('');
    submitLead({
      ...form,
      numFamilyMembers:     form.numFamilyMembers     ? Number(form.numFamilyMembers)     : undefined,
      sumInsuredPreference: form.sumInsuredPreference ? Number(form.sumInsuredPreference) : undefined,
      recommendedPlanIds:   planId ? [planId] : undefined,
    })
      .then(() => {
        saveUser({ name: form.name, phone: form.phone, email: form.email, dateOfBirth: form.dateOfBirth, gender: form.gender, city: form.city });
        setSuccess(true);
      })
      .catch(() => setApiError('Something went wrong. Please try again.'))
      .finally(() => setLoading(false));
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-gray-500 mb-6">
          We've received your enquiry. Our team will reach out to you shortly at <strong>{form.phone}</strong>.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/plans" className="bg-primary-600 text-white font-medium py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
            Browse More Plans
          </Link>
          <Link to="/compare" className="border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl hover:border-gray-400 transition-colors">
            Compare Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Get a Free Quote</h1>
        <p className="text-sm text-gray-500">Fill in your details and our team will get back to you.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full transition-colors ${i <= step ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <span className={`text-xs ${i === step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        {step === 0 && <StepContact form={form} update={update} errors={errors} />}
        {step === 1 && <StepHealth  form={form} update={update} />}
        {step === 2 && <StepReview  form={form} />}
      </div>

      {apiError && <p className="text-red-500 text-sm text-center mb-4">{apiError}</p>}

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
          disabled={loading}
          className="bg-primary-600 text-white font-medium px-8 py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading
            ? <><Spinner className="w-4 h-4" /> Submitting…</>
            : step === STEPS.length - 1 ? 'Submit Enquiry' : <><span>Next</span><ArrowRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}
