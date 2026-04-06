import { ChevronDown } from 'lucide-react';

/**
 * Styled select — replaces native <select> across admin and public pages.
 *
 * Usage:
 *   <Select value={val} onChange={(v) => setVal(v)}>
 *     <option value="">Select…</option>
 *     <option value="A">Option A</option>
 *   </Select>
 *
 * Props:
 *   value, onChange(value)  — controlled
 *   variant                 — 'default' | 'admin'  (controls focus ring color token)
 *   className               — extra wrapper classes
 *   disabled, required      — forwarded to <select>
 */
export default function Select({ value, onChange, children, variant = 'default', className = '', disabled, required }) {
  const ring = variant === 'admin'
    ? 'focus-within:ring-2 focus-within:ring-admin-500 focus-within:border-admin-400'
    : 'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-400';

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={`
          w-full appearance-none bg-white border border-gray-300 rounded-xl
          pl-3.5 pr-9 py-2.5 text-sm text-gray-800
          focus:outline-none transition-colors
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${ring}
        `}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}
