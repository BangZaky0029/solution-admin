// C:\codingVibes\nuansasolution\.mainweb\payment-tools\gateway_apto-admin\src\api\controllers\userController.js

import api from '../api';

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data; // response.data = { success, data }
};


export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
}; 
