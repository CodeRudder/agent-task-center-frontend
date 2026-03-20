/**
 * 投票统计显示组件 - V5.5
 * 显示任务的投票统计信息
 */
import React from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { VoteStats as VoteStatsType } from '@/types/vote';
import { useVoteStore } from '@/stores/voteStore';

export interface VoteStatsProps {
  taskId: string;
  stats?: VoteStatsType;
  showTotal?: boolean;
  className?: string;
}

export const VoteStats: React.FC<VoteStatsProps> = ({
  taskId,
  stats: externalStats,
  showTotal = true,
  className,
}) => {
  const { voteStats, loadVoteStats } = useVoteStore();

  // 优先使用外部传入的统计，否则使用store中的统计
  const stats = externalStats || voteStats[taskId];

  React.useEffect(() => {
    // 如果没有传入外部统计，且store中也没有，则加载统计
    if (!externalStats && !voteStats[taskId]) {
      loadVoteStats(taskId);
    }
  }, [taskId, externalStats, voteStats, loadVoteStats]);

  if (!stats) {
    return null;
  }

  // 计算百分比
  const supportPercentage = stats.total > 0 ? ((stats.support / stats.total) * 100).toFixed(0) : '0';
  const opposePercentage = stats.total > 0 ? ((stats.oppose / stats.total) * 100).toFixed(0) : '0';
  const abstainPercentage = stats.total > 0 ? ((stats.abstain / stats.total) * 100).toFixed(0) : '0';

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* 支持数 */}
      <div className="flex items-center gap-2">
        <span className="text-sm">👍</span>
        <span className="text-sm font-medium text-green-600">
          {stats.support}人
        </span>
        <span className="text-xs text-green-500">
          ({supportPercentage}%)
        </span>
      </div>

      {/* 反对数 */}
      <div className="flex items-center gap-2">
        <span className="text-sm">👎</span>
        <span className="text-sm font-medium text-red-600">
          {stats.oppose}人
        </span>
        <span className="text-xs text-red-500">
          ({opposePercentage}%)
        </span>
      </div>

      {/* 弃权数 */}
      <div className="flex items-center gap-2">
        <span className="text-sm">😐</span>
        <span className="text-sm font-medium text-gray-600">
          {stats.abstain}人
        </span>
        <span className="text-xs text-gray-500">
          ({abstainPercentage}%)
        </span>
      </div>

      {/* 总数和参与度 */}
      {showTotal && (
        <div className="ml-4 pl-4 border-l border-gray-300 flex items-center gap-3">
          <div>
            <span className="text-xs text-gray-500">总计: </span>
            <span className="text-sm font-semibold text-gray-700">
              {stats.total}
            </span>
          </div>
          {stats.total > 0 && (
            <div>
              <span className="text-xs text-gray-500">参与度: </span>
              <span className="text-sm font-semibold text-blue-600">
                {stats.total}/25人
              </span>
              <span className="text-xs text-blue-500 ml-1">
                ({((stats.total / 25) * 100).toFixed(0)}%)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoteStats;
