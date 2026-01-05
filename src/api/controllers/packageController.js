// C:\codingVibes\nuansasolution\.mainweb\payment-tools\gateway_apto-admin\src\api\controllers\packageController.js


import api from '../api';

export const getPackages = async () => {
  const response = await api.get('/packages');
  return response.data;
};

export const createPackage = async (data) => {
  const response = await api.post('/packages', data);
  return response.data;
};

export const updatePackage = async (id, data) => {
  const response = await api.put(`/packages/${id}`, data);
  return response.data;
};

export const deletePackage = async (id) => {
  const response = await api.delete(`/packages/${id}`);
  return response.data;
};

