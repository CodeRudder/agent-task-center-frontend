/**
 * 用户管理页面（带角色管理Tab）
 *
 * 集成用户列表和角色管理功能
 * - 用户管理Tab：用户列表展示、筛选、搜索
 * - 角色管理Tab：角色列表展示、权限查看
 *
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useState } from 'react';
import { Tabs } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import UserList from '@/components/User/UserList';
import RoleList from '@/components/Role/RoleList';

const { TabPane } = Tabs;

/**
 * 用户管理页面组件
 *
 * 功能：
 * - Tab切换：用户管理 / 角色管理
 * - 用户列表展示（支持分页）
 * - 角色列表展示（支持权限查看）
 * - 角色筛选和管理
 * - 状态筛选和管理
 * - 用户搜索（用户名/邮箱）
 *
 * 路由：/users
 */
const UserManagementPage: React.FC = () => {
  // ========== 本地状态 ==========
  /**
   * 当前激活的Tab
   * - users: 用户管理
   * - roles: 角色管理
   */
  const [activeTab, setActiveTab] = useState<string>('users');

  // ========== 事件处理 ==========

  /**
   * 处理Tab切换
   * @param key Tab键值
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // ========== 渲染函数 ==========

  /**
   * 渲染用户管理Tab
   */
  const renderUserManagement = () => (
    <div className="user-management-tab">
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

  /**
   * 渲染角色管理Tab
   */
  const renderRoleManagement = () => (
    <div className="role-management-tab">
      {/*
        RoleList组件已经包含完整的UI功能：
        - 标题栏（角色管理 + 角色数量）
        - 角色卡片列表
        - 角色权限查看弹窗（RolePermissions）
        - 加载、错误、空状态处理
      */}
      <RoleList
        showTitle={true}
      />
    </div>
  );

  return (
    <div className="user-management-page-wrapper">
      {/*
        Tab组件
        - 使用antd Tabs组件
        - 支持Tab切换
        - 响应式设计
      */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="user-management-tabs"
        size="large"
        tabBarStyle={{
          marginBottom: '0px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {/* 用户管理Tab */}
        <TabPane
          tab={
            <span className="flex items-center">
              <UserOutlined className="mr-2" />
              用户管理
            </span>
          }
          key="users"
        >
          {renderUserManagement()}
        </TabPane>

        {/* 角色管理Tab */}
        <TabPane
          tab={
            <span className="flex items-center">
              <TeamOutlined className="mr-2" />
              角色管理
            </span>
          }
          key="roles"
        >
          {renderRoleManagement()}
        </TabPane>
      </Tabs>

      {/* 
        内联样式：确保Tab内容区域样式正确
        注意：这里使用内联样式是为了快速调整，后续可以移到CSS文件中
      */}
      <style jsx global>{`
        .user-management-page-wrapper {
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .user-management-tabs .ant-tabs-content {
          height: 100%;
        }

        .user-management-tabs .ant-tabs-tabpane {
          background-color: #f5f5f5;
        }

        /* 响应式Tab样式 */
        @media (max-width: 640px) {
          .user-management-tabs .ant-tabs-nav {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .user-management-tabs .ant-tabs-tab {
            padding: 12px 16px !important;
          }

          .user-management-tabs .ant-tabs-tab .anticon {
            margin-right: 4px !important;
          }

          /* 小屏幕隐藏Tab文字，只显示图标 */
          .user-management-tabs .ant-tabs-tab span:not(.anticon) {
            display: none;
          }
        }

        /* Tab激活状态样式 */
        .user-management-tabs .ant-tabs-tab-active {
          font-weight: 600;
        }

        /* Tab图标和文字对齐 */
        .user-management-tabs .ant-tabs-tab .flex {
          display: flex;
          align-items: center;
        }

        .user-management-tabs .ant-tabs-tab .mr-2 {
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default UserManagementPage;
