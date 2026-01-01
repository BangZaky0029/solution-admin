import api from '../api';

export const getPackages = async () => {
  const response = await api.get('/package');
  return response.data;
};

export const createPackage = async (data) => {
  const response = await api.post('/package', data);
  return response.data;
};

export const updatePackage = async (id, data) => {
  const response = await api.put(`/package/${id}`, data);
  return response.data;
};

export const deletePackage = async (id) => {
  const response = await api.delete(`/package/${id}`);
  return response.data;
};
