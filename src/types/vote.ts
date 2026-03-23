/**
 * 投票类型常量
 * 
 * 注意：后端当前只支持 UPVOTE 和 DOWNVOTE
 * ABSTAIN (弃权) 暂时在前端处理
 */
export const VoteType = {
  UPVOTE: 'upvote',     // 支持 👍
  DOWNVOTE: 'downvote', // 反对 👎
  ABSTAIN: 'abstain',   // 弃权 😐 (前端临时实现)
} as const;

export type VoteType = typeof VoteType[keyof typeof VoteType];

/**
 * 投票响应DTO
 */
export interface VoteResponse {
  id: string;
  taskId: string;
  userId: string;
  voteType: VoteType;
  votedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 投票统计DTO
 */
export interface VoteStats {
  taskId: string;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  score: number; // upvotes - downvotes
}

/**
 * 创建投票DTO
 */
export interface CreateVoteDto {
  taskId: string;
  voteType: 'upvote' | 'downvote'; // 后端只支持这两种
}

/**
 * 用户投票状态
 */
export interface UserVoteState {
  hasVoted: boolean;
  voteType: VoteType | null;
}
