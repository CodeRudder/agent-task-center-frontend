/**
 * StatusActions - 状态流转按钮组组件
 * 显示当前状态和可流转的下一个状态按钮
 */
import React from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { ReasonDialog } from './ReasonDialog';

interface StatusActionsProps {
  taskId: string;
  currentStatus: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  disabled?: boolean;
}

/**
 * 状态配置信息
 */
const STATUS_CONFIG: Record<string, { label: string; color: string; badgeColor: string; icon: string }> = {
  todo: {
    label: '待办',
    color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    badgeColor: 'bg-gray-200 text-gray-800',
    icon: '📋',
  },
  in_progress: {
    label: '进行中',
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    badgeColor: 'bg-blue-200 text-blue-800',
    icon: '🔄',
  },
  review: {
    label: '审核中',
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    badgeColor: 'bg-purple-200 text-purple-800',
    icon: '👀',
  },
  done: {
    label: '已完成',
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
    badgeColor: 'bg-green-200 text-green-800',
    icon: '✅',
  },
  blocked: {
    label: '已阻塞',
    color: 'bg-red-100 text-red-800 hover:bg-red-200',
    badgeColor: 'bg-red-200 text-red-800',
    icon: '🚫',
  },
};

export const StatusActions: React.FC<StatusActionsProps> = ({
  taskId,
  currentStatus,
  disabled = false,
}) => {
  const { getNextStatuses, updateTaskStatus, requireReason } = useTaskStore();
  const [showReasonDialog, setShowReasonDialog] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<'todo' | 'in_progress' | 'review' | 'done' | 'blocked' | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const nextStatuses = getNextStatuses(currentStatus);

  /**
   * 处理状态变更
   * @param newStatus 新状态
   * @param requireReasonFlag 是否需要填写原因
   */
  const handleStatusChange = async (newStatus: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked', requireReasonFlag: boolean) => {
    if (requireReasonFlag) {
      setSelectedStatus(newStatus);
      setShowReasonDialog(true);
    } else {
      setIsLoading(true);
      try {
        await updateTaskStatus(taskId, newStatus);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * 提交原因对话框
   */
  const handleReasonSubmit = async (reason: string) => {
    if (selectedStatus) {
      setIsLoading(true);
      try {
        await updateTaskStatus(taskId, selectedStatus, reason);
        setShowReasonDialog(false);
        setSelectedStatus(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * 取消原因对话框
   */
  const handleReasonCancel = () => {
    setShowReasonDialog(false);
    setSelectedStatus(null);
  };

  const currentConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.todo;

  return (
    <div className="status-actions">
      {/* 当前状态 */}
      <div className="current-status mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentConfig.badgeColor}`}>
          <span className="mr-1.5">{currentConfig.icon}</span>
          {currentConfig.label}
        </span>
      </div>

      {/* 可流转的下一个状态按钮组 */}
      {!disabled && nextStatuses.length > 0 && (
        <div className="next-statuses">
          <p className="text-sm text-gray-600 mb-2">流转到：</p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => {
              const config = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
              const requireReasonFlag = requireReason(currentStatus, status);
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status, requireReasonFlag)}
                  disabled={isLoading}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isLoading
                      ? 'opacity-50 cursor-not-allowed'
                      : `${config.color} cursor-pointer`
                  }`}
                  title={requireReasonFlag ? '需要填写原因' : config.label}
                >
                  <span className="mr-1.5">{config.icon}</span>
                  {config.label}
                  {requireReasonFlag && <span className="ml-1 text-xs">* </span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 原因输入对话框 */}
      {showReasonDialog && selectedStatus && (
        <ReasonDialog
          isOpen={showReasonDialog}
          onSubmit={handleReasonSubmit}
          onCancel={handleReasonCancel}
          isLoading={isLoading}
          targetStatus={selectedStatus}
        />
      )}
    </div>
  );
};

export default StatusActions;
