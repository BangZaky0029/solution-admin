import { FC } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute: FC = () => {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
