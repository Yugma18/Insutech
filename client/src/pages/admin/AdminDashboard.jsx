import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BadgePlus, ClipboardList, Building2, ArrowRight, FileText, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../services/api.js';

const STAT_CARDS = [
  { key: 'totalLeads',       label: 'Total Leads',      icon: Users,         to: '/admin/leads',            color: 'blue'   },
  { key: 'newLeads',         label: 'New Leads',        icon: BadgePlus,     to: '/admin/leads?status=NEW', color: 'green'  },
  { key: 'totalPlans',       label: 'Active Plans',     icon: ClipboardList, to: '/admin/plans',            color: 'orange' },
  { key: 'totalInsurers',    label: 'Insurers',         icon: Building2,     to: '/admin/insurers',         color: 'purple' },
  { key: 'totalPolicies',    label: 'Active Policies',  icon: FileText,      to: '/admin/policies',         color: 'teal'   },
  { key: 'expiringPolicies', label: 'Expiring (30d)',   icon: AlertTriangle, to: '/admin/policies',         color: 'red'    },
];

const QUICK_LINKS = [
  { to: '/admin/insurers', icon: Building2,     title: 'Manage Insurers', desc: 'Add or update insurance company profiles.' },
  { to: '/admin/plans',    icon: ClipboardList, title: 'Manage Plans',    desc: 'Create and edit plan features and premiums.' },
  { to: '/admin/leads',    icon: Users,         title: 'Manage Leads',    desc: 'View enquiries and update their status.' },
  { to: '/admin/policies', icon: FileText,      title: 'Manage Policies', desc: 'Review purchases and activate policies.' },
];

const COLOR_MAP = {
  blue:   'bg-admin-50 text-admin-600',
  green:  'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  teal:   'bg-primary-50 text-primary-600',
  red:    'bg-red-50 text-red-500',
};

function StatCard({ label, value, icon: Icon, to, color }) {
  return (
    <Link to={to} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow block">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-sm font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${COLOR_MAP[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your insurance platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {STAT_CARDS.map(({ key, label, icon, to, color }) => (
            <StatCard key={key} label={label} value={stats?.[key]} icon={icon} to={to} color={color} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {QUICK_LINKS.map(({ to, icon: Icon, title, desc }) => (
            <Link key={to} to={to} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow flex flex-col">
              <div className="w-10 h-10 bg-admin-50 rounded-xl flex items-center justify-center mb-3">
                <Icon size={20} className="text-admin-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 flex-1">{desc}</p>
              <div className="flex items-center gap-1 text-admin-600 text-sm font-medium mt-3">
                Go <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
