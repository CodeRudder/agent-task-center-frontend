import React from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Tooltip } from 'antd';
import {
  DashboardOutlined,
  TagsOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { GlobalSearchBox } from '@/components/TaskSearch/GlobalSearchBox';

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
    } else if (key === 'profile') {
      // P0 修复：点击"个人信息"时跳转到用户信息页面
      navigate('/user/profile');
    }
  };

  const handleSearchClick = () => {
    // 触发Ctrl+K事件，由GlobalSearchBox组件监听
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <>
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
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {/* 搜索按钮 */}
            <Tooltip title="搜索任务 (Ctrl+K)">
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={handleSearchClick}
                style={{ fontSize: '16px' }}
              >
                搜索任务
              </Button>
            </Tooltip>

            {/* 用户菜单 */}
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

      {/* 全局搜索框 */}
      <GlobalSearchBox />
    </>
  );
};

export default Layout;
