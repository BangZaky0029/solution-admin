import api from '../api';

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getMonthlyStats = async () => {
  const response = await api.get('/stats/monthly');
  return response.data;
};

export const getRecentActivities = async () => {
  const response = await api.get('/stats/activities');
  return response.data;
};
