/**
 * 状态徽章组件
 */
import React from 'react';
import { cn } from '@/utils/cn';

export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'success' | 'error' | 'warning' | 'info';
  text?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, size = 'md' }) => {
  const statusConfig = {
    online: {
      icon: '🟢',
      text: '在线',
      className: 'bg-green-100 text-green-800',
    },
    offline: {
      icon: '⚪',
      text: '离线',
      className: 'bg-gray-100 text-gray-800',
    },
    busy: {
      icon: '🟡',
      text: '忙碌',
      className: 'bg-yellow-100 text-yellow-800',
    },
    success: {
      icon: '✓',
      text: '成功',
      className: 'bg-green-100 text-green-800',
    },
    error: {
      icon: '✗',
      text: '错误',
      className: 'bg-red-100 text-red-800',
    },
    warning: {
      icon: '⚠',
      text: '警告',
      className: 'bg-yellow-100 text-yellow-800',
    },
    info: {
      icon: 'ℹ',
      text: '信息',
      className: 'bg-blue-100 text-blue-800',
    },
  };

  const config = statusConfig[status];
  const displayText = text || config.text;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.className,
        sizeClasses[size]
      )}
    >
      <span>{config.icon}</span>
      <span>{displayText}</span>
    </span>
  );
};

export default StatusBadge;
