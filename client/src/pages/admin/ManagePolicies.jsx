import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Select from '../../components/ui/Select.jsx';
import { adminGetPolicies, adminUpdatePolicy } from '../../services/adminService.js';

const STATUS_OPTIONS = ['', 'PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'];

const STATUS_COLOR = {
  PENDING:   'orange',
  ACTIVE:    'green',
  EXPIRED:   'gray',
  CANCELLED: 'red',
};

const STATUS_ICON = {
  PENDING:   Clock,
  ACTIVE:    CheckCircle,
  EXPIRED:   XCircle,
  CANCELLED: XCircle,
};

function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date) - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiryChip({ endDate, status }) {
  if (status !== 'ACTIVE') return null;
  const days = daysUntil(endDate);
  if (days === null) return null;
  if (days < 0) return <span className="text-xs text-gray-400">Expired</span>;
  if (days <= 7)  return <span className="flex items-center gap-1 text-xs font-medium text-red-600"><AlertTriangle size={11} />{days}d left</span>;
  if (days <= 30) return <span className="flex items-center gap-1 text-xs font-medium text-orange-500"><AlertTriangle size={11} />{days}d left</span>;
  return <span className="text-xs text-gray-400">{days}d left</span>;
}

export default function ManagePolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', startDate: '', endDate: '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (search)       params.search = search;
    adminGetPolicies(params).then((r) => setPolicies(r.data)).finally(() => setLoading(false));
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (policy) => {
    setSelected(policy);
    setEditForm({
      status:    policy.status,
      startDate: policy.startDate ? policy.startDate.slice(0, 10) : '',
      endDate:   policy.endDate   ? policy.endDate.slice(0, 10)   : '',
    });
    setError('');
    setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await adminUpdatePolicy(selected.id, editForm);
      load();
      setModal(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update policy.');
    } finally { setSaving(false); }
  };

  const columns = [
    {
      key: 'policy', label: 'Policy',
      render: (row) => {
        const days = daysUntil(row.endDate);
        const isExpiring = row.status === 'ACTIVE' && days !== null && days <= 30 && days >= 0;
        return (
          <div className="flex items-start gap-2">
            {isExpiring && days <= 7 && <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />}
            {isExpiring && days > 7  && <AlertTriangle size={14} className="text-orange-400 mt-0.5 shrink-0" />}
            <div>
              <p className="font-mono text-xs font-medium text-gray-900">{row.policyNumber}</p>
              <p className="text-xs text-gray-500 mt-0.5">{row.plan?.name} · {row.plan?.insurer?.name}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'user', label: 'Policyholder',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{row.user?.name}</p>
          <p className="text-xs text-gray-400">{row.user?.phone}</p>
        </div>
      ),
    },
    {
      key: 'status', label: 'Status', width: '130px',
      render: (row) => {
        const Icon = STATUS_ICON[row.status] || Clock;
        return (
          <div className="flex flex-col gap-1">
            <Badge color={STATUS_COLOR[row.status] || 'gray'}>
              <span className="flex items-center gap-1"><Icon size={10} />{row.status}</span>
            </Badge>
            <ExpiryChip endDate={row.endDate} status={row.status} />
          </div>
        );
      },
    },
    {
      key: 'cover', label: 'Cover', width: '110px',
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">₹{(row.sumInsured / 100000).toFixed(0)}L</p>
          <p className="text-xs text-gray-400">₹{row.annualPremium.toLocaleString('en-IN')}/yr</p>
        </div>
      ),
    },
    {
      key: 'dates', label: 'Validity', width: '130px',
      render: (row) => (
        <div className="text-xs text-gray-500">
          {row.startDate ? new Date(row.startDate).toLocaleDateString('en-IN') : '—'}
          <span className="mx-1">→</span>
          {row.endDate   ? new Date(row.endDate).toLocaleDateString('en-IN')   : '—'}
        </div>
      ),
    },
    {
      key: 'actions', label: '', width: '80px',
      render: (row) => (
        <button onClick={() => openEdit(row)} className="text-xs text-admin-600 hover:underline font-medium">
          Manage
        </button>
      ),
    },
  ];

  // Separate expiring-soon for visual emphasis
  const expiringSoon = policies.filter((p) => {
    const d = daysUntil(p.endDate);
    return p.status === 'ACTIVE' && d !== null && d <= 30 && d >= 0;
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
            <p className="text-gray-500 text-sm mt-0.5">{policies.length} total</p>
          </div>
        </div>

        {/* Expiring soon banner */}
        {expiringSoon.length > 0 && !statusFilter && !search && (
          <div className="mb-5 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3.5">
            <AlertTriangle size={18} className="text-orange-500 shrink-0" />
            <p className="text-sm text-orange-800">
              <span className="font-semibold">{expiringSoon.length} active {expiringSoon.length === 1 ? 'policy' : 'policies'}</span>{' '}
              expiring within 30 days — shown first in the table below.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, policy no…"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500"
          />
          <div className="w-44">
            <Select value={statusFilter} onChange={setStatusFilter} variant="admin">
              <option value="">All statuses</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>

        <AdminTable columns={columns} data={policies} loading={loading} emptyMessage="No policies found." />
      </div>

      {modal === 'edit' && selected && (
        <Modal title="Manage Policy" onClose={() => setModal(null)} size="sm">
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="font-mono text-xs font-medium text-gray-700">{selected.policyNumber}</p>
            <p className="text-sm text-gray-600 mt-0.5">{selected.user?.name} · {selected.plan?.name}</p>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={editForm.status} onChange={(v) => setEditForm((f) => ({ ...f, status: v }))} variant="admin">
                {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date" value={editForm.startDate}
                onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date" value={editForm.endDate}
                onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500"
              />
            </div>
            <p className="text-xs text-gray-400">Setting status to Active without an end date will auto-set it to 1 year from start.</p>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium bg-admin-600 text-white rounded-xl hover:bg-admin-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
