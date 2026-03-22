/**
 * 卡片组件
 * 
 * 统一的卡片样式，支持多种变体和交互效果
 * 包含hover、active状态和动画
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 卡片变体 */
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  /** 内边距 */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** 是否可点击 */
  clickable?: boolean;
  /** 是否选中 */
  selected?: boolean;
  /** 加载状态 */
  loading?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      clickable = false,
      selected = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    // ========== 内边距样式 ==========
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4 sm:p-5',
      lg: 'p-6 sm:p-8',
    };

    // ========== 变体样式 ==========
    const variantStyles = {
      default: cn(
        'bg-white rounded-xl shadow-card',
        'border border-neutral-200'
      ),
      bordered: cn(
        'bg-white rounded-xl',
        'border-2 border-neutral-300'
      ),
      elevated: cn(
        'bg-white rounded-xl shadow-lg',
        'border border-neutral-100'
      ),
      interactive: cn(
        'bg-white rounded-xl shadow-card',
        'border border-neutral-200',
        'cursor-pointer',
        'transition-all duration-200 ease-out',
        'hover:shadow-lg hover:-translate-y-0.5 hover:border-neutral-300',
        'active:translate-y-0 active:shadow-md active:border-neutral-400'
      ),
    };

    return (
      <div
        ref={ref}
        className={cn(
          // 基础样式
          'relative overflow-hidden',
          // 变体样式
          variantStyles[clickable ? 'interactive' : variant],
          // 内边距
          paddingStyles[padding],
          // 选中状态
          selected && 'ring-2 ring-primary-500 border-primary-500',
          // 加载状态
          loading && 'pointer-events-none opacity-60',
          className
        )}
        {...props}
      >
        {/* 加载遮罩 */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="loading-spinner w-6 h-6 border-2 border-primary-500 border-r-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* 内容 */}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ========== 卡片头部 ==========
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 标题 */
  title?: string;
  /** 副标题 */
  subtitle?: string;
  /** 操作区 */
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  title,
  subtitle,
  action,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4',
        'pb-4 mb-4 border-b border-neutral-200',
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-neutral-900 truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0">{action}</div>
      )}
    </div>
  );
};

// ========== 卡片内容 ==========
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

// ========== 卡片底部 ==========
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'pt-4 mt-4 border-t border-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
