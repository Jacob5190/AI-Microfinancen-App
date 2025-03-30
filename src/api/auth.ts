import api from './axios';

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('userRole');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};