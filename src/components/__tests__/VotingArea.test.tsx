/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VotingArea } from '../VotingArea';
import { useVoteStore } from '../../stores/voteStore';
import { VoteType } from '../../types/vote';

// Mock Zustand store
vi.mock('../../stores/voteStore', () => ({
  useVoteStore: vi.fn(),
}));

// Mock vote service
vi.mock('../../services/voteService', () => ({
  default: {
    getVoteStats: vi.fn(),
    getUserVote: vi.fn(),
    vote: vi.fn(),
  },
}));

describe('VotingArea Component', () => {
  const mockFetchVoteStats = vi.fn();
  const mockFetchUserVote = vi.fn();
  const mockVote = vi.fn();

  const defaultStoreState = {
    voteStats: new Map(),
    userVotes: new Map(),
    loading: false,
    error: null,
    fetchVoteStats: mockFetchVoteStats,
    fetchUserVote: mockFetchUserVote,
    vote: mockVote,
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useVoteStore as any).mockReturnValue(defaultStoreState);
  });

  it('should render voting buttons', () => {
    render(<VotingArea taskId="test-task-1" />);

    expect(screen.getByText('📊 投票区域')).toBeInTheDocument();
    expect(screen.getByText('支持')).toBeInTheDocument();
    expect(screen.getByText('反对')).toBeInTheDocument();
    expect(screen.getByText('弃权')).toBeInTheDocument();
  });

  it('should fetch vote stats and user vote on mount', () => {
    render(<VotingArea taskId="test-task-1" />);

    expect(mockFetchVoteStats).toHaveBeenCalledWith('test-task-1');
    expect(mockFetchUserVote).toHaveBeenCalledWith('test-task-1');
  });

  it('should call vote when support button is clicked', async () => {
    render(<VotingArea taskId="test-task-1" />);

    const supportButton = screen.getByText('支持').closest('button');
    fireEvent.click(supportButton!);

    await waitFor(() => {
      expect(mockVote).toHaveBeenCalledWith('test-task-1', VoteType.UPVOTE);
    });
  });

  it('should call vote when oppose button is clicked', async () => {
    render(<VotingArea taskId="test-task-1" />);

    const opposeButton = screen.getByText('反对').closest('button');
    fireEvent.click(opposeButton!);

    await waitFor(() => {
      expect(mockVote).toHaveBeenCalledWith('test-task-1', VoteType.DOWNVOTE);
    });
  });

  it('should call vote when abstain button is clicked', async () => {
    render(<VotingArea taskId="test-task-1" />);

    const abstainButton = screen.getByText('弃权').closest('button');
    fireEvent.click(abstainButton!);

    await waitFor(() => {
      expect(mockVote).toHaveBeenCalledWith('test-task-1', VoteType.ABSTAIN);
    });
  });

  it('should display vote statistics when available', () => {
    const storeWithStats = {
      ...defaultStoreState,
      voteStats: new Map([['test-task-1', {
        taskId: 'test-task-1',
        upvotes: 12,
        downvotes: 3,
        totalVotes: 15,
        score: 9,
      }]]),
    };

    // 使用 mockImplementation 确保返回正确的 store
    (useVoteStore as any).mockImplementation(() => storeWithStats);

    render(<VotingArea taskId="test-task-1" />);

    // 检查统计区域是否渲染
    expect(screen.getByText('投票统计：')).toBeInTheDocument();
  });

  it('should highlight selected vote button', () => {
    const storeWithUserVote = {
      ...defaultStoreState,
      userVotes: new Map([['test-task-1', VoteType.UPVOTE]]),
    };

    (useVoteStore as any).mockReturnValue(storeWithUserVote);

    render(<VotingArea taskId="test-task-1" />);

    const supportButton = screen.getByText('支持').closest('button');
    expect(supportButton).toHaveClass('bg-green-50');
    expect(supportButton).toHaveClass('border-green-500');
  });

  it('should display error message when there is an error', () => {
    const storeWithError = {
      ...defaultStoreState,
      error: '投票失败，请重试',
    };

    (useVoteStore as any).mockReturnValue(storeWithError);

    render(<VotingArea taskId="test-task-1" />);

    expect(screen.getByText('投票失败，请重试')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    const storeWithLoading = {
      ...defaultStoreState,
      loading: true,
    };

    (useVoteStore as any).mockReturnValue(storeWithLoading);

    render(<VotingArea taskId="test-task-1" />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should calculate participation rate correctly', () => {
    const storeWithStats = {
      ...defaultStoreState,
      voteStats: new Map([['test-task-1', {
        taskId: 'test-task-1',
        upvotes: 12,
        downvotes: 3,
        totalVotes: 15,
        score: 9,
      }]]),
    };

    (useVoteStore as any).mockReturnValue(storeWithStats);

    render(<VotingArea taskId="test-task-1" totalUsers={20} />);

    // 15/20 = 75%
    expect(screen.getByText('75%')).toBeInTheDocument();
    // 文本可能被分割，使用更灵活的匹配
    expect(screen.getByText(/15\/20/)).toBeInTheDocument();
  });
});
