/**
 * 页面切换动画组件
 * 
 * 提供页面切换时的淡入淡出和滑动动画
 * 支持多种动画效果
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

// ========== 页面切换Props ==========
interface PageTransitionProps {
  children: React.ReactNode;
  /** 动画类型 */
  type?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  /** 动画时长（ms） */
  duration?: number;
  /** 延迟（ms） */
  delay?: number;
  /** 自定义类名 */
  className?: string;
  /** 是否显示 */
  show?: boolean;
  /** 动画完成回调 */
  onAnimationEnd?: () => void;
}

// ========== 动画样式映射 ==========
const animationVariants = {
  fade: {
    enter: 'opacity-0',
    enterActive: 'opacity-100 transition-opacity',
    exit: 'opacity-100',
    exitActive: 'opacity-0 transition-opacity',
  },
  'slide-up': {
    enter: 'opacity-0 translate-y-4',
    enterActive: 'opacity-100 translate-y-0 transition-all',
    exit: 'opacity-100 translate-y-0',
    exitActive: 'opacity-0 translate-y-4 transition-all',
  },
  'slide-down': {
    enter: 'opacity-0 -translate-y-4',
    enterActive: 'opacity-100 translate-y-0 transition-all',
    exit: 'opacity-100 translate-y-0',
    exitActive: 'opacity-0 -translate-y-4 transition-all',
  },
  'slide-left': {
    enter: 'opacity-0 translate-x-4',
    enterActive: 'opacity-100 translate-x-0 transition-all',
    exit: 'opacity-100 translate-x-0',
    exitActive: 'opacity-0 translate-x-4 transition-all',
  },
  'slide-right': {
    enter: 'opacity-0 -translate-x-4',
    enterActive: 'opacity-100 translate-x-0 transition-all',
    exit: 'opacity-100 translate-x-0',
    exitActive: 'opacity-0 -translate-x-4 transition-all',
  },
  scale: {
    enter: 'opacity-0 scale-95',
    enterActive: 'opacity-100 scale-100 transition-all',
    exit: 'opacity-100 scale-100',
    exitActive: 'opacity-0 scale-95 transition-all',
  },
};

// ========== 页面切换组件 ==========
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  className,
  show = true,
  onAnimationEnd,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const variant = animationVariants[type];

  useEffect(() => {
    if (show) {
      // 延迟后开始进入动画
      const delayTimer = setTimeout(() => {
        setIsAnimating(true);
      }, delay);
      
      // 进入动画完成后
      const enterTimer = setTimeout(() => {
        setIsVisible(true);
        onAnimationEnd?.();
      }, delay + duration);

      return () => {
        clearTimeout(delayTimer);
        clearTimeout(enterTimer);
      };
    } else {
      setIsAnimating(false);
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(exitTimer);
    }
  }, [show, duration, delay, onAnimationEnd]);

  if (!show && !isAnimating) return null;

  return (
    <div
      className={cn(
        'w-full h-full',
        isAnimating ? variant.enterActive : variant.enter,
        !show && isAnimating && variant.exitActive,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
