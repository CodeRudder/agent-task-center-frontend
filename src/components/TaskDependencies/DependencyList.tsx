/**
 * V5.3 依赖关系列表组件
 * 以列表形式展示任务的依赖关系
 * 支持过滤、搜索和批量操作
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Link, Link2Off } from 'lucide-react';
import { useDependencyStore } from '../../stores/dependencyStore';

/**
 * 依赖关系项组件属性
 */
interface DependencyItemProps {
  dependency: {
    id: string;
    taskId: string;
    taskTitle?: string;
    dependsOnTaskId: string;
    dependsOnTaskTitle?: string;
    dependencyType: string;
    status?: 'active' | 'blocked' | 'completed';
  };
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

/**
 * 依赖关系项组件
 */
const DependencyItem: React.FC<DependencyItemProps> = ({
  dependency,
  onDelete,
  onEdit,
}) => {
  const statusColors: Record<string, string> = {
    active: 'text-blue-600 bg-blue-50',
    blocked: 'text-red-600 bg-red-50',
    completed: 'text-green-600 bg-green-50',
  };

  const statusLabels: Record<string, string> = {
    active: '进行中',
    blocked: '已阻塞',
    completed: '已完成',
  };

  const typeLabels: Record<string, string> = {
    FS: '完成-开始 (FS)',
    SS: '开始-开始 (SS)',
    FF: '完成-完成 (FF)',
    SF: '开始-完成 (SF)',
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 依赖关系信息 */}
          <div className="flex items-center gap-2 mb-2">
            <Link className="h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {dependency.taskTitle || dependency.taskId}
            </span>
            <span className="text-gray-400">依赖于</span>
            <span className="font-medium">
              {dependency.dependsOnTaskTitle || dependency.dependsOnTaskId}
            </span>
          </div>

          {/* 类型和状态 */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              {typeLabels[dependency.dependencyType] || dependency.dependencyType}
            </span>
            {dependency.status && (
              <span className={`px-2 py-0.5 rounded ${statusColors[dependency.status]}`}>
                {statusLabels[dependency.status]}
              </span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded hover:bg-gray-200"
            onClick={() => onEdit?.(dependency.id)}
            title="编辑"
          >
            <Link2Off className="h-4 w-4 text-gray-600" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-red-100"
            onClick={() => onDelete?.(dependency.id)}
            title="删除"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * DependencyList组件属性
 */
interface DependencyListProps {
  /** 任务ID（可选，用于显示特定任务的依赖关系） */
  taskId?: string;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 是否显示过滤器 */
  showFilter?: boolean;
  /** 是否显示批量操作 */
  showBatchActions?: boolean;
  /** 类名 */
  className?: string;
}

/**
 * DependencyList组件
 * 以列表形式展示依赖关系
 */
const DependencyList: React.FC<DependencyListProps> = ({
  taskId,
  showSearch = true,
  showFilter = true,
  showBatchActions = true,
  className = '',
}) => {
  const { dependencies, removeDependency } = useDependencyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /**
   * 过滤后的依赖关系列表
   */
  const filteredDependencies = useMemo(() => {
    let filtered = dependencies;

    // 如果指定了taskId，只显示该任务的依赖关系
    if (taskId) {
      filtered = filtered.filter(
        (dep) => dep.taskId === taskId || dep.dependsOnTaskId === taskId
      );
    }

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(
        (dep) =>
          dep.taskId.includes(searchQuery) ||
          dep.dependsOnTaskId.includes(searchQuery)
      );
    }

    // 状态过滤
    if (filterStatus !== 'all') {
      // TODO: 实现状态过滤逻辑
    }

    return filtered;
  }, [dependencies, taskId, searchQuery, filterStatus]);

  /**
   * 处理删除
   */
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个依赖关系吗？')) {
      removeDependency(id);
    }
  };

  /**
   * 处理批量删除
   */
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.size} 个依赖关系吗？`)) {
      selectedIds.forEach((id) => removeDependency(id));
      setSelectedIds(new Set());
    }
  };

  /**
   * 切换选择
   */
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDependencies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDependencies.map((dep) => dep.id)));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 搜索和过滤 */}
      {(showSearch || showFilter) && (
        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索依赖关系..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {showFilter && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="active">进行中</option>
              <option value="blocked">已阻塞</option>
              <option value="completed">已完成</option>
            </select>
          )}
        </div>
      )}

      {/* 批量操作 */}
      {showBatchActions && selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            已选择 {selectedIds.size} 项
          </span>
          <button
            onClick={handleBatchDelete}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded"
          >
            批量删除
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            取消选择
          </button>
        </div>
      )}

      {/* 列表 */}
      {filteredDependencies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery || filterStatus !== 'all'
            ? '没有找到匹配的依赖关系'
            : '暂无依赖关系'}
        </div>
      ) : (
        <div className="space-y-2">
          {/* 全选复选框 */}
          <div className="flex items-center gap-2 px-2">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredDependencies.length}
              onChange={toggleSelectAll}
              className="rounded"
            />
            <span className="text-sm text-gray-600">全选</span>
          </div>

          {/* 依赖关系列表 */}
          {filteredDependencies.map((dep) => (
            <div key={dep.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={selectedIds.has(dep.id)}
                onChange={() => toggleSelect(dep.id)}
                className="mt-4 rounded"
              />
              <div className="flex-1">
                <DependencyItem
                  dependency={{
                    id: dep.id,
                    taskId: dep.taskId,
                    dependsOnTaskId: dep.dependsOnTaskId,
                    dependencyType: dep.dependencyType,
                  }}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      {filteredDependencies.length > 0 && (
        <div className="text-sm text-gray-500 text-right">
          共 {filteredDependencies.length} 个依赖关系
        </div>
      )}
    </div>
  );
};

export default DependencyList;
export type { DependencyListProps, DependencyItemProps };
