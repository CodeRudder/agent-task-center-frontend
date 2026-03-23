import React from 'react';
import { VoteType } from '../types/vote';

/**
 * 投票按钮组件属性
 */
export interface VoteButtonsProps {
  /** 当前选中的投票类型 */
  selectedVote?: VoteType | null;
  /** 是否加载中 */
  loading?: boolean;
  /** 投票点击回调 */
  onVote: (voteType: VoteType) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示文字标签 */
  showLabels?: boolean;
}

/**
 * 投票按钮组件
 * 
 * 显示3个投票按钮：支持、反对、弃权
 * 支持响应式设计和可访问性
 */
export const VoteButtons: React.FC<VoteButtonsProps> = ({
  selectedVote,
  loading = false,
  onVote,
  disabled = false,
  size = 'md',
  showLabels = true,
}) => {
  // 尺寸样式映射
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  // Emoji尺寸映射
  const emojiSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // 检查按钮是否选中
  const isSelected = (voteType: VoteType): boolean => {
    return selectedVote === voteType;
  };

  // 获取按钮样式
  const getButtonStyle = (voteType: VoteType): string => {
    const baseStyle = `
      rounded-lg border-2 transition-all duration-200 
      flex items-center font-medium
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeStyles[size]}
    `;

    if (isSelected(voteType)) {
      // 已选中：彩色边框和背景
      const selectedColors: Record<VoteType, string> = {
        [VoteType.UPVOTE]: 'bg-green-50 border-green-500 text-green-700 focus:ring-green-500',
        [VoteType.DOWNVOTE]: 'bg-red-50 border-red-500 text-red-700 focus:ring-red-500',
        [VoteType.ABSTAIN]: 'bg-gray-50 border-gray-500 text-gray-700 focus:ring-gray-500',
      };
      return `${baseStyle} ${selectedColors[voteType]}`;
    } else {
      // 未选中：灰色边框
      return `${baseStyle} border-gray-300 bg-white text-gray-600 hover:border-gray-400 focus:ring-gray-400`;
    }
  };

  // 按钮配置
  const voteOptions: Array<{ type: VoteType; emoji: string; label: string; ariaLabel: string }> = [
    { type: VoteType.UPVOTE, emoji: '👍', label: '支持', ariaLabel: '支持此任务' },
    { type: VoteType.DOWNVOTE, emoji: '👎', label: '反对', ariaLabel: '反对此任务' },
    { type: VoteType.ABSTAIN, emoji: '😐', label: '弃权', ariaLabel: '对此任务弃权' },
  ];

  return (
    <div 
      className="flex gap-3" 
      role="group" 
      aria-label="投票按钮组"
    >
      {voteOptions.map(({ type, emoji, label, ariaLabel }) => (
        <button
          key={type}
          type="button"
          onClick={() => onVote(type)}
          disabled={disabled || loading}
          className={getButtonStyle(type)}
          aria-label={ariaLabel}
          aria-pressed={isSelected(type)}
        >
          <span className={emojiSizes[size]} role="img" aria-hidden="true">
            {emoji}
          </span>
          {showLabels && <span>{label}</span>}
        </button>
      ))}

      {/* 加载状态指示器 */}
      {loading && (
        <div className="flex items-center text-sm text-gray-500" aria-live="polite">
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>处理中...</span>
        </div>
      )}
    </div>
  );
};

export default VoteButtons;
