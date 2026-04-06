import { create } from 'zustand';

const useCompareStore = create((set, get) => ({
  selectedPlans: [], // array of plan objects (max 4)

  addPlan: (plan) => {
    const { selectedPlans } = get();
    if (selectedPlans.length >= 4) return;
    if (selectedPlans.find((p) => p.id === plan.id)) return;
    set({ selectedPlans: [...selectedPlans, plan] });
  },

  removePlan: (planId) => {
    set({ selectedPlans: get().selectedPlans.filter((p) => p.id !== planId) });
  },

  clearPlans: () => set({ selectedPlans: [] }),

  isSelected: (planId) => get().selectedPlans.some((p) => p.id === planId),
}));

export default useCompareStore;
