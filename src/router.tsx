import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import AgentList from './pages/AgentList';

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
    ],
  },
]);
