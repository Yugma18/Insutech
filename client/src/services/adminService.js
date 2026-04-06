import api from './api';

// Auth
export const adminLogin = (data) => api.post('/auth/login', data);

// Insurers
export const adminGetInsurers = () => api.get('/admin/insurers');
export const adminCreateInsurer = (data) => api.post('/admin/insurers', data);
export const adminUpdateInsurer = (id, data) => api.put(`/admin/insurers/${id}`, data);
export const adminDeleteInsurer = (id) => api.delete(`/admin/insurers/${id}`);
export const adminUploadInsurerLogo = (id, file) => {
  const fd = new FormData();
  fd.append('logo', file);
  return api.post(`/admin/insurers/${id}/logo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Plans
export const adminGetPlans = () => api.get('/admin/plans');
export const adminCreatePlan = (data) => api.post('/admin/plans', data);
export const adminUpdatePlan = (id, data) => api.put(`/admin/plans/${id}`, data);
export const adminDeletePlan = (id) => api.delete(`/admin/plans/${id}`);

// Features
export const adminUpsertFeature   = (planId, data) => api.post(`/admin/plans/${planId}/features`, data);
export const adminDeleteFeature   = (planId, featureKey) => api.delete(`/admin/plans/${planId}/features/${featureKey}`);
export const adminFeaturesTemplate = (planId) => api.get(`/admin/plans/${planId}/features/template`, { responseType: 'blob' });
export const adminImportFeatures  = (planId, csvText) => api.post(`/admin/plans/${planId}/features/import`, csvText, { headers: { 'Content-Type': 'text/plain' } });

// Premiums
export const adminCreatePremium   = (planId, data) => api.post(`/admin/plans/${planId}/premiums`, data);
export const adminUpdatePremium   = (id, data) => api.put(`/admin/premiums/${id}`, data);
export const adminDeletePremium   = (id) => api.delete(`/admin/premiums/${id}`);
export const adminPremiumsTemplate = (planId) => api.get(`/admin/plans/${planId}/premiums/template`, { responseType: 'blob' });
export const adminImportPremiums  = (planId, csvText) => api.post(`/admin/plans/${planId}/premiums/import`, csvText, { headers: { 'Content-Type': 'text/plain' } });

// Leads
export const adminGetLeads = (params) => api.get('/admin/leads', { params });
export const adminGetLeadById = (id) => api.get(`/admin/leads/${id}`);
export const adminUpdateLead = (id, data) => api.put(`/admin/leads/${id}`, data);
export const adminExportLeads = () => api.get('/admin/leads/export', { responseType: 'blob' });

// Policies
export const adminGetPolicies = (params) => api.get('/admin/policies', { params });
export const adminUpdatePolicy = (id, data) => api.put(`/admin/policies/${id}`, data);
