/**
 * 角色权限关联组件
 * 
 * 显示角色与权限的关联关系，支持权限分配
 * - 显示角色与权限的关联关系
 * - 支持角色选择
 * - 显示选中角色的权限列表
 * - 支持权限分配（可选）
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { 
  Shield, 
  Users,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Search,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/stores/userStore';
import { UserService } from '@/services/userService';
import { 
  Role, 
  Permission, 
  PermissionResource,
  RoleStatus 
} from '@/types/user';

/**
 * RolePermissionMapping组件属性
 */
export interface RolePermissionMappingProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 是否为编辑模式（支持权限分配） */
  editMode?: boolean;
  /** 权限更新回调 */
  onPermissionUpdate?: (roleId: string, permissionIds: string[]) => Promise<void>;
}

/**
 * 角色权限关联组件
 */
export const RolePermissionMapping: React.FC<RolePermissionMappingProps> = ({
  className,
  showTitle = true,
  editMode = false,
  onPermissionUpdate,
}) => {
  // ========== Store状态 ==========
  const {
    roles,
    permissions,
    rolesLoading,
    permissionsLoading,
    rolesError,
    permissionsError,
    setRoles,
    setPermissions,
    setRolesLoading,
    setPermissionsLoading,
    setRolesError,
    setPermissionsError,
  } = useUserStore();

  // ========== 本地状态 ==========
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
      
      // 默认选中第一个角色
      if (rolesData.length > 0 && !selectedRole) {
        setSelectedRole(rolesData[0]);
        setSelectedPermissionIds(new Set(rolesData[0].permissions.map(p => p.id)));
      }
    } catch (error) {
      console.error('加载角色列表失败:', error);
      setRolesError(error instanceof Error ? error.message : '加载角色列表失败');
    } finally {
      setRolesLoading(false);
    }
  }, [selectedRole, setRolesLoading, setRoles, setRolesError]);

  /**
   * 加载权限列表
   */
  const loadPermissions = useCallback(async () => {
    try {
      setPermissionsLoading(true);
      setPermissionsError(null);
      const permissionsData = await UserService.getPermissions();
      setPermissions(permissionsData);
    } catch (error) {
      console.error('加载权限列表失败:', error);
      setPermissionsError(error instanceof Error ? error.message : '加载权限列表失败');
    } finally {
      setPermissionsLoading(false);
    }
  }, [setPermissionsLoading, setPermissions, setPermissionsError]);

  /**
   * 初始化加载
   */
  useEffect(() => {
    if (roles.length === 0) {
      loadRoles();
    }
    if (permissions.length === 0) {
      loadPermissions();
    }
  }, [roles.length, permissions.length, loadRoles, loadPermissions]);

  // ========== 计算属性 ==========

  /**
   * 筛选后的权限列表
   */
  const filteredPermissions = useMemo(() => {
    if (!searchKeyword) return permissions;
    
    const keyword = searchKeyword.toLowerCase();
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.code.toLowerCase().includes(keyword) ||
        (p.description && p.description.toLowerCase().includes(keyword))
    );
  }, [permissions, searchKeyword]);

  /**
   * 按资源分组的权限
   */
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    
    filteredPermissions.forEach((permission) => {
      const resource = permission.resource;
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(permission);
    });

    // 按资源名称排序
    const sortedGroups: Record<string, Permission[]> = {};
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sortedGroups[key] = groups[key].sort((a, b) => a.sortOrder - b.sortOrder);
      });

    return sortedGroups;
  }, [filteredPermissions]);

  /**
   * 选中角色的权限ID集合（用于显示）
   */
  const rolePermissionIds = useMemo(() => {
    if (!selectedRole) return new Set<string>();
    return new Set(selectedRole.permissions.map(p => p.id));
  }, [selectedRole]);

  // ========== 事件处理 ==========

  /**
   * 处理角色选择
   */
  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role);
    setSelectedPermissionIds(new Set(role.permissions.map(p => p.id)));
    setHasChanges(false);
    setSearchKeyword('');
  }, []);

  /**
   * 处理权限选择
   */
  const handlePermissionToggle = useCallback((permissionId: string) => {
    if (!editMode) return;
    
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
    
    // 检查是否有变更
    const hasChanged = !areSetsEqual(selectedPermissionIds, rolePermissionIds);
    setHasChanges(hasChanged);
  }, [editMode, selectedPermissionIds, rolePermissionIds]);

  /**
   * 处理资源组全选/取消全选
   */
  const handleResourceGroupToggle = useCallback((resource: string, permissionIds: string[]) => {
    if (!editMode) return;
    
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      const allSelected = permissionIds.every(id => next.has(id));
      
      if (allSelected) {
        // 取消全选
        permissionIds.forEach(id => next.delete(id));
      } else {
        // 全选
        permissionIds.forEach(id => next.add(id));
      }
      
      return next;
    });
    
    setHasChanges(true);
  }, [editMode]);

  /**
   * 处理保存
   */
  const handleSave = useCallback(async () => {
    if (!selectedRole || !onPermissionUpdate) return;
    
    try {
      setIsUpdating(true);
      await onPermissionUpdate(selectedRole.id, Array.from(selectedPermissionIds));
      
      // 更新本地角色数据
      const updatedRole = {
        ...selectedRole,
        permissions: permissions.filter(p => selectedPermissionIds.has(p.id)),
      };
      setSelectedRole(updatedRole);
      setHasChanges(false);
      
      // 更新store中的角色列表
      setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
      
      alert('权限更新成功！');
    } catch (error) {
      console.error('更新权限失败:', error);
      alert('更新权限失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsUpdating(false);
    }
  }, [selectedRole, selectedPermissionIds, onPermissionUpdate, permissions, roles, setRoles]);

  /**
   * 处理取消
   */
  const handleCancel = useCallback(() => {
    if (!selectedRole) return;
    setSelectedPermissionIds(new Set(selectedRole.permissions.map(p => p.id)));
    setHasChanges(false);
  }, [selectedRole]);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    loadRoles();
    loadPermissions();
  }, [loadRoles, loadPermissions]);

  // ========== 工具函数 ==========

  /**
   * 比较两个Set是否相等
   */
  const areSetsEqual = (a: Set<string>, b: Set<string>) => {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  };

  /**
   * 获取资源显示名称
   */
  const getResourceDisplayName = (resource: string) => {
    const names: Record<string, string> = {
      [PermissionResource.USER]: '用户管理',
      [PermissionResource.ROLE]: '角色管理',
      [PermissionResource.PERMISSION]: '权限管理',
      [PermissionResource.TASK]: '任务管理',
      [PermissionResource.AGENT]: 'Agent管理',
      [PermissionResource.TEMPLATE]: '模板管理',
      [PermissionResource.DASHBOARD]: '仪表盘',
      [PermissionResource.SYSTEM]: '系统设置',
    };
    return names[resource] || resource;
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

  // ========== 渲染函数 ==========

  /**
   * 渲染角色列表
   */
  const renderRoleList = () => (
    <div className="w-full md:w-1/3 bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 角色列表头部 */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">角色列表</span>
            <span className="text-xs text-gray-500">({roles.length})</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={rolesLoading || permissionsLoading}
            className={cn(
              'p-1 rounded hover:bg-gray-100',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('w-4 h-4 text-gray-500', (rolesLoading || permissionsLoading) && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* 角色列表内容 */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {roles.map((role) => {
          const isSelected = selectedRole?.id === role.id;
          const iconColor = getRoleIconColor(role.code);

          return (
            <div
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={cn(
                'flex items-center justify-between px-4 py-3 cursor-pointer',
                'border-b border-gray-100 last:border-b-0',
                'hover:bg-gray-50 transition-colors',
                isSelected && 'bg-blue-50 border-l-4 border-l-blue-600'
              )}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={cn('p-1.5 rounded', iconColor)}>
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {role.name}
                    </span>
                    {role.isSystem && (
                      <Lock className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {role.permissions.length} 个权限
                    {role.userCount !== undefined && ` · ${role.userCount} 个用户`}
                  </p>
                </div>
              </div>
              <ChevronRight className={cn('w-4 h-4', isSelected ? 'text-blue-600' : 'text-gray-400')} />
            </div>
          );
        })}
      </div>
    </div>
  );

  /**
   * 渲染权限列表
   */
  const renderPermissionList = () => {
    if (!selectedRole) {
      return (
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">请选择一个角色查看权限</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
        {/* 权限列表头部 */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {selectedRole.name} 的权限
              </span>
              <span className="text-xs text-gray-500">
                ({selectedPermissionIds.size} / {permissions.length})
              </span>
            </div>
            {editMode && (
              <div className="text-xs text-gray-500">
                {hasChanges ? (
                  <span className="text-orange-600">有未保存的更改</span>
                ) : (
                  <span>点击权限项进行分配</span>
                )}
              </div>
            )}
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索权限名称、代码或描述"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 text-sm rounded-md border border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              )}
            />
          </div>
        </div>

        {/* 权限列表内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(groupedPermissions).map(([resource, perms]) => {
            const allSelected = perms.every(p => selectedPermissionIds.has(p.id));
            const someSelected = perms.some(p => selectedPermissionIds.has(p.id));

            return (
              <div key={resource} className="mb-4 last:mb-0">
                {/* 资源组头部 */}
                <div
                  onClick={() => editMode && handleResourceGroupToggle(resource, perms.map(p => p.id))}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 mb-2',
                    editMode && 'cursor-pointer hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getResourceDisplayName(resource)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({perms.filter(p => selectedPermissionIds.has(p.id)).length} / {perms.length})
                    </span>
                  </div>
                  {editMode && (
                    <div className="flex items-center">
                      {allSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      ) : someSelected ? (
                        <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-100" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* 权限项列表 */}
                <div className="space-y-1 pl-3">
                  {perms.map((permission) => {
                    const isSelected = selectedPermissionIds.has(permission.id);
                    const isOriginal = rolePermissionIds.has(permission.id);

                    return (
                      <div
                        key={permission.id}
                        onClick={() => handlePermissionToggle(permission.id)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg',
                          'transition-colors',
                          editMode && 'cursor-pointer hover:bg-gray-50',
                          isSelected && 'bg-blue-50'
                        )}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {editMode ? (
                            isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )
                          ) : (
                            <div className="w-4 h-4 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-900">
                                {permission.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {permission.code}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {permission.description || '暂无描述'}
                            </p>
                          </div>
                        </div>
                        {editMode && isOriginal && !isSelected && (
                          <span className="text-xs text-orange-600 ml-2">
                            将移除
                          </span>
                        )}
                        {editMode && !isOriginal && isSelected && (
                          <span className="text-xs text-green-600 ml-2">
                            新增
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 操作按钮 */}
        {editMode && hasChanges && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className={cn(
                'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md',
                'text-gray-700 bg-white border border-gray-300',
                'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <X className="w-4 h-4 mr-2" />
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className={cn(
                'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md',
                'text-white bg-blue-600',
                'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存更改
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  /**
   * 渲染错误状态
   */
  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg border border-gray-200">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        {rolesError || permissionsError || '加载数据时发生错误'}
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
    <div className="flex items-center justify-center py-12 px-4 bg-white rounded-lg border border-gray-200">
      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
      <span className="ml-2 text-sm text-gray-600">加载中...</span>
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
              <h1 className="text-xl font-semibold text-gray-900">角色权限映射</h1>
            </div>
            {editMode && (
              <span className="text-sm text-gray-500">
                点击权限项进行分配
              </span>
            )}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="px-4 py-4 sm:px-6">
        {rolesLoading || permissionsLoading ? (
          renderLoading()
        ) : rolesError || permissionsError ? (
          renderError()
        ) : (
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* 角色列表 */}
            {renderRoleList()}
            
            {/* 权限列表 */}
            {renderPermissionList()}
          </div>
        )}
      </div>
    </div>
  );
};

export default RolePermissionMapping;
