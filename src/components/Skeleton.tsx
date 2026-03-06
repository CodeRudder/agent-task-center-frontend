/**
 * 骨架屏组件
 */
import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-md',
    };

    const animationStyles = {
      pulse: 'animate-pulse',
      wave: 'animate-wave',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200',
          variantStyles[variant],
          animationStyles[animation],
          className
        )}
        style={{
          width: width || '100%',
          height: height || (variant === 'text' ? '1em' : '40px'),
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;
