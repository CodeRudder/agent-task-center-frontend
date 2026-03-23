/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVoteStore } from '../voteStore';
import { VoteType } from '../../types/vote';
import VoteService from '../../services/voteService';

// Mock VoteService
vi.mock('../../services/voteService', () => ({
  default: {
    getVoteStats: vi.fn(),
    getUserVote: vi.fn(),
    vote: vi.fn(),
  },
}));

describe('voteStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useVoteStore.setState({
      voteStats: new Map(),
      userVotes: new Map(),
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = useVoteStore.getState();

      expect(state.voteStats).toBeInstanceOf(Map);
      expect(state.userVotes).toBeInstanceOf(Map);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchVoteStats', () => {
    it('应该成功获取投票统计', async () => {
      const mockStats = {
        taskId: 'task-1',
        upvotes: 10,
        downvotes: 3,
        totalVotes: 13,
        score: 7,
      };

      (VoteService.getVoteStats as any).mockResolvedValue(mockStats);

      const { fetchVoteStats } = useVoteStore.getState();
      await fetchVoteStats('task-1');

      const state = useVoteStore.getState();
      expect(state.voteStats.get('task-1')).toEqual(mockStats);
      expect(VoteService.getVoteStats).toHaveBeenCalledWith('task-1');
    });

    it('获取失败时应该设置错误信息', async () => {
      (VoteService.getVoteStats as any).mockRejectedValue(new Error('Network error'));

      const { fetchVoteStats } = useVoteStore.getState();
      await fetchVoteStats('task-1');

      const state = useVoteStore.getState();
      expect(state.error).toBe('获取投票统计失败');
    });

    it('应该为多个任务存储统计', async () => {
      const mockStats1 = {
        taskId: 'task-1',
        upvotes: 10,
        downvotes: 3,
        totalVotes: 13,
        score: 7,
      };
      const mockStats2 = {
        taskId: 'task-2',
        upvotes: 5,
        downvotes: 2,
        totalVotes: 7,
        score: 3,
      };

      (VoteService.getVoteStats as any)
        .mockResolvedValueOnce(mockStats1)
        .mockResolvedValueOnce(mockStats2);

      const { fetchVoteStats } = useVoteStore.getState();
      await fetchVoteStats('task-1');
      await fetchVoteStats('task-2');

      const state = useVoteStore.getState();
      expect(state.voteStats.size).toBe(2);
      expect(state.voteStats.get('task-1')).toEqual(mockStats1);
      expect(state.voteStats.get('task-2')).toEqual(mockStats2);
    });
  });

  describe('fetchUserVote', () => {
    it('应该成功获取用户投票', async () => {
      const mockVote = {
        id: 'vote-1',
        taskId: 'task-1',
        userId: 'user-1',
        voteType: VoteType.UPVOTE,
        votedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (VoteService.getUserVote as any).mockResolvedValue(mockVote);

      const { fetchUserVote } = useVoteStore.getState();
      await fetchUserVote('task-1');

      const state = useVoteStore.getState();
      expect(state.userVotes.get('task-1')).toBe(VoteType.UPVOTE);
      expect(VoteService.getUserVote).toHaveBeenCalledWith('task-1');
    });

    it('用户未投票时应该设置为null', async () => {
      (VoteService.getUserVote as any).mockResolvedValue(null);

      const { fetchUserVote } = useVoteStore.getState();
      await fetchUserVote('task-1');

      const state = useVoteStore.getState();
      expect(state.userVotes.get('task-1')).toBeNull();
    });

    it('获取失败时应该设置错误信息', async () => {
      (VoteService.getUserVote as any).mockRejectedValue(new Error('Network error'));

      const { fetchUserVote } = useVoteStore.getState();
      await fetchUserVote('task-1');

      const state = useVoteStore.getState();
      expect(state.error).toBe('获取用户投票失败');
    });
  });

  describe('vote', () => {
    it('应该成功投票支持', async () => {
      const mockResponse = {
        id: 'vote-1',
        taskId: 'task-1',
        userId: 'user-1',
        voteType: VoteType.UPVOTE,
        votedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (VoteService.vote as any).mockResolvedValue(mockResponse);
      (VoteService.getVoteStats as any).mockResolvedValue({
        taskId: 'task-1',
        upvotes: 11,
        downvotes: 3,
        totalVotes: 14,
        score: 8,
      });

      const { vote } = useVoteStore.getState();
      await vote('task-1', VoteType.UPVOTE);

      const state = useVoteStore.getState();
      expect(state.userVotes.get('task-1')).toBe(VoteType.UPVOTE);
      expect(state.loading).toBe(false);
      expect(VoteService.vote).toHaveBeenCalledWith('task-1', VoteType.UPVOTE);
    });

    it('应该成功投票反对', async () => {
      const mockResponse = {
        id: 'vote-1',
        taskId: 'task-1',
        userId: 'user-1',
        voteType: VoteType.DOWNVOTE,
        votedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (VoteService.vote as any).mockResolvedValue(mockResponse);
      (VoteService.getVoteStats as any).mockResolvedValue({
        taskId: 'task-1',
        upvotes: 10,
        downvotes: 4,
        totalVotes: 14,
        score: 6,
      });

      const { vote } = useVoteStore.getState();
      await vote('task-1', VoteType.DOWNVOTE);

      const state = useVoteStore.getState();
      expect(state.userVotes.get('task-1')).toBe(VoteType.DOWNVOTE);
      expect(state.loading).toBe(false);
    });

    it('弃权时应该只更新本地状态（不调用API）', async () => {
      const { vote } = useVoteStore.getState();
      await vote('task-1', VoteType.ABSTAIN);

      const state = useVoteStore.getState();
      expect(state.userVotes.get('task-1')).toBe(VoteType.ABSTAIN);
      expect(VoteService.vote).not.toHaveBeenCalled();
    });

    it('从支持改为弃权时应该更新状态', async () => {
      // 先设置已有投票
      useVoteStore.setState({
        userVotes: new Map([['task-1', VoteType.UPVOTE]]),
      });

      const { vote } = useVoteStore.getState();
      await vote('task-1', VoteType.ABSTAIN);

      const state = useVoteStore.getState();
      expect(state.userVotes.get('task-1')).toBe(VoteType.ABSTAIN);
    });

    it('投票时应该设置loading状态', async () => {
      const mockResponse = {
        id: 'vote-1',
        taskId: 'task-1',
        userId: 'user-1',
        voteType: VoteType.UPVOTE,
        votedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (VoteService.vote as any).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockResponse), 100);
        });
      });
      (VoteService.getVoteStats as any).mockResolvedValue({
        taskId: 'task-1',
        upvotes: 11,
        downvotes: 3,
        totalVotes: 14,
        score: 8,
      });

      const votePromise = useVoteStore.getState().vote('task-1', VoteType.UPVOTE);

      // 检查loading状态
      expect(useVoteStore.getState().loading).toBe(true);

      await votePromise;

      // 完成后loading应该为false
      expect(useVoteStore.getState().loading).toBe(false);
    });

    it('投票失败时应该设置错误信息', async () => {
      (VoteService.vote as any).mockRejectedValue(new Error('Network error'));

      const { vote } = useVoteStore.getState();
      await vote('task-1', VoteType.UPVOTE);

      const state = useVoteStore.getState();
      expect(state.error).toBe('投票失败，请重试');
      expect(state.loading).toBe(false);
    });

    it('投票后应该重新获取统计', async () => {
      const mockResponse = {
        id: 'vote-1',
        taskId: 'task-1',
        userId: 'user-1',
        voteType: VoteType.UPVOTE,
        votedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (VoteService.vote as any).mockResolvedValue(mockResponse);
      (VoteService.getVoteStats as any).mockResolvedValue({
        taskId: 'task-1',
        upvotes: 11,
        downvotes: 3,
        totalVotes: 14,
        score: 8,
      });

      const { vote } = useVoteStore.getState();
      await vote('task-1', VoteType.UPVOTE);

      expect(VoteService.getVoteStats).toHaveBeenCalledWith('task-1');
    });
  });

  describe('clearError', () => {
    it('应该清除错误信息', () => {
      useVoteStore.setState({ error: 'Some error' });

      const { clearError } = useVoteStore.getState();
      clearError();

      const state = useVoteStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('状态持久化', () => {
    it('不同组件应该共享同一状态', () => {
      const store1 = useVoteStore.getState();
      const store2 = useVoteStore.getState();

      expect(store1).toBe(store2);
    });

    it('状态更新应该反映到所有组件', () => {
      const newState = {
        voteStats: new Map([['task-1', {
          taskId: 'task-1',
          upvotes: 10,
          downvotes: 3,
          totalVotes: 13,
          score: 7,
        }]]),
        userVotes: new Map([['task-1', VoteType.UPVOTE]]),
        loading: false,
        error: null,
      };

      useVoteStore.setState(newState);

      const state = useVoteStore.getState();
      expect(state.voteStats.size).toBe(1);
      expect(state.userVotes.size).toBe(1);
    });
  });
});
