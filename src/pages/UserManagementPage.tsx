/**
 * 用户管理页面
 *
 * 集成UserList组件，提供用户管理功能
 * - 用户列表展示
 * - 角色管理
 * - 状态管理
 * - 筛选和搜索
 *
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React from 'react';
import UserList from '@/components/User/UserList';

/**
 * 用户管理页面组件
 *
 * 功能：
 * - 用户列表展示（支持分页）
 * - 角色筛选和管理
 * - 状态筛选和管理
 * - 用户搜索（用户名/邮箱）
 *
 * 路由：/users
 */
const UserManagementPage: React.FC = () => {
  return (
    <div className="user-management-page">
      {/*
        UserList组件已经包含完整的UI功能：
        - 标题栏（用户管理 + 用户数量）
        - 筛选区域（角色、状态、搜索）
        - 用户卡片列表
        - 分页组件
        - 加载、错误、空状态处理
      */}
      <UserList
        showTitle={true}
        pageSize={20}
      />
    </div>
  );
};

export default UserManagementPage;
