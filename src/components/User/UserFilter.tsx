/**
 * 用户筛选组件
 * 
 * 提供用户列表的筛选功能
 * - 角色筛选下拉框
 * - 状态筛选下拉框
 * - 搜索输入框
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { UserStatus, Role } from '@/types/user';

/**
 * 筛选参数接口
 */
export interface UserFilterParams {
  keyword?: string;      // 搜索关键词（用户名/邮箱）
  status?: UserStatus;   // 状态筛选
  roleId?: string;       // 角色筛选
}

/**
 * UserFilter组件属性
 */
export interface UserFilterProps {
  /** 当前筛选参数 */
  filters: UserFilterParams;
  /** 角色列表（用于角色筛选） */
  roles: Role[];
  /** 筛选变化回调 */
  onFilterChange: (filters: UserFilterParams) => void;
  /** 重置筛选回调 */
  onReset?: () => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 用户筛选组件
 * 
 * 功能：
 * 1. 关键词搜索（用户名/邮箱）
 * 2. 角色筛选
 * 3. 状态筛选
 * 4. 重置筛选
 */
export const UserFilter: React.FC<UserFilterProps> = ({
  filters,
  roles,
  onFilterChange,
  onReset,
  className,
}) => {
  // 状态选项
  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: UserStatus.ACTIVE, label: '活跃' },
    { value: UserStatus.INACTIVE, label: '未激活' },
    { value: UserStatus.SUSPENDED, label: '已停用' },
    { value: UserStatus.LOCKED, label: '已锁定' },
  ];

  // 角色选项（动态生成）
  const roleOptions = [
    { value: '', label: '全部角色' },
    ...roles.map((role) => ({
      value: role.id,
      label: role.name,
    })),
  ];

  /**
   * 处理关键词搜索
   */
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      keyword: e.target.value,
    });
  };

  /**
   * 处理状态筛选变化
   */
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as UserStatus | '';
    onFilterChange({
      ...filters,
      status: value || undefined,
    });
  };

  /**
   * 处理角色筛选变化
   */
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      roleId: value || undefined,
    });
  };

  /**
   * 清空搜索关键词
   */
  const handleClearKeyword = () => {
    onFilterChange({
      ...filters,
      keyword: '',
    });
  };

  /**
   * 重置所有筛选
   */
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onFilterChange({});
    }
  };

  /**
   * 判断是否有筛选条件
   */
  const hasFilters = filters.keyword || filters.status || filters.roleId;

  return (
    <div className={cn('bg-white rounded-lg shadow-sm p-4', className)}>
      {/* 移动端：垂直布局 */}
      <div className="flex flex-col space-y-3 md:hidden">
        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={filters.keyword || ''}
            onChange={handleKeywordChange}
            className={cn(
              'w-full pl-10 pr-10 py-2 border rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'border-gray-300'
            )}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          {filters.keyword && (
            <button
              onClick={handleClearKeyword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 状态筛选 */}
        <select
          value={filters.status || ''}
          onChange={handleStatusChange}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'border-gray-300 bg-white'
          )}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 角色筛选 */}
        <select
          value={filters.roleId || ''}
          onChange={handleRoleChange}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'border-gray-300 bg-white'
          )}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 重置按钮 */}
        {hasFilters && (
          <button
            onClick={handleReset}
            className={cn(
              'w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg',
              'hover:bg-gray-200 transition-colors'
            )}
          >
            重置筛选
          </button>
        )}
      </div>

      {/* 桌面端：水平布局 */}
      <div className="hidden md:flex md:items-center md:space-x-3">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={filters.keyword || ''}
            onChange={handleKeywordChange}
            className={cn(
              'w-full pl-10 pr-10 py-2 border rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'border-gray-300'
            )}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          {filters.keyword && (
            <button
              onClick={handleClearKeyword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 状态筛选 */}
        <select
          value={filters.status || ''}
          onChange={handleStatusChange}
          className={cn(
            'px-3 py-2 border rounded-lg text-sm min-w-[120px]',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'border-gray-300 bg-white'
          )}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 角色筛选 */}
        <select
          value={filters.roleId || ''}
          onChange={handleRoleChange}
          className={cn(
            'px-3 py-2 border rounded-lg text-sm min-w-[120px]',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'border-gray-300 bg-white'
          )}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 重置按钮 */}
        {hasFilters && (
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
    </div>
  );
};

export default UserFilter;
