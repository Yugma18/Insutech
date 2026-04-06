import api from './api';

export const submitLead        = (data) => api.post('/leads', data);
export const quickCaptureLead  = (data) => api.post('/leads/quick-capture', data);
export const pingVisit         = (phone) => api.post('/leads/ping', { phone });
export const getRecommendations = (data) => api.post('/recommend', data);
