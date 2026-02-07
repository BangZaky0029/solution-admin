import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ErrorBoundary from '../components/ErrorBoundary';

const AdminLayout: FC = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <Header />
                <main className="p-6 flex-1 overflow-y-auto">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default AdminLayout;
