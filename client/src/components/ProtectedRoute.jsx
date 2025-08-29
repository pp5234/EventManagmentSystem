import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRouter } from '../hooks/useRouter.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const { navigate } = useRouter();

    if (loading) {
        return <div>Loading session...</div>;
    }
    if (!user) {
        navigate('/ems/login');
        return null;
    }
    return children;
};

export default ProtectedRoute;