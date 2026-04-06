import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('admin_token') || null,
  admin: null,

  setAuth: (token, admin) => {
    localStorage.setItem('admin_token', token);
    set({ token, admin });
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ token: null, admin: null });
  },

  isAuthenticated: () => !!localStorage.getItem('admin_token'),
}));

export default useAuthStore;
