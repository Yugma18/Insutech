export default function Spinner({ className = '' }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 ${className}`} />
  );
}
