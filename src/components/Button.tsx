/**
 * 按钮组件
 * 
 * 统一的按钮样式，支持多种变体和尺寸
 * 包含完整的交互状态（hover、active、focus、loading、disabled）
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 加载状态 */
  loading?: boolean;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 全宽按钮 */
  fullWidth?: boolean;
  /** 禁用波纹效果 */
  noRipple?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      noRipple = false,
      ...props
    },
    ref
  ) => {
    // ========== 基础样式 ==========
    const baseStyles = cn(
      // 基础布局
      'inline-flex items-center justify-center font-medium rounded-lg',
      // 过渡动画
      'transition-all duration-200 ease-out',
      // 焦点状态
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      // 禁用状态
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      // 点击动画
      'active:scale-[0.98]',
      // 波纹效果容器
      !noRipple && 'relative overflow-hidden'
    );

    // ========== 变体样式 ==========
    const variants = {
      primary: cn(
        'bg-primary-500 text-white',
        'hover:bg-primary-600 hover:shadow-md',
        'focus:ring-primary-500',
        'active:bg-primary-700'
      ),
      secondary: cn(
        'bg-neutral-100 text-neutral-900',
        'hover:bg-neutral-200 hover:shadow-sm',
        'focus:ring-neutral-400',
        'active:bg-neutral-300'
      ),
      danger: cn(
        'bg-error-500 text-white',
        'hover:bg-error-600 hover:shadow-md',
        'focus:ring-error-500',
        'active:bg-error-700'
      ),
      ghost: cn(
        'bg-transparent text-neutral-700',
        'hover:bg-neutral-100',
        'focus:ring-neutral-400',
        'active:bg-neutral-200'
      ),
      outline: cn(
        'bg-transparent border-2 border-primary-500 text-primary-500',
        'hover:bg-primary-50',
        'focus:ring-primary-500',
        'active:bg-primary-100'
      ),
    };

    // ========== 尺寸样式 ==========
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[32px]',
      md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
      lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]',
    };

    // ========== 渲染图标 ==========
    const renderIcon = (icon: React.ReactNode, position: 'left' | 'right') => {
      if (!icon) return null;
      return (
        <span 
          className={cn(
            'flex-shrink-0 transition-transform duration-200',
            position === 'left' && 'mr-1',
            position === 'right' && 'ml-1'
          )}
        >
          {icon}
        </span>
      );
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading 状态 */}
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        
        {/* 左侧图标 */}
        {!loading && renderIcon(leftIcon, 'left')}
        
        {/* 按钮内容 */}
        <span className="relative z-10">{children}</span>
        
        {/* 右侧图标 */}
        {!loading && renderIcon(rightIcon, 'right')}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
