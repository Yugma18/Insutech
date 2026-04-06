import api from './api';

export const getPlans = (params) => api.get('/plans', { params });
export const getPlanById = (id) => api.get(`/plans/${id}`);
export const comparePlans = (ids) => api.get('/plans/compare', { params: { ids: ids.join(',') } });
export const getPlanPremiums = (id) => api.get(`/plans/${id}/premiums`);
export const getInsurers = () => api.get('/insurers');
