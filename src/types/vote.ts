/**
 * 投票相关类型定义 - V5.5
 */

/**
 * 投票类型
 */
export type VoteType = 'support' | 'oppose' | 'abstain';

/**
 * 投票统计
 */
export interface VoteStats {
  support: number;
  oppose: number;
  abstain: number;
  total: number;
}

/**
 * 投票结果
 */
export interface VoteResult {
  success: boolean;
  voteType: VoteType;
  stats: VoteStats;
}

/**
 * 用户投票记录
 */
export interface UserVote {
  taskId: string;
  userId: string;
  voteType: VoteType;
  votedAt: string;
}
