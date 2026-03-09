/**
 * 密码输入框组件
 */
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input, { InputProps } from './Input';

export interface PasswordInputProps extends InputProps {
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          showToggle ? (
            <button
              type="button"
              onClick={togglePassword}
              className="pointer-events-auto text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
