/**
 * 主应用组件
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/pages/LoginPage';
import TokenManagementPage from '@/pages/TokenManagementPage';
import TaskListPage from '@/pages/TaskListPage';
import TaskDetailPage from '@/pages/TaskDetailPage';
import TagManagementPage from '@/pages/TagManagement/TagManagementPage';
import ReportStatisticsPage from '@/pages/ReportStatistics/ReportStatisticsPage';
import ToastContainer from '@/components/Toast';
import Layout from '@/components/Layout';

/**
 * 验证 Token 有效性
 * @param token - 要验证的 token
 * @returns 是否有效
 */
const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  if (token === 'undefined' || token === 'null') return false;
  if (typeof token !== 'string' || token.length === 0) return false;
  return true;
};

/**
 * 检查用户是否已认证
 * 同时检查 store 状态和 localStorage 中的 token
 */
const useIsAuthenticated = (): { isAuthenticated: boolean; isLoading: boolean } => {
  const { isAuthenticated: storeAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Bug Fix #2: 同时检查 store 状态和 localStorage 中的 token
    // 这样可以处理以下情况：
    // 1. Store 尚未从 localStorage 恢复 (rehydration)
    // 2. Store 状态与 localStorage 不同步
    // 3. Token 被手动清除或过期
    
    const accessToken = localStorage.getItem('accessToken');
    const hasValidToken = isValidToken(accessToken);
    
    // 只有当 store 认为已认证 AND token 有效时，才认为已认证
    const authenticated = storeAuthenticated && hasValidToken;
    
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, [storeAuthenticated]);

  return { isAuthenticated, isLoading };
};

// 加载中组件
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">加载中...</p>
    </div>
  </div>
);

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  // 加载中显示 loading 状态
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Bug Fix #2: 未认证时重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 公共路由组件
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  // 加载中显示 loading 状态
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Bug Fix #2: 已认证用户访问登录页时重定向到首页
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {

  return (
    <BrowserRouter>
      <ToastContainer
        toasts={[]}
        onRemove={() => {}}
      />

      <Routes>
        {/* 公共路由 */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* 受保护的路由 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
              <TokenManagementPage />
            </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tokens"
          element={
            <ProtectedRoute>
              <Layout>
              <TokenManagementPage />
            </Layout>
            </ProtectedRoute>
          }
        />

        {/* 任务管理路由 */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
              <TaskListPage />
            </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <Layout>
              <TaskDetailPage />
            </Layout>
            </ProtectedRoute>
          }
        />

        {/* 标签管理路由 - V5.3 P2-4 */}
        <Route
          path="/tags"
          element={
            <ProtectedRoute>
              <Layout>
              <TagManagementPage />
            </Layout>
            </ProtectedRoute>
          }
        />

        {/* 统计报表路由 - V5.3 P2-5 */}
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Layout>
              <ReportStatisticsPage />
            </Layout>
            </ProtectedRoute>
          }
        />

        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
