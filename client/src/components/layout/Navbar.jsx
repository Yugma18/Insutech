import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/plans',     label: 'Browse Plans' },
  { to: '/compare',   label: 'Compare' },
  { to: '/recommend', label: 'Get Recommended' },
];

function UserMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
          <User size={12} className="text-primary-600" />
        </div>
        <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
        <ChevronDown size={13} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
          <Link
            to="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText size={14} className="text-gray-400" /> My Policies
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-tight">IT</span>
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tight">Insu<span className="text-primary-600">Tech</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <UserMenu user={user} logout={logout} />
            ) : (
              <>
                <Link to="/login" className="hidden md:inline-block text-sm font-medium text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/get-quote"
                  className="hidden md:inline-block bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Quote
                </Link>
              </>
            )}
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {open && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setOpen(false)} />}

      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200">
          <span className="font-bold text-gray-900">Menu</span>
          <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <nav className="p-5 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/account" className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">
                  My Policies
                </Link>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block w-full text-center border border-gray-200 text-gray-700 text-sm font-medium px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  Sign In
                </Link>
                <Link to="/get-quote" className="block w-full text-center bg-primary-600 text-white text-sm font-medium px-4 py-3 rounded-xl hover:bg-primary-700 transition-colors">
                  Get Quote
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
