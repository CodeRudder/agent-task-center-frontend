import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import AgentList from './pages/AgentList';
import AgentCreate from './pages/AgentCreate';
import AgentDetail from './pages/AgentDetail';
import TaskTemplates from './pages/TaskTemplates';
import { useAuthStore } from './stores/authStore';

// 路由守卫组件
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  const { isAuthenticated, getCurrentUser } = useAuthStore();
  
  // 检查token是否存在且有效（不是"undefined"或"null"字符串）
  if (!token || token === 'undefined' || token === 'null' || token === '') {
    return <Navigate to="/login" replace />;
  }
  
  // 检查用户是否已认证
  if (!isAuthenticated) {
    // 尝试获取用户信息
    getCurrentUser().catch(() => {
      // 获取失败，重定向到登录页
      window.location.href = '/login';
    });
    return null; // 或者显示加载状态
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
        path: 'tasks',
        element: <TaskList />,
      },
      {
        path: 'tasks/:id',
        element: <TaskDetail />,
      },
      {
        path: 'agents',
        element: <AgentList />,
      },
      {
        path: 'agents/create',
        element: <AgentCreate />,
      },
      {
        path: 'agents/:id',
        element: <AgentDetail />,
      },
      {
        path: 'templates',
        element: <TaskTemplates />,
      },
    ],
  },
]);
