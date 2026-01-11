// C:\codingVibes\nuansasolution\.mainweb\payment-tools\gateway_apto-admin\src\api\controllers\paymentController.js

import api from '../api';

  export const getPayments = async () => {
    const response = await api.get('/admin/payments');
    return response.data.data; // ✅ BALIKIN ARRAY SAJA
  };

  export const activatePayment = async (data) => {
    const response = await api.post('/admin/activate', data);
    return response.data.data; // ✅ BALIKIN ARRAY SAJA
  };