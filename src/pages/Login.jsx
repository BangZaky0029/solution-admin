import { useState } from 'react';
import api from '../api/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    console.log('[LOGIN] submit', { email });

    try {
      const res = await api.post('/admin/login', { email, password });

      console.log('[LOGIN SUCCESS]', res.data);

      localStorage.setItem('admin_token', res.data.token);
      window.location.href = '/';

    } catch (err) {
      console.error('[LOGIN FAILED]', err.response?.data || err.message);
      alert('Login gagal, cek email/password');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-8 shadow w-96 space-y-4">
        <h1 className="text-xl font-bold">Admin Login</h1>

        <input
          className="border w-full p-2"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="border w-full p-2"
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 text-white w-full py-2">
          Login
        </button>
      </form>
    </div>
  );
}
