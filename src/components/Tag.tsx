/**
 * 标签组件
 */
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  closable?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', size = 'md', closable, onClose, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      primary: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      success: 'bg-green-100 text-green-800 hover:bg-green-200',
      warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      danger: 'bg-red-100 text-red-800 hover:bg-red-200',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md font-medium transition-colors',
          variantStyles[variant],
          sizeStyles[size],
          closable && 'pr-1',
          className
        )}
        {...props}
      >
        {children}
        {closable && (
          <button
            onClick={onClose}
            className="ml-0.5 hover:opacity-70 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

export default Tag;
