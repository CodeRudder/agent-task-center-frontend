import React, { useEffect } from 'react';
import { useVoteStore } from '../stores/voteStore';

/**
 * 投票摘要组件属性
 */
interface VotingSummaryProps {
  taskId: string;
  onClick?: () => void; // 点击回调（例如：跳转到任务详情）
}

/**
 * 投票摘要组件
 * 
 * 用于任务列表页，显示投票摘要
 * 格式：👍12 👎3 😐1
 */
export const VotingSummary: React.FC<VotingSummaryProps> = ({ taskId, onClick }) => {
  const { voteStats, fetchVoteStats } = useVoteStore();

  // 获取投票统计
  useEffect(() => {
    fetchVoteStats(taskId);
  }, [taskId, fetchVoteStats]);

  const stats = voteStats.get(taskId);

  // 如果没有投票，不显示
  if (!stats || stats.totalVotes === 0) {
    return null;
  }

  // 处理点击
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Tooltip内容
  const tooltipText = `支持率: ${Math.round((stats.upvotes / stats.totalVotes) * 100)}% (${stats.upvotes}/${stats.totalVotes})\n` +
                      `反对率: ${Math.round((stats.downvotes / stats.totalVotes) * 100)}% (${stats.downvotes}/${stats.totalVotes})`;

  return (
    <div
      className="flex items-center gap-2 text-xs cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleClick}
      title={tooltipText}
      role="button"
      aria-label={`投票统计：${stats.upvotes}人支持，${stats.downvotes}人反对`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* 支持数 */}
      <span className="flex items-center gap-1">
        <span>👍</span>
        <span className="text-green-600 font-medium">{stats.upvotes}</span>
      </span>
      
      {/* 反对数 */}
      <span className="flex items-center gap-1">
        <span>👎</span>
        <span className="text-red-600 font-medium">{stats.downvotes}</span>
      </span>
      
      {/* 弃权数（暂时不显示，因为后端不支持） */}
      {/* <span className="flex items-center gap-1">
        <span>😐</span>
        <span className="text-gray-600 font-medium">{stats.abstains}</span>
      </span> */}
    </div>
  );
};

export default VotingSummary;
