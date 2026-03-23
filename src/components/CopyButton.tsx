import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * 复制按钮组件属性
 */
export interface CopyButtonProps {
  /** 要复制的文本 */
  text: string;
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示文本提示 */
  showTooltip?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 复制按钮组件
 * 
 * 点击复制文本到剪贴板，并显示成功提示
 * 
 * @example
 * ```tsx
 * <CopyButton text="task-123" size="sm" />
 * ```
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  size = 'sm',
  showTooltip = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // 复制到剪贴板
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    e.preventDefault(); // 阻止默认行为

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // 2秒后重置状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      // 如果复制失败，可以尝试使用备用方法
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
    }
  };

  // 根据大小设置样式
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleCopy}
        className={`
          ${buttonSizeClasses[size]}
          rounded
          transition-colors
          ${copied 
            ? 'text-green-600 hover:text-green-700' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          ${className}
        `}
        aria-label={copied ? '已复制' : '复制任务ID'}
        title={copied ? '已复制' : '复制任务ID'}
      >
        {copied ? (
          <Check className={sizeClasses[size]} />
        ) : (
          <Copy className={sizeClasses[size]} />
        )}
      </button>

      {/* 复制成功提示 */}
      {showTooltip && copied && (
        <div className="
          absolute 
          bottom-full 
          left-1/2 
          transform 
          -translate-x-1/2 
          mb-2
          px-2 
          py-1 
          text-xs 
          font-medium 
          text-white 
          bg-green-600 
          rounded 
          shadow-lg
          whitespace-nowrap
          z-50
          animate-fade-in
        ">
          已复制！
          <div className="
            absolute 
            top-full 
            left-1/2 
            transform 
            -translate-x-1/2 
            border-4 
            border-transparent 
            border-t-green-600
          " />
        </div>
      )}
    </div>
  );
};

export default CopyButton;
