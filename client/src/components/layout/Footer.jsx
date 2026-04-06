import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs tracking-tight">IT</span>
              </div>
              <span className="font-black text-white text-lg tracking-tight">Insu<span className="text-primary-400">Tech</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              INSUTECH Insurance Broking Services Pvt. Ltd. — helping you find and compare the right health insurance plan.
            </p>
            <p className="text-xs mt-3 text-slate-500">IRDAI Broker License · CIN: XXXXXXXXXXXX</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/plans"     className="hover:text-primary-400 transition-colors">Browse Plans</Link></li>
              <li><Link to="/compare"   className="hover:text-primary-400 transition-colors">Compare Plans</Link></li>
              <li><Link to="/recommend" className="hover:text-primary-400 transition-colors">Get Recommended</Link></li>
              <li><Link to="/get-quote" className="hover:text-primary-400 transition-colors">Get a Quote</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Info</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/admin/login" className="hover:text-primary-400 transition-colors">Admin Login</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-slate-800 pt-6 space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-400">Disclaimer:</strong> Insurance is the subject matter of solicitation. INSUTECH Insurance Broking Services Pvt. Ltd. is a registered insurance broker with IRDAI. The premium and plan information displayed on this platform is indicative and subject to change at the insurer's discretion. Please read the policy document carefully before purchasing.
          </p>
          <p className="text-xs text-slate-600 text-center">
            © {new Date().getFullYear()} INSUTECH Insurance Broking Services Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
