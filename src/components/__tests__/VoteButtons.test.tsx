import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoteButtons } from '../VoteButtons';
import { VoteType } from '../../types/vote';

describe('VoteButtons', () => {
  const mockOnVote = vi.fn();

  beforeEach(() => {
    mockOnVote.mockClear();
  });

  describe('渲染测试', () => {
    it('应该渲染3个投票按钮（支持、反对、弃权）', () => {
      render(<VoteButtons onVote={mockOnVote} />);

      expect(screen.getByRole('button', { name: '支持此任务' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '反对此任务' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '对此任务弃权' })).toBeInTheDocument();
    });

    it('应该显示投票表情符号和文字标签', () => {
      render(<VoteButtons onVote={mockOnVote} showLabels={true} />);

      expect(screen.getByText('👍')).toBeInTheDocument();
      expect(screen.getByText('支持')).toBeInTheDocument();
      expect(screen.getByText('👎')).toBeInTheDocument();
      expect(screen.getByText('反对')).toBeInTheDocument();
      expect(screen.getByText('😐')).toBeInTheDocument();
      expect(screen.getByText('弃权')).toBeInTheDocument();
    });

    it('应该支持隐藏文字标签', () => {
      render(<VoteButtons onVote={mockOnVote} showLabels={false} />);

      expect(screen.getByText('👍')).toBeInTheDocument();
      expect(screen.queryByText('支持')).not.toBeInTheDocument();
    });

    it('应该显示按钮组的无障碍标签', () => {
      render(<VoteButtons onVote={mockOnVote} />);

      expect(screen.getByRole('group', { name: '投票按钮组' })).toBeInTheDocument();
    });
  });

  describe('选中状态测试', () => {
    it('支持按钮选中时应该有绿色样式', () => {
      render(<VoteButtons onVote={mockOnVote} selectedVote={VoteType.UPVOTE} />);

      const upvoteButton = screen.getByRole('button', { name: '支持此任务' });
      expect(upvoteButton).toHaveAttribute('aria-pressed', 'true');
      expect(upvoteButton).toHaveClass('bg-green-50');
      expect(upvoteButton).toHaveClass('border-green-500');
    });

    it('反对按钮选中时应该有红色样式', () => {
      render(<VoteButtons onVote={mockOnVote} selectedVote={VoteType.DOWNVOTE} />);

      const downvoteButton = screen.getByRole('button', { name: '反对此任务' });
      expect(downvoteButton).toHaveAttribute('aria-pressed', 'true');
      expect(downvoteButton).toHaveClass('bg-red-50');
      expect(downvoteButton).toHaveClass('border-red-500');
    });

    it('弃权按钮选中时应该有灰色样式', () => {
      render(<VoteButtons onVote={mockOnVote} selectedVote={VoteType.ABSTAIN} />);

      const abstainButton = screen.getByRole('button', { name: '对此任务弃权' });
      expect(abstainButton).toHaveAttribute('aria-pressed', 'true');
      expect(abstainButton).toHaveClass('bg-gray-50');
      expect(abstainButton).toHaveClass('border-gray-500');
    });

    it('未选中状态应该有灰色边框', () => {
      render(<VoteButtons onVote={mockOnVote} selectedVote={null} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed', 'false');
        expect(button).toHaveClass('border-gray-300');
      });
    });
  });

  describe('交互测试', () => {
    it('点击支持按钮应该调用onVote回调', () => {
      render(<VoteButtons onVote={mockOnVote} />);

      const upvoteButton = screen.getByRole('button', { name: '支持此任务' });
      fireEvent.click(upvoteButton);

      expect(mockOnVote).toHaveBeenCalledTimes(1);
      expect(mockOnVote).toHaveBeenCalledWith(VoteType.UPVOTE);
    });

    it('点击反对按钮应该调用onVote回调', () => {
      render(<VoteButtons onVote={mockOnVote} />);

      const downvoteButton = screen.getByRole('button', { name: '反对此任务' });
      fireEvent.click(downvoteButton);

      expect(mockOnVote).toHaveBeenCalledTimes(1);
      expect(mockOnVote).toHaveBeenCalledWith(VoteType.DOWNVOTE);
    });

    it('点击弃权按钮应该调用onVote回调', () => {
      render(<VoteButtons onVote={mockOnVote} />);

      const abstainButton = screen.getByRole('button', { name: '对此任务弃权' });
      fireEvent.click(abstainButton);

      expect(mockOnVote).toHaveBeenCalledTimes(1);
      expect(mockOnVote).toHaveBeenCalledWith(VoteType.ABSTAIN);
    });

    it('禁用状态下点击按钮不应该触发回调', () => {
      render(<VoteButtons onVote={mockOnVote} disabled={true} />);

      const upvoteButton = screen.getByRole('button', { name: '支持此任务' });
      fireEvent.click(upvoteButton);

      expect(mockOnVote).not.toHaveBeenCalled();
    });

    it('加载状态下点击按钮不应该触发回调', () => {
      render(<VoteButtons onVote={mockOnVote} loading={true} />);

      const upvoteButton = screen.getByRole('button', { name: '支持此任务' });
      fireEvent.click(upvoteButton);

      expect(mockOnVote).not.toHaveBeenCalled();
    });
  });

  describe('加载状态测试', () => {
    it('加载时应该显示加载指示器', () => {
      render(<VoteButtons onVote={mockOnVote} loading={true} />);

      expect(screen.getByText('处理中...')).toBeInTheDocument();
    });

    it('加载时按钮应该被禁用', () => {
      render(<VoteButtons onVote={mockOnVote} loading={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('非加载时不应该显示加载指示器', () => {
      render(<VoteButtons onVote={mockOnVote} loading={false} />);

      expect(screen.queryByText('处理中...')).not.toBeInTheDocument();
    });
  });

  describe('尺寸测试', () => {
    it('小尺寸应该应用正确的样式', () => {
      render(<VoteButtons onVote={mockOnVote} size="sm" />);

      const upvoteButton = screen.getByRole('button', { name: '支持此任务' });
      expect(upvoteButton).toHaveClass('px-3');
      expect(upvoteButton).toHaveClass('py-1.5');
    });

    it('中等尺寸应该应用正确的样式', () => {
      render(<VoteButtons onVote={mockOnVote} size="md" />);

      const upvoteButton = screen.getByRole('button', { name: '支持此任务' });
      expect(upvoteButton).toHaveClass('px-4');
      expect(upvoteButton).toHaveClass('py-2');
    });

    it('大尺寸应该应用正确的样式', () => {
      render(<VoteButtons onVote={mockOnVote} size="lg" />);

      const upvoteButton = screen.getByRole('button', { name: '支持此任务' });
      expect(upvoteButton).toHaveClass('px-6');
      expect(upvoteButton).toHaveClass('py-3');
    });
  });

  describe('可访问性测试', () => {
    it('所有按钮应该有正确的aria-pressed属性', () => {
      render(<VoteButtons onVote={mockOnVote} selectedVote={VoteType.UPVOTE} />);

      const upvoteButton = screen.getByRole('button', { name: '支持此任务' });
      const downvoteButton = screen.getByRole('button', { name: '反对此任务' });
      const abstainButton = screen.getByRole('button', { name: '对此任务弃权' });

      expect(upvoteButton).toHaveAttribute('aria-pressed', 'true');
      expect(downvoteButton).toHaveAttribute('aria-pressed', 'false');
      expect(abstainButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('所有按钮应该有正确的aria-label属性', () => {
      render(<VoteButtons onVote={mockOnVote} />);

      expect(screen.getByRole('button', { name: '支持此任务' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '反对此任务' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '对此任务弃权' })).toBeInTheDocument();
    });

    it('表情符号应该有aria-hidden属性', () => {
      render(<VoteButtons onVote={mockOnVote} />);

      const emojis = screen.getAllByRole('img', { hidden: true });
      expect(emojis.length).toBe(3); // 3个表情符号
    });
  });
});
