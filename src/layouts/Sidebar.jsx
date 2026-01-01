import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <h2 className="text-xl font-bold mb-6">ADMIN</h2>

      <nav className="space-y-4">
        <Link to="/" className="block hover:text-blue-400">Dashboard</Link>
        <Link to="/payments" className="block hover:text-blue-400">Payments</Link>
        <Link to="/packages" className="block hover:text-blue-400">Packages</Link>
      </nav>
    </aside>
  );
}
