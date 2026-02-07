import { useState, FC, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from '../hooks/usePackages';
import { useFeatures } from '../hooks/useFeatures';
import { useUIStore } from '../stores/uiStore';
import { LoadingSpinner, EmptyState, Modal, Button, Input, Textarea } from '../components/ui';
import { packageSchema, PackageFormData } from '../lib/validations';
import type { Package } from '../types';

const Packages = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    // Filtering State
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDuration, setSelectedDuration] = useState('All');

    // React Query hooks
    const { data: packages = [], isLoading: packagesLoading } = usePackages();
    const { data: features = [], isLoading: featuresLoading } = useFeatures();

    const createMutation = useCreatePackage();
    const updateMutation = useUpdatePackage();
    const deleteMutation = useDeletePackage();
    const { addNotification } = useUIStore();

    // Group features for UI
    const sortedFeatures = useMemo(() => {
        return [...features].sort((a, b) => a.id - b.id);
    }, [features]);

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

    // React Hook Form with Zod
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<PackageFormData>({
        resolver: zodResolver(packageSchema),
        defaultValues: {
            name: '',
            price: 0,
            duration_days: 30,
            features: '',
            feature_ids: [],
            description: '',
        },
    });

    // Watch selected feature IDs for UI feedback
    const selectedFeatureIds = watch('feature_ids') || [];

    const handleFeatureToggle = (featureId: number) => {
        const current = selectedFeatureIds;
        if (current.includes(featureId)) {
            setValue('feature_ids', current.filter(id => id !== featureId));
        } else {
            setValue('feature_ids', [...current, featureId]);
        }
    };

    const openModal = (pkg: Package | null = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            // Check if description is JSON (auto-generated) or custom text
            let customDescription = '';
            if (pkg.description) {
                try {
                    JSON.parse(pkg.description);
                    // It's JSON, so it's auto-generated. Leave customDescription empty.
                } catch {
                    // It's NOT JSON, so it's a custom description (e.g. Trial).
                    customDescription = pkg.description;
                }
            }

            reset({
                name: pkg.name,
                price: pkg.price,
                duration_days: pkg.duration_days,
                features: '', // Legacy ignored
                feature_ids: pkg.feature_ids || [],
                description: customDescription,
            });
        } else {
            setEditingPackage(null);
            reset({ name: '', price: 0, duration_days: 30, features: '', feature_ids: [], description: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPackage(null);
        reset();
    };

    const onSubmit = async (data: PackageFormData) => {
        const payload = {
            name: data.name,
            price: Number(data.price),
            duration_days: Number(data.duration_days),
            feature_ids: data.feature_ids,
            features: '', // Legacy param
            description: data.description, // Manual override
        };

        try {
            if (editingPackage) {
                await updateMutation.mutateAsync({ id: editingPackage.id, ...payload });
                addNotification({
                    type: 'success',
                    title: 'Package Updated',
                    message: `${data.name} has been updated successfully.`,
                });
            } else {
                await createMutation.mutateAsync(payload);
                addNotification({
                    type: 'success',
                    title: 'Package Created',
                    message: `${data.name} has been created successfully.`,
                });
            }
            closeModal();
        } catch {
            addNotification({
                type: 'error',
                title: 'Operation Failed',
                message: 'Failed to save package. Please try again.',
            });
        }
    };

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
                            onClick={() => openModal(pkg)}
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
            {/* Header and Filters (Same as before) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl">
                {/* ... header content ... */}
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
                    <Button variant="ghost" onClick={() => openModal()} className="bg-white hover:bg-gray-50 text-emerald-600 shadow-xl" size="lg" icon="➕">
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

            {/* Modal with Feature Selection */}
            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editingPackage ? 'Edit Package' : 'Create New Package'}
                icon={editingPackage ? '✏️' : '✨'}
                size="lg" // Make it wider for feature list
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Package Name"
                        icon="🏷️"
                        placeholder="Enter package name"
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price (IDR)"
                            icon="💰"
                            type="number"
                            placeholder="50000"
                            error={errors.price?.message}
                            {...register('price', { valueAsNumber: true })}
                        />

                        <Input
                            label="Duration (days)"
                            icon="⏳"
                            type="number"
                            placeholder="30"
                            error={errors.duration_days?.message}
                            {...register('duration_days', { valueAsNumber: true })}
                        />
                    </div>

                    {/* Feature Selection Grid */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <span>✨</span>
                            Select Features
                        </label>

                        {errors.feature_ids && (
                            <p className="text-red-500 text-xs font-semibold">{errors.feature_ids.message}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                            {sortedFeatures.map(feature => {
                                const isSelected = selectedFeatureIds.includes(feature.id);
                                return (
                                    <div
                                        key={feature.id}
                                        onClick={() => handleFeatureToggle(feature.id)}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${isSelected
                                                ? 'bg-purple-50 border-purple-500 shadow-md'
                                                : 'bg-white border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 mr-3 transition-colors ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                                            }`}>
                                            {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                                                {feature.name}
                                            </p>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${feature.status === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                {feature.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Textarea
                            label="Description (Override)"
                            icon="📝"
                            placeholder="Optional: Manually override the feature list description (e.g. for Trial packages). Leave empty to auto-generate from features."
                            rows={3}
                            error={errors.description?.message}
                            {...register('description')}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            * Leave empty to automatically generate description from selected features.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={closeModal}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isSubmitting || createMutation.isPending || updateMutation.isPending}
                            className="flex-1"
                        >
                            {editingPackage ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;
