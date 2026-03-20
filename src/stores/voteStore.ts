/**
 * 投票状态管理 - V5.5
 */
import { create } from 'zustand';
import { VoteType, VoteStats } from '@/types/vote';
import TaskService from '@/services/taskService';

interface VoteState {
  // 状态
  voteStats: Record<string, VoteStats>;
  userVotes: Record<string, VoteType>;
  isLoading: boolean;
  error: string | null;

  // Actions
  /**
   * 对任务进行投票
   * @param taskId 任务ID
   * @param voteType 投票类型
   */
  voteTask: (taskId: string, voteType: VoteType) => Promise<void>;

  /**
   * 加载任务投票统计
   * @param taskId 任务ID
   */
  loadVoteStats: (taskId: string) => Promise<void>;

  /**
   * 清除错误信息
   */
  clearError: () => void;

  /**
   * 重置状态
   */
  reset: () => void;
}

export const useVoteStore = create<VoteState>((set) => ({
  // 初始状态
  voteStats: {},
  userVotes: {},
  isLoading: false,
  error: null,

  // 对任务进行投票
  voteTask: async (taskId: string, voteType: VoteType) => {
    set({ isLoading: true, error: null });
    try {
      const result = await TaskService.voteTask(taskId, voteType);
      
      if (result.success) {
        set((state) => ({
          voteStats: {
            ...state.voteStats,
            [taskId]: result.stats,
          },
          userVotes: {
            ...state.userVotes,
            [taskId]: result.voteType,
          },
          isLoading: false,
        }));
      } else {
        throw new Error('投票失败');
      }
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { message?: string } } };
      set({
        isLoading: false,
        error: err.response?.data?.message || err.message || '投票失败',
      });
      throw error;
    }
  },

  // 加载任务投票统计
  loadVoteStats: async (taskId: string) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await TaskService.getTaskVotes(taskId);
      
      set((state) => ({
        voteStats: {
          ...state.voteStats,
          [taskId]: stats,
        },
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { message?: string } } };
      set({
        isLoading: false,
        error: err.response?.data?.message || '加载投票统计失败',
      });
      throw error;
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 重置状态
  reset: () => {
    set({
      voteStats: {},
      userVotes: {},
      isLoading: false,
      error: null,
    });
  },
}));

export default useVoteStore;
