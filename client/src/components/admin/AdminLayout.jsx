import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, ClipboardList, Users, LogOut, FileText } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';

const NAV = [
  { to: '/admin',           label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/insurers',  label: 'Insurers',  icon: Building2 },
  { to: '/admin/plans',     label: 'Plans',     icon: ClipboardList },
  { to: '/admin/leads',     label: 'Leads',     icon: Users },
  { to: '/admin/policies',  label: 'Policies',  icon: FileText },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuthStore();
  const navigate   = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 bg-gray-900 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-admin-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">IN</span>
            </div>
            <span className="font-bold text-white text-sm">INSUTECH</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-admin-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
