import { useState, FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from '../hooks/usePackages';
import { useUIStore } from '../stores/uiStore';
import { LoadingSpinner, EmptyState, Modal, Button, Input, Textarea } from '../components/ui';
import { packageSchema, PackageFormData } from '../lib/validations';
import type { Package } from '../types';

const Packages = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    // React Query hooks
    const { data: packagesData = [], isLoading } = usePackages();
    const createMutation = useCreatePackage();
    const updateMutation = useUpdatePackage();
    const deleteMutation = useDeletePackage();
    const { addNotification } = useUIStore();

    // Parse packages features
    const packages = packagesData.map((pkg: Package) => {
        let features: string[] = [];
        if (typeof pkg.features === 'string') {
            try {
                features = pkg.features.startsWith('[')
                    ? JSON.parse(pkg.features)
                    : pkg.features.split(',').map(f => f.trim()).filter(Boolean);
            } catch {
                features = [];
            }
        } else if (Array.isArray(pkg.features)) {
            features = pkg.features;
        }
        return { ...pkg, features };
    });

    // React Hook Form with Zod
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PackageFormData>({
        resolver: zodResolver(packageSchema),
        defaultValues: {
            name: '',
            price: 0,
            duration_days: 30,
            features: '',
        },
    });

    const openModal = (pkg: Package | null = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            reset({
                name: pkg.name,
                price: pkg.price,
                duration_days: pkg.duration_days,
                features: Array.isArray(pkg.features) ? pkg.features.join(', ') : String(pkg.features),
            });
        } else {
            setEditingPackage(null);
            reset({ name: '', price: 0, duration_days: 30, features: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPackage(null);
        reset();
    };

    const onSubmit = async (data: PackageFormData) => {
        const featuresArray = data.features
            .split(',')
            .map(f => f.trim())
            .filter(Boolean);

        const payload = {
            name: data.name,
            price: data.price,
            duration_days: data.duration_days,
            features: featuresArray,
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
        const features = Array.isArray(pkg.features) ? pkg.features : [];
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
                        {features.map((feature, idx) => (
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

    if (isLoading) {
        return <LoadingSpinner size="lg" text="Loading packages..." icon="📦" />;
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

                    <Button
                        variant="ghost"
                        onClick={() => openModal()}
                        className="bg-white hover:bg-gray-50 text-emerald-600 shadow-xl"
                        size="lg"
                        icon="➕"
                    >
                        <span className="hidden sm:inline">Create Package</span>
                    </Button>
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
                <EmptyState
                    icon="📦"
                    title="No packages yet"
                    description="Create your first package to get started"
                    action={
                        <Button variant="primary" onClick={() => openModal()} icon="➕">
                            Create First Package
                        </Button>
                    }
                />
            )}

            {/* Modal with Zod Validation */}
            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editingPackage ? 'Edit Package' : 'Create New Package'}
                icon={editingPackage ? '✏️' : '✨'}
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

                    <Textarea
                        label="Features (comma separated)"
                        icon="✨"
                        placeholder="Feature 1, Feature 2, Feature 3"
                        rows={4}
                        error={errors.features?.message}
                        {...register('features')}
                    />

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
