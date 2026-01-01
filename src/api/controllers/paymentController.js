import api from '../api';

export const getPayments = async () => {
  const response = await api.get('/admin/payments');
  return response.data;
};

export const activatePayment = async (data) => {
  const response = await api.post('/admin/activate', data);
  return response.data;
};