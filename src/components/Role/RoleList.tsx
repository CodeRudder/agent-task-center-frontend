/**
 * 角色列表组件
 * 
 * 显示角色列表，支持查看角色权限
 * - 显示角色列表（admin, project_manager, user）
 * - 显示角色名称、显示名称、描述
 * - 显示角色权限数量
 * - 支持角色权限查看
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useEffect, useCallback, useState } from 'react';
import { 
  Shield, 
  ChevronRight, 
  Users,
  RefreshCw,
  AlertCircle,
  Lock
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/stores/userStore';
import { UserService } from '@/services/userService';
import { Role, RoleStatus } from '@/types/user';
import RolePermissions from './RolePermissions';

/**
 * RoleList组件属性
 */
export interface RoleListProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 角色点击回调（查看权限） */
  onRoleClick?: (role: Role) => void;
}

/**
 * 角色列表组件
 */
export const RoleList: React.FC<RoleListProps> = ({
  className,
  showTitle = true,
  onRoleClick,
}) => {
  // ========== Store状态 ==========
  const {
    roles,
    rolesLoading,
    rolesError,
    setRoles,
    setRolesLoading,
    setRolesError,
  } = useUserStore();

  // ========== 本地状态 ==========
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  // ========== 数据加载 ==========

  /**
   * 加载角色列表
   */
  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      setRolesError(null);
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
    if (roles.length === 0) {
      loadRoles();
    }
  }, [roles.length, loadRoles]);

  // ========== 事件处理 ==========

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    loadRoles();
  }, [loadRoles]);

  /**
   * 处理角色点击（查看权限）
   */
  const handleRoleClick = useCallback((role: Role) => {
    setSelectedRole(role);
    setShowPermissions(true);
    onRoleClick?.(role);
  }, [onRoleClick]);

  /**
   * 处理关闭权限弹窗
   */
  const handleClosePermissions = useCallback(() => {
    setShowPermissions(false);
    setSelectedRole(null);
  }, []);

  // ========== 渲染函数 ==========

  /**
   * 获取角色状态配置
   */
  const getRoleStatusConfig = (status: RoleStatus) => {
    const configs = {
      [RoleStatus.ACTIVE]: {
        label: '活跃',
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      [RoleStatus.DISABLED]: {
        label: '已禁用',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      },
    };
    return configs[status] || configs[RoleStatus.ACTIVE];
  };

  /**
   * 获取角色图标颜色
   */
  const getRoleIconColor = (roleCode: string) => {
    const colors: Record<string, string> = {
      admin: 'text-red-600 bg-red-50',
      project_manager: 'text-blue-600 bg-blue-50',
      user: 'text-gray-600 bg-gray-50',
    };
    return colors[roleCode] || 'text-gray-600 bg-gray-50';
  };

  /**
   * 渲染角色卡片
   */
  const renderRoleCard = (role: Role) => {
    const statusConfig = getRoleStatusConfig(role.status);
    const iconColor = getRoleIconColor(role.code);

    return (
      <div
        key={role.id}
        onClick={() => handleRoleClick(role)}
        className={cn(
          'bg-white rounded-lg border border-gray-200 p-4 cursor-pointer',
          'hover:shadow-md hover:border-blue-300 transition-all',
          'group'
        )}
      >
        {/* 移动端布局 */}
        <div className="md:hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={cn('p-2 rounded-lg', iconColor)}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {role.name}
                </h3>
                <p className="text-sm text-gray-500">
                  @{role.code}
                </p>
              </div>
            </div>
            {role.isSystem && (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {role.description || '暂无描述'}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                {role.permissions.length} 个权限
              </span>
              {role.userCount !== undefined && (
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {role.userCount} 个用户
                </span>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* 桌面端布局 */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className={cn('p-2.5 rounded-lg', iconColor)}>
                <Shield className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {role.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    @{role.code}
                  </span>
                  {role.isSystem && (
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                      statusConfig.className
                    )}
                  >
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {role.description || '暂无描述'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center whitespace-nowrap">
                  <Shield className="w-4 h-4 mr-1" />
                  {role.permissions.length} 个权限
                </span>
                {role.userCount !== undefined && (
                  <span className="flex items-center whitespace-nowrap">
                    <Users className="w-4 h-4 mr-1" />
                    {role.userCount} 个用户
                  </span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
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
      <Shield className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无角色</h3>
      <p className="text-sm text-gray-500 text-center">
        系统中还没有角色数据
      </p>
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
        {rolesError || '加载角色列表时发生错误'}
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
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
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
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">角色管理</h1>
              <span className="text-sm text-gray-500">({roles.length} 个角色)</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={rolesLoading}
              className={cn(
                'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md',
                'text-gray-700 bg-white border border-gray-300',
                'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', rolesLoading && 'animate-spin')} />
              刷新
            </button>
          </div>
        </div>
      )}

      {/* 角色列表 */}
      <div className="px-4 py-4 sm:px-6">
        {rolesLoading ? (
          renderLoading()
        ) : rolesError ? (
          renderError()
        ) : roles.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="space-y-3">
            {roles.map((role) => renderRoleCard(role))}
          </div>
        )}
      </div>

      {/* 角色权限弹窗 */}
      {showPermissions && selectedRole && (
        <RolePermissions
          role={selectedRole}
          isOpen={showPermissions}
          onClose={handleClosePermissions}
        />
      )}
    </div>
  );
};

export default RoleList;
