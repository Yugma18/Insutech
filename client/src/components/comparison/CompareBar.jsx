import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import useCompareStore from '../../store/compareStore.js';

export default function CompareBar() {
  const { selectedPlans, removePlan, clearPlans } = useCompareStore();
  const navigate = useNavigate();

  if (selectedPlans.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-600">Compare:</span>
          {selectedPlans.map((plan) => (
            <div key={plan.id} className="flex items-center gap-1.5 bg-primary-50 border border-primary-200 rounded-lg px-3 py-1">
              <span className="text-sm font-medium text-primary-700">{plan.insurer?.name} — {plan.name}</span>
              <button onClick={() => removePlan(plan.id)} className="text-primary-400 hover:text-primary-700 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
          {selectedPlans.length < 4 && (
            <span className="text-xs text-gray-400">
              Add {4 - selectedPlans.length} more plan{4 - selectedPlans.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clearPlans} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Clear</button>
          <button
            onClick={() => navigate('/compare')}
            disabled={selectedPlans.length < 2}
            className="bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare {selectedPlans.length} Plans
          </button>
        </div>
      </div>
    </div>
  );
}
