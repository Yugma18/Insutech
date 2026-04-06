export default function Badge({ children, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-700',
    teal:    'bg-primary-100 text-primary-700',
    admin:   'bg-admin-100 text-admin-700',
    blue:    'bg-admin-100 text-admin-700',
    green:   'bg-green-100 text-green-700',
    orange:  'bg-orange-100 text-orange-700',
    gray:    'bg-gray-100 text-gray-600',
    red:     'bg-red-100 text-red-600',
    purple:  'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}
