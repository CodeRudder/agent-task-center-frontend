/**
 * 角色权限展示组件
 * 
 * 显示角色的所有权限
 * - 显示角色的所有权限
 * - 按资源分组显示权限
 * - 显示权限名称、资源、操作、描述
 * - 支持权限筛选
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  X,
  ChevronDown,
  ChevronRight,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Settings,
  Filter
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Role, Permission, PermissionResource, PermissionAction, PermissionType } from '@/types/user';
import Modal from '../Modal';
import Input from '../Input';

/**
 * RolePermissions组件属性
 */
export interface RolePermissionsProps {
  /** 角色数据 */
  role: Role;
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
}

/**
 * 权限分组（按资源分组）
 */
interface PermissionGroup {
  resource: PermissionResource;
  resourceName: string;
  permissions: Permission[];
}

/**
 * 角色权限展示组件
 */
export const RolePermissions: React.FC<RolePermissionsProps> = ({
  role,
  isOpen,
  onClose,
}) => {
  // ========== 本地状态 ==========
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterResource, setFilterResource] = useState<PermissionResource | ''>('');
  const [filterType, setFilterType] = useState<PermissionType | ''>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<PermissionResource>>(new Set());

  // ========== 数据处理 ==========

  /**
   * 获取资源名称映射
   */
  const getResourceName = (resource: PermissionResource): string => {
    const names: Record<PermissionResource, string> = {
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
   * 获取权限类型名称
   */
  const getPermissionTypeName = (type: PermissionType): string => {
    const names: Record<PermissionType, string> = {
      [PermissionType.MENU]: '菜单权限',
      [PermissionType.ACTION]: '操作权限',
      [PermissionType.DATA]: '数据权限',
      [PermissionType.API]: 'API权限',
    };
    return names[type] || type;
  };

  /**
   * 获取权限操作图标
   */
  const getActionIcon = (action: PermissionAction) => {
    const icons: Record<PermissionAction, React.ReactNode> = {
      [PermissionAction.CREATE]: <Plus className="w-4 h-4 text-green-600" />,
      [PermissionAction.READ]: <Eye className="w-4 h-4 text-blue-600" />,
      [PermissionAction.UPDATE]: <Edit className="w-4 h-4 text-yellow-600" />,
      [PermissionAction.DELETE]: <Trash2 className="w-4 h-4 text-red-600" />,
      [PermissionAction.EXPORT]: <Download className="w-4 h-4 text-purple-600" />,
      [PermissionAction.IMPORT]: <Upload className="w-4 h-4 text-indigo-600" />,
      [PermissionAction.ASSIGN]: <Settings className="w-4 h-4 text-orange-600" />,
    };
    return icons[action] || <Lock className="w-4 h-4 text-gray-600" />;
  };

  /**
   * 按资源分组权限
   */
  const permissionGroups: PermissionGroup[] = useMemo(() => {
    // 先筛选权限
    let filteredPermissions = role.permissions;

    // 关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filteredPermissions = filteredPermissions.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.code.toLowerCase().includes(keyword) ||
          p.description?.toLowerCase().includes(keyword)
      );
    }

    // 资源筛选
    if (filterResource) {
      filteredPermissions = filteredPermissions.filter(
        (p) => p.resource === filterResource
      );
    }

    // 类型筛选
    if (filterType) {
      filteredPermissions = filteredPermissions.filter(
        (p) => p.type === filterType
      );
    }

    // 按资源分组
    const groupMap = new Map<PermissionResource, Permission[]>();
    filteredPermissions.forEach((permission) => {
      const resource = permission.resource;
      if (!groupMap.has(resource)) {
        groupMap.set(resource, []);
      }
      groupMap.get(resource)!.push(permission);
    });

    // 转换为数组并排序
    const groups: PermissionGroup[] = [];
    groupMap.forEach((permissions, resource) => {
      groups.push({
        resource,
        resourceName: getResourceName(resource),
        permissions: permissions.sort((a, b) => a.sortOrder - b.sortOrder),
      });
    });

    return groups.sort((a, b) => a.resource.localeCompare(b.resource));
  }, [role.permissions, searchKeyword, filterResource, filterType]);

  /**
   * 资源选项（用于筛选）
   */
  const resourceOptions = useMemo(() => {
    const resources = Array.from(
      new Set(role.permissions.map((p) => p.resource))
    );
    return [
      { value: '', label: '全部资源' },
      ...resources.map((r) => ({
        value: r,
        label: getResourceName(r),
      })),
    ];
  }, [role.permissions]);

  /**
   * 类型选项（用于筛选）
   */
  const typeOptions = [
    { value: '', label: '全部类型' },
    { value: PermissionType.MENU, label: '菜单权限' },
    { value: PermissionType.ACTION, label: '操作权限' },
    { value: PermissionType.DATA, label: '数据权限' },
    { value: PermissionType.API, label: 'API权限' },
  ];

  // ========== 事件处理 ==========

  /**
   * 切换分组展开/折叠
   */
  const toggleGroup = (resource: PermissionResource) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resource)) {
        newSet.delete(resource);
      } else {
        newSet.add(resource);
      }
      return newSet;
    });
  };

  /**
   * 全部展开
   */
  const expandAll = () => {
    setExpandedGroups(new Set(permissionGroups.map((g) => g.resource)));
  };

  /**
   * 全部折叠
   */
  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  /**
   * 重置筛选
   */
  const handleReset = () => {
    setSearchKeyword('');
    setFilterResource('');
    setFilterType('');
  };

  /**
   * 关闭弹窗时重置状态
   */
  const handleClose = () => {
    handleReset();
    setExpandedGroups(new Set());
    onClose();
  };

  /**
   * 打开弹窗时默认展开所有分组
   */
  useEffect(() => {
    if (isOpen) {
      expandAll();
    }
  }, [isOpen]);

  // ========== 渲染函数 ==========

  /**
   * 渲染权限项
   */
  const renderPermissionItem = (permission: Permission) => {
    return (
      <div
        key={permission.id}
        className={cn(
          'flex items-center justify-between py-3 px-4',
          'hover:bg-gray-50 transition-colors'
        )}
      >
        {/* 权限信息 */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* 操作图标 */}
          <div className="flex-shrink-0">
            {getActionIcon(permission.action)}
          </div>

          {/* 权限详情 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {permission.name}
              </h4>
              <span className="text-xs text-gray-400 font-mono">
                {permission.code}
              </span>
            </div>
            {permission.description && (
              <p className="text-xs text-gray-600 truncate">
                {permission.description}
              </p>
            )}
          </div>
        </div>

        {/* 权限类型 */}
        <div className="flex-shrink-0 ml-4">
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
            permission.type === PermissionType.ACTION && 'bg-blue-50 text-blue-700',
            permission.type === PermissionType.MENU && 'bg-purple-50 text-purple-700',
            permission.type === PermissionType.DATA && 'bg-green-50 text-green-700',
            permission.type === PermissionType.API && 'bg-orange-50 text-orange-700'
          )}>
            {getPermissionTypeName(permission.type)}
          </span>
        </div>
      </div>
    );
  };

  /**
   * 渲染权限分组
   */
  const renderPermissionGroup = (group: PermissionGroup) => {
    const isExpanded = expandedGroups.has(group.resource);

    return (
      <div key={group.resource} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* 分组标题 */}
        <div
          onClick={() => toggleGroup(group.resource)}
          className={cn(
            'flex items-center justify-between px-4 py-3',
            'bg-gray-50 border-b border-gray-200',
            'cursor-pointer hover:bg-gray-100 transition-colors'
          )}
        >
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              {group.resourceName}
            </h3>
            <span className="text-xs text-gray-500">
              ({group.permissions.length})
            </span>
          </div>
        </div>

        {/* 权限列表 */}
        {isExpanded && (
          <div className="divide-y divide-gray-100">
            {group.permissions.map(renderPermissionItem)}
          </div>
        )}
      </div>
    );
  };

  /**
   * 渲染空状态
   */
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Shield className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无权限</h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        {searchKeyword || filterResource || filterType
          ? '没有找到符合条件的权限，请尝试调整筛选条件'
          : '该角色还没有分配任何权限'}
      </p>
      {(searchKeyword || filterResource || filterType) && (
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          重置筛选条件
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${role.name} - 权限列表`}
      size="xl"
    >
      <div className="space-y-4">
        {/* 角色信息 */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {role.name}
              </h3>
              <p className="text-xs text-gray-600">
                @{role.code} · {role.permissions.length} 个权限
              </p>
            </div>
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
          </div>
        </div>

        {/* 筛选区域 */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜索权限名称或代码..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={cn(
                'w-full pl-10 pr-10 py-2 border rounded-lg text-sm',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'border-gray-300'
              )}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 资源筛选 */}
          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value as PermissionResource | '')}
            className={cn(
              'px-3 py-2 border rounded-lg text-sm min-w-[120px]',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'border-gray-300 bg-white'
            )}
          >
            {resourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* 类型筛选 */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as PermissionType | '')}
            className={cn(
              'px-3 py-2 border rounded-lg text-sm min-w-[120px]',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'border-gray-300 bg-white'
            )}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* 重置按钮 */}
          {(searchKeyword || filterResource || filterType) && (
            <button
              onClick={handleReset}
              className={cn(
                'px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg',
                'hover:bg-gray-200 transition-colors whitespace-nowrap'
              )}
            >
              重置
            </button>
          )}
        </div>

        {/* 权限列表 */}
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {permissionGroups.length === 0 ? (
            renderEmpty()
          ) : (
            permissionGroups.map(renderPermissionGroup)
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RolePermissions;
