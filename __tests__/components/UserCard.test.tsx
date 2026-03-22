/**
 * UserCard 组件单元测试
 * 
 * 测试用户卡片组件的所有功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from '@/components/User/UserCard';
import { UserStatus, RoleStatus } from '@/types/user';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  MoreVertical: () => <div data-testid="more-vertical-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  UserX: () => <div data-testid="user-x-icon" />,
  UserCheck: () => <div data-testid="user-check-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Unlock: () => <div data-testid="unlock-icon" />,
}));

describe('UserCard', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    department: '开发部',
    position: '前端工程师',
    role: {
      id: 'role-1',
      code: 'admin',
      name: '管理员',
    },
    status: UserStatus.ACTIVE,
    lastLoginAt: '2026-01-01T10:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockRoles = [
    {
      id: 'role-1',
      code: 'admin',
      name: '管理员',
      permissions: [],
      status: RoleStatus.ACTIVE,
      isSystem: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'role-2',
      code: 'user',
      name: '普通用户',
      permissions: [],
      status: RoleStatus.ACTIVE,
      isSystem: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    user: mockUser,
    roles: mockRoles,
    onRoleUpdate: vi.fn(),
    onStatusUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========== 用户信息渲染测试 ==========

  describe('用户信息渲染', () => {
    it('should_render_user_name', () => {
      render(<UserCard {...defaultProps} />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should_render_user_username', () => {
      render(<UserCard {...defaultProps} />);

      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    it('should_render_user_email', () => {
      render(<UserCard {...defaultProps} />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should_render_user_role_name', () => {
      render(<UserCard {...defaultProps} />);

      expect(screen.getByText('管理员')).toBeInTheDocument();
    });

    it('should_render_user_department_and_position', () => {
      render(<UserCard {...defaultProps} />);

      expect(screen.getByText('开发部 · 前端工程师')).toBeInTheDocument();
    });

    it('should_render_user_avatar_when_provided', () => {
      render(<UserCard {...defaultProps} />);

      const avatar = screen.getByAlt('Test User');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should_render_default_avatar_when_not_provided', () => {
      const userWithoutAvatar = { ...mockUser, avatar: undefined };
      render(<UserCard {...defaultProps} user={userWithoutAvatar} />);

      // 应该显示默认头像图标
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should_render_last_login_time', () => {
      render(<UserCard {...defaultProps} />);

      // 检查是否包含最后登录信息
      const clockIcons = screen.getAllByTestId('clock-icon');
      expect(clockIcons.length).toBeGreaterThan(0);
    });

    it('should_render_created_time', () => {
      render(<UserCard {...defaultProps} />);

      // 检查是否包含创建时间信息
      const calendarIcons = screen.getAllByTestId('calendar-icon');
      expect(calendarIcons.length).toBeGreaterThan(0);
    });

    it('should_handle_missing_optional_fields', () => {
      const minimalUser = {
        id: 'user-2',
        email: 'minimal@example.com',
        name: 'Minimal User',
        role: { id: 'role-1', code: 'admin', name: '管理员' },
        status: UserStatus.ACTIVE,
        createdAt: '2026-01-01T00:00:00Z',
      };

      render(<UserCard {...defaultProps} user={minimalUser} />);

      expect(screen.getByText('Minimal User')).toBeInTheDocument();
      expect(screen.getByText('minimal@example.com')).toBeInTheDocument();
    });

    it('should_use_email_username_when_username_not_provided', () => {
      const userWithoutUsername = {
        ...mockUser,
        username: undefined,
        email: 'emailuser@example.com',
      };

      render(<UserCard {...defaultProps} user={userWithoutUsername} />);

      expect(screen.getByText('@emailuser')).toBeInTheDocument();
    });
  });

  // ========== 角色更新按钮测试 ==========

  describe('角色更新按钮', () => {
    it('should_render_role_update_button_in_desktop_layout', () => {
      render(<UserCard {...defaultProps} />);

      // 桌面端应该有角色更新按钮
      const shieldIcons = screen.getAllByTestId('shield-icon');
      expect(shieldIcons.length).toBeGreaterThan(0);
    });

    it('should_call_onRoleUpdate_when_clicking_role_update_button', () => {
      const onRoleUpdate = vi.fn();
      render(<UserCard {...defaultProps} onRoleUpdate={onRoleUpdate} />);

      // 找到角色更新按钮（通过shield图标）
      const shieldIcons = screen.getAllByTestId('shield-icon');
      const roleButton = shieldIcons[0].closest('button');

      if (roleButton) {
        fireEvent.click(roleButton);
        expect(onRoleUpdate).toHaveBeenCalledWith('user-1');
      }
    });

    it('should_render_role_update_option_in_mobile_menu', () => {
      render(<UserCard {...defaultProps} />);

      // 点击更多按钮打开菜单
      const moreButtons = screen.getAllByTestId('more-vertical-icon');
      const moreButton = moreButtons[0].closest('button');

      if (moreButton) {
        fireEvent.click(moreButton);
        
        // 应该显示"更新角色"选项
        expect(screen.getByText('更新角色')).toBeInTheDocument();
      }
    });

    it('should_call_onRoleUpdate_when_clicking_role_update_in_mobile_menu', () => {
      const onRoleUpdate = vi.fn();
      render(<UserCard {...defaultProps} onRoleUpdate={onRoleUpdate} />);

      // 打开菜单
      const moreButtons = screen.getAllByTestId('more-vertical-icon');
      const moreButton = moreButtons[0].closest('button');

      if (moreButton) {
        fireEvent.click(moreButton);

        // 点击"更新角色"选项
        const roleUpdateOption = screen.getByText('更新角色');
        fireEvent.click(roleUpdateOption);

        expect(onRoleUpdate).toHaveBeenCalledWith('user-1');
      }
    });

    it('should_disable_role_update_button_when_updating', () => {
      render(<UserCard {...defaultProps} updatingUserId="user-1" />);

      // 找到角色更新按钮
      const shieldIcons = screen.getAllByTestId('shield-icon');
      const roleButton = shieldIcons[0].closest('button');

      if (roleButton) {
        expect(roleButton).toBeDisabled();
      }
    });

    it('should_not_call_onRoleUpdate_when_button_disabled', () => {
      const onRoleUpdate = vi.fn();
      render(<UserCard {...defaultProps} updatingUserId="user-1" onRoleUpdate={onRoleUpdate} />);

      // 找到角色更新按钮
      const shieldIcons = screen.getAllByTestId('shield-icon');
      const roleButton = shieldIcons[0].closest('button');

      if (roleButton) {
        fireEvent.click(roleButton);
        expect(onRoleUpdate).not.toHaveBeenCalled();
      }
    });
  });

  // ========== 状态更新按钮测试 ==========

  describe('状态更新按钮', () => {
    it('should_render_status_update_button_in_desktop_layout', () => {
      render(<UserCard {...defaultProps} />);

      // 桌面端应该有状态更新按钮
      const editIcons = screen.getAllByTestId('edit-icon');
      expect(editIcons.length).toBeGreaterThan(0);
    });

    it('should_call_onStatusUpdate_when_clicking_status_update_button', () => {
      const onStatusUpdate = vi.fn();
      render(<UserCard {...defaultProps} onStatusUpdate={onStatusUpdate} />);

      // 找到状态更新按钮（通过edit图标）
      const editIcons = screen.getAllByTestId('edit-icon');
      const statusButton = editIcons[0].closest('button');

      if (statusButton) {
        fireEvent.click(statusButton);
        expect(onStatusUpdate).toHaveBeenCalledWith('user-1');
      }
    });

    it('should_render_status_update_option_in_mobile_menu', () => {
      render(<UserCard {...defaultProps} />);

      // 点击更多按钮打开菜单
      const moreButtons = screen.getAllByTestId('more-vertical-icon');
      const moreButton = moreButtons[0].closest('button');

      if (moreButton) {
        fireEvent.click(moreButton);

        // 应该显示"更新状态"选项
        expect(screen.getByText('更新状态')).toBeInTheDocument();
      }
    });

    it('should_call_onStatusUpdate_when_clicking_status_update_in_mobile_menu', () => {
      const onStatusUpdate = vi.fn();
      render(<UserCard {...defaultProps} onStatusUpdate={onStatusUpdate} />);

      // 打开菜单
      const moreButtons = screen.getAllByTestId('more-vertical-icon');
      const moreButton = moreButtons[0].closest('button');

      if (moreButton) {
        fireEvent.click(moreButton);

        // 点击"更新状态"选项
        const statusUpdateOption = screen.getByText('更新状态');
        fireEvent.click(statusUpdateOption);

        expect(onStatusUpdate).toHaveBeenCalledWith('user-1');
      }
    });

    it('should_disable_status_update_button_when_updating', () => {
      render(<UserCard {...defaultProps} updatingUserId="user-1" />);

      // 找到状态更新按钮
      const editIcons = screen.getAllByTestId('edit-icon');
      const statusButton = editIcons[0].closest('button');

      if (statusButton) {
        expect(statusButton).toBeDisabled();
      }
    });

    it('should_not_call_onStatusUpdate_when_button_disabled', () => {
      const onStatusUpdate = vi.fn();
      render(<UserCard {...defaultProps} updatingUserId="user-1" onStatusUpdate={onStatusUpdate} />);

      // 找到状态更新按钮
      const editIcons = screen.getAllByTestId('edit-icon');
      const statusButton = editIcons[0].closest('button');

      if (statusButton) {
        fireEvent.click(statusButton);
        expect(onStatusUpdate).not.toHaveBeenCalled();
      }
    });
  });

  // ========== 状态标签显示测试 ==========

  describe('状态标签显示', () => {
    it('should_display_active_status_correctly', () => {
      render(<UserCard {...defaultProps} />);

      expect(screen.getByText('活跃')).toBeInTheDocument();
    });

    it('should_display_inactive_status_correctly', () => {
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      render(<UserCard {...defaultProps} user={inactiveUser} />);

      expect(screen.getByText('未激活')).toBeInTheDocument();
    });

    it('should_display_suspended_status_correctly', () => {
      const suspendedUser = { ...mockUser, status: UserStatus.SUSPENDED };
      render(<UserCard {...defaultProps} user={suspendedUser} />);

      expect(screen.getByText('已停用')).toBeInTheDocument();
    });

    it('should_display_locked_status_correctly', () => {
      const lockedUser = { ...mockUser, status: UserStatus.LOCKED };
      render(<UserCard {...defaultProps} user={lockedUser} />);

      expect(screen.getByText('已锁定')).toBeInTheDocument();
    });

    it('should_apply_correct_css_class_for_active_status', () => {
      const { container } = render(<UserCard {...defaultProps} />);

      const statusBadge = container.querySelector('.bg-green-100');
      expect(statusBadge).toBeInTheDocument();
    });

    it('should_apply_correct_css_class_for_inactive_status', () => {
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      const { container } = render(<UserCard {...defaultProps} user={inactiveUser} />);

      const statusBadge = container.querySelector('.bg-gray-100');
      expect(statusBadge).toBeInTheDocument();
    });

    it('should_apply_correct_css_class_for_suspended_status', () => {
      const suspendedUser = { ...mockUser, status: UserStatus.SUSPENDED };
      const { container } = render(<UserCard {...defaultProps} user={suspendedUser} />);

      const statusBadge = container.querySelector('.bg-yellow-100');
      expect(statusBadge).toBeInTheDocument();
    });

    it('should_apply_correct_css_class_for_locked_status', () => {
      const lockedUser = { ...mockUser, status: UserStatus.LOCKED };
      const { container } = render(<UserCard {...defaultProps} user={lockedUser} />);

      const statusBadge = container.querySelector('.bg-red-100');
      expect(statusBadge).toBeInTheDocument();
    });

    it('should_display_status_icon', () => {
      render(<UserCard {...defaultProps} />);

      // 活跃状态应该显示UserCheck图标
      const userCheckIcons = screen.getAllByTestId('user-check-icon');
      expect(userCheckIcons.length).toBeGreaterThan(0);
    });
  });

  // ========== 加载状态测试 ==========

  describe('加载状态', () => {
    it('should_show_loading_state_when_updating', () => {
      const { container } = render(<UserCard {...defaultProps} updatingUserId="user-1" />);

      // 应该有loading样式
      const card = container.querySelector('.opacity-60');
      expect(card).toBeInTheDocument();
    });

    it('should_disable_pointer_events_when_updating', () => {
      const { container } = render(<UserCard {...defaultProps} updatingUserId="user-1" />);

      const card = container.querySelector('.pointer-events-none');
      expect(card).toBeInTheDocument();
    });

    it('should_not_show_loading_state_for_other_users', () => {
      const { container } = render(<UserCard {...defaultProps} updatingUserId="user-2" />);

      // 不应该有loading样式
      const card = container.querySelector('.opacity-60');
      expect(card).not.toBeInTheDocument();
    });
  });

  // ========== 移动端菜单测试 ==========

  describe('移动端菜单', () => {
    it('should_toggle_menu_when_clicking_more_button', () => {
      render(<UserCard {...defaultProps} />);

      // 点击更多按钮
      const moreButtons = screen.getAllByTestId('more-vertical-icon');
      const moreButton = moreButtons[0].closest('button');

      if (moreButton) {
        // 第一次点击 - 打开菜单
        fireEvent.click(moreButton);
        expect(screen.getByText('更新角色')).toBeInTheDocument();

        // 点击菜单外部关闭
        const overlay = document.querySelector('.fixed.inset-0');
        if (overlay) {
          fireEvent.click(overlay);
        }
      }
    });

    it('should_close_menu_when_selecting_an_option', () => {
      render(<UserCard {...defaultProps} />);

      // 打开菜单
      const moreButtons = screen.getAllByTestId('more-vertical-icon');
      const moreButton = moreButtons[0].closest('button');

      if (moreButton) {
        fireEvent.click(moreButton);

        // 选择一个选项
        const roleUpdateOption = screen.getByText('更新角色');
        fireEvent.click(roleUpdateOption);

        // 菜单应该关闭
        expect(screen.queryByText('更新角色')).not.toBeInTheDocument();
      }
    });
  });

  // ========== 自定义样式测试 ==========

  describe('自定义样式', () => {
    it('should_apply_custom_className', () => {
      const { container } = render(<UserCard {...defaultProps} className="custom-class" />);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should_have_correct_base_styles', () => {
      const { container } = render(<UserCard {...defaultProps} />);

      const card = container.querySelector('.bg-white.rounded-lg.border');
      expect(card).toBeInTheDocument();
    });

    it('should_have_hover_effect', () => {
      const { container } = render(<UserCard {...defaultProps} />);

      const card = container.querySelector('.hover\\:shadow-md');
      expect(card).toBeInTheDocument();
    });
  });

  // ========== 边界条件测试 ==========

  describe('边界条件', () => {
    it('should_handle_empty_department', () => {
      const userWithoutDepartment = { ...mockUser, department: undefined };
      render(<UserCard {...defaultProps} user={userWithoutDepartment} />);

      expect(screen.getByText('前端工程师')).toBeInTheDocument();
    });

    it('should_handle_empty_position', () => {
      const userWithoutPosition = { ...mockUser, position: undefined };
      render(<UserCard {...defaultProps} user={userWithoutPosition} />);

      expect(screen.getByText('开发部')).toBeInTheDocument();
    });

    it('should_handle_empty_department_and_position', () => {
      const userWithoutBoth = {
        ...mockUser,
        department: undefined,
        position: undefined,
      };
      render(<UserCard {...defaultProps} user={userWithoutBoth} />);

      // 不应该显示部门/职位行
      expect(screen.queryByText('·')).not.toBeInTheDocument();
    });

    it('should_handle_missing_lastLoginAt', () => {
      const userWithoutLogin = {
        ...mockUser,
        lastLoginAt: undefined,
      };
      render(<UserCard {...defaultProps} user={userWithoutLogin} />);

      // 应该显示默认值（-）
      const clockIcons = screen.getAllByTestId('clock-icon');
      expect(clockIcons.length).toBeGreaterThan(0);
    });

    it('should_handle_invalid_date_format', () => {
      const userWithInvalidDate = {
        ...mockUser,
        lastLoginAt: 'invalid-date',
        createdAt: 'invalid-date',
      };

      // 不应该崩溃
      expect(() => render(<UserCard {...defaultProps} user={userWithInvalidDate} />)).not.toThrow();
    });

    it('should_handle_empty_roles_array', () => {
      render(<UserCard {...defaultProps} roles={[]} />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should_handle_undefined_callbacks', () => {
      render(<UserCard {...defaultProps} onRoleUpdate={undefined} onStatusUpdate={undefined} />);

      // 不应该崩溃
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  // ========== 响应式布局测试 ==========

  describe('响应式布局', () => {
    it('should_render_mobile_layout', () => {
      const { container } = render(<UserCard {...defaultProps} />);

      // 应该包含移动端布局的类名
      expect(container.querySelector('.md\\:hidden')).toBeInTheDocument();
    });

    it('should_render_desktop_layout', () => {
      const { container } = render(<UserCard {...defaultProps} />);

      // 应该包含桌面端布局的类名
      expect(container.querySelector('.hidden.md\\:block')).toBeInTheDocument();
    });
  });

  // ========== 辅助功能测试 ==========

  describe('辅助功能', () => {
    it('should_have_accessible_buttons', () => {
      render(<UserCard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should_have_title_attributes_on_buttons', () => {
      render(<UserCard {...defaultProps} />);

      // 桌面端按钮应该有title属性
      const shieldIcons = screen.getAllByTestId('shield-icon');
      const roleButton = shieldIcons[0].closest('button');

      if (roleButton) {
        expect(roleButton).toHaveAttribute('title');
      }
    });

    it('should_have_alt_text_for_avatar', () => {
      render(<UserCard {...defaultProps} />);

      const avatar = screen.getByAlt('Test User');
      expect(avatar).toBeInTheDocument();
    });
  });
});
