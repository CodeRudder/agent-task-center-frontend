/**
 * 模态框组件
 * 
 * 支持多种尺寸和动画效果
 * 包含完整的键盘导航和焦点管理
 * 响应式设计，移动端全屏显示
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ModalProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 标题 */
  title?: string;
  /** 子内容 */
  children: React.ReactNode;
  /** 底部操作区 */
  footer?: React.ReactNode;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 点击遮罩层关闭 */
  closeOnOverlayClick?: boolean;
  /** 按ESC键关闭 */
  closeOnEscape?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否全屏（移动端） */
  fullscreenOnMobile?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  fullscreenOnMobile = true,
}) => {
  // ========== 状态管理 ==========
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ========== 尺寸映射 ==========
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  // ========== 动画效果 ==========
  useEffect(() => {
    if (isOpen) {
      // 保存当前焦点元素
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // 打开动画
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
      
      // 聚焦到Modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // 关闭动画
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // 恢复背景滚动
        document.body.style.overflow = 'unset';
        // 恢复焦点
        previousActiveElement.current?.focus();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ========== 键盘事件 ==========
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  // ========== 焦点陷阱 ==========
  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleTab);
    }

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  // ========== 不渲染 ==========
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-modal flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* 遮罩层 */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm',
          'transition-opacity duration-200',
          closeOnOverlayClick && 'cursor-pointer',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal内容 */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative bg-white rounded-xl shadow-modal w-full mx-4',
          'transition-all duration-200 ease-out',
          // 动画状态
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-4',
          // 尺寸
          sizeClasses[size],
          // 响应式：移动端全屏
          fullscreenOnMobile && 'md:rounded-xl md:max-h-[90vh]',
          fullscreenOnMobile && 'rounded-none max-h-screen h-full md:h-auto',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            {title && (
              <h2 
                id="modal-title" 
                className="text-xl font-semibold text-neutral-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'p-2 text-neutral-400 rounded-lg',
                  'transition-all duration-150',
                  'hover:text-neutral-600 hover:bg-neutral-100',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  'active:bg-neutral-200'
                )}
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* 内容区 */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {children}
        </div>

        {/* 底部 */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
