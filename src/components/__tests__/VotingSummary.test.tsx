/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VotingSummary } from '../VotingSummary';
import { useVoteStore } from '../../stores/voteStore';

// Mock Zustand store
vi.mock('../../stores/voteStore', () => ({
  useVoteStore: vi.fn(),
}));

describe('VotingSummary Component', () => {
  const mockFetchVoteStats = vi.fn();

  const defaultStoreState = {
    voteStats: new Map(),
    fetchVoteStats: mockFetchVoteStats,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useVoteStore as any).mockReturnValue(defaultStoreState);
  });

  it('should not render when there are no votes', () => {
    const { container } = render(<VotingSummary taskId="test-task-1" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render voting summary when there are votes', () => {
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

    render(<VotingSummary taskId="test-task-1" />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should fetch vote stats on mount', () => {
    render(<VotingSummary taskId="test-task-1" />);
    expect(mockFetchVoteStats).toHaveBeenCalledWith('test-task-1');
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = vi.fn();
    
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

    render(<VotingSummary taskId="test-task-1" onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('should call onClick when Enter key is pressed', () => {
    const mockOnClick = vi.fn();
    
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

    render(<VotingSummary taskId="test-task-1" onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('should have correct aria-label', () => {
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

    render(<VotingSummary taskId="test-task-1" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '投票统计：12人支持，3人反对');
  });

  it('should display upvotes in green color', () => {
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

    render(<VotingSummary taskId="test-task-1" />);

    const upvoteNumber = screen.getByText('12');
    expect(upvoteNumber).toHaveClass('text-green-600');
  });

  it('should display downvotes in red color', () => {
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

    render(<VotingSummary taskId="test-task-1" />);

    const downvoteNumber = screen.getByText('3');
    expect(downvoteNumber).toHaveClass('text-red-600');
  });

  it('should have tooltip with percentage information', () => {
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

    render(<VotingSummary taskId="test-task-1" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title');
    expect(button.getAttribute('title')).toContain('支持率');
    expect(button.getAttribute('title')).toContain('反对率');
  });
});
