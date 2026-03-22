/**
 * UserList 组件单元测试
 * 
 * 测试用户列表组件的所有功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from '@/components/User/UserList';
import { useUserStore } from '@/stores/userStore';
import { UserService } from '@/services/userService';
import { UserStatus, RoleStatus } from '@/types/user';

// Mock dependencies
vi.mock('@/stores/userStore');
vi.mock('@/services/userService');
vi.mock('@/components/User/UserFilter', () => ({
  default: ({ onFilterChange, onReset }: any) => (
    <div data-testid="user-filter">
      <button onClick={() => onFilterChange({ keyword: 'test' })}>Change Filter</button>
      <button onClick={onReset}>Reset Filter</button>
    </div>
  ),
}));
vi.mock('@/components/User/UserCard', () => ({
  default: ({ user, onRoleUpdate, onStatusUpdate }: any) => (
    <div data-testid={`user-card-${user.id}`}>
      <span>{user.name}</span>
      <button onClick={() => onRoleUpdate?.(user.id)}>Update Role</button>
      <button onClick={() => onStatusUpdate?.(user.id)}>Update Status</button>
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  ChevronsLeft: () => <div data-testid="chevrons-left-icon" />,
  ChevronsRight: () => <div data-testid="chevrons-right-icon" />,
  RefreshCw: () => <div data-testid="refresh-cw-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

describe('UserList', () => {
  const mockUsers = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      name: 'User 1',
      role: { id: 'role-1', code: 'admin', name: '管理员' },
      status: UserStatus.ACTIVE,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      name: 'User 2',
      role: { id: 'role-2', code: 'user', name: '普通用户' },
      status: UserStatus.ACTIVE,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

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
  ];

  const mockStoreState = {
    users: [],
    userTotal: 0,
    userPage: 1,
    userPageSize: 20,
    userTotalPages: 0,
    userListLoading: false,
    userListError: null,
    roles: [],
    rolesLoading: false,
    updatingUser: false,
    setUserList: vi.fn(),
    setUserListLoading: vi.fn(),
    setUserListError: vi.fn(),
    setUserListParams: vi.fn(),
    setRoles: vi.fn(),
    setRolesLoading: vi.fn(),
    setRolesError: vi.fn(),
    setUpdatingUser: vi.fn(),
    setUpdateError: vi.fn(),
    updateUserInList: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset store mock
    vi.mocked(useUserStore).mockReturnValue(mockStoreState as any);
    
    // Reset service mocks
    vi.mocked(UserService.getUsers).mockResolvedValue({
      users: mockUsers,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
    
    vi.mocked(UserService.getRoles).mockResolvedValue(mockRoles);
  });

  // ========== 用户列表渲染测试 ==========

  describe('用户列表渲染', () => {
    it('should_render_user_list_when_users_exist', async () => {
      const state = { ...mockStoreState, users: mockUsers, userTotal: 2 };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByTestId('user-card-user-1')).toBeInTheDocument();
        expect(screen.getByTestId('user-card-user-2')).toBeInTheDocument();
      });
    });

    it('should_render_user_filter_component', () => {
      render(<UserList />);

      expect(screen.getByTestId('user-filter')).toBeInTheDocument();
    });

    it('should_render_title_when_showTitle_is_true', async () => {
      const state = { ...mockStoreState, userTotal: 2 };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList showTitle={true} />);

      await waitFor(() => {
        expect(screen.getByText('用户管理')).toBeInTheDocument();
      });
    });

    it('should_not_render_title_when_showTitle_is_false', () => {
      render(<UserList showTitle={false} />);

      expect(screen.queryByText('用户管理')).not.toBeInTheDocument();
    });

    it('should_display_user_count_in_title', async () => {
      const state = { ...mockStoreState, userTotal: 100 };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByText('(100 个用户)')).toBeInTheDocument();
      });
    });

    it('should_render_refresh_button', () => {
      render(<UserList />);

      expect(screen.getByText('刷新')).toBeInTheDocument();
    });

    it('should_load_users_on_mount', async () => {
      render(<UserList />);

      await waitFor(() => {
        expect(UserService.getUsers).toHaveBeenCalled();
      });
    });

    it('should_load_roles_on_mount', async () => {
      render(<UserList />);

      await waitFor(() => {
        expect(UserService.getRoles).toHaveBeenCalled();
      });
    });
  });

  // ========== 分页功能测试 ==========

  describe('分页功能', () => {
    it('should_render_pagination_when_totalPages_greater_than_1', async () => {
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 1,
        userTotalPages: 3,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should_not_render_pagination_when_totalPages_is_1', () => {
      const state = { ...mockStoreState, users: mockUsers, userTotal: 2, userTotalPages: 1 };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      expect(screen.queryByText('上一页')).not.toBeInTheDocument();
    });

    it('should_call_setUserListParams_when_clicking_page_number', async () => {
      const setUserListParams = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 1,
        userTotalPages: 3,
        setUserListParams,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        const pageButton = screen.getByText('2');
        fireEvent.click(pageButton);

        expect(setUserListParams).toHaveBeenCalledWith({ page: 2 });
      });
    });

    it('should_call_setUserListParams_when_clicking_next_page', async () => {
      const setUserListParams = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 1,
        userTotalPages: 3,
        setUserListParams,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        const nextButtons = screen.getAllByTestId('chevron-right-icon');
        const nextButton = nextButtons[0].closest('button');

        if (nextButton) {
          fireEvent.click(nextButton);
          expect(setUserListParams).toHaveBeenCalledWith({ page: 2 });
        }
      });
    });

    it('should_call_setUserListParams_when_clicking_previous_page', async () => {
      const setUserListParams = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 2,
        userTotalPages: 3,
        setUserListParams,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        const prevButtons = screen.getAllByTestId('chevron-left-icon');
        const prevButton = prevButtons[0].closest('button');

        if (prevButton) {
          fireEvent.click(prevButton);
          expect(setUserListParams).toHaveBeenCalledWith({ page: 1 });
        }
      });
    });

    it('should_disable_previous_button_on_first_page', async () => {
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 1,
        userTotalPages: 3,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        const prevButtons = screen.getAllByTestId('chevron-left-icon');
        const prevButton = prevButtons[0].closest('button');

        if (prevButton) {
          expect(prevButton).toBeDisabled();
        }
      });
    });

    it('should_disable_next_button_on_last_page', async () => {
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 3,
        userTotalPages: 3,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        const nextButtons = screen.getAllByTestId('chevron-right-icon');
        const nextButton = nextButtons[0].closest('button');

        if (nextButton) {
          expect(nextButton).toBeDisabled();
        }
      });
    });

    it('should_display_correct_page_range_info', async () => {
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 2,
        userPageSize: 20,
        userTotalPages: 3,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByText('21')).toBeInTheDocument();
        expect(screen.getByText('40')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
      });
    });

    it('should_call_setUserListParams_when_clicking_first_page', async () => {
      const setUserListParams = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 2,
        userTotalPages: 3,
        setUserListParams,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        const firstButtons = screen.getAllByTestId('chevrons-left-icon');
        const firstButton = firstButtons[0].closest('button');

        if (firstButton) {
          fireEvent.click(firstButton);
          expect(setUserListParams).toHaveBeenCalledWith({ page: 1 });
        }
      });
    });

    it('should_call_setUserListParams_when_clicking_last_page', async () => {
      const setUserListParams = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 1,
        userTotalPages: 3,
        setUserListParams,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        const lastButtons = screen.getAllByTestId('chevrons-right-icon');
        const lastButton = lastButtons[0].closest('button');

        if (lastButton) {
          fireEvent.click(lastButton);
          expect(setUserListParams).toHaveBeenCalledWith({ page: 3 });
        }
      });
    });
  });

  // ========== 加载状态测试 ==========

  describe('加载状态', () => {
    it('should_show_loading_skeleton_when_loading', () => {
      const state = { ...mockStoreState, userListLoading: true };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      // 检查是否有骨架屏
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should_disable_refresh_button_when_loading', () => {
      const state = { ...mockStoreState, userListLoading: true };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      const refreshButton = screen.getByText('刷新').closest('button');
      expect(refreshButton).toBeDisabled();
    });

    it('should_show_spinning_animation_on_refresh_when_loading', () => {
      const state = { ...mockStoreState, userListLoading: true };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      const spinningIcons = document.querySelectorAll('.animate-spin');
      expect(spinningIcons.length).toBeGreaterThan(0);
    });
  });

  // ========== 空状态测试 ==========

  describe('空状态', () => {
    it('should_show_empty_state_when_no_users', async () => {
      const state = {
        ...mockStoreState,
        users: [],
        userTotal: 0,
        userTotalPages: 0,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByText('暂无用户')).toBeInTheDocument();
      });
    });

    it('should_show_different_message_when_filters_applied', async () => {
      const state = {
        ...mockStoreState,
        users: [],
        userTotal: 0,
        userTotalPages: 0,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      // 点击筛选按钮应用筛选
      const changeFilterButton = screen.getByText('Change Filter');
      fireEvent.click(changeFilterButton);

      await waitFor(() => {
        expect(screen.getByText('没有找到符合条件的用户，请尝试调整筛选条件')).toBeInTheDocument();
      });
    });

    it('should_show_reset_button_when_filters_applied', async () => {
      const state = {
        ...mockStoreState,
        users: [],
        userTotal: 0,
        userTotalPages: 0,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      // 点击筛选按钮应用筛选
      const changeFilterButton = screen.getByText('Change Filter');
      fireEvent.click(changeFilterButton);

      await waitFor(() => {
        expect(screen.getByText('重置筛选条件')).toBeInTheDocument();
      });
    });

    it('should_render_users_icon_in_empty_state', async () => {
      const state = {
        ...mockStoreState,
        users: [],
        userTotal: 0,
        userTotalPages: 0,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      });
    });
  });

  // ========== 错误状态测试 ==========

  describe('错误状态', () => {
    it('should_show_error_state_when_error_occurs', async () => {
      const state = {
        ...mockStoreState,
        userListError: '加载失败',
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
      });
    });

    it('should_show_error_title_when_error_occurs', async () => {
      const state = {
        ...mockStoreState,
        userListError: '加载失败',
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
      });
    });

    it('should_render_alert_icon_in_error_state', async () => {
      const state = {
        ...mockStoreState,
        userListError: '加载失败',
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      });
    });

    it('should_show_retry_button_in_error_state', async () => {
      const state = {
        ...mockStoreState,
        userListError: '加载失败',
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByText('重新加载')).toBeInTheDocument();
      });
    });
  });

  // ========== 刷新功能测试 ==========

  describe('刷新功能', () => {
    it('should_call_loadUsers_when_clicking_refresh_button', async () => {
      const setUserListLoading = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        setUserListLoading,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      const refreshButton = screen.getByText('刷新');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(setUserListLoading).toHaveBeenCalled();
      });
    });

    it('should_reload_users_when_clicking_retry_in_error_state', async () => {
      const setUserListLoading = vi.fn();
      const state = {
        ...mockStoreState,
        userListError: '加载失败',
        setUserListLoading,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      const retryButton = screen.getByText('重新加载');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(setUserListLoading).toHaveBeenCalled();
      });
    });
  });

  // ========== 筛选功能测试 ==========

  describe('筛选功能', () => {
    it('should_reset_to_page_1_when_filter_changes', async () => {
      const setUserListParams = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userPage: 2,
        setUserListParams,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      const changeFilterButton = screen.getByText('Change Filter');
      fireEvent.click(changeFilterButton);

      await waitFor(() => {
        expect(setUserListParams).toHaveBeenCalledWith({ page: 1 });
      });
    });

    it('should_reset_to_page_1_when_reset_filters', async () => {
      const setUserListParams = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userPage: 2,
        setUserListParams,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      const resetFilterButton = screen.getByText('Reset Filter');
      fireEvent.click(resetFilterButton);

      await waitFor(() => {
        expect(setUserListParams).toHaveBeenCalledWith({ page: 1 });
      });
    });

    it('should_reload_users_when_filter_changes', async () => {
      const setUserListLoading = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        setUserListLoading,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      const changeFilterButton = screen.getByText('Change Filter');
      fireEvent.click(changeFilterButton);

      await waitFor(() => {
        expect(setUserListLoading).toHaveBeenCalled();
      });
    });
  });

  // ========== 角色和状态更新测试 ==========

  describe('角色和状态更新', () => {
    it('should_call_onRoleUpdate_when_role_update_triggered', async () => {
      const onRoleUpdate = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        roles: mockRoles,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList onRoleUpdate={onRoleUpdate} />);

      await waitFor(() => {
        const roleButtons = screen.getAllByText('Update Role');
        fireEvent.click(roleButtons[0]);

        expect(onRoleUpdate).toHaveBeenCalledWith('user-1');
      });
    });

    it('should_call_onStatusUpdate_when_status_update_triggered', async () => {
      const onStatusUpdate = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        roles: mockRoles,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList onStatusUpdate={onStatusUpdate} />);

      await waitFor(() => {
        const statusButtons = screen.getAllByText('Update Status');
        fireEvent.click(statusButtons[0]);

        expect(onStatusUpdate).toHaveBeenCalledWith('user-1');
      });
    });
  });

  // ========== 自定义属性测试 ==========

  describe('自定义属性', () => {
    it('should_apply_custom_className', () => {
      const { container } = render(<UserList className="custom-class" />);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should_use_custom_pageSize', async () => {
      render(<UserList pageSize={50} />);

      await waitFor(() => {
        expect(UserService.getUsers).toHaveBeenCalledWith(
          expect.objectContaining({
            pageSize: 50,
          })
        );
      });
    });
  });

  // ========== 边界条件测试 ==========

  describe('边界条件', () => {
    it('should_handle_single_page_correctly', async () => {
      const state = {
        ...mockStoreState,
        users: [mockUsers[0]],
        userTotal: 1,
        userPage: 1,
        userTotalPages: 1,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByTestId('user-card-user-1')).toBeInTheDocument();
      });
    });

    it('should_handle_very_large_total_pages', async () => {
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 1000,
        userPage: 1,
        userTotalPages: 100,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        // 应该显示部分页码（不会显示所有100页）
        const pageNumbers = screen.getAllByText(/^\d+$/);
        // 验证页码数量是有限的，不会超过10个（包括1-5和可能的省略号后的页码）
        expect(pageNumbers.length).toBeLessThanOrEqual(10);
      });
    });

    it('should_handle_empty_roles_array', async () => {
      vi.mocked(UserService.getRoles).mockResolvedValue([]);
      
      const state = {
        ...mockStoreState,
        users: mockUsers,
        roles: [],
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(screen.getByTestId('user-card-user-1')).toBeInTheDocument();
      });
    });

    it('should_handle_api_error_gracefully', async () => {
      const setUserListError = vi.fn();
      vi.mocked(UserService.getUsers).mockRejectedValue(new Error('API Error'));
      
      const state = {
        ...mockStoreState,
        setUserListError,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(setUserListError).toHaveBeenCalledWith('API Error');
      });
    });

    it('should_handle_roles_error_gracefully', async () => {
      const setRolesError = vi.fn();
      vi.mocked(UserService.getRoles).mockRejectedValue(new Error('Roles Error'));
      
      const state = {
        ...mockStoreState,
        setRolesError,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        expect(setRolesError).toHaveBeenCalledWith('Roles Error');
      });
    });

    it('should_scroll_to_top_when_page_changes', async () => {
      const mockScrollTo = vi.fn();
      window.scrollTo = mockScrollTo;

      const setUserListParams = vi.fn();
      const state = {
        ...mockStoreState,
        users: mockUsers,
        userTotal: 50,
        userPage: 1,
        userTotalPages: 3,
        setUserListParams,
      };
      vi.mocked(useUserStore).mockReturnValue(state as any);

      render(<UserList />);

      await waitFor(() => {
        const pageButton = screen.getByText('2');
        fireEvent.click(pageButton);

        expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });
    });
  });
});
