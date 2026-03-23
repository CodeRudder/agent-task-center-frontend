import React, { useEffect } from 'react';
import { useVoteStore } from '../stores/voteStore';
import { VoteType } from '../types/vote';

/**
 * 投票区域组件属性
 */
interface VotingAreaProps {
  taskId: string;
  totalUsers?: number; // 总用户数（用于计算参与度）
}

/**
 * 投票区域组件
 * 
 * 用于任务详情页，显示投票按钮和统计信息
 */
export const VotingArea: React.FC<VotingAreaProps> = ({ taskId, totalUsers = 0 }) => {
  const { voteStats, userVotes, loading, error, fetchVoteStats, fetchUserVote, vote } = useVoteStore();

  // 获取投票统计和用户投票
  useEffect(() => {
    fetchVoteStats(taskId);
    fetchUserVote(taskId);
  }, [taskId, fetchVoteStats, fetchUserVote]);

  const stats = voteStats.get(taskId);
  const userVote = userVotes.get(taskId);

  // 计算百分比
  const calculatePercentage = (count: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // 计算参与度
  const calculateParticipation = (): number => {
    if (totalUsers === 0) return 0;
    const votedUsers = stats?.totalVotes || 0;
    // 考虑弃权的用户（前端记录的弃权状态）
    const abstainCount = Array.from(userVotes.values()).filter(v => v === VoteType.ABSTAIN).length;
    return Math.round(((votedUsers + abstainCount) / totalUsers) * 100);
  };

  // 处理投票
  const handleVote = async (voteType: VoteType) => {
    await vote(taskId, voteType);
  };

  // 检查按钮是否选中
  const isSelected = (voteType: VoteType): boolean => {
    return userVote === voteType;
  };

  // 获取按钮样式
  const getButtonStyle = (voteType: VoteType): string => {
    const baseStyle = 'px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 font-medium';
    
    if (isSelected(voteType)) {
      // 已选中：彩色边框，浅色背景
      const bgColors: Record<VoteType, string> = {
        [VoteType.UPVOTE]: 'bg-green-50 border-green-500 text-green-700',
        [VoteType.DOWNVOTE]: 'bg-red-50 border-red-500 text-red-700',
        [VoteType.ABSTAIN]: 'bg-gray-50 border-gray-500 text-gray-700',
      };
      return `${baseStyle} ${bgColors[voteType]}`;
    } else {
      // 未选中：灰色边框，白色背景
      return `${baseStyle} border-gray-300 bg-white text-gray-600 hover:border-gray-400`;
    }
  };

  return (
    <div className="my-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 投票区域</h3>
      
      {/* 投票按钮 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">对此任务的态度？</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleVote(VoteType.UPVOTE)}
            disabled={loading}
            className={getButtonStyle(VoteType.UPVOTE)}
            aria-label="支持"
            aria-pressed={isSelected(VoteType.UPVOTE)}
          >
            <span className="text-xl">👍</span>
            <span>支持</span>
          </button>
          
          <button
            onClick={() => handleVote(VoteType.DOWNVOTE)}
            disabled={loading}
            className={getButtonStyle(VoteType.DOWNVOTE)}
            aria-label="反对"
            aria-pressed={isSelected(VoteType.DOWNVOTE)}
          >
            <span className="text-xl">👎</span>
            <span>反对</span>
          </button>
          
          <button
            onClick={() => handleVote(VoteType.ABSTAIN)}
            disabled={loading}
            className={getButtonStyle(VoteType.ABSTAIN)}
            aria-label="弃权"
            aria-pressed={isSelected(VoteType.ABSTAIN)}
          >
            <span className="text-xl">😐</span>
            <span>弃权</span>
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 投票统计 */}
      {stats && (
        <div>
          <div className="border-t border-gray-200 pt-4 mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">投票统计：</p>
          </div>
          
          <div className="flex items-center gap-6 mb-3">
            {/* 支持 */}
            <div className="flex items-center gap-2">
              <span className="text-lg">👍</span>
              <span className="text-sm text-gray-600">支持：</span>
              <span className="font-semibold text-green-600">{stats.upvotes}人</span>
              <span className="text-xs text-gray-500">
                ({calculatePercentage(stats.upvotes, stats.totalVotes)}%)
              </span>
            </div>
            
            {/* 反对 */}
            <div className="flex items-center gap-2">
              <span className="text-lg">👎</span>
              <span className="text-sm text-gray-600">反对：</span>
              <span className="font-semibold text-red-600">{stats.downvotes}人</span>
              <span className="text-xs text-gray-500">
                ({calculatePercentage(stats.downvotes, stats.totalVotes)}%)
              </span>
            </div>
            
            {/* 弃权（前端统计） */}
            {userVote === VoteType.ABSTAIN && (
              <div className="flex items-center gap-2">
                <span className="text-lg">😐</span>
                <span className="text-sm text-gray-600">弃权：</span>
                <span className="font-semibold text-gray-600">1人</span>
              </div>
            )}
          </div>

          {/* 参与度 */}
          {totalUsers > 0 && (
            <div className="text-sm text-gray-600">
              参与度：<span className="font-semibold">{calculateParticipation()}%</span> ({stats.totalVotes}/{totalUsers}人)
            </div>
          )}
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center text-gray-500 text-sm">投票中...</div>
      )}
    </div>
  );
};

export default VotingArea;

