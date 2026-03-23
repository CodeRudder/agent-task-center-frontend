import { create } from 'zustand';
import type { VoteStats } from '../types/vote';
import { VoteType } from '../types/vote';
import VoteService from '../services/voteService';

/**
 * 投票状态接口
 */
interface VoteState {
  // 状态
  voteStats: Map<string, VoteStats>;        // 任务ID -> 投票统计
  userVotes: Map<string, VoteType | null>;  // 任务ID -> 用户投票类型
  loading: boolean;
  error: string | null;

  // 动作
  fetchVoteStats: (taskId: string) => Promise<void>;
  fetchUserVote: (taskId: string) => Promise<void>;
  vote: (taskId: string, voteType: VoteType) => Promise<void>;
  clearError: () => void;
}

/**
 * 投票状态管理Store
 */
export const useVoteStore = create<VoteState>((set, get) => ({
  // 初始状态
  voteStats: new Map(),
  userVotes: new Map(),
  loading: false,
  error: null,

  /**
   * 获取任务的投票统计
   */
  fetchVoteStats: async (taskId: string) => {
    try {
      const stats = await VoteService.getVoteStats(taskId);
      set((state) => {
        const newVoteStats = new Map(state.voteStats);
        newVoteStats.set(taskId, stats);
        return { voteStats: newVoteStats };
      });
    } catch (error) {
      console.error('Failed to fetch vote stats:', error);
      set({ error: '获取投票统计失败' });
    }
  },

  /**
   * 获取当前用户对任务的投票
   */
  fetchUserVote: async (taskId: string) => {
    try {
      const vote = await VoteService.getUserVote(taskId);
      set((state) => {
        const newUserVotes = new Map(state.userVotes);
        newUserVotes.set(taskId, vote ? vote.voteType : null);
        return { userVotes: newUserVotes };
      });
    } catch (error) {
      console.error('Failed to fetch user vote:', error);
      set({ error: '获取用户投票失败' });
    }
  },

  /**
   * 对任务投票
   */
  vote: async (taskId: string, voteType: VoteType) => {
    set({ loading: true, error: null });
    try {
      // 处理弃权逻辑
      if (voteType === VoteType.ABSTAIN) {
        // 弃权：如果之前投过票，取消投票
        const currentVote = get().userVotes.get(taskId);
        if (currentVote && currentVote !== VoteType.ABSTAIN) {
          // 后端没有取消投票API，暂时通过设置本地状态来处理
          set((state) => {
            const newUserVotes = new Map(state.userVotes);
            newUserVotes.set(taskId, VoteType.ABSTAIN);
            return { userVotes: newUserVotes, loading: false };
          });
          // 重新获取统计（因为弃权不发送到后端）
          await get().fetchVoteStats(taskId);
        } else {
          // 已经是弃权或未投票，直接设置为弃权
          set((state) => {
            const newUserVotes = new Map(state.userVotes);
            newUserVotes.set(taskId, VoteType.ABSTAIN);
            return { userVotes: newUserVotes, loading: false };
          });
        }
      } else {
        // 支持或反对：调用后端API
        const response = await VoteService.vote(taskId, voteType as 'upvote' | 'downvote');
        
        // 更新本地状态
        set((state) => {
          const newUserVotes = new Map(state.userVotes);
          newUserVotes.set(taskId, response.voteType);
          return { userVotes: newUserVotes, loading: false };
        });

        // 重新获取投票统计
        await get().fetchVoteStats(taskId);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      set({ loading: false, error: '投票失败，请重试' });
    }
  },

  /**
   * 清除错误
   */
  clearError: () => set({ error: null }),
}));
