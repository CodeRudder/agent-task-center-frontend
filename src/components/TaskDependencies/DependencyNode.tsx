/**
 * V5.3 依赖关系图 - 自定义任务节点
 * 基于React Flow的Node类型，实现任务节点的自定义样式和交互
 */

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Calendar, User, AlertCircle, CheckCircle2, Clock, PauseCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * 任务状态配置
 */
const STATUS_CONFIG = {
  completed: {
    label: '已完成',
    color: 'bg-green-500',
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
    icon: CheckCircle2,
  },
  in_progress: {
    label: '进行中',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
    icon: Clock,
  },
  blocked: {
    label: '已阻塞',
    color: 'bg-red-500',
    bgColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-700',
    icon: PauseCircle,
  },
  pending: {
    label: '待开始',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50 border-gray-200',
    textColor: 'text-gray-700',
    icon: AlertCircle,
  },
};

/**
 * 优先级配置
 */
const PRIORITY_CONFIG = {
  high: { label: '高', color: 'bg-red-100 text-red-700 border-red-300' },
  medium: { label: '中', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  low: { label: '低', color: 'bg-green-100 text-green-700 border-green-300' },
};

/**
 * DependencyNode组件
 * 显示任务节点的自定义样式
 */
const DependencyNode: React.FC<any> = ({ data, selected }) => {
  const statusConfig = STATUS_CONFIG[data?.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const priorityConfig = PRIORITY_CONFIG[data?.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="relative">
      {/* 输入Handle - 前置任务连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-white"
      />

      {/* 任务卡片 */}
      <Card
        className={cn(
          'min-w-[240px] max-w-[280px] shadow-md transition-all duration-200',
          'hover:shadow-lg hover:scale-[1.02]',
          statusConfig.bgColor,
          selected && 'ring-2 ring-blue-500 ring-offset-2'
        )}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <StatusIcon className={cn('w-5 h-5 flex-shrink-0', statusConfig.textColor)} />
              <h3 className="text-sm font-semibold truncate" title={data?.title}>
                {data?.title || '未命名任务'}
              </h3>
            </div>
            <div className={cn('text-xs px-2 py-0.5 rounded-full border', priorityConfig.color)}>
              {priorityConfig.label}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-2 space-y-2">
          {/* 任务状态 */}
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', statusConfig.color)} />
            <span className={cn('text-xs font-medium', statusConfig.textColor)}>
              {statusConfig.label}
            </span>
          </div>

          {/* 时间信息 */}
          {data?.startDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>
                {data.startDate}
                {data.endDate && ` → ${data.endDate}`}
              </span>
            </div>
          )}

          {/* 负责人 */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <User className="w-3 h-3" />
            <span>负责人ID: {data?.taskId || '未分配'}</span>
          </div>
        </CardContent>
      </Card>

      {/* 输出Handle - 后置任务连接点 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-400 !border-2 !border-white"
      />
    </div>
  );
};

/**
 * 使用memo优化性能，避免不必要的重渲染
 */
export default memo(DependencyNode);
