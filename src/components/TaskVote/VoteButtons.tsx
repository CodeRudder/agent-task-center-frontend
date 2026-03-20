/**
 * 投票按钮组件 - V5.5
 * 提供支持、反对、弃权三种投票按钮
 */
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { VoteType } from '@/types/vote';
import { useVoteStore } from '@/stores/voteStore';

export interface VoteButtonsProps {
  taskId: string;
  disabled?: boolean;
  onVoteSuccess?: (voteType: VoteType) => void;
  onVoteError?: (error: Error) => void;
  className?: string;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  taskId,
  disabled = false,
  onVoteSuccess,
  onVoteError,
  className,
}) => {
  const { voteTask, userVotes, isLoading } = useVoteStore();
  const [localLoading, setLocalLoading] = useState(false);
  
  const currentVote = userVotes[taskId];

  const handleVote = async (voteType: VoteType) => {
    if (disabled || isLoading || localLoading) {
      return;
    }

    setLocalLoading(true);
    try {
      await voteTask(taskId, voteType);
      onVoteSuccess?.(voteType);
    } catch (error) {
      onVoteError?.(error as Error);
    } finally {
      setLocalLoading(false);
    }
  };

  const isDisabled = disabled || isLoading || localLoading;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* 支持按钮 */}
      <button
        onClick={() => handleVote('support')}
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
          currentVote === 'support'
            ? 'border-green-500 bg-green-50 text-green-600 hover:bg-green-100 focus:ring-green-500'
            : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50 focus:ring-green-500',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="投票支持"
        aria-pressed={currentVote === 'support'}
      >
        <span className="text-lg">👍</span>
        <span>支持</span>
        {currentVote === 'support' && <span className="text-green-600">✓</span>}
      </button>

      {/* 反对按钮 */}
      <button
        onClick={() => handleVote('oppose')}
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
          currentVote === 'oppose'
            ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500'
            : 'border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50 focus:ring-red-500',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="投票反对"
        aria-pressed={currentVote === 'oppose'}
      >
        <span className="text-lg">👎</span>
        <span>反对</span>
        {currentVote === 'oppose' && <span className="text-red-600">✗</span>}
      </button>

      {/* 弃权按钮 */}
      <button
        onClick={() => handleVote('abstain')}
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
          currentVote === 'abstain'
            ? 'border-gray-500 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="投票弃权"
        aria-pressed={currentVote === 'abstain'}
      >
        <span className="text-lg">😐</span>
        <span>弃权</span>
        {currentVote === 'abstain' && <span className="text-gray-700">○</span>}
      </button>
    </div>
  );
};

export default VoteButtons;
