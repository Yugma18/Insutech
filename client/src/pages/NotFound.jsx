import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <p className="text-8xl font-bold text-gray-100 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="bg-primary-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
        >
          Go Home
        </Link>
        <Link
          to="/plans"
          className="border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:border-gray-400 transition-colors"
        >
          Browse Plans
        </Link>
      </div>
    </div>
  );
}
