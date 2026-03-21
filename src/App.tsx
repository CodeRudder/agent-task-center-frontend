import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TaskList } from './pages/TaskList';
import { TaskDetail } from './pages/TaskDetail';
import { LoginPage } from './pages/LoginPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { UserManagementPage } from './components/User-management';
import { ProtectedRoute } from './components/ProtectedRoute';
import './index.css';

/**
 * 主应用组件
 * 
 * 配置路由和全局布局
 */
function App() {
  // 模拟总用户数（用于投票参与率计算）
  const TOTAL_USERS = 25;

  return (
    <Router>
      <Routes>
        {/* 登录页面 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 首页重定向到任务列表 */}
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        
        {/* 任务列表页（需要认证） */}
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <TaskList 
                showSearch={true}
                showFilters={true}
                showCreateButton={true}
              />
            </ProtectedRoute>
          } 
        />
        
        {/* 任务详情页（需要认证） */}
        <Route 
          path="/tasks/:taskId" 
          element={
            <ProtectedRoute>
              <TaskDetail totalUsers={TOTAL_USERS} />
            </ProtectedRoute>
          } 
        />
        
        {/* 用户管理页（需要认证，管理员权限） */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <UserManagementPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 用户个人信息页（需要认证） */}
        <Route 
          path="/user/profile" 
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* 404页面 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-4">页面不存在</p>
                <a 
                  href="/tasks" 
                  className="text-blue-600 hover:underline"
                >
                  返回任务列表
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
