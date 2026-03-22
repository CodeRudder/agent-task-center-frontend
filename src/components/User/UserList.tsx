/**
 * 用户列表组件
 * 
 * 显示用户列表，支持筛选、搜索、分页功能
 * - 显示用户列表（username, email, role, status, created_at, last_login_at）
 * - 实现分页功能
 * - 实现角色筛选（admin, project_manager, user）
 * - 实现状态筛选（active, disabled）
 * - 实现用户名/邮箱搜索功能
 * - 响应式设计（移动端+桌面端）
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useEffect, useCallback, useState } from 'react';
import { 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/stores/userStore';
import { UserService } from '@/services/userService';
import { UserListItem, UserStatus, Role, UserListParams } from '@/types/user';
import UserFilter, { UserFilterParams } from './UserFilter';
import UserCard from './UserCard';

/**
 * UserList组件属性
 */
export interface UserListProps {
  /** 自定义样式类名 */
  className?: string;
  /** 每页显示数量（默认20） */
  pageSize?: number;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 角色更新回调 */
  onRoleUpdate?: (userId: string) => void;
  /** 状态更新回调 */
  onStatusUpdate?: (userId: string) => void;
}

/**
 * 用户列表组件
 */
export const UserList: React.FC<UserListProps> = ({
  className,
  pageSize = 20,
  showTitle = true,
  onRoleUpdate,
  onStatusUpdate,
}) => {
  // ========== Store状态 ==========
  const {
    users,
    userTotal,
    userPage,
    userPageSize,
    userTotalPages,
    userListLoading,
    userListError,
    roles,
    rolesLoading,
    updatingUser,
    setUserList,
    setUserListLoading,
    setUserListError,
    setUserListParams,
    setRoles,
    setRolesLoading,
    setRolesError,
    setUpdatingUser,
    setUpdateError,
    updateUserInList,
  } = useUserStore();

  // ========== 本地状态 ==========
  const [filters, setFilters] = useState<UserFilterParams>({});
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  // ========== 数据加载 ==========

  /**
   * 加载用户列表
   */
  const loadUsers = useCallback(async () => {
    try {
      setUserListLoading(true);
      setUserListError(null);

      // 构建查询参数
      const params: UserListParams = {
        page: userPage,
        pageSize: userPageSize,
        keyword: filters.keyword,
        status: filters.status,
        roleId: filters.roleId,
      };

      const response = await UserService.getUsers(params);
      setUserList(response);
    } catch (error) {
      console.error('加载用户列表失败:', error);
      setUserListError(error instanceof Error ? error.message : '加载用户列表失败');
    } finally {
      setUserListLoading(false);
    }
  }, [userPage, userPageSize, filters, setUserListLoading, setUserListError, setUserList]);

  /**
   * 加载角色列表
   */
  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const rolesData = await UserService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('加载角色列表失败:', error);
      setRolesError(error instanceof Error ? error.message : '加载角色列表失败');
    } finally {
      setRolesLoading(false);
    }
  }, [setRolesLoading, setRoles, setRolesError]);

  /**
   * 初始化加载
   */
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  /**
   * 监听筛选和分页变化，重新加载用户列表
   */
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ========== 事件处理 ==========

  /**
   * 处理筛选变化
   */
  const handleFilterChange = useCallback((newFilters: UserFilterParams) => {
    setFilters(newFilters);
    // 重置到第一页
    setUserListParams({ page: 1 });
  }, [setUserListParams]);

  /**
   * 处理重置筛选
   */
  const handleFilterReset = useCallback(() => {
    setFilters({});
    setUserListParams({ page: 1 });
  }, [setUserListParams]);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * 处理分页变化
   */
  const handlePageChange = useCallback((newPage: number) => {
    setUserListParams({ page: newPage });
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setUserListParams]);

  /**
   * 处理角色更新
   */
  const handleRoleUpdate = useCallback(async (userId: string) => {
    setActionUserId(userId);
    try {
      // 调用外部回调或执行默认操作
      if (onRoleUpdate) {
        onRoleUpdate(userId);
      } else {
        // 默认操作：这里可以打开角色选择对话框
        console.log('更新用户角色:', userId);
      }
    } finally {
      setActionUserId(null);
    }
  }, [onRoleUpdate]);

  /**
   * 处理状态更新
   */
  const handleStatusUpdate = useCallback(async (userId: string) => {
    setActionUserId(userId);
    try {
      // 调用外部回调或执行默认操作
      if (onStatusUpdate) {
        onStatusUpdate(userId);
      } else {
        // 默认操作：这里可以打开状态选择对话框
        console.log('更新用户状态:', userId);
      }
    } finally {
      setActionUserId(null);
    }
  }, [onStatusUpdate]);

  // ========== 渲染函数 ==========

  /**
   * 渲染分页组件
   */
  const renderPagination = () => {
    if (userTotalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, userPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(userTotalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        {/* 移动端分页 */}
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => handlePageChange(userPage - 1)}
            disabled={userPage === 1 || userListLoading}
            className={cn(
              'relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md',
              'text-gray-700 bg-white border border-gray-300',
              'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            上一页
          </button>
          <span className="text-sm text-gray-700">
            第 {userPage} / {userTotalPages} 页
          </span>
          <button
            onClick={() => handlePageChange(userPage + 1)}
            disabled={userPage === userTotalPages || userListLoading}
            className={cn(
              'relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md',
              'text-gray-700 bg-white border border-gray-300',
              'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            下一页
          </button>
        </div>

        {/* 桌面端分页 */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700">
            显示第 <span className="font-medium">{(userPage - 1) * userPageSize + 1}</span> 到{' '}
            <span className="font-medium">{Math.min(userPage * userPageSize, userTotal)}</span> 条，
            共 <span className="font-medium">{userTotal}</span> 条
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              {/* 首页 */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={userPage === 1 || userListLoading}
                className={cn(
                  'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500',
                  'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              
              {/* 上一页 */}
              <button
                onClick={() => handlePageChange(userPage - 1)}
                disabled={userPage === 1 || userListLoading}
                className={cn(
                  'relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500',
                  'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* 页码 */}
              {startPage > 1 && (
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
              
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={userListLoading}
                  className={cn(
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === userPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    userListLoading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {page}
                </button>
              ))}

              {endPage < userTotalPages && (
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )}

              {/* 下一页 */}
              <button
                onClick={() => handlePageChange(userPage + 1)}
                disabled={userPage === userTotalPages || userListLoading}
                className={cn(
                  'relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500',
                  'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* 末页 */}
              <button
                onClick={() => handlePageChange(userTotalPages)}
                disabled={userPage === userTotalPages || userListLoading}
                className={cn(
                  'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500',
                  'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 渲染空状态
   */
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Users className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无用户</h3>
      <p className="text-sm text-gray-500 text-center">
        {filters.keyword || filters.status || filters.roleId
          ? '没有找到符合条件的用户，请尝试调整筛选条件'
          : '系统中还没有用户'}
      </p>
      {(filters.keyword || filters.status || filters.roleId) && (
        <button
          onClick={handleFilterReset}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700"
        >
          重置筛选条件
        </button>
      )}
    </div>
  );

  /**
   * 渲染错误状态
   */
  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        {userListError || '加载用户列表时发生错误'}
      </p>
      <button
        onClick={handleRefresh}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        重新加载
      </button>
    </div>
  );

  /**
   * 渲染加载状态
   */
  const renderLoading = () => (
    <div className="space-y-3 p-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn('bg-gray-50 min-h-screen', className)}>
      {/* 标题栏 */}
      {showTitle && (
        <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">用户管理</h1>
              <span className="text-sm text-gray-500">({userTotal} 个用户)</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={userListLoading}
              className={cn(
                'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md',
                'text-gray-700 bg-white border border-gray-300',
                'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', userListLoading && 'animate-spin')} />
              刷新
            </button>
          </div>
        </div>
      )}

      {/* 筛选区域 */}
      <div className="px-4 py-4 sm:px-6">
        <UserFilter
          filters={filters}
          roles={roles}
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
        />
      </div>

      {/* 用户列表 */}
      <div className="px-4 sm:px-6">
        {userListLoading ? (
          renderLoading()
        ) : userListError ? (
          renderError()
        ) : users.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* 列表内容 */}
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  roles={roles}
                  updatingUserId={actionUserId}
                  onRoleUpdate={handleRoleUpdate}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>

            {/* 分页 */}
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
