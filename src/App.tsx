import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Packages from './pages/Packages';
import Users from './pages/Users';
import WhatsAppConnector from './pages/WhatsAppConnector';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const App: FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <BrowserRouter>
                    <Routes>
                        {/* Public Route */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/payments" element={<Payments />} />
                                <Route path="/packages" element={<Packages />} />
                                <Route path="/users" element={<Users />} />
                                <Route path="/whatsapp" element={<WhatsAppConnector />} />
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ErrorBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};

export default App;
