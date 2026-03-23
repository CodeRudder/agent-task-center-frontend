import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import TaskTemplates from './pages/TaskTemplates';
// 用户管理页面 - V5.6 P0用户管理RBAC权限系统
import UserManagementPage from './pages/UserManagementPage';

// 路由守卫组件
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <App />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'tasks/:id',
        element: <TaskDetail />,
      },
      {
        path: 'templates',
        element: <TaskTemplates />,
      },
      // 用户管理路由 - V5.6 P0用户管理RBAC权限系统
      {
        path: 'users',
        element: <UserManagementPage />,
      },
    ],
  },
]);
