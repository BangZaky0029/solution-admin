import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/admin/payments').then(res => setPayments(res.data));
  }, []);

  const activate = async (id) => {
    await api.post('/admin/activate', { payment_id: id });
    alert('Package activated');
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Pending Payments</h1>

      <table className="w-full bg-white shadow">
        <thead className="bg-gray-200">
          <tr>
            <th>Email</th>
            <th>Phone</th>
            <th>Proof</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id} className="text-center border-t">
              <td>{p.email}</td>
              <td>{p.phone}</td>
              <td>
                <a href={`http://localhost:5000/uploads/${p.proof_image}`} target="_blank">
                  View
                </a>
              </td>
              <td>
                <button
                  onClick={() => activate(p.payment_id)}
                  className="bg-green-600 text-white px-3 py-1">
                  Activate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
