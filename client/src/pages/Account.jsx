import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useAuth from '../hooks/useAuth';
import { userGetPolicies } from '../services/userService';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending Review', icon: Clock,         color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  ACTIVE:    { label: 'Active',         icon: CheckCircle,   color: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-200' },
  EXPIRED:   { label: 'Expired',        icon: XCircle,       color: 'text-gray-500',   bg: 'bg-gray-50',    border: 'border-gray-200'  },
  CANCELLED: { label: 'Cancelled',      icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-200'   },
};

function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date) - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ endDate }) {
  const days = daysUntil(endDate);
  if (days === null || days < 0) return null;

  if (days <= 7)  return (
    <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      <AlertTriangle size={11} /> Expires in {days}d
    </span>
  );
  if (days <= 30) return (
    <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
      <AlertTriangle size={11} /> Expires in {days}d
    </span>
  );
  return null;
}

function PolicyCard({ policy }) {
  const { plan } = policy;
  const insurer  = plan?.insurer;
  const cfg      = STATUS_CONFIG[policy.status] || STATUS_CONFIG.PENDING;
  const Icon     = cfg.icon;
  const days     = daysUntil(policy.endDate);
  const isExpiringSoon = policy.status === 'ACTIVE' && days !== null && days <= 30;

  return (
    <div className={`bg-white rounded-2xl border ${isExpiringSoon ? 'border-orange-300 shadow-orange-100' : 'border-gray-100'} shadow-sm p-5`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {insurer?.logoUrl ? (
            <img
              src={insurer.logoUrl.startsWith('http') ? insurer.logoUrl : `${API_BASE}${insurer.logoUrl}`}
              alt={insurer.name}
              className="w-10 h-10 object-contain rounded-xl border border-gray-100 bg-white p-0.5"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Shield size={18} className="text-primary-600" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm">{plan?.name}</p>
            <p className="text-xs text-gray-500">{insurer?.name}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <Icon size={11} /> {cfg.label}
          </span>
          <ExpiryBadge endDate={policy.endDate} />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Policy No.</p>
          <p className="font-mono font-medium text-gray-900 text-xs">{policy.policyNumber}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Sum Insured</p>
          <p className="font-semibold text-gray-900">₹{(policy.sumInsured / 100000).toFixed(0)}L</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Annual Premium</p>
          <p className="font-semibold text-primary-700">₹{policy.annualPremium.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Family Config</p>
          <p className="font-medium text-gray-900">{policy.familyConfig}</p>
        </div>
        {policy.startDate && (
          <div className="bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-400 mb-0.5">Start Date</p>
            <p className="font-medium text-gray-900">{new Date(policy.startDate).toLocaleDateString('en-IN')}</p>
          </div>
        )}
        {policy.endDate && (
          <div className={`rounded-xl px-3 py-2 ${isExpiringSoon && days <= 7 ? 'bg-red-50' : isExpiringSoon ? 'bg-orange-50' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-400 mb-0.5">End Date</p>
            <p className={`font-medium ${isExpiringSoon && days <= 7 ? 'text-red-700' : isExpiringSoon ? 'text-orange-700' : 'text-gray-900'}`}>
              {new Date(policy.endDate).toLocaleDateString('en-IN')}
            </p>
          </div>
        )}
      </div>

      {/* Expiry warning banner */}
      {isExpiringSoon && (
        <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${days <= 7 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
          <AlertTriangle size={13} />
          {days <= 7
            ? `Your policy expires in ${days} day${days === 1 ? '' : 's'}! Renew now to stay covered.`
            : `Your policy expires in ${days} days. Consider renewing soon.`}
          <Link to="/plans" className="ml-auto underline underline-offset-2 shrink-0">Browse plans</Link>
        </div>
      )}
    </div>
  );
}

export default function Account() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/account' } }); return; }
    userGetPolicies().then((r) => setPolicies(r.data)).finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  const active    = policies.filter((p) => p.status === 'ACTIVE');
  const pending   = policies.filter((p) => p.status === 'PENDING');
  const others    = policies.filter((p) => p.status !== 'ACTIVE' && p.status !== 'PENDING');
  const expiringSoon = active.filter((p) => { const d = daysUntil(p.endDate); return d !== null && d <= 30; });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        {/* Profile header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-500 text-sm mt-0.5">{user.email} · {user.phone}</p>
          </div>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            Sign Out
          </button>
        </div>

        {/* Expiry alert summary */}
        {expiringSoon.length > 0 && (
          <div className="mb-6 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
            <AlertTriangle size={20} className="text-orange-500 shrink-0" />
            <p className="text-sm text-orange-800 font-medium">
              {expiringSoon.length === 1
                ? '1 policy is expiring within 30 days.'
                : `${expiringSoon.length} policies are expiring within 30 days.`}
              {' '}<Link to="/plans" className="underline underline-offset-2">Browse plans to renew.</Link>
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading policies…</div>
        ) : policies.length === 0 ? (
          <div className="text-center py-20">
            <Shield size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No policies yet</p>
            <p className="text-gray-400 text-sm mt-1">Browse plans and purchase your first health insurance policy.</p>
            <Link to="/plans" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary-600 hover:underline">
              Browse Plans <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pending Review ({pending.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2">{pending.map((p) => <PolicyCard key={p.id} policy={p} />)}</div>
              </section>
            )}
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Policies ({active.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2">{active.map((p) => <PolicyCard key={p.id} policy={p} />)}</div>
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past Policies</h2>
                <div className="grid gap-4 sm:grid-cols-2">{others.map((p) => <PolicyCard key={p.id} policy={p} />)}</div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
