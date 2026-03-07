/**
 * StatusHistory - 状态历史时间线组件
 * 显示任务的状态变更历史记录
 */
import React from 'react';
import { StatusHistoryItem } from '@/types/task';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface StatusHistoryProps {
  histories: StatusHistoryItem[];
  loading?: boolean;
}

/**
 * 状态配置信息
 */
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  todo: { label: '待办', color: 'bg-gray-100 text-gray-800', icon: '📋' },
  in_progress: { label: '进行中', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  review: { label: '审核中', color: 'bg-purple-100 text-purple-800', icon: '👀' },
  done: { label: '已完成', color: 'bg-green-100 text-green-800', icon: '✅' },
  blocked: { label: '已阻塞', color: 'bg-red-100 text-red-800', icon: '🚫' },
};

/**
 * 格式化时间
 */
const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
  } catch (error) {
    return dateString;
  }
};

export const StatusHistory: React.FC<StatusHistoryProps> = ({
  histories,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="status-history">
        <h3 className="text-lg font-semibold mb-4">状态变更历史</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-0.5 h-full bg-gray-200 mt-2" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!histories || histories.length === 0) {
    return (
      <div className="status-history">
        <h3 className="text-lg font-semibold mb-4">状态变更历史</h3>
        <div className="text-center py-8 text-gray-500">
          <p>暂无状态变更历史</p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-history">
      <h3 className="text-lg font-semibold mb-4">状态变更历史</h3>
      <div className="space-y-6">
        {histories.map((item, index) => {
          const oldConfig = STATUS_CONFIG[item.oldStatus];
          const newConfig = STATUS_CONFIG[item.newStatus];
          const isLast = index === histories.length - 1;

          return (
            <div key={item.id} className="flex gap-4">
              {/* 时间线标记 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    item.newStatus === 'done'
                      ? 'bg-green-500'
                      : item.newStatus === 'blocked'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                />
                {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
              </div>

              {/* 状态变更内容 */}
              <div className="flex-1 pb-6">
                {/* 状态变更 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${oldConfig.color}`}>
                    <span className="mr-1">{oldConfig.icon}</span>
                    {oldConfig.label}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${newConfig.color}`}>
                    <span className="mr-1">{newConfig.icon}</span>
                    {newConfig.label}
                  </span>
                </div>

                {/* 变更人和时间 */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                  <span className="flex items-center">
                    {item.changedByType === 'user' ? (
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    {item.changerName || item.changedBy}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatTime(item.changedAt)}
                  </span>
                </div>

                {/* 变更原因 */}
                {item.reason && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">原因：</span>
                      {item.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusHistory;
