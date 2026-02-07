import { useState, FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePackages, useDeletePackage } from '../hooks/usePackages';
import { useFeatures } from '../hooks/useFeatures';
import { useUIStore } from '../stores/uiStore';
import { LoadingSpinner, EmptyState, Button } from '../components/ui';
import type { Package } from '../types';

const Packages = () => {
    const navigate = useNavigate();

    // Filtering State
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDuration, setSelectedDuration] = useState('All');

    // React Query hooks
    const { data: packages = [], isLoading: packagesLoading } = usePackages();
    const { data: features = [], isLoading: featuresLoading } = useFeatures();

    const deleteMutation = useDeletePackage();
    const { addNotification } = useUIStore();

    // Derived Filters
    const filteredPackages = useMemo(() => {
        return packages.filter(pkg => {
            // Filter by Category
            const matchCategory = selectedCategory === 'All'
                ? true
                : pkg.name.toLowerCase().includes(selectedCategory.toLowerCase());

            // Filter by Duration
            let matchDuration = true;
            if (selectedDuration !== 'All') {
                const durationMap: Record<string, number> = {
                    'Trial': 3,
                    '1 Bulan': 30,
                    '3 Bulan': 90,
                    '6 Bulan': 180,
                    '1 Tahun': 365
                };
                matchDuration = pkg.duration_days === durationMap[selectedDuration];
            }

            return matchCategory && matchDuration;
        });
    }, [packages, selectedCategory, selectedDuration]);

    const categories = ['All', 'Dasar', 'Premium', 'Pro', 'Auto Pilot', 'Trial'];
    const durations = ['All', '1 Bulan', '3 Bulan', '6 Bulan', '1 Tahun'];


    const handleDelete = async (pkg: Package) => {
        if (!confirm(`Are you sure you want to delete "${pkg.name}"?`)) return;

        try {
            await deleteMutation.mutateAsync(pkg.id);
            addNotification({
                type: 'success',
                title: 'Package Deleted',
                message: `${pkg.name} has been deleted.`,
            });
        } catch {
            addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to delete package. Please try again.',
            });
        }
    };

    // Helper to get feature names for a package
    const getPackageFeatureNames = (pkg: Package) => {
        // If description is NOT a JSON string, use it as the "feature" list (single item)
        if (pkg.description) {
            try {
                const parsed = JSON.parse(pkg.description);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                return [pkg.description];
            }
        }

        // Fallback to relational features
        if (pkg.feature_ids?.length) {
            return pkg.feature_ids
                .map(id => features.find(f => f.id === id)?.name)
                .filter(Boolean) as string[];
        }

        return [];
    };

    const gradients = [
        'from-blue-500 to-blue-700',
        'from-purple-500 to-purple-700',
        'from-pink-500 to-pink-700',
    ];

    interface PackageCardProps {
        pkg: Package;
        index: number;
    }

    const PackageCard: FC<PackageCardProps> = ({ pkg, index }) => {
        const displayFeatures = getPackageFeatureNames(pkg);

        return (
            <div
                className="group relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-transparent hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 0.1}s` }}
            >
                <div className={`relative overflow-hidden bg-gradient-to-br ${gradients[index % 3]} p-8`}>
                    <div className="absolute -right-12 -top-12 w-40 h-40 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500" />
                    <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500" />

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

                <div className="p-8">
                    <div className="space-y-4 mb-6">
                        {displayFeatures.slice(0, 5).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 group/item">
                                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover/item:scale-125 transition-transform">
                                    <span className="text-white text-xs font-bold">✓</span>
                                </div>
                                <span className="text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors line-clamp-1">
                                    {feature}
                                </span>
                            </div>
                        ))}
                        {displayFeatures.length > 5 && (
                            <div className="text-xs text-center text-gray-500 font-medium italic">
                                +{displayFeatures.length - 5} more features...
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            onClick={() => navigate(`/packages/edit/${pkg.id}`)}
                            className="flex-1"
                            icon="✏️"
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleDelete(pkg)}
                            loading={deleteMutation.isPending}
                            className="flex-1"
                            icon="🗑️"
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 pointer-events-none" />
            </div>
        );
    };

    if (packagesLoading || featuresLoading) {
        return <LoadingSpinner size="lg" text="Loading data..." icon="📦" />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <span className="text-5xl">📦</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2">Package Management</h1>
                            <p className="text-emerald-100 text-lg font-medium">
                                Create and manage subscription packages
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/packages/create')} className="bg-white hover:bg-gray-50 text-emerald-600 shadow-xl" size="lg" icon="➕">
                        <span className="hidden sm:inline">Create Package</span>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${selectedCategory === cat ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-bold text-sm">Duration:</span>
                    <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)} className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 font-semibold text-gray-700 focus:outline-none focus:border-purple-500 transition-colors">
                        {durations.map(dur => (
                            <option key={dur} value={dur}>{dur}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Packages Grid */}
            {filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPackages.map((pkg, index) => (
                        <PackageCard key={pkg.id} pkg={pkg} index={index} />
                    ))}
                </div>
            ) : (
                <EmptyState icon="📦" title="No packages found" description="Try adjusting your filters" action={<Button variant="ghost" onClick={() => { setSelectedCategory('All'); setSelectedDuration('All'); }} icon="🔄">Reset Filters</Button>} />
            )}
        </div>
    );
};

export default Packages;
