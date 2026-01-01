import { useState, useEffect } from 'react';
import { getPackages, createPackage, updatePackage, deletePackage } from '../api/controllers/packageController';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_days: 30,
    features: '',
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const data = await getPackages();
      // Ensure features is an array
      const formattedData = data.map(pkg => ({
        ...pkg,
        features: typeof pkg.features === 'string' 
          ? (pkg.features.startsWith('[') ? JSON.parse(pkg.features) : pkg.features.split(',')) 
          : pkg.features
      }));
      setPackages(formattedData);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        price: pkg.price,
        duration_days: pkg.duration_days,
        features: Array.isArray(pkg.features) ? pkg.features.join(', ') : pkg.features,
      });
    } else {
      setEditingPackage(null);
      setFormData({ name: '', price: '', duration_days: 30, features: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPackage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
    const payload = { ...formData, features: featuresArray };
    
    try {
      if (editingPackage) {
        await updatePackage(editingPackage.id, payload);
        alert(' Package updated successfully!');
      } else {
        await createPackage(payload);
        alert(' Package created successfully!');
      }
      fetchPackages();
      closeModal();
    } catch (error) {
      console.error('Error saving package:', error);
      alert(' Failed to save package');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await deletePackage(id);
        setPackages(packages.filter(p => p.id !== id));
        alert(' Package deleted successfully!');
      } catch (error) {
        console.error('Error deleting package:', error);
        alert(' Failed to delete package');
      }
    }
  };

  const gradients = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700',
  ];

  const PackageCard = ({ pkg, index }) => (
    <div 
      className="group relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-transparent hover:scale-105 transition-all duration-500"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Gradient Header */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradients[index % 3]} p-8`}>
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-3xl">📦</span>
            </div>
            {index === 1 && (
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black">
                POPULAR
              </span>
            )}
          </div>
          
          <h3 className="text-3xl font-black text-white mb-2">{pkg.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">
              {(pkg.price / 1000).toFixed(0)}K
            </span>
            <span className="text-white/80 text-lg font-semibold">IDR</span>
          </div>
          <p className="text-white/90 text-sm font-medium mt-2">
             {pkg.duration_days} days access
          </p>
        </div>
      </div>

      {/* Features List */}
      <div className="p-8">
        <div className="space-y-4 mb-6">
          {pkg.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 group/item">
              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover/item:scale-125 transition-transform">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => openModal(pkg)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <span className="flex items-center justify-center gap-2">
              <span>✏️</span>
              Edit
            </span>
          </button>
          <button
            onClick={() => handleDelete(pkg.id)}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🗑️</span>
              Delete
            </span>
          </button>
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 pointer-events-none"></div>
    </div>
  );

  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="text-3xl">{editingPackage ? '✏️' : '✨'}</span>
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </h2>
              <button
                onClick={closeModal}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-2 text-white transition-all duration-300 hover:scale-110"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>🏷️</span> Package Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium"
                placeholder="Enter package name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>💰</span> Price (IDR)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium"
                  placeholder="50000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>⏳</span> Duration (days)
                </label>
                <input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>✨</span> Features (comma separated)
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium resize-none"
                rows="4"
                placeholder="Feature 1, Feature 2, Feature 3"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {editingPackage ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin opacity-75"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
          </div>
          <p className="text-gray-600 font-semibold">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <span className="text-5xl">📦</span>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                Package Management
              </h1>
              <p className="text-emerald-100 text-lg font-medium">
                Create and manage subscription packages
              </p>
            </div>
          </div>
          
          <button
            onClick={() => openModal()}
            className="group bg-white hover:bg-gray-50 text-emerald-600 px-6 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <span className="flex items-center gap-3">
              <span className="text-3xl group-hover:rotate-90 transition-transform duration-300">➕</span>
              <span className="hidden sm:inline">Create Package</span>
            </span>
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.id} pkg={pkg} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-20 text-center shadow-2xl">
          <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-10 mb-6">
            <span className="text-8xl">📦</span>
          </div>
          <p className="text-3xl font-black text-gray-800 mb-3">No packages yet</p>
          <p className="text-gray-600 text-lg mb-6">Create your first package to get started</p>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-110 hover:shadow-xl"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">➕</span>
              Create First Package
            </span>
          </button>
        </div>
      )}

      <Modal />
    </div>
  );
}