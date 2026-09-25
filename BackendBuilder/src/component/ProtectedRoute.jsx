import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div role='status'>Checking session...</div>;
  }

  const hasValidUser = !!(user && (user.id || user.userId || user.email || user.username || user.name || user.authenticated));

  if (!hasValidUser) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
