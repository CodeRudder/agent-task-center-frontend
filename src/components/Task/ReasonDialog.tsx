/**
 * ReasonDialog - 原因输入对话框组件
 * 用于状态流转时需要填写原因的场景
 */
import React from 'react';
import { TaskStatus } from '@/types/task';

interface ReasonDialogProps {
  isOpen: boolean;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  targetStatus?: TaskStatus;
}

/**
 * 状态配置信息
 */
const STATUS_CONFIG: Record<string, { label: string }> = {
  todo: { label: '待办' },
  in_progress: { label: '进行中' },
  review: { label: '审核中' },
  done: { label: '已完成' },
  blocked: { label: '已阻塞' },
};

export const ReasonDialog: React.FC<ReasonDialogProps> = ({
  isOpen,
  onSubmit,
  onCancel,
  isLoading = false,
  targetStatus,
}) => {
  const [reason, setReason] = React.useState('');

  // 对话框关闭时重置表单
  React.useEffect(() => {
    if (!isOpen) {
      setReason('');
    }
  }, [isOpen]);

  /**
   * 处理提交
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
    }
  };

  /**
   * 处理取消
   */
  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  if (!isOpen) {
    return null;
  }

  const targetStatusLabel = targetStatus ? STATUS_CONFIG[targetStatus]?.label : '新状态';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      />

      {/* 对话框内容 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* 标题 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            状态变更原因
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            请输入将任务流转到「{targetStatusLabel}」的原因
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              原因 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入状态变更的原因..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length} / 500 字符
            </p>
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '提交中...' : '确认变更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReasonDialog;
