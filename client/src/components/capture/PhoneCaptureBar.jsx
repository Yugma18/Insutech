import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, PhoneCall } from 'lucide-react';
import useLocalUser from '../../hooks/useLocalUser.js';
import useCompareStore from '../../store/compareStore.js';
import { quickCaptureLead } from '../../services/leadService.js';

// Pages where the bar should never appear
const EXCLUDED = ['/get-quote', '/admin'];

export default function PhoneCaptureBar() {
  const { localUser, saveUser }   = useLocalUser();
  const { selectedPlans }         = useCompareStore();
  const { pathname }              = useLocation();
  const [visible,  setVisible]    = useState(false);
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const excluded = EXCLUDED.some((p) => pathname.startsWith(p));

  // Show after 4s — only if phone not already captured and not on excluded pages
  useEffect(() => {
    if (localUser?.phone || excluded) return;
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [localUser, excluded]);

  if (!visible || excluded) return null;

  // Sit above CompareBar when plans are selected (CompareBar is ~60px)
  const bottomClass = selectedPlans.length > 0 ? 'bottom-16' : 'bottom-0';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim())                        return setError('Please enter your name.');
    if (!/^\d{10}$/.test(phone.trim()))      return setError('Enter a valid 10-digit number.');

    setLoading(true);
    try {
      await quickCaptureLead({ name: name.trim(), phone: phone.trim() });
      saveUser({ name: name.trim(), phone: phone.trim() });
      setDone(true);
      setTimeout(() => setVisible(false), 2500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed ${bottomClass} left-0 right-0 z-40 bg-white border-t-2 border-primary-500 shadow-xl transition-all`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        {done ? (
          <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-sm py-1">
            <PhoneCall size={16} />
            Thanks! Our team will call you shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Label */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <PhoneCall size={16} className="text-primary-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Get a free callback from our expert
              </p>
            </div>

            {/* Fields */}
            <div className="flex flex-1 flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-36"
              />
              <input
                type="tel"
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-40"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 shrink-0"
              >
                {loading ? 'Sending…' : 'Call Me'}
              </button>
            </div>

            {error && <p className="text-xs text-red-500 sm:self-center">{error}</p>}

            {/* Dismiss */}
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors sm:static sm:ml-auto"
            >
              <X size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
