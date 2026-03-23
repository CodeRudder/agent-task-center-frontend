import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VotingSummary } from '../components/VotingSummary';
import { Search, Filter, Plus, User, Clock, ChevronRight } from 'lucide-react';
import { getTasks, isAuthenticated } from '../services/taskService';
import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

/**
 * 状态标签配置
 */
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  [TaskStatus.PENDING]: {
    label: '待处理',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: '进行中',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  [TaskStatus.COMPLETED]: {
    label: '已完成',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
  },
  [TaskStatus.CANCELLED]: {
    label: '已取消',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
  },
};

/**
 * 优先级标签配置
 */
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dotColor: string }> = {
  [TaskPriority.LOW]: {
    label: '低',
    dotColor: 'bg-gray-400',
  },
  [TaskPriority.MEDIUM]: {
    label: '中',
    dotColor: 'bg-blue-400',
  },
  [TaskPriority.HIGH]: {
    label: '高',
    dotColor: 'bg-orange-400',
  },
  [TaskPriority.URGENT]: {
    label: '紧急',
    dotColor: 'bg-red-400',
  },
};

/**
 * 排序选项
 */
type SortOption = 'createdAt' | 'dueDate' | 'priority' | 'votes';

/**
 * 任务列表页组件属性
 */
export interface TaskListProps {
  /** 自定义任务数据（用于测试或预览） */
  initialTasks?: Task[];
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 是否显示筛选器 */
  showFilters?: boolean;
  /** 是否显示创建按钮 */
  showCreateButton?: boolean;
}

/**
 * 任务列表页组件
 * 
 * 显示任务列表，每个任务卡片包含投票摘要
 * 
 * @example
 * ```tsx
 * <TaskList showSearch showFilters showCreateButton />
 * ```
 */
export const TaskList: React.FC<TaskListProps> = ({
  initialTasks,
  showSearch = true,
  showFilters = true,
  showCreateButton = true,
}) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [loading, setLoading] = useState(!initialTasks);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 获取任务列表（使用真实API）
  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        // 检查是否已登录
        if (!isAuthenticated()) {
          setError('请先登录');
          setLoading(false);
          return;
        }

        // 调用真实API获取任务列表
        const tasks = await getTasks();
        setTasks(tasks);
      } catch (err: any) {
        console.error('Failed to fetch tasks:', err);
        setError(err.message || '获取任务列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [initialTasks]);

  // 过滤和排序任务
  const filteredAndSortedTasks = React.useMemo(() => {
    let result = [...tasks];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }

    // 排序
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'priority':
          const priorityOrder = {
            [TaskPriority.URGENT]: 4,
            [TaskPriority.HIGH]: 3,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.LOW]: 1,
          };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'votes':
          // 投票排序需要从store获取，暂时使用默认排序
          comparison = 0;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, searchQuery, statusFilter, sortBy, sortOrder]);

  // 点击任务卡片
  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  // 点击投票摘要
  const handleVoteSummaryClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" role="status" aria-label="加载中">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">任务列表</h1>
            {showCreateButton && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="创建新任务"
              >
                <Plus className="w-5 h-5" />
                <span>新建任务</span>
              </button>
            )}
          </div>

          {/* 搜索和筛选 */}
          {(showSearch || showFilters) && (
            <div className="flex flex-wrap items-center gap-4">
              {/* 搜索框 */}
              {showSearch && (
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索任务..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="搜索任务"
                  />
                </div>
              )}

              {/* 筛选器 */}
              {showFilters && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="状态筛选"
                    >
                      <option value="all">全部状态</option>
                      <option value={TaskStatus.PENDING}>待处理</option>
                      <option value={TaskStatus.IN_PROGRESS}>进行中</option>
                      <option value={TaskStatus.COMPLETED}>已完成</option>
                      <option value={TaskStatus.CANCELLED}>已取消</option>
                    </select>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="排序方式"
                  >
                    <option value="createdAt">创建时间</option>
                    <option value="dueDate">截止日期</option>
                    <option value="priority">优先级</option>
                    <option value="votes">投票数</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    aria-label={sortOrder === 'asc' ? '升序' : '降序'}
                  >
                    {sortOrder === 'asc' ? '↑ 升序' : '↓ 降序'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 任务列表 */}
      <div className="max-w-4xl mx-auto p-6">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <p className="text-gray-500">暂无任务</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedTasks.map(task => {
              const statusConfig = STATUS_CONFIG[task.status];
              const priorityConfig = PRIORITY_CONFIG[task.priority];

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTaskClick(task.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`查看任务：${task.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleTaskClick(task.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    {/* 左侧：任务信息 */}
                    <div className="flex-1 min-w-0">
                      {/* 第一行：ID + 状态 + 标题 */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-500 flex-shrink-0">
                          #{task.id}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border flex-shrink-0 ${statusConfig.bgColor} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {task.title}
                        </h3>
                      </div>

                      {/* 第二行：描述 */}
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                        {task.description}
                      </p>

                      {/* 第三行：元信息 */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        {/* 优先级 */}
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotColor}`}></span>
                          <span>{priorityConfig.label}优先级</span>
                        </div>

                        {/* 指派人 */}
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{task.assignee}</span>
                          </div>
                        )}

                        {/* 截止日期 */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                          </div>
                        )}

                        {/* 标签 */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            {task.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="text-gray-400">+{task.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 右侧：投票摘要 + 箭头 */}
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      {/* 投票摘要 */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <VotingSummary
                          taskId={task.id}
                          onClick={() => handleVoteSummaryClick(task.id)}
                        />
                      </div>

                      {/* 箭头 */}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部统计 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          共 {filteredAndSortedTasks.length} 个任务
          {statusFilter !== 'all' && ` (已筛选)`}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
