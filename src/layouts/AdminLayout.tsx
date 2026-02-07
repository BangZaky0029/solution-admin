import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ErrorBoundary from '../components/ErrorBoundary';

const AdminLayout: FC = () => {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar />

            <div className="flex flex-col flex-1 relative overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 scroll-smooth">
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
