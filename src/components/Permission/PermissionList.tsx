/**
 * 权限列表组件
 * 
 * 显示权限列表，支持按资源分组和筛选
 * - 显示权限列表（所有权限）
 * - 按资源分组显示权限
 * - 显示权限名称、资源、操作、描述
 * - 支持权限筛选（关键词搜索、资源筛选）
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { 
  Shield, 
  Search,
  RefreshCw,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  Lock,
  Eye
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/stores/userStore';
import { UserService } from '@/services/userService';
import { 
  Permission, 
  PermissionResource, 
  PermissionType,
  PermissionAction 
} from '@/types/user';

/**
 * PermissionList组件属性
 */
export interface PermissionListProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 权限点击回调 */
  onPermissionClick?: (permission: Permission) => void;
  /** 显示模式：grouped（分组） | list（列表） */
  displayMode?: 'grouped' | 'list';
}

/**
 * 权限筛选参数
 */
export interface PermissionFilterParams {
  /** 关键词搜索 */
  keyword?: string;
  /** 资源类型筛选 */
  resource?: PermissionResource | '';
  /** 权限类型筛选 */
  type?: PermissionType | '';
}

/**
 * 权限列表组件
 */
export const PermissionList: React.FC<PermissionListProps> = ({
  className,
  showTitle = true,
  onPermissionClick,
  displayMode = 'grouped',
}) => {
  // ========== Store状态 ==========
  const {
    permissions,
    permissionsLoading,
    permissionsError,
    setPermissions,
    setPermissionsLoading,
    setPermissionsError,
  } = useUserStore();

  // ========== 本地状态 ==========
  const [filters, setFilters] = useState<PermissionFilterParams>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // ========== 数据加载 ==========

  /**
   * 加载权限列表
   */
  const loadPermissions = useCallback(async () => {
    try {
      setPermissionsLoading(true);
      setPermissionsError(null);
      const permissionsData = await UserService.getPermissions();
      setPermissions(permissionsData);
      
      // 默认展开所有资源组
      const resourceSet = new Set(permissionsData.map(p => p.resource));
      setExpandedGroups(resourceSet);
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
    if (permissions.length === 0) {
      loadPermissions();
    }
  }, [permissions.length, loadPermissions]);

  // ========== 筛选逻辑 ==========

  /**
   * 筛选后的权限列表
   */
  const filteredPermissions = useMemo(() => {
    let result = permissions;

    // 关键词搜索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.code.toLowerCase().includes(keyword) ||
          (p.description && p.description.toLowerCase().includes(keyword))
      );
    }

    // 资源筛选
    if (filters.resource) {
      result = result.filter((p) => p.resource === filters.resource);
    }

    // 类型筛选
    if (filters.type) {
      result = result.filter((p) => p.type === filters.type);
    }

    return result;
  }, [permissions, filters]);

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

  // ========== 事件处理 ==========

  /**
   * 处理筛选变化
   */
  const handleFilterChange = useCallback((newFilters: PermissionFilterParams) => {
    setFilters(newFilters);
  }, []);

  /**
   * 处理重置筛选
   */
  const handleFilterReset = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    loadPermissions();
  }, [loadPermissions]);

  /**
   * 处理权限点击
   */
  const handlePermissionClick = useCallback((permission: Permission) => {
    onPermissionClick?.(permission);
  }, [onPermissionClick]);

  /**
   * 切换资源组展开/折叠
   */
  const toggleGroup = useCallback((resource: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(resource)) {
        next.delete(resource);
      } else {
        next.add(resource);
      }
      return next;
    });
  }, []);

  /**
   * 展开所有资源组
   */
  const expandAll = useCallback(() => {
    const allResources = new Set(Object.keys(groupedPermissions));
    setExpandedGroups(allResources);
  }, [groupedPermissions]);

  /**
   * 折叠所有资源组
   */
  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  // ========== 工具函数 ==========

  /**
   * 获取权限类型配置
   */
  const getPermissionTypeConfig = (type: PermissionType) => {
    const configs = {
      [PermissionType.MENU]: { label: '菜单', color: 'bg-purple-100 text-purple-800' },
      [PermissionType.ACTION]: { label: '操作', color: 'bg-blue-100 text-blue-800' },
      [PermissionType.DATA]: { label: '数据', color: 'bg-green-100 text-green-800' },
      [PermissionType.API]: { label: 'API', color: 'bg-orange-100 text-orange-800' },
    };
    return configs[type] || configs[PermissionType.ACTION];
  };

  /**
   * 获取权限操作配置
   */
  const getPermissionActionConfig = (action: PermissionAction) => {
    const configs = {
      [PermissionAction.CREATE]: { label: '创建', icon: '✚', color: 'text-green-600' },
      [PermissionAction.READ]: { label: '读取', icon: '👁', color: 'text-blue-600' },
      [PermissionAction.UPDATE]: { label: '更新', icon: '✎', color: 'text-yellow-600' },
      [PermissionAction.DELETE]: { label: '删除', icon: '✗', color: 'text-red-600' },
      [PermissionAction.EXPORT]: { label: '导出', icon: '↗', color: 'text-indigo-600' },
      [PermissionAction.IMPORT]: { label: '导入', icon: '↘', color: 'text-purple-600' },
      [PermissionAction.ASSIGN]: { label: '分配', icon: '→', color: 'text-pink-600' },
    };
    return configs[action] || configs[PermissionAction.READ];
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
   * 获取资源图标颜色
   */
  const getResourceIconColor = (resource: string) => {
    const colors: Record<string, string> = {
      [PermissionResource.USER]: 'text-blue-600 bg-blue-50',
      [PermissionResource.ROLE]: 'text-purple-600 bg-purple-50',
      [PermissionResource.PERMISSION]: 'text-red-600 bg-red-50',
      [PermissionResource.TASK]: 'text-green-600 bg-green-50',
      [PermissionResource.AGENT]: 'text-orange-600 bg-orange-50',
      [PermissionResource.TEMPLATE]: 'text-cyan-600 bg-cyan-50',
      [PermissionResource.DASHBOARD]: 'text-indigo-600 bg-indigo-50',
      [PermissionResource.SYSTEM]: 'text-gray-600 bg-gray-50',
    };
    return colors[resource] || 'text-gray-600 bg-gray-50';
  };

  // ========== 渲染函数 ==========

  /**
   * 渲染筛选区域
   */
  const renderFilters = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      {/* 筛选头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">筛选条件</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={expandAll}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            全部展开
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            全部折叠
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleFilterReset}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            重置
          </button>
        </div>
      </div>

      {/* 筛选字段 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 关键词搜索 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            关键词搜索
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索权限名称、代码或描述"
              value={filters.keyword || ''}
              onChange={(e) =>
                handleFilterChange({ ...filters, keyword: e.target.value })
              }
              className={cn(
                'w-full pl-10 pr-4 py-2 text-sm rounded-md border border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              )}
            />
          </div>
        </div>

        {/* 资源筛选 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            资源类型
          </label>
          <select
            value={filters.resource || ''}
            onChange={(e) =>
              handleFilterChange({
                ...filters,
                resource: e.target.value as PermissionResource | '',
              })
            }
            className={cn(
              'w-full px-3 py-2 text-sm rounded-md border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            )}
          >
            <option value="">全部资源</option>
            {Object.values(PermissionResource).map((resource) => (
              <option key={resource} value={resource}>
                {getResourceDisplayName(resource)}
              </option>
            ))}
          </select>
        </div>

        {/* 类型筛选 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            权限类型
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) =>
              handleFilterChange({
                ...filters,
                type: e.target.value as PermissionType | '',
              })
            }
            className={cn(
              'w-full px-3 py-2 text-sm rounded-md border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            )}
          >
            <option value="">全部类型</option>
            {Object.values(PermissionType).map((type) => (
              <option key={type} value={type}>
                {getPermissionTypeConfig(type).label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  /**
   * 渲染权限项
   */
  const renderPermissionItem = (permission: Permission) => {
    const typeConfig = getPermissionTypeConfig(permission.type);
    const actionConfig = getPermissionActionConfig(permission.action);

    return (
      <div
        key={permission.id}
        onClick={() => handlePermissionClick(permission)}
        className={cn(
          'flex items-center justify-between p-3 rounded-lg border border-gray-100',
          'hover:bg-gray-50 hover:border-blue-200 cursor-pointer transition-all',
          'group'
        )}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* 权限操作图标 */}
          <div className={cn('text-lg', actionConfig.color)} title={actionConfig.label}>
            {actionConfig.icon}
          </div>

          {/* 权限信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
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

        <div className="flex items-center space-x-2">
          {/* 权限类型标签 */}
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              typeConfig.color
            )}
          >
            {typeConfig.label}
          </span>
          
          {/* 查看图标 */}
          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    );
  };

  /**
   * 渲染资源组
   */
  const renderResourceGroup = (resource: string, perms: Permission[]) => {
    const isExpanded = expandedGroups.has(resource);
    const iconColor = getResourceIconColor(resource);

    return (
      <div
        key={resource}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        {/* 资源组头部 */}
        <div
          onClick={() => toggleGroup(resource)}
          className={cn(
            'flex items-center justify-between p-4 cursor-pointer',
            'hover:bg-gray-50 transition-colors',
            'border-b border-gray-200'
          )}
        >
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg', iconColor)}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {getResourceDisplayName(resource)}
              </h3>
              <p className="text-xs text-gray-500">
                {perms.length} 个权限
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* 权限列表 */}
        {isExpanded && (
          <div className="p-4 space-y-2">
            {perms.map((perm) => renderPermissionItem(perm))}
          </div>
        )}
      </div>
    );
  };

  /**
   * 渲染空状态
   */
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg border border-gray-200">
      <Shield className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无权限</h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        {filters.keyword || filters.resource || filters.type
          ? '没有找到符合条件的权限，请尝试调整筛选条件'
          : '系统中还没有权限数据'}
      </p>
      {(filters.keyword || filters.resource || filters.type) && (
        <button
          onClick={handleFilterReset}
          className="text-sm text-blue-600 hover:text-blue-700"
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
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg border border-gray-200">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        {permissionsError || '加载权限列表时发生错误'}
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
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
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
              <h1 className="text-xl font-semibold text-gray-900">权限管理</h1>
              <span className="text-sm text-gray-500">
                ({filteredPermissions.length} 个权限)
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={permissionsLoading}
              className={cn(
                'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md',
                'text-gray-700 bg-white border border-gray-300',
                'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', permissionsLoading && 'animate-spin')} />
              刷新
            </button>
          </div>
        </div>
      )}

      {/* 筛选区域 */}
      <div className="px-4 py-4 sm:px-6">
        {renderFilters()}
      </div>

      {/* 权限列表 */}
      <div className="px-4 sm:px-6 pb-6">
        {permissionsLoading ? (
          renderLoading()
        ) : permissionsError ? (
          renderError()
        ) : filteredPermissions.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedPermissions).map(([resource, perms]) =>
              renderResourceGroup(resource, perms)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionList;
