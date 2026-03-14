import React from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  TagsOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/tasks',
      icon: <TagsOutlined />,
      label: '任务管理',
    },
    {
      key: '/templates',
      icon: <FileTextOutlined />,
      label: '任务模板',
    },
    {
      key: '/tags',
      icon: <TagOutlined />,
      label: '标签管理',
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '统计报表',
    },
    {
      key: '/agents',
      icon: <TeamOutlined />,
      label: 'Agent列表',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          Agent任务管理
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>{user?.email?.split('@')[0] || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: '280px',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
