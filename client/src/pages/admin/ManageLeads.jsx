import { useState, useEffect, useCallback } from 'react';
import { Cigarette, Droplets, Activity, Heart, Zap, Download, ArrowLeft, ArrowRight, Check, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Select from '../../components/ui/Select.jsx';
import { adminGetLeads, adminGetLeadById, adminUpdateLead, adminExportLeads } from '../../services/adminService.js';

const STATUS_COLORS = { NEW: 'green', CONTACTED: 'blue', CONVERTED: 'purple', DROPPED: 'gray' };
const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'CONVERTED', 'DROPPED'];

function LeadDetail({ lead, onSave }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes]   = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateLead(lead.id, { status, notes });
      onSave({ ...lead, status, notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const yes = (v) => v ? 'Yes' : '—';

  return (
    <div className="space-y-6">
      {/* Contact info */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {[
          ['Name',    lead.name],
          ['Email',   lead.email],
          ['Phone',   lead.phone],
          ['DOB',     lead.dateOfBirth ? new Date(lead.dateOfBirth).toLocaleDateString('en-IN') : '—'],
          ['Age',     lead.age],
          ['Gender',  lead.gender],
          ['City',    lead.city || '—'],
          ['Plan Type', lead.planTypeInterest === 'INDIVIDUAL' ? 'Individual' : 'Family Floater'],
          ['Sum Insured Pref.', lead.sumInsuredPreference ? `₹${Number(lead.sumInsuredPreference).toLocaleString('en-IN')}` : '—'],
          ['Family Members', lead.numFamilyMembers || '—'],
          ['Submitted',   new Date(lead.createdAt).toLocaleString('en-IN')],
          ['Visits',      lead.visitCount ?? 1],
          ['Last Visit',  new Date(lead.lastVisitAt).toLocaleString('en-IN')],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <span className="text-gray-500 w-36 shrink-0">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* Health profile */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Health Profile</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ['Smoker',        lead.isSmoker],
            ['Diabetes',      lead.hasDiabetes],
            ['BP',            lead.hasBP],
            ['Heart Condition', lead.hasHeartCondition],
            ['Thyroid',       lead.hasThyroid],
            ['Cancer History', lead.hasCancerHistory],
            ['Kidney Disease', lead.hasKidneyDisease],
            ['Other Condition', lead.hasOtherCondition],
          ].map(([label, val]) => (
            <div key={label} className={`flex gap-2 px-3 py-1.5 rounded-lg ${val ? 'bg-orange-50' : 'bg-gray-50'}`}>
              <span className="text-gray-500">{label}</span>
              <span className={`font-medium ${val ? 'text-orange-600' : 'text-gray-400'}`}>{val ? 'Yes' : 'No'}</span>
            </div>
          ))}
        </div>
        {lead.otherConditionDetail && (
          <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <span className="font-medium">Detail:</span> {lead.otherConditionDetail}
          </p>
        )}
      </div>

      {/* Status + Notes */}
      <div className="space-y-3 bg-gray-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Update Lead</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Select value={status} onChange={setStatus} variant="admin">
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add notes about this lead…"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500 resize-none" />
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-admin-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-admin-700 disabled:opacity-50">
          {saving ? 'Saving…' : saved ? <><Check size={14} className="inline mr-1" />Saved!</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default function ManageLeads() {
  const [leads, setLeads]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    adminGetLeads(params)
      .then((r) => { setLeads(r.data.leads); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openLead = async (lead) => {
    const res = await adminGetLeadById(lead.id);
    setSelected(res.data);
    setModal('detail');
  };

  const handleSave = (updated) => {
    setSelected(updated);
    setLeads((prev) => prev.map((l) => l.id === updated.id ? { ...l, status: updated.status, notes: updated.notes } : l));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminExportLeads();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'leads.csv'; a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  const totalPages = Math.ceil(total / 20);

  const columns = [
    {
      key: 'name', label: 'Lead',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    { key: 'phone',          label: 'Phone',   width: '130px', render: (row) => <span className="text-sm">{row.phone}</span> },
    { key: 'age',            label: 'Age',     width: '60px' },
    { key: 'planTypeInterest', label: 'Plan', width: '130px', render: (row) => <Badge color="gray">{row.planTypeInterest === 'INDIVIDUAL' ? 'Individual' : 'Family'}</Badge> },
    {
      key: 'health', label: 'Conditions', width: '120px',
      render: (row) => {
        const flags = [
            row.isSmoker        && <Cigarette key="smoke" size={14} className="text-gray-500" title="Smoker" />,
            row.hasDiabetes     && <Droplets  key="diab"  size={14} className="text-gray-500" title="Diabetes" />,
            row.hasBP           && <Activity  key="bp"    size={14} className="text-gray-500" title="BP" />,
            row.hasHeartCondition && <Heart   key="heart" size={14} className="text-gray-500" title="Heart" />,
            row.hasThyroid      && <Zap       key="thy"   size={14} className="text-gray-500" title="Thyroid" />,
          ].filter(Boolean);
        return <div className="flex items-center gap-1">{flags.length ? flags : <span className="text-gray-300 text-sm">None</span>}</div>;
      },
    },
    {
      key: 'visitCount', label: 'Visits', width: '80px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <RefreshCw size={12} className={row.visitCount > 1 ? 'text-admin-500' : 'text-gray-300'} />
          <span className={`text-sm font-medium ${row.visitCount > 1 ? 'text-admin-600' : 'text-gray-400'}`}>
            {row.visitCount ?? 1}
          </span>
        </div>
      ),
    },
    { key: 'status', label: 'Status', width: '110px', render: (row) => <Badge color={STATUS_COLORS[row.status]}>{row.status}</Badge> },
    {
      key: 'createdAt', label: 'Date', width: '130px',
      render: (row) => <span className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleDateString('en-IN')}</span>,
    },
    {
      key: 'actions', label: '', width: '80px',
      render: (row) => (
        <button onClick={() => openLead(row)} className="text-xs text-admin-600 hover:underline font-medium">View</button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total} total enquiries</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status filter */}
            <Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} variant="admin">
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </Select>

            <button onClick={handleExport} disabled={exporting}
              className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 disabled:opacity-50">
              {exporting ? 'Exporting…' : <><Download size={14} className="inline mr-1" />Export CSV</>}
            </button>
          </div>
        </div>

        <AdminTable columns={columns} data={leads} loading={loading} emptyMessage="No leads found." />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"><ArrowLeft size={14} /> Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next <ArrowRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {modal === 'detail' && selected && (
        <Modal title={`Lead — ${selected.name}`} onClose={() => { setModal(null); setSelected(null); }} size="lg">
          <LeadDetail lead={selected} onSave={handleSave} />
        </Modal>
      )}
    </AdminLayout>
  );
}
