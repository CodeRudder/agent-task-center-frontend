/**
 * 用户管理状态管理
 * 
 * 使用Zustand管理用户、角色、权限的全局状态
 */
import { create } from 'zustand';
import {
  UserListItem,
  UserDetail,
  UserListParams,
  UserListResponse,
  Role,
  Permission,
  UserStatus,
  UserStatistics,
  RoleStatistics,
} from '@/types/user';

/**
 * 用户管理状态接口
 */
interface UserState {
  // ========== 用户列表状态 ==========
  users: UserListItem[];           // 用户列表
  userListParams: UserListParams;  // 查询参数
  userTotal: number;               // 总数
  userPage: number;                // 当前页
  userPageSize: number;            // 每页数量
  userTotalPages: number;          // 总页数
  userListLoading: boolean;        // 列表加载状态
  userListError: string | null;    // 列表错误信息

  // ========== 用户详情状态 ==========
  currentUser: UserDetail | null;  // 当前查看的用户详情
  userDetailLoading: boolean;      // 详情加载状态
  userDetailError: string | null;  // 详情错误信息

  // ========== 角色管理状态 ==========
  roles: Role[];                   // 角色列表
  rolesLoading: boolean;           // 角色列表加载状态
  rolesError: string | null;       // 角色列表错误信息

  // ========== 权限管理状态 ==========
  permissions: Permission[];       // 权限列表
  permissionsLoading: boolean;     // 权限列表加载状态
  permissionsError: string | null; // 权限列表错误信息

  // ========== 统计数据状态 ==========
  userStatistics: UserStatistics | null;  // 用户统计
  roleStatistics: RoleStatistics | null;  // 角色统计
  statisticsLoading: boolean;             // 统计数据加载状态
  statisticsError: string | null;         // 统计数据错误信息

  // ========== 选中状态 ==========
  selectedUserId: string | null;   // 当前选中的用户ID
  selectedUserIds: string[];       // 批量选中的用户ID列表

  // ========== 操作状态 ==========
  updatingUser: boolean;           // 更新用户中
  updateError: string | null;      // 更新错误信息

  // ========== 用户列表操作 ==========
  /**
   * 设置用户列表
   */
  setUserList: (response: UserListResponse) => void;

  /**
   * 设置查询参数
   */
  setUserListParams: (params: Partial<UserListParams>) => void;

  /**
   * 设置列表加载状态
   */
  setUserListLoading: (loading: boolean) => void;

  /**
   * 设置列表错误信息
   */
  setUserListError: (error: string | null) => void;

  /**
   * 重置用户列表
   */
  resetUserList: () => void;

  // ========== 用户详情操作 ==========
  /**
   * 设置当前用户详情
   */
  setCurrentUser: (user: UserDetail | null) => void;

  /**
   * 设置详情加载状态
   */
  setUserDetailLoading: (loading: boolean) => void;

  /**
   * 设置详情错误信息
   */
  setUserDetailError: (error: string | null) => void;

  // ========== 角色管理操作 ==========
  /**
   * 设置角色列表
   */
  setRoles: (roles: Role[]) => void;

  /**
   * 设置角色列表加载状态
   */
  setRolesLoading: (loading: boolean) => void;

  /**
   * 设置角色列表错误信息
   */
  setRolesError: (error: string | null) => void;

  // ========== 权限管理操作 ==========
  /**
   * 设置权限列表
   */
  setPermissions: (permissions: Permission[]) => void;

  /**
   * 设置权限列表加载状态
   */
  setPermissionsLoading: (loading: boolean) => void;

  /**
   * 设置权限列表错误信息
   */
  setPermissionsError: (error: string | null) => void;

  // ========== 统计数据操作 ==========
  /**
   * 设置用户统计
   */
  setUserStatistics: (stats: UserStatistics | null) => void;

  /**
   * 设置角色统计
   */
  setRoleStatistics: (stats: RoleStatistics | null) => void;

  /**
   * 设置统计数据加载状态
   */
  setStatisticsLoading: (loading: boolean) => void;

  /**
   * 设置统计数据错误信息
   */
  setStatisticsError: (error: string | null) => void;

  // ========== 选中状态操作 ==========
  /**
   * 设置选中的用户ID
   */
  setSelectedUserId: (id: string | null) => void;

  /**
   * 设置批量选中的用户ID列表
   */
  setSelectedUserIds: (ids: string[]) => void;

  /**
   * 切换用户选中状态
   */
  toggleUserSelection: (id: string) => void;

  /**
   * 全选/取消全选
   */
  toggleSelectAll: () => void;

  /**
   * 清空选中
   */
  clearSelection: () => void;

  // ========== 操作状态管理 ==========
  /**
   * 设置更新状态
   */
  setUpdatingUser: (updating: boolean) => void;

  /**
   * 设置更新错误
   */
  setUpdateError: (error: string | null) => void;

  // ========== 本地用户数据更新 ==========
  /**
   * 更新列表中的用户数据
   */
  updateUserInList: (userId: string, updates: Partial<UserListItem>) => void;

  /**
   * 从列表中移除用户
   */
  removeUserFromList: (userId: string) => void;

  /**
   * 批量更新用户状态
   */
  batchUpdateUserStatus: (userIds: string[], status: UserStatus) => void;

  // ========== 重置操作 ==========
  /**
   * 重置所有状态
   */
  reset: () => void;
}

/**
 * 初始状态
 */
const initialState = {
  // 用户列表
  users: [],
  userListParams: {
    page: 1,
    pageSize: 20,
  },
  userTotal: 0,
  userPage: 1,
  userPageSize: 20,
  userTotalPages: 0,
  userListLoading: false,
  userListError: null,

  // 用户详情
  currentUser: null,
  userDetailLoading: false,
  userDetailError: null,

  // 角色管理
  roles: [],
  rolesLoading: false,
  rolesError: null,

  // 权限管理
  permissions: [],
  permissionsLoading: false,
  permissionsError: null,

  // 统计数据
  userStatistics: null,
  roleStatistics: null,
  statisticsLoading: false,
  statisticsError: null,

  // 选中状态
  selectedUserId: null,
  selectedUserIds: [],

  // 操作状态
  updatingUser: false,
  updateError: null,
};

/**
 * 用户管理Store
 */
export const useUserStore = create<UserState>((set, get) => ({
  ...initialState,

  // ========== 用户列表操作 ==========
  setUserList: (response) => {
    set({
      users: response.users,
      userTotal: response.total,
      userPage: response.page,
      userPageSize: response.pageSize,
      userTotalPages: response.totalPages,
    });
  },

  setUserListParams: (params) => {
    set((state) => ({
      userListParams: { ...state.userListParams, ...params },
    }));
  },

  setUserListLoading: (loading) => {
    set({ userListLoading: loading });
  },

  setUserListError: (error) => {
    set({ userListError: error });
  },

  resetUserList: () => {
    set({
      users: [],
      userTotal: 0,
      userPage: 1,
      userPageSize: 20,
      userTotalPages: 0,
      userListError: null,
    });
  },

  // ========== 用户详情操作 ==========
  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  setUserDetailLoading: (loading) => {
    set({ userDetailLoading: loading });
  },

  setUserDetailError: (error) => {
    set({ userDetailError: error });
  },

  // ========== 角色管理操作 ==========
  setRoles: (roles) => {
    set({ roles });
  },

  setRolesLoading: (loading) => {
    set({ rolesLoading: loading });
  },

  setRolesError: (error) => {
    set({ rolesError: error });
  },

  // ========== 权限管理操作 ==========
  setPermissions: (permissions) => {
    set({ permissions });
  },

  setPermissionsLoading: (loading) => {
    set({ permissionsLoading: loading });
  },

  setPermissionsError: (error) => {
    set({ permissionsError: error });
  },

  // ========== 统计数据操作 ==========
  setUserStatistics: (stats) => {
    set({ userStatistics: stats });
  },

  setRoleStatistics: (stats) => {
    set({ roleStatistics: stats });
  },

  setStatisticsLoading: (loading) => {
    set({ statisticsLoading: loading });
  },

  setStatisticsError: (error) => {
    set({ statisticsError: error });
  },

  // ========== 选中状态操作 ==========
  setSelectedUserId: (id) => {
    set({ selectedUserId: id });
  },

  setSelectedUserIds: (ids) => {
    set({ selectedUserIds: ids });
  },

  toggleUserSelection: (id) => {
    set((state) => {
      const isSelected = state.selectedUserIds.includes(id);
      return {
        selectedUserIds: isSelected
          ? state.selectedUserIds.filter((userId) => userId !== id)
          : [...state.selectedUserIds, id],
      };
    });
  },

  toggleSelectAll: () => {
    set((state) => {
      const allSelected = state.users.every((user) =>
        state.selectedUserIds.includes(user.id)
      );
      return {
        selectedUserIds: allSelected
          ? []
          : state.users.map((user) => user.id),
      };
    });
  },

  clearSelection: () => {
    set({ selectedUserIds: [], selectedUserId: null });
  },

  // ========== 操作状态管理 ==========
  setUpdatingUser: (updating) => {
    set({ updatingUser: updating });
  },

  setUpdateError: (error) => {
    set({ updateError: error });
  },

  // ========== 本地用户数据更新 ==========
  updateUserInList: (userId, updates) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      ),
    }));
  },

  removeUserFromList: (userId) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
      userTotal: state.userTotal - 1,
      selectedUserIds: state.selectedUserIds.filter((id) => id !== userId),
    }));
  },

  batchUpdateUserStatus: (userIds, status) => {
    set((state) => ({
      users: state.users.map((user) =>
        userIds.includes(user.id) ? { ...user, status } : user
      ),
      selectedUserIds: [],
    }));
  },

  // ========== 重置操作 ==========
  reset: () => {
    set(initialState);
  },
}));

export default useUserStore;
