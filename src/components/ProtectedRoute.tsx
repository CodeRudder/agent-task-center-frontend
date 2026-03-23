import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 路由守卫组件
 * 
 * 检查用户是否已登录，未登录则重定向到登录页面
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // 未登录，重定向到登录页面，并保存当前路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
