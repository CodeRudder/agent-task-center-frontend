/**
 * 输入框组件
 * 
 * 统一的输入框样式，支持多种状态和交互效果
 * 包含完整的表单验证状态（默认、错误、成功、禁用）
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 标签 */
  label?: string;
  /** 错误信息 */
  error?: string;
  /** 成功状态 */
  success?: boolean;
  /** 帮助文本 */
  helperText?: string;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 全宽 */
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      size = 'md',
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    // ========== 生成ID ==========
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // ========== 尺寸样式 ==========
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-3 py-2 text-sm min-h-[40px]',
      lg: 'px-4 py-3 text-base min-h-[48px]',
    };

    // ========== 状态样式 ==========
    const stateStyles = error
      ? 'border-error-500 focus:ring-error-500 focus:border-error-500 hover:border-error-600'
      : success
      ? 'border-success-500 focus:ring-success-500 focus:border-success-500 hover:border-success-600'
      : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500 hover:border-neutral-400';

    return (
      <div className={cn(fullWidth ? 'w-full' : 'inline-block')}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              'transition-colors duration-150',
              error ? 'text-error-700' : 'text-neutral-700'
            )}
          >
            {label}
            {props.required && (
              <span className="text-error-500 ml-1">*</span>
            )}
          </label>
        )}

        {/* 输入框容器 */}
        <div className="relative">
          {/* 左侧图标 */}
          {leftIcon && (
            <div 
              className={cn(
                'absolute inset-y-0 left-0 flex items-center pointer-events-none',
                size === 'sm' ? 'pl-2.5' : size === 'lg' ? 'pl-4' : 'pl-3'
              )}
            >
              <span 
                className={cn(
                  'transition-colors duration-150',
                  error ? 'text-error-400' : success ? 'text-success-400' : 'text-neutral-400',
                  'group-focus-within:text-primary-500'
                )}
              >
                {leftIcon}
              </span>
            </div>
          )}

          {/* 输入框 */}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              // 基础样式
              'w-full rounded-lg bg-white',
              'font-sans placeholder:text-neutral-400',
              // 过渡动画
              'transition-all duration-200 ease-out',
              // 焦点样式
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              // 状态样式
              stateStyles,
              // 禁用样式
              'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:border-neutral-200',
              // 尺寸
              sizeStyles[size],
              // 图标padding
              leftIcon && (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-11' : 'pl-10'),
              rightIcon && (size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-11' : 'pr-10'),
              className
            )}
            {...props}
          />

          {/* 右侧图标 */}
          {rightIcon && (
            <div 
              className={cn(
                'absolute inset-y-0 right-0 flex items-center',
                size === 'sm' ? 'pr-2.5' : size === 'lg' ? 'pr-4' : 'pr-3'
              )}
            >
              <span 
                className={cn(
                  'transition-colors duration-150',
                  error ? 'text-error-400' : success ? 'text-success-400' : 'text-neutral-400'
                )}
              >
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <p
            id={errorId}
            className={cn(
              'mt-1.5 text-sm text-error-600',
              'animate-fade-in'
            )}
            role="alert"
          >
            {error}
          </p>
        )}

        {/* 帮助文本 */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-neutral-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
