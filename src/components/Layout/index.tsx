import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Space } from 'antd';
import {
  HomeOutlined,
  TagsOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import GlobalSearchBox from '@/components/GlobalSearchBox';

const { Header, Content } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [searchVisible, setSearchVisible] = useState(false);

  // Debug: 监控searchVisible状态变化
  useEffect(() => {
    console.log('🔍 [Layout] searchVisible状态变化:', searchVisible);
  }, [searchVisible]);

  // 导航菜单项
  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/tasks',
      icon: <TagsOutlined />,
      label: '任务列表',
    },
    {
      key: '/agents',
      icon: <TeamOutlined />,
      label: '团队成员',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 用户菜单项
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

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  // 监听 Ctrl+K 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 调试：输出所有键盘事件
      console.log('🔍 [Layout] 键盘事件:', e.key, e.code, e.ctrlKey, e.metaKey);
      
      // 使用e.code更可靠，同时支持大小写
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        console.log('🔍 [Layout] Ctrl+K快捷键触发！');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // 阻止其他监听器
        setSearchVisible(true);
        console.log('🔍 [Layout] setSearchVisible(true)已调用');
        return false; // 额外的阻止
      }
    };

    // 使用document和capture: true确保最早捕获
    document.addEventListener('keydown', handleKeyDown, true);
    console.log('🔍 [Layout] Ctrl+K事件监听器已添加');
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      console.log('🔍 [Layout] Ctrl+K事件监听器已移除');
    };
  }, []);

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* 左侧：Logo + 标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1F2937',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          >
            📋 任务管理平台
          </div>
        </div>

        {/* 中间：导航菜单 */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            justifyContent: 'center',
            border: 'none',
          }}
        />

        {/* 右侧：搜索按钮 + 用户信息 */}
        <Space size="middle">
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => {
              console.log('🔍 [Layout] 搜索按钮点击！');
              setSearchVisible(true);
              console.log('🔍 [Layout] setSearchVisible(true)已调用');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6B7280',
            }}
          >
            搜索任务...
            <span
              style={{
                fontSize: '12px',
                padding: '2px 6px',
                backgroundColor: '#F3F4F6',
                borderRadius: '4px',
                border: '1px solid #E5E7EB',
              }}
            >
              Ctrl+K
            </span>
          </Button>

          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <div
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Avatar icon={<UserOutlined />} />
              <span style={{ color: '#1F2937' }}>
                {user?.email?.split('@')[0] || '用户'}
              </span>
            </div>
          </Dropdown>
        </Space>
      </Header>

      {/* 内容区 */}
      <Content
        style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)',
        }}
      >
        {children}
      </Content>

      {/* 全局搜索框 */}
      <GlobalSearchBox
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </AntLayout>
  );
};

export default Layout;
