import api from '../api';

export const getUsers = async () => {
  const response = await api.get('/user');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(/user/);
  return response.data;
};
