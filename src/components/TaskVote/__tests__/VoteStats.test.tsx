/**
 * VoteStats 组件单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VoteStats } from '../VoteStats';
import type { VoteStats as VoteStatsType } from '@/types/vote';
import { useVoteStore } from '@/stores/voteStore';

// Mock voteStore
vi.mock('@/stores/voteStore', () => ({
  useVoteStore: vi.fn(),
}));

describe('VoteStats 组件', () => {
  const mockTaskId = 'task-123';
  const mockLoadVoteStats = vi.fn();

  const mockStats: VoteStatsType = {
    support: 10,
    oppose: 5,
    abstain: 3,
    total: 18,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 默认mock store状态
    vi.mocked(useVoteStore).mockReturnValue({
      voteStats: {},
      loadVoteStats: mockLoadVoteStats,
    } as any);
  });

  describe('渲染测试', () => {
    it('应该渲染投票统计信息', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} />);

      expect(screen.getByText('10人')).toBeInTheDocument();
      expect(screen.getByText('5人')).toBeInTheDocument();
      expect(screen.getByText('3人')).toBeInTheDocument();
    });

    it('应该显示投票图标', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} />);

      expect(screen.getByText('👍')).toBeInTheDocument();
      expect(screen.getByText('👎')).toBeInTheDocument();
      expect(screen.getByText('😐')).toBeInTheDocument();
    });

    it('应该显示总数', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} showTotal />);

      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('总计:')).toBeInTheDocument();
    });

    it('应该应用自定义className', () => {
      const { container } = render(
        <VoteStats taskId={mockTaskId} stats={mockStats} className="custom-class" />
      );

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });

    it('应该在无统计数据时不渲染任何内容', () => {
      const { container } = render(<VoteStats taskId={mockTaskId} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('百分比计算测试', () => {
    it('应该正确计算支持票百分比', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} />);

      // 10 / 18 = 56%
      expect(screen.getByText('(56%)')).toBeInTheDocument();
    });

    it('应该正确计算反对票百分比', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} />);

      // 5 / 18 = 28%
      expect(screen.getByText('(28%)')).toBeInTheDocument();
    });

    it('应该正确计算弃权票百分比', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} />);

      // 3 / 18 = 17%
      expect(screen.getByText('(17%)')).toBeInTheDocument();
    });

    it('应该在总票数为0时显示0%', () => {
      const emptyStats: VoteStatsType = {
        support: 0,
        oppose: 0,
        abstain: 0,
        total: 0,
      };

      render(<VoteStats taskId={mockTaskId} stats={emptyStats} />);

      expect(screen.getAllByText('(0%)').length).toBeGreaterThan(0);
    });

    it('应该正确处理百分比四舍五入', () => {
      const statsWithDecimals: VoteStatsType = {
        support: 7,
        oppose: 7,
        abstain: 6,
        total: 20,
      };

      render(<VoteStats taskId={mockTaskId} stats={statsWithDecimals} />);

      // 7/20 = 35%, 6/20 = 30%
      const percentages = screen.getAllByText('(35%)');
      expect(percentages.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('参与度显示测试', () => {
    it('应该显示参与度信息', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} showTotal />);

      expect(screen.getByText(/18\/25人/)).toBeInTheDocument();
      expect(screen.getByText(/参与度:/)).toBeInTheDocument();
    });

    it('应该正确计算参与度百分比', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} showTotal />);

      // 18 / 25 = 72%
      expect(screen.getByText('(72%)')).toBeInTheDocument();
    });

    it('应该在总票数为0时不显示参与度', () => {
      const emptyStats: VoteStatsType = {
        support: 0,
        oppose: 0,
        abstain: 0,
        total: 0,
      };

      render(<VoteStats taskId={mockTaskId} stats={emptyStats} showTotal />);

      // 应该显示总数0，但不显示参与度
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.queryByText(/参与度:/)).not.toBeInTheDocument();
    });

    it('应该隐藏总数当showTotal=false', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} showTotal={false} />);

      expect(screen.queryByText('总计:')).not.toBeInTheDocument();
      expect(screen.queryByText(/参与度:/)).not.toBeInTheDocument();
    });
  });

  describe('自动加载统计测试', () => {
    it('应该在无外部统计数据且无store数据时自动加载', () => {
      render(<VoteStats taskId={mockTaskId} />);

      expect(mockLoadVoteStats).toHaveBeenCalledWith(mockTaskId);
    });

    it('应该只调用一次loadVoteStats', () => {
      const { rerender } = render(<VoteStats taskId={mockTaskId} />);

      rerender(<VoteStats taskId={mockTaskId} />);

      expect(mockLoadVoteStats).toHaveBeenCalledTimes(1);
    });

    it('不应该在有外部统计数据时调用loadVoteStats', () => {
      render(<VoteStats taskId={mockTaskId} stats={mockStats} />);

      expect(mockLoadVoteStats).not.toHaveBeenCalled();
    });

    it('不应该在已有store数据时调用loadVoteStats', () => {
      vi.mocked(useVoteStore).mockReturnValue({
        voteStats: { [mockTaskId]: mockStats },
        loadVoteStats: mockLoadVoteStats,
      });

      render(<VoteStats taskId={mockTaskId} />);

      expect(mockLoadVoteStats).not.toHaveBeenCalled();
    });

    it('应该使用外部统计数据而非store数据', () => {
      const externalStats: VoteStatsType = {
        support: 20,
        oppose: 10,
        abstain: 5,
        total: 35,
      };

      vi.mocked(useVoteStore).mockReturnValue({
        voteStats: { [mockTaskId]: mockStats },
        loadVoteStats: mockLoadVoteStats,
      });

      render(<VoteStats taskId={mockTaskId} stats={externalStats} />);

      // 应该显示外部统计数据（35）
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.queryByText('18')).not.toBeInTheDocument();
    });
  });

  describe('样式和颜色测试', () => {
    it('应该为支持票应用绿色样式', () => {
      const { container } = render(<VoteStats taskId={mockTaskId} stats={mockStats} />);

      const supportText = container.querySelector('.text-green-600');
      expect(supportText).toBeInTheDocument();
      expect(supportText?.textContent).toContain('10人');
    });

    it('应该为反对票应用红色样式', () => {
      const { container } = render(<VoteStats taskId={mockTaskId} stats={mockStats} />);

      const opposeText = container.querySelector('.text-red-600');
      expect(opposeText).toBeInTheDocument();
      expect(opposeText?.textContent).toContain('5人');
    });

    it('应该为弃权票应用灰色样式', () => {
      const { container } = render(<VoteStats taskId={mockTaskId} stats={mockStats} />);

      const abstainText = container.querySelector('.text-gray-600');
      expect(abstainText).toBeInTheDocument();
      expect(abstainText?.textContent).toContain('3人');
    });

    it('应该为参与度应用蓝色样式', () => {
      const { container } = render(<VoteStats taskId={mockTaskId} stats={mockStats} showTotal />);

      const participationText = container.querySelector('.text-blue-600');
      expect(participationText).toBeInTheDocument();
      expect(participationText?.textContent).toContain('18/25人');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理全部支持的情况', () => {
      const allSupport: VoteStatsType = {
        support: 25,
        oppose: 0,
        abstain: 0,
        total: 25,
      };

      render(<VoteStats taskId={mockTaskId} stats={allSupport} />);

      expect(screen.getByText('25人')).toBeInTheDocument();
      expect(screen.getAllByText('(100%)').length).toBeGreaterThan(0);
    });

    it('应该处理全部反对的情况', () => {
      const allOppose: VoteStatsType = {
        support: 0,
        oppose: 25,
        abstain: 0,
        total: 25,
      };

      render(<VoteStats taskId={mockTaskId} stats={allOppose} />);

      expect(screen.getByText('25人')).toBeInTheDocument();
      expect(screen.getAllByText('(100%)').length).toBeGreaterThan(0);
    });

    it('应该处理全部弃权的情况', () => {
      const allAbstain: VoteStatsType = {
        support: 0,
        oppose: 0,
        abstain: 25,
        total: 25,
      };

      render(<VoteStats taskId={mockTaskId} stats={allAbstain} />);

      expect(screen.getByText('25人')).toBeInTheDocument();
      expect(screen.getAllByText('(100%)').length).toBeGreaterThan(0);
    });

    it('应该处理单票情况', () => {
      const singleVote: VoteStatsType = {
        support: 1,
        oppose: 0,
        abstain: 0,
        total: 1,
      };

      render(<VoteStats taskId={mockTaskId} stats={singleVote} />);

      expect(screen.getByText('1人')).toBeInTheDocument();
      expect(screen.getAllByText('(100%)').length).toBeGreaterThan(0);
    });

    it('应该处理最大投票数（25人）', () => {
      const maxVotes: VoteStatsType = {
        support: 10,
        oppose: 8,
        abstain: 7,
        total: 25,
      };

      render(<VoteStats taskId={mockTaskId} stats={maxVotes} showTotal />);

      expect(screen.getByText(/25\/25人/)).toBeInTheDocument();
      expect(screen.getByText('(100%)')).toBeInTheDocument();
    });
  });
});
