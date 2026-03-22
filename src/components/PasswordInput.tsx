/**
 * 密码输入框组件
 * 
 * 扩展Input组件，添加密码显示/隐藏切换功能
 * 包含平滑的图标切换动画
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input, { InputProps } from './Input';
import { cn } from '@/utils/cn';

export interface PasswordInputProps extends Omit<InputProps, 'rightIcon' | 'type'> {
  /** 是否显示切换按钮 */
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        className={className}
        rightIcon={
          showToggle ? (
            <button
              type="button"
              onClick={togglePassword}
              className={cn(
                'pointer-events-auto p-1 rounded-md',
                'text-neutral-400 hover:text-neutral-600',
                'transition-all duration-200 ease-out',
                'hover:bg-neutral-100',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                'active:bg-neutral-200 active:scale-95'
              )}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 animate-fade-in" />
              ) : (
                <Eye className="h-4 w-4 animate-fade-in" />
              )}
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
