import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, size = 'md' }) {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${widths[size]} max-h-[90vh] flex flex-col overflow-hidden`}>
        {/* Header — fixed, never scrolls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="font-semibold text-gray-900 truncate pr-4">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>
        {/* Body — scrolls vertically only, no horizontal overflow */}
        <div className="p-6 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
}
