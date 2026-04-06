import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { adminGetPlans, adminGetInsurers, adminCreatePlan, adminUpdatePlan, adminDeletePlan, adminUpsertFeature, adminDeleteFeature, adminCreatePremium, adminDeletePremium, adminFeaturesTemplate, adminImportFeatures, adminPremiumsTemplate, adminImportPremiums } from '../../services/adminService.js';
import { formatCurrency, formatPremium } from '../../utils/formatters.js';
import Select from '../../components/ui/Select.jsx';

const EMPTY_PLAN = { insurerId: '', name: '', planType: 'INDIVIDUAL', variant: '', minSumInsured: '', maxSumInsured: '', minEntryAge: 18, maxEntryAge: 65, isActive: true };
const EMPTY_FEATURE = { featureKey: '', featureLabel: '', featureValue: '', featureCategory: 'Coverage', displayOrder: 0 };
const EMPTY_PREMIUM = { ageGroup: '', familyConfig: '1A', sumInsured: '', annualPremium: '' };

const FEATURE_CATEGORIES = ['Basic Info', 'Waiting Periods', 'Coverage', 'Benefits', 'Optional Covers', 'Costs & Discounts'];

function PlanForm({ form, onChange, insurers, onSubmit, loading, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Insurer <span className="text-red-500">*</span></label>
        <Select required value={form.insurerId} onChange={(v) => onChange('insurerId', v)} variant="admin">
          <option value="">Select insurer…</option>
          {insurers.map((ins) => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name <span className="text-red-500">*</span></label>
          <input required value={form.name} onChange={(e) => onChange('name', e.target.value)} placeholder="e.g. Elevate"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
          <input value={form.variant} onChange={(e) => onChange('variant', e.target.value)} placeholder="e.g. Gold (optional)"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type <span className="text-red-500">*</span></label>
        <Select value={form.planType} onChange={(v) => onChange('planType', v)} variant="admin">
          <option value="INDIVIDUAL">Individual</option>
          <option value="FAMILY_FLOATER">Family Floater</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Sum Insured (₹)</label>
          <input type="number" value={form.minSumInsured} onChange={(e) => onChange('minSumInsured', Number(e.target.value))} placeholder="e.g. 500000"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Sum Insured (₹)</label>
          <input type="number" value={form.maxSumInsured} onChange={(e) => onChange('maxSumInsured', Number(e.target.value))} placeholder="e.g. 10000000"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Entry Age</label>
          <input type="number" value={form.minEntryAge} onChange={(e) => onChange('minEntryAge', Number(e.target.value))}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Entry Age (999 = no limit)</label>
          <input type="number" value={form.maxEntryAge} onChange={(e) => onChange('maxEntryAge', Number(e.target.value))}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="planActive" checked={form.isActive} onChange={(e) => onChange('isActive', e.target.checked)} className="accent-admin-600 w-4 h-4" />
        <label htmlFor="planActive" className="text-sm text-gray-700">Active (visible on platform)</label>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading}
          className="bg-admin-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-admin-700 transition-colors disabled:opacity-50">
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function ImportBar({ planId, type }) {
  const [importing, setImporting] = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');

  const downloadTemplate = async () => {
    try {
      const res  = type === 'features' ? await adminFeaturesTemplate(planId) : await adminPremiumsTemplate(planId);
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${type}_template.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Failed to download template.'); }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setResult(null); setError('');
    try {
      const text = await file.text();
      const res  = type === 'features'
        ? await adminImportFeatures(planId, text)
        : await adminImportPremiums(planId, text);
      setResult(res.data);
      // Reset file input so same file can be re-uploaded
      e.target.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed.');
    } finally { setImporting(false); }
  };

  return (
    <div className="bg-admin-50 border border-admin-200 rounded-xl p-4 mb-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-admin-900">Bulk Import via CSV</p>
          <p className="text-xs text-admin-600 mt-0.5">
            Download the template → fill in values → upload back.
            {type === 'features' && ' Only the featureValue column needs to be edited.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-admin-400 text-admin-700 rounded-lg hover:bg-admin-100 transition-colors"
          >
            ↓ Download Template
          </button>
          <label className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${importing ? 'bg-gray-200 text-gray-400' : 'bg-admin-600 text-white hover:bg-admin-700'}`}>
            {importing ? 'Importing…' : '↑ Upload CSV'}
            <input type="file" accept=".csv" className="hidden" disabled={importing} onChange={handleFile} />
          </label>
        </div>
      </div>

      {result && (
        <div className="mt-3 text-xs space-y-1">
          <p className="text-green-700 font-medium">✓ {result.saved} rows imported successfully{result.skipped > 0 ? `, ${result.skipped} blank rows skipped` : ''}.</p>
          {result.errors?.length > 0 && (
            <ul className="text-amber-700 space-y-0.5">
              {result.errors.map((e, i) => <li key={i}>⚠ {e}</li>)}
            </ul>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function FeatureManager({ plan, onClose }) {
  const [features, setFeatures] = useState(plan.features || []);
  const [form, setForm]         = useState(EMPTY_FEATURE);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.featureKey || !form.featureLabel || !form.featureValue) { setError('Key, label and value are required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await adminUpsertFeature(plan.id, form);
      setFeatures((f) => {
        const idx = f.findIndex((x) => x.featureKey === res.data.featureKey);
        return idx >= 0 ? f.map((x, i) => i === idx ? res.data : x) : [...f, res.data];
      });
      setForm(EMPTY_FEATURE);
    } catch { setError('Failed to save feature.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (featureKey) => {
    try {
      await adminDeleteFeature(plan.id, featureKey);
      setFeatures((f) => f.filter((x) => x.featureKey !== featureKey));
    } catch { setError('Failed to delete feature.'); }
  };

  const grouped = FEATURE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = features.filter((f) => f.featureCategory === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <ImportBar planId={plan.id} type="features" />

      {/* Add / edit feature form */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add / Update Feature</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.featureKey} onChange={(e) => updateForm('featureKey', e.target.value)} placeholder="feature_key (snake_case)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-500" />
            <input value={form.featureLabel} onChange={(e) => updateForm('featureLabel', e.target.value)} placeholder="Display Label"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-500" />
          </div>
          <textarea value={form.featureValue} onChange={(e) => updateForm('featureValue', e.target.value)} placeholder="Feature value / description" rows={2}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-500 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.featureCategory} onChange={(v) => updateForm('featureCategory', v)} variant="admin">
              {FEATURE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <input type="number" value={form.displayOrder} onChange={(e) => updateForm('displayOrder', Number(e.target.value))} placeholder="Display order"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-500" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={saving}
            className="bg-admin-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-admin-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Feature'}
          </button>
        </form>
      </div>

      {/* Feature list grouped */}
      {FEATURE_CATEGORIES.map((cat) => grouped[cat]?.length > 0 && (
        <div key={cat}>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{cat}</h4>
          <div className="space-y-1">
            {grouped[cat].map((f) => (
              <div key={f.featureKey} className="flex items-start gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-mono">{f.featureKey}</p>
                  <p className="text-sm font-medium text-gray-800">{f.featureLabel}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{f.featureValue}</p>
                </div>
                <button onClick={() => { setForm({ featureKey: f.featureKey, featureLabel: f.featureLabel, featureValue: f.featureValue, featureCategory: f.featureCategory, displayOrder: f.displayOrder }); }}
                  className="text-xs text-admin-600 hover:underline shrink-0">Edit</button>
                <button onClick={() => handleDelete(f.featureKey)} className="text-xs text-red-500 hover:underline shrink-0">Del</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PremiumManager({ plan }) {
  const [premiums, setPremiums] = useState(plan.premiums || []);
  const [form, setForm]         = useState(EMPTY_PREMIUM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await adminCreatePremium(plan.id, {
        ageGroup: Number(form.ageGroup),
        familyConfig: form.familyConfig,
        sumInsured: Number(form.sumInsured),
        annualPremium: Number(form.annualPremium),
      });
      setPremiums((p) => [...p, res.data]);
      setForm(EMPTY_PREMIUM);
    } catch { setError('Failed to save premium.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeletePremium(id);
      setPremiums((p) => p.filter((x) => x.id !== id));
    } catch { setError('Failed to delete premium.'); }
  };

  return (
    <div className="space-y-5">
      <ImportBar planId={plan.id} type="premiums" />

      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Premium Row</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
          <input type="number" value={form.ageGroup} onChange={(e) => updateForm('ageGroup', e.target.value)} placeholder="Age Group (e.g. 30)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-500" />
          <input value={form.familyConfig} onChange={(e) => updateForm('familyConfig', e.target.value)} placeholder="Config (e.g. 1A or 2A+2C)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-500" />
          <input type="number" value={form.sumInsured} onChange={(e) => updateForm('sumInsured', e.target.value)} placeholder="Sum Insured (₹)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-500" />
          <input type="number" value={form.annualPremium} onChange={(e) => updateForm('annualPremium', e.target.value)} placeholder="Annual Premium (₹)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-500" />
          {error && <p className="col-span-2 text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={saving} className="col-span-2 bg-admin-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-admin-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Add Premium'}
          </button>
        </form>
      </div>

      {premiums.length > 0 && (
        <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {['Age', 'Config', 'Sum Insured', 'Premium/yr', ''].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {premiums.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-3 py-2">{p.ageGroup}</td>
                <td className="px-3 py-2">{p.familyConfig}</td>
                <td className="px-3 py-2">{formatCurrency(p.sumInsured)}</td>
                <td className="px-3 py-2 font-medium text-admin-600">{formatPremium(p.annualPremium)}</td>
                <td className="px-3 py-2">
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ManagePlans() {
  const [plans, setPlans]       = useState([]);
  const [insurers, setInsurers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_PLAN);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [detailTab, setDetailTab] = useState('features');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([adminGetPlans(), adminGetInsurers()])
      .then(([plansRes, insRes]) => { setPlans(plansRes.data); setInsurers(insRes.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const closeModal = () => { setModal(null); setSelected(null); setForm(EMPTY_PLAN); setError(''); };

  const openAdd  = () => { setForm({ ...EMPTY_PLAN, insurerId: insurers[0]?.id || '' }); setModal('add'); };
  const openEdit = (plan) => {
    setSelected(plan);
    setForm({ insurerId: plan.insurerId, name: plan.name, planType: plan.planType, variant: plan.variant || '', minSumInsured: plan.minSumInsured, maxSumInsured: plan.maxSumInsured, minEntryAge: plan.minEntryAge, maxEntryAge: plan.maxEntryAge, isActive: plan.isActive });
    setModal('edit');
  };
  const openDetail = (plan) => { setSelected(plan); setDetailTab('features'); setModal('detail'); };
  const openDel  = (plan) => { setSelected(plan); setModal('delete'); };

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try { await adminCreatePlan(form); load(); closeModal(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to create plan.'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try { await adminUpdatePlan(selected.id, form); load(); closeModal(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to update plan.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await adminDeletePlan(selected.id); load(); closeModal(); }
    catch { setError('Failed to delete plan.'); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      key: 'name', label: 'Plan',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}{row.variant ? ` · ${row.variant}` : ''}</p>
          <p className="text-xs text-gray-400">{row.insurer?.name}</p>
        </div>
      ),
    },
    { key: 'planType', label: 'Type', width: '140px', render: (row) => <Badge color="gray">{row.planType === 'INDIVIDUAL' ? 'Individual' : 'Family Floater'}</Badge> },
    { key: 'category', label: 'Cat.', width: '80px', render: (row) => <Badge color={row.insurer?.category === 'PVT' ? 'blue' : 'orange'}>{row.insurer?.category}</Badge> },
    { key: 'si', label: 'Sum Insured', width: '160px', render: (row) => <span className="text-sm text-gray-600">{formatCurrency(row.minSumInsured)} – {formatCurrency(row.maxSumInsured)}</span> },
    { key: 'isActive', label: 'Status', width: '90px', render: (row) => <Badge color={row.isActive ? 'green' : 'gray'}>{row.isActive ? 'Active' : 'Off'}</Badge> },
    {
      key: 'actions', label: '', width: '160px',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => openDetail(row)} className="text-xs text-admin-600 hover:underline font-medium">Features</button>
          <button onClick={() => openEdit(row)} className="text-xs text-gray-600 hover:underline font-medium">Edit</button>
          <button onClick={() => openDel(row)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
            <p className="text-gray-500 text-sm mt-0.5">{plans.length} plans total</p>
          </div>
          <button onClick={openAdd} className="bg-admin-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-admin-700 text-sm">
            + Add Plan
          </button>
        </div>

        <AdminTable columns={columns} data={plans} loading={loading} />
      </div>

      {modal === 'add' && (
        <Modal title="Add Plan" onClose={closeModal}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <PlanForm form={form} onChange={updateForm} insurers={insurers} onSubmit={handleAdd} loading={saving} submitLabel="Add Plan" />
        </Modal>
      )}

      {modal === 'edit' && (
        <Modal title="Edit Plan" onClose={closeModal}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <PlanForm form={form} onChange={updateForm} insurers={insurers} onSubmit={handleEdit} loading={saving} submitLabel="Save Changes" />
        </Modal>
      )}

      {modal === 'detail' && selected && (
        <Modal title={`${selected.insurer?.name} — ${selected.name}${selected.variant ? ` · ${selected.variant}` : ''}`} onClose={closeModal} size="xl">
          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
            {['features', 'premiums'].map((tab) => (
              <button key={tab} onClick={() => setDetailTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${detailTab === tab ? 'bg-admin-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {detailTab === 'features'  && <FeatureManager plan={selected} onClose={closeModal} />}
          {detailTab === 'premiums'  && <PremiumManager plan={selected} />}
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete Plan" onClose={closeModal} size="sm">
          <p className="text-gray-600 text-sm mb-6">Delete <strong>{selected?.name}</strong>? All features and premiums will also be removed.</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button>
            <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50">
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
