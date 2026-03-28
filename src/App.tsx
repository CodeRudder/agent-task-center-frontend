/**
 * 主应用组件
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import TokenManagementPage from '@/pages/TokenManagementPage';
import TaskListPage from '@/pages/TaskListPage';
import TaskListPageSimple from '@/pages/TaskListPageSimple';
import TaskListPageMedium from '@/pages/TaskListPageMedium';
import TaskListPageWithHooks from '@/pages/TaskListPageWithHooks';
import TaskDetailPage from '@/pages/TaskDetailPage';
import TaskTemplates from '@/pages/TaskTemplates';
import UserManagementPage from '@/pages/UserManagementPage';
import AgentLoadSummary from '@/pages/AgentLoadSummary';
import ToastContainer from '@/components/Toast';
import Layout from '@/components/Layout';

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, getCurrentUser } = useAuthStore();
  const hasToken = !!localStorage.getItem('accessToken');
  const [isChecking, setIsChecking] = React.useState(true);

  console.log('🔍 ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('🔍 ProtectedRoute - hasToken:', hasToken);

  React.useEffect(() => {
    // 如果localStorage有accessToken但isAuthenticated为false，自动获取用户信息
    if (hasToken && !isAuthenticated) {
      console.log('🔍 ProtectedRoute - Has token but not authenticated, fetching user info...');
      getCurrentUser()
        .then(() => {
          console.log('🔍 ProtectedRoute - User info fetched successfully');
          setIsChecking(false);
        })
        .catch((error) => {
          console.error('🔍 ProtectedRoute - Failed to fetch user info:', error);
          // 获取用户信息失败，清除localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsChecking(false);
        });
    } else {
      setIsChecking(false);
    }
  }, [hasToken, isAuthenticated, getCurrentUser]);

  // 如果isAuthenticated为true但没有accessToken，说明状态不一致，需要清除状态
  if (isAuthenticated && !hasToken) {
    console.log('🔍 ProtectedRoute - State mismatch, clearing auth state and redirecting to /login');
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      error: null,
    });
    return <Navigate to="/login" replace />;
  }

  // 正在检查认证状态
  if (isChecking) {
    console.log('🔍 ProtectedRoute - Checking authentication...');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !hasToken) {
    console.log('🔍 ProtectedRoute - Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔍 ProtectedRoute - Authenticated, showing protected content');
  return <Layout>{children}</Layout>;
};

// 公共路由组件
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const hasToken = !!localStorage.getItem('accessToken');

  console.log('🔍 PublicRoute - isAuthenticated:', isAuthenticated);
  console.log('🔍 PublicRoute - hasToken:', hasToken);

  // 如果isAuthenticated为true但没有accessToken，说明状态不一致，需要清除状态
  if (isAuthenticated && !hasToken) {
    console.log('🔍 PublicRoute - State mismatch, clearing auth state');
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      error: null,
    });
    return <>{children}</>;
  }

  if (isAuthenticated && hasToken) {
    console.log('🔍 PublicRoute - Already authenticated, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('🔍 PublicRoute - Not authenticated, showing login page');
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
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tokens"
          element={
            <ProtectedRoute>
              <TokenManagementPage />
            </ProtectedRoute>
          }
        />

        {/* 任务管理路由 */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetailPage />
            </ProtectedRoute>
          }
        />

        {/* 任务模板路由 */}
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <TaskTemplates />
            </ProtectedRoute>
          }
        />

        {/* Agent管理路由 */}
        <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <AgentLoadSummary />
            </ProtectedRoute>
          }
        />

        {/* 用户管理路由 - V5.6 P0用户管理RBAC权限系统 */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagementPage />
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
