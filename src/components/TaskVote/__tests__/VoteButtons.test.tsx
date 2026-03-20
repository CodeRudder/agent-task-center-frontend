/**
 * VoteButtons 组件单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoteButtons } from '../VoteButtons';
import { useVoteStore } from '@/stores/voteStore';
import type { VoteType } from '@/types/vote';

// Mock voteStore
vi.mock('@/stores/voteStore', () => ({
  useVoteStore: vi.fn(),
}));

// Get the typed mock
const mockedUseVoteStore = vi.mocked(useVoteStore);

describe('VoteButtons 组件', () => {
  const mockTaskId = 'task-123';
  const mockVoteTask = vi.fn();
  const mockOnVoteSuccess = vi.fn();
  const mockOnVoteError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 默认mock store状态
    mockedUseVoteStore.mockReturnValue({
      voteTask: mockVoteTask,
      userVotes: {},
      isLoading: false,
    });
  });

  describe('渲染测试', () => {
    it('应该渲染三个投票按钮', () => {
      render(<VoteButtons taskId={mockTaskId} />);

      expect(screen.getByText('支持')).toBeInTheDocument();
      expect(screen.getByText('反对')).toBeInTheDocument();
      expect(screen.getByText('弃权')).toBeInTheDocument();
    });

    it('应该显示投票图标', () => {
      const { container } = render(<VoteButtons taskId={mockTaskId} />);

      // 检查emoji图标
      expect(screen.getByText('👍')).toBeInTheDocument();
      expect(screen.getByText('👎')).toBeInTheDocument();
      expect(screen.getByText('😐')).toBeInTheDocument();
    });

    it('应该设置正确的ARIA标签', () => {
      render(<VoteButtons taskId={mockTaskId} />);

      expect(screen.getByLabelText('投票支持')).toBeInTheDocument();
      expect(screen.getByLabelText('投票反对')).toBeInTheDocument();
      expect(screen.getByLabelText('投票弃权')).toBeInTheDocument();
    });

    it('应该应用自定义className', () => {
      const { container } = render(
        <VoteButtons taskId={mockTaskId} className="custom-class" />
      );

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('投票功能测试', () => {
    it('应该调用voteTask并触发onVoteSuccess', async () => {
      mockVoteTask.mockResolvedValue(undefined);

      render(<VoteButtons taskId={mockTaskId} onVoteSuccess={mockOnVoteSuccess} />);

      const supportButton = screen.getByLabelText('投票支持');
      fireEvent.click(supportButton);

      await waitFor(() => {
        expect(mockVoteTask).toHaveBeenCalledWith(mockTaskId, 'support');
        expect(mockOnVoteSuccess).toHaveBeenCalledWith('support');
      });
    });

    it('应该正确处理反对投票', async () => {
      mockVoteTask.mockResolvedValue(undefined);

      render(<VoteButtons taskId={mockTaskId} onVoteSuccess={mockOnVoteSuccess} />);

      const opposeButton = screen.getByLabelText('投票反对');
      fireEvent.click(opposeButton);

      await waitFor(() => {
        expect(mockVoteTask).toHaveBeenCalledWith(mockTaskId, 'oppose');
        expect(mockOnVoteSuccess).toHaveBeenCalledWith('oppose');
      });
    });

    it('应该正确处理弃权投票', async () => {
      mockVoteTask.mockResolvedValue(undefined);

      render(<VoteButtons taskId={mockTaskId} onVoteSuccess={mockOnVoteSuccess} />);

      const abstainButton = screen.getByLabelText('投票弃权');
      fireEvent.click(abstainButton);

      await waitFor(() => {
        expect(mockVoteTask).toHaveBeenCalledWith(mockTaskId, 'abstain');
        expect(mockOnVoteSuccess).toHaveBeenCalledWith('abstain');
      });
    });

    it('应该在投票失败时调用onVoteError', async () => {
      const mockError = new Error('投票失败');
      mockVoteTask.mockRejectedValue(mockError);

      render(<VoteButtons taskId={mockTaskId} onVoteError={mockOnVoteError} />);

      const supportButton = screen.getByLabelText('投票支持');
      fireEvent.click(supportButton);

      await waitFor(() => {
        expect(mockOnVoteError).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe('加载状态测试', () => {
    it('应该在store加载时禁用按钮', () => {
      mockedUseVoteStore.mockReturnValue({
        voteTask: mockVoteTask,
        userVotes: {},
        isLoading: true,
      });

      render(<VoteButtons taskId={mockTaskId} />);

      const supportButton = screen.getByLabelText('投票支持') as HTMLButtonElement;
      const opposeButton = screen.getByLabelText('投票反对') as HTMLButtonElement;
      const abstainButton = screen.getByLabelText('投票弃权') as HTMLButtonElement;

      expect(supportButton.disabled).toBe(true);
      expect(opposeButton.disabled).toBe(true);
      expect(abstainButton.disabled).toBe(true);
    });

    it('应该显示加载状态的样式', () => {
      mockedUseVoteStore.mockReturnValue({
        voteTask: mockVoteTask,
        userVotes: {},
        isLoading: true,
      });

      const { container } = render(<VoteButtons taskId={mockTaskId} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
      });
    });

    it('应该在投票过程中禁用按钮（本地加载状态）', async () => {
      let resolveVote: any;
      mockVoteTask.mockImplementation(() => new Promise(resolve => { resolveVote = resolve; }));

      render(<VoteButtons taskId={mockTaskId} />);

      const supportButton = screen.getByLabelText('投票支持') as HTMLButtonElement;
      fireEvent.click(supportButton);

      // 按钮应该被禁用
      expect(supportButton.disabled).toBe(true);

      // 解决promise
      resolveVote();
      await waitFor(() => {
        expect(supportButton.disabled).toBe(false);
      });
    });
  });

  describe('禁用状态测试', () => {
    it('应该禁用所有按钮当disabled=true', () => {
      render(<VoteButtons taskId={mockTaskId} disabled />);

      const supportButton = screen.getByLabelText('投票支持') as HTMLButtonElement;
      const opposeButton = screen.getByLabelText('投票反对') as HTMLButtonElement;
      const abstainButton = screen.getByLabelText('投票弃权') as HTMLButtonElement;

      expect(supportButton.disabled).toBe(true);
      expect(opposeButton.disabled).toBe(true);
      expect(abstainButton.disabled).toBe(true);
    });

    it('应该在禁用状态下阻止点击', () => {
      render(<VoteButtons taskId={mockTaskId} disabled />);

      const supportButton = screen.getByLabelText('投票支持');
      fireEvent.click(supportButton);

      expect(mockVoteTask).not.toHaveBeenCalled();
    });
  });

  describe('用户当前投票状态显示测试', () => {
    it('应该高亮显示已投票的支持按钮', () => {
      mockedUseVoteStore.mockReturnValue({
        voteTask: mockVoteTask,
        userVotes: { [mockTaskId]: 'support' as VoteType },
        isLoading: false,
      });

      const { container } = render(<VoteButtons taskId={mockTaskId} />);

      const supportButton = container.querySelector('button[aria-label="投票支持"]');
      expect(supportButton).toHaveClass('border-green-500', 'bg-green-50', 'text-green-600');
    });

    it('应该高亮显示已投票的反对按钮', () => {
      mockedUseVoteStore.mockReturnValue({
        voteTask: mockVoteTask,
        userVotes: { [mockTaskId]: 'oppose' as VoteType },
        isLoading: false,
      });

      const { container } = render(<VoteButtons taskId={mockTaskId} />);

      const opposeButton = container.querySelector('button[aria-label="投票反对"]');
      expect(opposeButton).toHaveClass('border-red-500', 'bg-red-50', 'text-red-600');
    });

    it('应该高亮显示已投票的弃权按钮', () => {
      mockedUseVoteStore.mockReturnValue({
        voteTask: mockVoteTask,
        userVotes: { [mockTaskId]: 'abstain' as VoteType },
        isLoading: false,
      });

      const { container } = render(<VoteButtons taskId={mockTaskId} />);

      const abstainButton = container.querySelector('button[aria-label="投票弃权"]');
      expect(abstainButton).toHaveClass('border-gray-500', 'bg-gray-100', 'text-gray-700');
    });

    it('应该显示已投票标记', () => {
      mockedUseVoteStore.mockReturnValue({
        voteTask: mockVoteTask,
        userVotes: { [mockTaskId]: 'support' as VoteType },
        isLoading: false,
      });

      render(<VoteButtons taskId={mockTaskId} />);

      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('应该正确设置aria-pressed属性', () => {
      mockedUseVoteStore.mockReturnValue({
        voteTask: mockVoteTask,
        userVotes: { [mockTaskId]: 'support' as VoteType },
        isLoading: false,
      });

      render(<VoteButtons taskId={mockTaskId} />);

      const supportButton = screen.getByLabelText('投票支持');
      expect(supportButton).toHaveAttribute('aria-pressed', 'true');

      const opposeButton = screen.getByLabelText('投票反对');
      expect(opposeButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('应该在未投票时显示默认样式', () => {
      mockedUseVoteStore.mockReturnValue({
        voteTask: mockVoteTask,
        userVotes: {},
        isLoading: false,
      });

      const { container } = render(<VoteButtons taskId={mockTaskId} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('border-gray-200', 'bg-white', 'text-gray-600');
      });
    });
  });

  describe('交互测试', () => {
    it('应该阻止重复点击', async () => {
      let resolveVote: any;
      mockVoteTask.mockImplementation(() => new Promise(resolve => { resolveVote = resolve; }));

      render(<VoteButtons taskId={mockTaskId} />);

      const supportButton = screen.getByLabelText('投票支持');
      
      // 第一次点击
      fireEvent.click(supportButton);
      expect(mockVoteTask).toHaveBeenCalledTimes(1);

      // 第二次点击（应该在加载中，不会触发）
      fireEvent.click(supportButton);
      expect(mockVoteTask).toHaveBeenCalledTimes(1);

      // 解决promise
      resolveVote();
      await waitFor(() => {
        expect(mockVoteTask).toHaveBeenCalledTimes(1);
      });
    });

    it('应该在投票完成后允许再次点击', async () => {
      mockVoteTask.mockResolvedValue(undefined);

      render(<VoteButtons taskId={mockTaskId} />);

      const supportButton = screen.getByLabelText('投票支持');
      
      // 第一次投票
      fireEvent.click(supportButton);
      await waitFor(() => {
        expect(mockVoteTask).toHaveBeenCalledTimes(1);
      });

      // 第二次投票（应该允许）
      fireEvent.click(supportButton);
      await waitFor(() => {
        expect(mockVoteTask).toHaveBeenCalledTimes(2);
      });
    });
  });
});
