import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VotingArea } from '../components/VotingArea';
import { CopyButton } from '../components/CopyButton';
import { ArrowLeft, Clock, User, Tag, CheckCircle } from 'lucide-react';
import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';
import { getTaskById } from '../services/taskService';

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
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dotColor: string }> = {
  [TaskPriority.LOW]: {
    label: '低',
    color: 'text-gray-600',
    dotColor: 'bg-gray-400',
  },
  [TaskPriority.MEDIUM]: {
    label: '中',
    color: 'text-blue-600',
    dotColor: 'bg-blue-400',
  },
  [TaskPriority.HIGH]: {
    label: '高',
    color: 'text-orange-600',
    dotColor: 'bg-orange-400',
  },
  [TaskPriority.URGENT]: {
    label: '紧急',
    color: 'text-red-600',
    dotColor: 'bg-red-400',
  },
};

/**
 * 任务详情页组件属性
 */
export interface TaskDetailProps {
  /** 总用户数（用于投票参与率计算） */
  totalUsers?: number;
  /** 自定义任务数据（用于测试或预览） */
  initialTask?: Task;
}

/**
 * 任务详情页组件
 * 
 * 显示任务详细信息，包括投票区域
 * 
 * @example
 * ```tsx
 * <TaskDetail totalUsers={25} />
 * ```
 */
export const TaskDetail: React.FC<TaskDetailProps> = ({
  totalUsers = 0,
  initialTask,
}) => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(initialTask || null);
  const [loading, setLoading] = useState(!initialTask);
  const [error, setError] = useState<string | null>(null);

  // 获取任务详情（模拟API调用）
  useEffect(() => {
    if (initialTask) {
      setTask(initialTask);
      setLoading(false);
      return;
    }

    if (!taskId) {
      setError('任务ID不存在');
      setLoading(false);
      return;
    }

    // 使用真实API调用获取任务详情
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);

        // 调用真实的API获取任务详情
        const taskData = await getTaskById(taskId);
        setTask(taskData);
      } catch (err: any) {
        console.error('Failed to fetch task:', err);
        setError(err.message || '获取任务详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, initialTask]);

  // 返回任务列表
  const handleBack = () => {
    navigate('/tasks');
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" role="status" aria-label="加载中">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-20 bg-gray-200 rounded mb-6"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !task) {
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
            <p className="text-gray-600 mb-4">{error || '任务不存在'}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回任务列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[task.status];
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="返回任务列表"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回任务列表</span>
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto p-6">
        {/* 任务标题和元信息 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* 任务ID和标题 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mono text-gray-500">#{task.shortId || task.id.slice(0, 8)}</span>
                  <CopyButton 
                    text={`#${task.shortId || task.id.slice(0, 8)}`}
                    size="sm"
                    showTooltip={true}
                  />
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusConfig.bgColor} ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            </div>
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {/* 优先级 */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${priorityConfig.dotColor}`}></span>
              <span className={priorityConfig.color}>优先级：{priorityConfig.label}</span>
            </div>

            {/* 指派人 */}
            {task.assignee && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>指派给：<span className="font-medium text-gray-900">{task.assignee}</span></span>
              </div>
            )}

            {/* 创建者 */}
            {task.creator && (
              <div className="flex items-center gap-1.5">
                <span>创建者：<span className="font-medium text-gray-900">{task.creator}</span></span>
              </div>
            )}

            {/* 截止日期 */}
            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>截止：<span className="font-medium text-gray-900">
                  {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                </span></span>
              </div>
            )}
          </div>

          {/* 标签 */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Tag className="w-4 h-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 任务描述 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            任务描述
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            {task.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* 投票区域 */}
        <VotingArea taskId={task.id} totalUsers={totalUsers} />

        {/* 底部时间信息 */}
        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>创建于 {new Date(task.createdAt).toLocaleString('zh-CN')}</p>
          {task.updatedAt && <p>最后更新于 {new Date(task.updatedAt).toLocaleString('zh-CN')}</p>}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
