/**
 * voteStore 状态管理单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVoteStore } from '../voteStore';
import TaskService from '@/services/taskService';
import type { VoteType, VoteStats } from '@/types/vote';

// Mock TaskService
vi.mock('@/services/taskService', () => ({
  default: {
    voteTask: vi.fn(),
    getTaskVotes: vi.fn(),
  },
}));

describe('useVoteStore', () => {
  const mockTaskId = 'task-123';
  const mockStats: VoteStats = {
    support: 10,
    oppose: 5,
    abstain: 3,
    total: 18,
  };

  beforeEach(() => {
    // 重置store状态
    useVoteStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('初始状态测试', () => {
    it('应该有正确的初始状态', () => {
      const state = useVoteStore.getState();

      expect(state.voteStats).toEqual({});
      expect(state.userVotes).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('应该重置状态到初始值', () => {
      // 先设置一些状态
      useVoteStore.getState().voteStats = { [mockTaskId]: mockStats };
      useVoteStore.getState().userVotes = { [mockTaskId]: 'support' as VoteType };
      useVoteStore.getState().isLoading = true;
      useVoteStore.getState().error = 'Some error';

      // 重置
      useVoteStore.getState().reset();

      const state = useVoteStore.getState();
      expect(state.voteStats).toEqual({});
      expect(state.userVotes).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('voteTask方法测试', () => {
    it('应该成功投票并更新状态', async () => {
      const mockResult = {
        success: true,
        voteType: 'support' as VoteType,
        stats: mockStats,
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult);

      await useVoteStore.getState().voteTask(mockTaskId, 'support');

      const state = useVoteStore.getState();

      expect(state.voteStats[mockTaskId]).toEqual(mockStats);
      expect(state.userVotes[mockTaskId]).toBe('support');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('应该调用TaskService.voteTask', async () => {
      const mockResult = {
        success: true,
        voteType: 'oppose' as VoteType,
        stats: mockStats,
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult);

      await useVoteStore.getState().voteTask(mockTaskId, 'oppose');

      expect(TaskService.voteTask).toHaveBeenCalledWith(mockTaskId, 'oppose');
    });

    it('应该正确处理支持投票', async () => {
      const mockResult = {
        success: true,
        voteType: 'support' as VoteType,
        stats: mockStats,
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult);

      await useVoteStore.getState().voteTask(mockTaskId, 'support');

      expect(useVoteStore.getState().userVotes[mockTaskId]).toBe('support');
    });

    it('应该正确处理反对投票', async () => {
      const mockResult = {
        success: true,
        voteType: 'oppose' as VoteType,
        stats: mockStats,
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult);

      await useVoteStore.getState().voteTask(mockTaskId, 'oppose');

      expect(useVoteStore.getState().userVotes[mockTaskId]).toBe('oppose');
    });

    it('应该正确处理弃权投票', async () => {
      const mockResult = {
        success: true,
        voteType: 'abstain' as VoteType,
        stats: mockStats,
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult);

      await useVoteStore.getState().voteTask(mockTaskId, 'abstain');

      expect(useVoteStore.getState().userVotes[mockTaskId]).toBe('abstain');
    });

    it('应该在投票过程中设置isLoading为true', async () => {
      let resolveVote: any;
      (TaskService.voteTask as any).mockImplementation(() => 
        new Promise(resolve => { resolveVote = resolve; })
      );

      const votePromise = useVoteStore.getState().voteTask(mockTaskId, 'support');

      expect(useVoteStore.getState().isLoading).toBe(true);

      // 解决promise
      const mockResult = {
        success: true,
        voteType: 'support' as VoteType,
        stats: mockStats,
      };
      resolveVote(mockResult);
      await votePromise;

      expect(useVoteStore.getState().isLoading).toBe(false);
    });

    it('应该处理投票失败的情况', async () => {
      const mockError = new Error('投票失败');
      (TaskService.voteTask as any).mockRejectedValue(mockError);

      await expect(
        useVoteStore.getState().voteTask(mockTaskId, 'support')
      ).rejects.toThrow('投票失败');

      const state = useVoteStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('投票失败');
    });

    it('应该处理API返回的success=false', async () => {
      const mockResult = {
        success: false,
        voteType: 'support' as VoteType,
        stats: mockStats,
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult);

      await expect(
        useVoteStore.getState().voteTask(mockTaskId, 'support')
      ).rejects.toThrow('投票失败');

      expect(useVoteStore.getState().error).toBe('投票失败');
    });

    it('应该处理带response的错误', async () => {
      const mockError = new Error('Network error');
      (mockError as any).response = {
        data: {
          message: 'API错误消息',
        },
      };

      (TaskService.voteTask as any).mockRejectedValue(mockError);

      await expect(
        useVoteStore.getState().voteTask(mockTaskId, 'support')
      ).rejects.toThrow();

      expect(useVoteStore.getState().error).toBe('API错误消息');
    });

    it('应该保留已有的投票统计', async () => {
      const existingStats: VoteStats = {
        support: 5,
        oppose: 3,
        abstain: 2,
        total: 10,
      };

      const newStats: VoteStats = {
        support: 15,
        oppose: 8,
        abstain: 2,
        total: 25,
      };

      // 设置已有的投票统计
      useVoteStore.setState({
        voteStats: { 'task-456': existingStats },
      });

      const mockResult = {
        success: true,
        voteType: 'support' as VoteType,
        stats: newStats,
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult);

      await useVoteStore.getState().voteTask(mockTaskId, 'support');

      const state = useVoteStore.getState();
      expect(state.voteStats['task-456']).toEqual(existingStats);
      expect(state.voteStats[mockTaskId]).toEqual(newStats);
    });

    it('应该保留已有的用户投票', async () => {
      // 设置已有的用户投票
      useVoteStore.setState({
        userVotes: { 'task-456': 'oppose' as VoteType },
      });

      const mockResult = {
        success: true,
        voteType: 'support' as VoteType,
        stats: mockStats,
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult);

      await useVoteStore.getState().voteTask(mockTaskId, 'support');

      const state = useVoteStore.getState();
      expect(state.userVotes['task-456']).toBe('oppose');
      expect(state.userVotes[mockTaskId]).toBe('support');
    });
  });

  describe('loadVoteStats方法测试', () => {
    it('应该成功加载投票统计', async () => {
      (TaskService.getTaskVotes as any).mockResolvedValue(mockStats);

      await useVoteStore.getState().loadVoteStats(mockTaskId);

      const state = useVoteStore.getState();

      expect(state.voteStats[mockTaskId]).toEqual(mockStats);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('应该调用TaskService.getTaskVotes', async () => {
      (TaskService.getTaskVotes as any).mockResolvedValue(mockStats);

      await useVoteStore.getState().loadVoteStats(mockTaskId);

      expect(TaskService.getTaskVotes).toHaveBeenCalledWith(mockTaskId);
    });

    it('应该在加载过程中设置isLoading为true', async () => {
      let resolveLoad: any;
      (TaskService.getTaskVotes as any).mockImplementation(() => 
        new Promise(resolve => { resolveLoad = resolve; })
      );

      const loadPromise = useVoteStore.getState().loadVoteStats(mockTaskId);

      expect(useVoteStore.getState().isLoading).toBe(true);

      // 解决promise
      resolveLoad(mockStats);
      await loadPromise;

      expect(useVoteStore.getState().isLoading).toBe(false);
    });

    it('应该处理加载失败的情况', async () => {
      const mockError = new Error('加载失败');
      (TaskService.getTaskVotes as any).mockRejectedValue(mockError);

      await expect(
        useVoteStore.getState().loadVoteStats(mockTaskId)
      ).rejects.toThrow('加载失败');

      const state = useVoteStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('加载投票统计失败');
    });

    it('应该处理带response的错误', async () => {
      const mockError = new Error('Network error');
      (mockError as any).response = {
        data: {
          message: 'API错误消息',
        },
      };

      (TaskService.getTaskVotes as any).mockRejectedValue(mockError);

      await expect(
        useVoteStore.getState().loadVoteStats(mockTaskId)
      ).rejects.toThrow();

      expect(useVoteStore.getState().error).toBe('API错误消息');
    });

    it('应该保留已有的投票统计', async () => {
      const existingStats: VoteStats = {
        support: 5,
        oppose: 3,
        abstain: 2,
        total: 10,
      };

      const newStats: VoteStats = {
        support: 15,
        oppose: 8,
        abstain: 2,
        total: 25,
      };

      // 设置已有的投票统计
      useVoteStore.setState({
        voteStats: { 'task-456': existingStats },
      });

      (TaskService.getTaskVotes as any).mockResolvedValue(newStats);

      await useVoteStore.getState().loadVoteStats(mockTaskId);

      const state = useVoteStore.getState();
      expect(state.voteStats['task-456']).toEqual(existingStats);
      expect(state.voteStats[mockTaskId]).toEqual(newStats);
    });

    it('应该覆盖同任务的已有统计', async () => {
      const oldStats: VoteStats = {
        support: 5,
        oppose: 3,
        abstain: 2,
        total: 10,
      };

      const newStats: VoteStats = {
        support: 15,
        oppose: 8,
        abstain: 2,
        total: 25,
      };

      // 设置已有的投票统计
      useVoteStore.setState({
        voteStats: { [mockTaskId]: oldStats },
      });

      (TaskService.getTaskVotes as any).mockResolvedValue(newStats);

      await useVoteStore.getState().loadVoteStats(mockTaskId);

      expect(useVoteStore.getState().voteStats[mockTaskId]).toEqual(newStats);
    });
  });

  describe('clearError方法测试', () => {
    it('应该清除错误信息', () => {
      useVoteStore.setState({ error: 'Some error' });

      useVoteStore.getState().clearError();

      expect(useVoteStore.getState().error).toBeNull();
    });

    it('应该保留其他状态', () => {
      useVoteStore.setState({
        voteStats: { [mockTaskId]: mockStats },
        userVotes: { [mockTaskId]: 'support' as VoteType },
        isLoading: true,
        error: 'Some error',
      });

      useVoteStore.getState().clearError();

      const state = useVoteStore.getState();
      expect(state.voteStats[mockTaskId]).toEqual(mockStats);
      expect(state.userVotes[mockTaskId]).toBe('support');
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('状态重置测试', () => {
    it('应该重置所有状态', () => {
      useVoteStore.setState({
        voteStats: { [mockTaskId]: mockStats },
        userVotes: { [mockTaskId]: 'support' as VoteType },
        isLoading: true,
        error: 'Some error',
      });

      useVoteStore.getState().reset();

      const state = useVoteStore.getState();
      expect(state.voteStats).toEqual({});
      expect(state.userVotes).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('应该可以重新投票', async () => {
      // 第一次投票
      const mockResult1 = {
        success: true,
        voteType: 'support' as VoteType,
        stats: { support: 10, oppose: 0, abstain: 0, total: 10 },
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult1);

      await useVoteStore.getState().voteTask(mockTaskId, 'support');

      // 重置
      useVoteStore.getState().reset();

      // 第二次投票（应该成功）
      const mockResult2 = {
        success: true,
        voteType: 'oppose' as VoteType,
        stats: { support: 0, oppose: 10, abstain: 0, total: 10 },
      };

      (TaskService.voteTask as any).mockResolvedValue(mockResult2);

      await useVoteStore.getState().voteTask(mockTaskId, 'oppose');

      expect(useVoteStore.getState().userVotes[mockTaskId]).toBe('oppose');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理连续投票', async () => {
      const mockResult1 = {
        success: true,
        voteType: 'support' as VoteType,
        stats: { support: 10, oppose: 0, abstain: 0, total: 10 },
      };

      const mockResult2 = {
        success: true,
        voteType: 'oppose' as VoteType,
        stats: { support: 9, oppose: 1, abstain: 0, total: 10 },
      };

      (TaskService.voteTask as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      await useVoteStore.getState().voteTask(mockTaskId, 'support');
      await useVoteStore.getState().voteTask(mockTaskId, 'oppose');

      expect(useVoteStore.getState().userVotes[mockTaskId]).toBe('oppose');
    });

    it('应该处理多个任务的投票', async () => {
      const mockResult1 = {
        success: true,
        voteType: 'support' as VoteType,
        stats: { support: 10, oppose: 0, abstain: 0, total: 10 },
      };

      const mockResult2 = {
        success: true,
        voteType: 'oppose' as VoteType,
        stats: { support: 0, oppose: 10, abstain: 0, total: 10 },
      };

      (TaskService.voteTask as any)
        .mockResolvedValueOnce(mockResult1)
        .mockResolvedValueOnce(mockResult2);

      await useVoteStore.getState().voteTask('task-1', 'support');
      await useVoteStore.getState().voteTask('task-2', 'oppose');

      const state = useVoteStore.getState();
      expect(state.userVotes['task-1']).toBe('support');
      expect(state.userVotes['task-2']).toBe('oppose');
    });

    it('应该处理多个任务的统计加载', async () => {
      const stats1: VoteStats = { support: 10, oppose: 0, abstain: 0, total: 10 };
      const stats2: VoteStats = { support: 0, oppose: 10, abstain: 0, total: 10 };

      (TaskService.getTaskVotes as any)
        .mockResolvedValueOnce(stats1)
        .mockResolvedValueOnce(stats2);

      await useVoteStore.getState().loadVoteStats('task-1');
      await useVoteStore.getState().loadVoteStats('task-2');

      const state = useVoteStore.getState();
      expect(state.voteStats['task-1']).toEqual(stats1);
      expect(state.voteStats['task-2']).toEqual(stats2);
    });
  });
});
