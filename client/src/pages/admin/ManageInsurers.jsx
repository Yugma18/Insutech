import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { adminGetInsurers, adminCreateInsurer, adminUpdateInsurer, adminDeleteInsurer, adminUploadInsurerLogo } from '../../services/adminService.js';
import Select from '../../components/ui/Select.jsx';

const EMPTY_FORM = { name: '', category: 'PVT', description: '', isActive: true, logoUrl: '' };
const API_BASE = import.meta.env.VITE_API_BASE || '';

function LogoPicker({ logoUrl, onFileSelect, onClear }) {
  const inputRef = useRef(null);
  // blob: = local preview, /uploads/... = server path, http: = external URL
  const previewSrc = logoUrl
    ? (logoUrl.startsWith('blob:') || logoUrl.startsWith('http') ? logoUrl : `${API_BASE}${logoUrl}`)
    : null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
      <div className="flex items-center gap-3">
        {previewSrc ? (
          <div className="relative w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            <img src={previewSrc} alt="Logo preview" className="w-full h-full object-contain p-1" />
            <button
              type="button"
              onClick={onClear}
              className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5 shadow text-gray-400 hover:text-red-500"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300">
            <Upload size={20} />
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm text-admin-600 font-medium hover:underline"
          >
            {previewSrc ? 'Change logo' : 'Upload logo'}
          </button>
          <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG or WebP · max 2 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => { if (e.target.files[0]) onFileSelect(e.target.files[0]); }}
          />
        </div>
      </div>
    </div>
  );
}

function InsurerForm({ form, onChange, onFileSelect, onLogoClear, onSubmit, loading, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Insurer Name <span className="text-red-500">*</span></label>
        <input
          required value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. ICICI Lombard"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
        <Select value={form.category} onChange={(v) => onChange('category', v)} variant="admin">
          <option value="PVT">Private (PVT)</option>
          <option value="PSU">Public Sector (PSU)</option>
        </Select>
      </div>

      <LogoPicker logoUrl={form.logoUrl} onFileSelect={onFileSelect} onClear={onLogoClear} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          placeholder="Short description of the insurer…"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-admin-500 resize-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => onChange('isActive', e.target.checked)}
          className="accent-admin-600 w-4 h-4"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible on platform)</label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-admin-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-admin-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function ManageInsurers() {
  const [insurers, setInsurers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [pendingFile, setPendingFile] = useState(null); // file selected but not yet uploaded
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminGetInsurers().then((r) => setInsurers(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const closeModal = () => { setModal(null); setSelected(null); setForm(EMPTY_FORM); setPendingFile(null); setError(''); };

  const openAdd  = () => { setForm(EMPTY_FORM); setPendingFile(null); setModal('add'); };
  const openEdit = (ins) => {
    setSelected(ins);
    setForm({ name: ins.name, category: ins.category, description: ins.description || '', isActive: ins.isActive, logoUrl: ins.logoUrl || '' });
    setPendingFile(null);
    setModal('edit');
  };
  const openDel  = (ins) => { setSelected(ins); setModal('delete'); };

  // When user picks a file, show a local object URL preview immediately
  const handleFileSelect = (file) => {
    setPendingFile(file);
    updateForm('logoUrl', URL.createObjectURL(file)); // local preview only
  };
  const handleLogoClear = () => { setPendingFile(null); updateForm('logoUrl', ''); };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const { data: created } = await adminCreateInsurer({ name: form.name, category: form.category, description: form.description, isActive: form.isActive });
      if (pendingFile) {
        await adminUploadInsurerLogo(created.id, pendingFile);
      }
      load(); closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create insurer.');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      let logoUrl = selected.logoUrl || '';
      if (pendingFile) {
        const { data } = await adminUploadInsurerLogo(selected.id, pendingFile);
        logoUrl = data.logoUrl;
      } else if (!form.logoUrl) {
        logoUrl = null; // cleared
      }
      await adminUpdateInsurer(selected.id, { name: form.name, category: form.category, description: form.description, isActive: form.isActive, logoUrl });
      load(); closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update insurer.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await adminDeleteInsurer(selected.id);
      load(); closeModal();
    } catch {
      setError('Failed to delete. This insurer may have associated plans.');
    } finally { setSaving(false); }
  };

  const columns = [
    {
      key: 'name', label: 'Insurer',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.logoUrl ? (
            <img
              src={row.logoUrl.startsWith('http') || row.logoUrl.startsWith('blob:') ? row.logoUrl : `${API_BASE}${row.logoUrl}`}
              alt={row.name}
              className="w-9 h-9 object-contain rounded-lg border border-gray-100 bg-white p-0.5 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
              <span className="text-gray-300 text-xs font-bold">{row.name[0]}</span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            {row.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{row.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'category', label: 'Category', width: '120px',
      render: (row) => <Badge color={row.category === 'PVT' ? 'blue' : 'orange'}>{row.category}</Badge>,
    },
    {
      key: 'isActive', label: 'Status', width: '100px',
      render: (row) => <Badge color={row.isActive ? 'green' : 'gray'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions', label: '', width: '120px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="text-xs text-admin-600 hover:underline font-medium">Edit</button>
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
            <h1 className="text-2xl font-bold text-gray-900">Insurers</h1>
            <p className="text-gray-500 text-sm mt-0.5">{insurers.length} insurers total</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-admin-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-admin-700 transition-colors text-sm"
          >
            + Add Insurer
          </button>
        </div>

        <AdminTable columns={columns} data={insurers} loading={loading} emptyMessage="No insurers found." />
      </div>

      {modal === 'add' && (
        <Modal title="Add Insurer" onClose={closeModal}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <InsurerForm form={form} onChange={updateForm} onFileSelect={handleFileSelect} onLogoClear={handleLogoClear} onSubmit={handleAdd} loading={saving} submitLabel="Add Insurer" />
        </Modal>
      )}

      {modal === 'edit' && (
        <Modal title="Edit Insurer" onClose={closeModal}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <InsurerForm form={form} onChange={updateForm} onFileSelect={handleFileSelect} onLogoClear={handleLogoClear} onSubmit={handleEdit} loading={saving} submitLabel="Save Changes" />
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete Insurer" onClose={closeModal} size="sm">
          <p className="text-gray-600 text-sm mb-6">
            Are you sure you want to delete <strong>{selected?.name}</strong>? This will also delete all associated plans and features.
          </p>
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
