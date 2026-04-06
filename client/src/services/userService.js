import api from './api';

export const userRegister    = (data)       => api.post('/user/register', data);
export const userLogin       = (data)       => api.post('/user/login', data);
export const userGetMe       = ()           => api.get('/user/me');
export const userUpdateMe    = (data)       => api.put('/user/me', data);
export const userGetPolicies = ()           => api.get('/user/policies');
export const userPurchase    = (data)       => api.post('/user/policies', data);
