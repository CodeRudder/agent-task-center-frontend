/**
 * Toast 通知组件
 * 
 * 支持多种类型的通知（success、error、warning、info）
 * 包含进入/退出动画
 * 自动关闭功能
 * 响应式定位
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ToastType, Toast } from '@/hooks/useToast';

// ========== 单个Toast Props ==========
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

// ========== Toast图标映射 ==========
const toastIcons = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  warning: <AlertCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

// ========== Toast样式映射 ==========
const toastStyles = {
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-800',
    icon: 'text-success-500',
    progress: 'bg-success-500',
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-200',
    text: 'text-error-800',
    icon: 'text-error-500',
    progress: 'bg-error-500',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-800',
    icon: 'text-warning-500',
    progress: 'bg-warning-500',
  },
  info: {
    bg: 'bg-info-50',
    border: 'border-info-200',
    text: 'text-info-800',
    icon: 'text-info-500',
    progress: 'bg-info-500',
  },
};

// ========== Toast组件 ==========
export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const styles = toastStyles[toast.type];

  // 进入动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 关闭处理
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  return (
    <div
      role="alert"
      className={cn(
        // 基础样式
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-toast',
        'pointer-events-auto',
        // 颜色
        styles.bg,
        styles.border,
        styles.text,
        // 动画
        'transition-all duration-300 ease-out',
        isEntering && 'opacity-0 translate-x-full',
        !isEntering && !isExiting && 'opacity-100 translate-x-0',
        isExiting && 'opacity-0 translate-x-full scale-95'
      )}
    >
      {/* 图标 */}
      <span className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
        {toastIcons[toast.type]}
      </span>
      
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">{toast.message}</p>
      </div>
      
      {/* 关闭按钮 */}
      <button
        onClick={handleClose}
        className={cn(
          'flex-shrink-0 p-1 rounded-md',
          'opacity-70 hover:opacity-100',
          'transition-opacity duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
        )}
        aria-label="关闭通知"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// ========== Toast容器Props ==========
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  /** 位置 */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

// ========== 位置样式映射 ==========
const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
};

// ========== Toast容器组件 ==========
export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onRemove,
  position = 'top-right'
}) => {
  return (
    <div
      className={cn(
        'fixed z-toast pointer-events-none',
        'flex flex-col gap-2 max-w-md w-full',
        // 响应式padding
        'px-4 sm:px-0',
        // 位置
        positionStyles[position]
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;
