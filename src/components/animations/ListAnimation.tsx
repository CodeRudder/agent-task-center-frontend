/**
 * 列表动画组件
 * 
 * 为列表项添加交错进入动画
 * 支持展开/折叠动画
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/utils/cn';

// ========== 列表项动画Props ==========
interface ListItemAnimationProps {
  children: React.ReactNode;
  /** 动画延迟（ms） */
  delay?: number;
  /** 索引（用于交错动画） */
  index?: number;
  /** 是否显示 */
  show?: boolean;
  /** 自定义类名 */
  className?: string;
}

// ========== 列表项动画组件 ==========
export const ListItemAnimation: React.FC<ListItemAnimationProps> = ({
  children,
  delay = 50,
  index = 0,
  show = true,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, index * delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, index, delay]);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-2',
        className
      )}
    >
      {children}
    </div>
  );
};

// ========== 列表容器Props ==========
interface AnimatedListProps {
  children: React.ReactNode[];
  /** 每项延迟（ms） */
  staggerDelay?: number;
  /** 自定义类名 */
  className?: string;
  /** 是否显示 */
  show?: boolean;
}

// ========== 动画列表容器 ==========
export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDelay = 50,
  className,
  show = true,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {React.Children.map(children, (child, index) => (
        <ListItemAnimation
          key={index}
          index={index}
          delay={staggerDelay}
          show={show}
        >
          {child}
        </ListItemAnimation>
      ))}
    </div>
  );
};

// ========== 展开/折叠Props ==========
interface CollapseProps {
  children: React.ReactNode;
  /** 是否展开 */
  isOpen: boolean;
  /** 动画时长（ms） */
  duration?: number;
  /** 自定义类名 */
  className?: string;
}

// ========== 展开/折叠组件 ==========
export const Collapse: React.FC<CollapseProps> = ({
  children,
  isOpen,
  duration = 300,
  className,
}) => {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight);
    }
  }, [children]);

  return (
    <div
      className={cn(
        'overflow-hidden transition-all ease-out',
        className
      )}
      style={{
        height: isOpen ? height : 0,
        opacity: isOpen ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      <div ref={ref}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedList;
