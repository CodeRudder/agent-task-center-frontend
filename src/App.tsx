/**
 * 主应用组件
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/pages/LoginPage';
import TokenManagementPage from '@/pages/TokenManagementPage';
import TaskListPage from '@/pages/TaskListPage';
import TaskDetailPage from '@/pages/TaskDetailPage';
import ToastContainer from '@/components/Toast';
import Layout from '@/components/Layout';

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 公共路由组件
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

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

        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
