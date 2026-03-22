/**
 * userStore 单元测试
 * 
 * 测试用户管理状态管理的所有功能
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useUserStore } from '@/stores/userStore';
import { UserStatus, RoleStatus } from '@/types/user';

describe('userStore', () => {
  // 在每个测试前重置store
  beforeEach(() => {
    const { reset } = useUserStore.getState();
    act(() => {
      reset();
    });
  });

  afterEach(() => {
    const { reset } = useUserStore.getState();
    act(() => {
      reset();
    });
  });

  // ========== 状态初始化测试 ==========

  describe('状态初始化', () => {
    it('should_have_correct_initial_state', () => {
      const state = useUserStore.getState();

      // 用户列表初始状态
      expect(state.users).toEqual([]);
      expect(state.userListParams).toEqual({ page: 1, pageSize: 20 });
      expect(state.userTotal).toBe(0);
      expect(state.userPage).toBe(1);
      expect(state.userPageSize).toBe(20);
      expect(state.userTotalPages).toBe(0);
      expect(state.userListLoading).toBe(false);
      expect(state.userListError).toBeNull();

      // 用户详情初始状态
      expect(state.currentUser).toBeNull();
      expect(state.userDetailLoading).toBe(false);
      expect(state.userDetailError).toBeNull();

      // 角色管理初始状态
      expect(state.roles).toEqual([]);
      expect(state.rolesLoading).toBe(false);
      expect(state.rolesError).toBeNull();

      // 权限管理初始状态
      expect(state.permissions).toEqual([]);
      expect(state.permissionsLoading).toBe(false);
      expect(state.permissionsError).toBeNull();

      // 统计数据初始状态
      expect(state.userStatistics).toBeNull();
      expect(state.roleStatistics).toBeNull();
      expect(state.statisticsLoading).toBe(false);
      expect(state.statisticsError).toBeNull();

      // 选中状态
      expect(state.selectedUserId).toBeNull();
      expect(state.selectedUserIds).toEqual([]);

      // 操作状态
      expect(state.updatingUser).toBe(false);
      expect(state.updateError).toBeNull();
    });
  });

  // ========== 用户列表操作测试 ==========

  describe('setUserList', () => {
    it('should_update_user_list_when_called', () => {
      const { setUserList } = useUserStore.getState();
      const mockResponse = {
        users: [
          {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: { id: '1', code: 'admin', name: '管理员' },
            status: UserStatus.ACTIVE,
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      act(() => {
        setUserList(mockResponse);
      });

      const state = useUserStore.getState();
      expect(state.users).toEqual(mockResponse.users);
      expect(state.userTotal).toBe(1);
      expect(state.userPage).toBe(1);
      expect(state.userPageSize).toBe(20);
      expect(state.userTotalPages).toBe(1);
    });

    it('should_replace_existing_users_when_called', () => {
      const { setUserList } = useUserStore.getState();
      
      // 第一次设置
      const firstResponse = {
        users: [
          {
            id: '1',
            email: 'user1@example.com',
            name: 'User 1',
            role: { id: '1', code: 'admin', name: '管理员' },
            status: UserStatus.ACTIVE,
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      act(() => {
        setUserList(firstResponse);
      });

      // 第二次设置
      const secondResponse = {
        users: [
          {
            id: '2',
            email: 'user2@example.com',
            name: 'User 2',
            role: { id: '2', code: 'user', name: '普通用户' },
            status: UserStatus.ACTIVE,
            createdAt: '2026-01-02T00:00:00Z',
          },
          {
            id: '3',
            email: 'user3@example.com',
            name: 'User 3',
            role: { id: '2', code: 'user', name: '普通用户' },
            status: UserStatus.ACTIVE,
            createdAt: '2026-01-03T00:00:00Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      act(() => {
        setUserList(secondResponse);
      });

      const state = useUserStore.getState();
      expect(state.users).toHaveLength(2);
      expect(state.users[0].id).toBe('2');
      expect(state.userTotal).toBe(2);
    });
  });

  describe('setUserListParams', () => {
    it('should_update_query_params_when_called', () => {
      const { setUserListParams } = useUserStore.getState();

      act(() => {
        setUserListParams({ page: 2, keyword: 'test' });
      });

      const state = useUserStore.getState();
      expect(state.userListParams.page).toBe(2);
      expect(state.userListParams.keyword).toBe('test');
    });

    it('should_merge_params_with_existing_ones', () => {
      const { setUserListParams } = useUserStore.getState();

      // 第一次更新
      act(() => {
        setUserListParams({ page: 2, keyword: 'test' });
      });

      // 第二次更新（只更新status，保留其他）
      act(() => {
        setUserListParams({ status: UserStatus.ACTIVE });
      });

      const state = useUserStore.getState();
      expect(state.userListParams.page).toBe(2);
      expect(state.userListParams.keyword).toBe('test');
      expect(state.userListParams.status).toBe(UserStatus.ACTIVE);
    });
  });

  describe('setUserListLoading', () => {
    it('should_update_loading_state_when_called', () => {
      const { setUserListLoading } = useUserStore.getState();

      act(() => {
        setUserListLoading(true);
      });

      expect(useUserStore.getState().userListLoading).toBe(true);

      act(() => {
        setUserListLoading(false);
      });

      expect(useUserStore.getState().userListLoading).toBe(false);
    });
  });

  describe('setUserListError', () => {
    it('should_update_error_state_when_called', () => {
      const { setUserListError } = useUserStore.getState();
      const errorMessage = '加载用户列表失败';

      act(() => {
        setUserListError(errorMessage);
      });

      expect(useUserStore.getState().userListError).toBe(errorMessage);

      act(() => {
        setUserListError(null);
      });

      expect(useUserStore.getState().userListError).toBeNull();
    });
  });

  describe('resetUserList', () => {
    it('should_reset_user_list_to_initial_state', () => {
      const { setUserList, resetUserList } = useUserStore.getState();

      // 先设置一些数据
      act(() => {
        setUserList({
          users: [
            {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
      });

      // 重置
      act(() => {
        resetUserList();
      });

      const state = useUserStore.getState();
      expect(state.users).toEqual([]);
      expect(state.userTotal).toBe(0);
      expect(state.userPage).toBe(1);
      expect(state.userTotalPages).toBe(0);
      expect(state.userListError).toBeNull();
    });
  });

  // ========== 用户详情操作测试 ==========

  describe('setCurrentUser', () => {
    it('should_update_current_user_when_called', () => {
      const { setCurrentUser } = useUserStore.getState();
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: {
          id: '1',
          code: 'admin',
          name: '管理员',
          permissions: [],
          status: RoleStatus.ACTIVE,
          isSystem: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        status: UserStatus.ACTIVE,
        loginCount: 10,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      act(() => {
        setCurrentUser(mockUser);
      });

      const state = useUserStore.getState();
      expect(state.currentUser).toEqual(mockUser);
    });

    it('should_clear_current_user_when_set_to_null', () => {
      const { setCurrentUser } = useUserStore.getState();

      // 先设置一个用户
      act(() => {
        setCurrentUser({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: {
            id: '1',
            code: 'admin',
            name: '管理员',
            permissions: [],
            status: RoleStatus.ACTIVE,
            isSystem: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
          status: UserStatus.ACTIVE,
          loginCount: 10,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        });
      });

      // 清空
      act(() => {
        setCurrentUser(null);
      });

      expect(useUserStore.getState().currentUser).toBeNull();
    });
  });

  describe('setUserDetailLoading', () => {
    it('should_update_detail_loading_state_when_called', () => {
      const { setUserDetailLoading } = useUserStore.getState();

      act(() => {
        setUserDetailLoading(true);
      });

      expect(useUserStore.getState().userDetailLoading).toBe(true);

      act(() => {
        setUserDetailLoading(false);
      });

      expect(useUserStore.getState().userDetailLoading).toBe(false);
    });
  });

  describe('setUserDetailError', () => {
    it('should_update_detail_error_state_when_called', () => {
      const { setUserDetailError } = useUserStore.getState();
      const errorMessage = '获取用户详情失败';

      act(() => {
        setUserDetailError(errorMessage);
      });

      expect(useUserStore.getState().userDetailError).toBe(errorMessage);

      act(() => {
        setUserDetailError(null);
      });

      expect(useUserStore.getState().userDetailError).toBeNull();
    });
  });

  // ========== 角色管理操作测试 ==========

  describe('setRoles', () => {
    it('should_update_roles_when_called', () => {
      const { setRoles } = useUserStore.getState();
      const mockRoles = [
        {
          id: '1',
          code: 'admin',
          name: '管理员',
          permissions: [],
          status: RoleStatus.ACTIVE,
          isSystem: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      act(() => {
        setRoles(mockRoles);
      });

      const state = useUserStore.getState();
      expect(state.roles).toEqual(mockRoles);
    });
  });

  describe('setRolesLoading', () => {
    it('should_update_roles_loading_state_when_called', () => {
      const { setRolesLoading } = useUserStore.getState();

      act(() => {
        setRolesLoading(true);
      });

      expect(useUserStore.getState().rolesLoading).toBe(true);

      act(() => {
        setRolesLoading(false);
      });

      expect(useUserStore.getState().rolesLoading).toBe(false);
    });
  });

  describe('setRolesError', () => {
    it('should_update_roles_error_state_when_called', () => {
      const { setRolesError } = useUserStore.getState();
      const errorMessage = '加载角色列表失败';

      act(() => {
        setRolesError(errorMessage);
      });

      expect(useUserStore.getState().rolesError).toBe(errorMessage);

      act(() => {
        setRolesError(null);
      });

      expect(useUserStore.getState().rolesError).toBeNull();
    });
  });

  // ========== 权限管理操作测试 ==========

  describe('setPermissions', () => {
    it('should_update_permissions_when_called', () => {
      const { setPermissions } = useUserStore.getState();
      const mockPermissions = [
        {
          id: '1',
          code: 'user:create',
          name: '创建用户',
          type: 'action' as const,
          resource: 'user' as const,
          action: 'create' as const,
          status: RoleStatus.ACTIVE,
          sortOrder: 1,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      act(() => {
        setPermissions(mockPermissions);
      });

      const state = useUserStore.getState();
      expect(state.permissions).toEqual(mockPermissions);
    });
  });

  describe('setPermissionsLoading', () => {
    it('should_update_permissions_loading_state_when_called', () => {
      const { setPermissionsLoading } = useUserStore.getState();

      act(() => {
        setPermissionsLoading(true);
      });

      expect(useUserStore.getState().permissionsLoading).toBe(true);

      act(() => {
        setPermissionsLoading(false);
      });

      expect(useUserStore.getState().permissionsLoading).toBe(false);
    });
  });

  describe('setPermissionsError', () => {
    it('should_update_permissions_error_state_when_called', () => {
      const { setPermissionsError } = useUserStore.getState();
      const errorMessage = '加载权限列表失败';

      act(() => {
        setPermissionsError(errorMessage);
      });

      expect(useUserStore.getState().permissionsError).toBe(errorMessage);

      act(() => {
        setPermissionsError(null);
      });

      expect(useUserStore.getState().permissionsError).toBeNull();
    });
  });

  // ========== 统计数据操作测试 ==========

  describe('setUserStatistics', () => {
    it('should_update_user_statistics_when_called', () => {
      const { setUserStatistics } = useUserStore.getState();
      const mockStats = {
        total: 100,
        active: 80,
        inactive: 10,
        suspended: 5,
        locked: 5,
        todayNew: 3,
        todayLogin: 25,
      };

      act(() => {
        setUserStatistics(mockStats);
      });

      const state = useUserStore.getState();
      expect(state.userStatistics).toEqual(mockStats);
    });

    it('should_clear_user_statistics_when_set_to_null', () => {
      const { setUserStatistics } = useUserStore.getState();

      // 先设置统计数据
      act(() => {
        setUserStatistics({
          total: 100,
          active: 80,
          inactive: 10,
          suspended: 5,
          locked: 5,
          todayNew: 3,
          todayLogin: 25,
        });
      });

      // 清空
      act(() => {
        setUserStatistics(null);
      });

      expect(useUserStore.getState().userStatistics).toBeNull();
    });
  });

  describe('setRoleStatistics', () => {
    it('should_update_role_statistics_when_called', () => {
      const { setRoleStatistics } = useUserStore.getState();
      const mockStats = {
        total: 10,
        active: 8,
        disabled: 2,
        systemRoles: 3,
        customRoles: 7,
      };

      act(() => {
        setRoleStatistics(mockStats);
      });

      const state = useUserStore.getState();
      expect(state.roleStatistics).toEqual(mockStats);
    });
  });

  describe('setStatisticsLoading', () => {
    it('should_update_statistics_loading_state_when_called', () => {
      const { setStatisticsLoading } = useUserStore.getState();

      act(() => {
        setStatisticsLoading(true);
      });

      expect(useUserStore.getState().statisticsLoading).toBe(true);

      act(() => {
        setStatisticsLoading(false);
      });

      expect(useUserStore.getState().statisticsLoading).toBe(false);
    });
  });

  describe('setStatisticsError', () => {
    it('should_update_statistics_error_state_when_called', () => {
      const { setStatisticsError } = useUserStore.getState();
      const errorMessage = '加载统计数据失败';

      act(() => {
        setStatisticsError(errorMessage);
      });

      expect(useUserStore.getState().statisticsError).toBe(errorMessage);

      act(() => {
        setStatisticsError(null);
      });

      expect(useUserStore.getState().statisticsError).toBeNull();
    });
  });

  // ========== 选中状态操作测试 ==========

  describe('setSelectedUserId', () => {
    it('should_update_selected_user_id_when_called', () => {
      const { setSelectedUserId } = useUserStore.getState();

      act(() => {
        setSelectedUserId('user-123');
      });

      expect(useUserStore.getState().selectedUserId).toBe('user-123');

      act(() => {
        setSelectedUserId(null);
      });

      expect(useUserStore.getState().selectedUserId).toBeNull();
    });
  });

  describe('setSelectedUserIds', () => {
    it('should_update_selected_user_ids_when_called', () => {
      const { setSelectedUserIds } = useUserStore.getState();

      act(() => {
        setSelectedUserIds(['user-1', 'user-2']);
      });

      expect(useUserStore.getState().selectedUserIds).toEqual(['user-1', 'user-2']);

      act(() => {
        setSelectedUserIds([]);
      });

      expect(useUserStore.getState().selectedUserIds).toEqual([]);
    });
  });

  describe('toggleUserSelection', () => {
    it('should_add_user_to_selection_when_not_selected', () => {
      const { toggleUserSelection } = useUserStore.getState();

      act(() => {
        toggleUserSelection('user-1');
      });

      expect(useUserStore.getState().selectedUserIds).toContain('user-1');
    });

    it('should_remove_user_from_selection_when_already_selected', () => {
      const { setSelectedUserIds, toggleUserSelection } = useUserStore.getState();

      // 先选中
      act(() => {
        setSelectedUserIds(['user-1', 'user-2']);
      });

      // 取消选中
      act(() => {
        toggleUserSelection('user-1');
      });

      const state = useUserStore.getState();
      expect(state.selectedUserIds).not.toContain('user-1');
      expect(state.selectedUserIds).toContain('user-2');
    });
  });

  describe('toggleSelectAll', () => {
    it('should_select_all_users_when_none_selected', () => {
      const { setUserList, toggleSelectAll } = useUserStore.getState();

      // 设置用户列表
      act(() => {
        setUserList({
          users: [
            {
              id: 'user-1',
              email: 'user1@example.com',
              name: 'User 1',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
            {
              id: 'user-2',
              email: 'user2@example.com',
              name: 'User 2',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
      });

      // 全选
      act(() => {
        toggleSelectAll();
      });

      const state = useUserStore.getState();
      expect(state.selectedUserIds).toHaveLength(2);
      expect(state.selectedUserIds).toContain('user-1');
      expect(state.selectedUserIds).toContain('user-2');
    });

    it('should_deselect_all_users_when_all_selected', () => {
      const { setUserList, setSelectedUserIds, toggleSelectAll } = useUserStore.getState();

      // 设置用户列表
      act(() => {
        setUserList({
          users: [
            {
              id: 'user-1',
              email: 'user1@example.com',
              name: 'User 1',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
            {
              id: 'user-2',
              email: 'user2@example.com',
              name: 'User 2',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
      });

      // 先全选
      act(() => {
        setSelectedUserIds(['user-1', 'user-2']);
      });

      // 再次点击取消全选
      act(() => {
        toggleSelectAll();
      });

      expect(useUserStore.getState().selectedUserIds).toHaveLength(0);
    });
  });

  describe('clearSelection', () => {
    it('should_clear_all_selections_when_called', () => {
      const { setSelectedUserId, setSelectedUserIds, clearSelection } = useUserStore.getState();

      // 设置选中状态
      act(() => {
        setSelectedUserId('user-1');
        setSelectedUserIds(['user-1', 'user-2']);
      });

      // 清空选中
      act(() => {
        clearSelection();
      });

      const state = useUserStore.getState();
      expect(state.selectedUserId).toBeNull();
      expect(state.selectedUserIds).toEqual([]);
    });
  });

  // ========== 操作状态管理测试 ==========

  describe('setUpdatingUser', () => {
    it('should_update_updating_state_when_called', () => {
      const { setUpdatingUser } = useUserStore.getState();

      act(() => {
        setUpdatingUser(true);
      });

      expect(useUserStore.getState().updatingUser).toBe(true);

      act(() => {
        setUpdatingUser(false);
      });

      expect(useUserStore.getState().updatingUser).toBe(false);
    });
  });

  describe('setUpdateError', () => {
    it('should_update_update_error_state_when_called', () => {
      const { setUpdateError } = useUserStore.getState();
      const errorMessage = '更新用户失败';

      act(() => {
        setUpdateError(errorMessage);
      });

      expect(useUserStore.getState().updateError).toBe(errorMessage);

      act(() => {
        setUpdateError(null);
      });

      expect(useUserStore.getState().updateError).toBeNull();
    });
  });

  // ========== 本地用户数据更新测试 ==========

  describe('updateUserInList', () => {
    it('should_update_user_in_list_when_given_valid_data', () => {
      const { setUserList, updateUserInList } = useUserStore.getState();

      // 设置用户列表
      act(() => {
        setUserList({
          users: [
            {
              id: 'user-1',
              email: 'user1@example.com',
              name: 'User 1',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
      });

      // 更新用户状态
      act(() => {
        updateUserInList('user-1', { status: UserStatus.SUSPENDED });
      });

      const state = useUserStore.getState();
      expect(state.users[0].status).toBe(UserStatus.SUSPENDED);
    });

    it('should_not_modify_other_users_when_updating_one', () => {
      const { setUserList, updateUserInList } = useUserStore.getState();

      // 设置用户列表
      act(() => {
        setUserList({
          users: [
            {
              id: 'user-1',
              email: 'user1@example.com',
              name: 'User 1',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
            {
              id: 'user-2',
              email: 'user2@example.com',
              name: 'User 2',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
      });

      // 更新第一个用户
      act(() => {
        updateUserInList('user-1', { status: UserStatus.SUSPENDED });
      });

      const state = useUserStore.getState();
      expect(state.users[0].status).toBe(UserStatus.SUSPENDED);
      expect(state.users[1].status).toBe(UserStatus.ACTIVE);
    });

    it('should_not_crash_when_user_not_found', () => {
      const { setUserList, updateUserInList } = useUserStore.getState();

      // 设置用户列表
      act(() => {
        setUserList({
          users: [
            {
              id: 'user-1',
              email: 'user1@example.com',
              name: 'User 1',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
      });

      // 尝试更新不存在的用户
      act(() => {
        updateUserInList('non-existent', { status: UserStatus.SUSPENDED });
      });

      // 不应该崩溃，列表保持不变
      const state = useUserStore.getState();
      expect(state.users).toHaveLength(1);
      expect(state.users[0].status).toBe(UserStatus.ACTIVE);
    });
  });

  describe('removeUserFromList', () => {
    it('should_remove_user_from_list_when_given_valid_id', () => {
      const { setUserList, removeUserFromList } = useUserStore.getState();

      // 设置用户列表
      act(() => {
        setUserList({
          users: [
            {
              id: 'user-1',
              email: 'user1@example.com',
              name: 'User 1',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
            {
              id: 'user-2',
              email: 'user2@example.com',
              name: 'User 2',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 2,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
      });

      // 移除用户
      act(() => {
        removeUserFromList('user-1');
      });

      const state = useUserStore.getState();
      expect(state.users).toHaveLength(1);
      expect(state.users[0].id).toBe('user-2');
      expect(state.userTotal).toBe(1);
    });

    it('should_remove_user_from_selection_when_removed', () => {
      const { setUserList, setSelectedUserIds, removeUserFromList } = useUserStore.getState();

      // 设置用户列表和选中状态
      act(() => {
        setUserList({
          users: [
            {
              id: 'user-1',
              email: 'user1@example.com',
              name: 'User 1',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
        setSelectedUserIds(['user-1']);
      });

      // 移除用户
      act(() => {
        removeUserFromList('user-1');
      });

      const state = useUserStore.getState();
      expect(state.selectedUserIds).not.toContain('user-1');
    });
  });

  describe('batchUpdateUserStatus', () => {
    it('should_update_status_for_multiple_users', () => {
      const { setUserList, batchUpdateUserStatus } = useUserStore.getState();

      // 设置用户列表
      act(() => {
        setUserList({
          users: [
            {
              id: 'user-1',
              email: 'user1@example.com',
              name: 'User 1',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
            {
              id: 'user-2',
              email: 'user2@example.com',
              name: 'User 2',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
            {
              id: 'user-3',
              email: 'user3@example.com',
              name: 'User 3',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 3,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
      });

      // 批量更新状态
      act(() => {
        batchUpdateUserStatus(['user-1', 'user-2'], UserStatus.SUSPENDED);
      });

      const state = useUserStore.getState();
      expect(state.users[0].status).toBe(UserStatus.SUSPENDED);
      expect(state.users[1].status).toBe(UserStatus.SUSPENDED);
      expect(state.users[2].status).toBe(UserStatus.ACTIVE);
    });

    it('should_clear_selection_after_batch_update', () => {
      const { setUserList, setSelectedUserIds, batchUpdateUserStatus } = useUserStore.getState();

      // 设置用户列表和选中状态
      act(() => {
        setUserList({
          users: [
            {
              id: 'user-1',
              email: 'user1@example.com',
              name: 'User 1',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
        setSelectedUserIds(['user-1']);
      });

      // 批量更新
      act(() => {
        batchUpdateUserStatus(['user-1'], UserStatus.SUSPENDED);
      });

      expect(useUserStore.getState().selectedUserIds).toEqual([]);
    });
  });

  // ========== 重置操作测试 ==========

  describe('reset', () => {
    it('should_reset_all_state_to_initial', () => {
      const {
        setUserList,
        setCurrentUser,
        setRoles,
        setPermissions,
        setSelectedUserIds,
        setUpdatingUser,
        setUpdateError,
        reset,
      } = useUserStore.getState();

      // 设置各种状态
      act(() => {
        setUserList({
          users: [
            {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
        setCurrentUser({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: {
            id: '1',
            code: 'admin',
            name: '管理员',
            permissions: [],
            status: RoleStatus.ACTIVE,
            isSystem: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
          status: UserStatus.ACTIVE,
          loginCount: 10,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        });
        setRoles([
          {
            id: '1',
            code: 'admin',
            name: '管理员',
            permissions: [],
            status: RoleStatus.ACTIVE,
            isSystem: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        ]);
        setPermissions([]);
        setSelectedUserIds(['user-1']);
        setUpdatingUser(true);
        setUpdateError('Some error');
      });

      // 重置
      act(() => {
        reset();
      });

      const state = useUserStore.getState();
      expect(state.users).toEqual([]);
      expect(state.currentUser).toBeNull();
      expect(state.roles).toEqual([]);
      expect(state.permissions).toEqual([]);
      expect(state.selectedUserIds).toEqual([]);
      expect(state.updatingUser).toBe(false);
      expect(state.updateError).toBeNull();
    });
  });
});
