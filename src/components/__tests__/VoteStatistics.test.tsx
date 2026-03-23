/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VoteStatistics } from '../VoteStatistics';
import type { VoteStats } from '../../types/vote';

// Mock Recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />,
}));

describe('VoteStatistics', () => {
  const mockStats: VoteStats = {
    taskId: 'task-1',
    upvotes: 10,
    downvotes: 3,
    totalVotes: 13,
    score: 7,
  };

  describe('渲染测试', () => {
    it('应该渲染投票统计数据', () => {
      render(<VoteStatistics stats={mockStats} />);

      expect(screen.getByText('投票统计')).toBeInTheDocument();
      expect(screen.getByText('支持')).toBeInTheDocument();
      expect(screen.getByText('反对')).toBeInTheDocument();
    });

    it('应该显示正确的支持票数和百分比', () => {
      render(<VoteStatistics stats={mockStats} abstainCount={0} />);

      expect(screen.getByText('10')).toBeInTheDocument(); // 票数
      expect(screen.getByText('(77%)')).toBeInTheDocument(); // 百分比 10/13
    });

    it('应该显示正确的反对票数和百分比', () => {
      render(<VoteStatistics stats={mockStats} abstainCount={0} />);

      const downvoteElements = screen.getAllByText('3');
      expect(downvoteElements.length).toBeGreaterThan(0); // 票数
      expect(screen.getByText('(23%)')).toBeInTheDocument(); // 百分比 3/13
    });

    it('应该显示弃权票数（如果有）', () => {
      render(<VoteStatistics stats={mockStats} abstainCount={2} />);

      expect(screen.getByText('弃权')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('应该显示总票数和得分', () => {
      render(<VoteStatistics stats={mockStats} />);

      expect(screen.getByText('13')).toBeInTheDocument(); // 总票数
      expect(screen.getByText('7')).toBeInTheDocument(); // 得分
    });

    it('没有统计数据时应该显示提示信息', () => {
      render(<VoteStatistics stats={null} />);

      expect(screen.getByText('暂无投票数据')).toBeInTheDocument();
    });
  });

  describe('图表显示测试', () => {
    it('应该渲染柱状图（默认显示）', () => {
      render(<VoteStatistics stats={mockStats} showChart={true} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('应该支持隐藏图表', () => {
      render(<VoteStatistics stats={mockStats} showChart={false} />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('总票数为0时不应该显示图表', () => {
      const zeroStats: VoteStats = {
        taskId: 'task-1',
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0,
        score: 0,
      };

      render(<VoteStatistics stats={zeroStats} abstainCount={0} showChart={true} />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('参与率测试', () => {
    it('应该显示参与率（如果提供总用户数）', () => {
      render(<VoteStatistics stats={mockStats} totalUsers={20} showParticipation={true} />);

      expect(screen.getByText('参与率')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument(); // 13/20 = 65%
    });

    it('应该支持隐藏参与率', () => {
      render(<VoteStatistics stats={mockStats} totalUsers={20} showParticipation={false} />);

      expect(screen.queryByText('参与率')).not.toBeInTheDocument();
    });

    it('没有提供总用户数时不应该显示参与率', () => {
      render(<VoteStatistics stats={mockStats} totalUsers={0} showParticipation={true} />);

      expect(screen.queryByText('参与率')).not.toBeInTheDocument();
    });

    it('应该显示参与人数', () => {
      render(<VoteStatistics stats={mockStats} totalUsers={20} />);

      expect(screen.getByText('13 / 20 人已投票')).toBeInTheDocument();
    });

    it('应该正确计算包含弃权的参与率', () => {
      render(<VoteStatistics stats={mockStats} abstainCount={5} totalUsers={20} />);

      expect(screen.getByText('90%')).toBeInTheDocument(); // (13+5)/20 = 90%
    });
  });

  describe('百分比计算测试', () => {
    it('应该正确计算支持百分比', () => {
      const stats: VoteStats = {
        taskId: 'task-1',
        upvotes: 8,
        downvotes: 2,
        totalVotes: 10,
        score: 6,
      };

      render(<VoteStatistics stats={stats} />);

      expect(screen.getByText('(80%)')).toBeInTheDocument(); // 8/10
    });

    it('应该正确计算反对百分比', () => {
      const stats: VoteStats = {
        taskId: 'task-1',
        upvotes: 8,
        downvotes: 2,
        totalVotes: 10,
        score: 6,
      };

      render(<VoteStatistics stats={stats} />);

      expect(screen.getByText('(20%)')).toBeInTheDocument(); // 2/10
    });

    it('总票数为0时百分比应该为0%', () => {
      const zeroStats: VoteStats = {
        taskId: 'task-1',
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0,
        score: 0,
      };

      render(<VoteStatistics stats={zeroStats} />);

      // 检查有两个0%（支持和反对）
      const percentageElements = screen.getAllByText('(0%)');
      expect(percentageElements.length).toBe(2);
    });
  });

  describe('样式测试', () => {
    it('支持卡片应该有绿色背景', () => {
      render(<VoteStatistics stats={mockStats} />);

      // 找到包含"支持"文本的容器
      const supportCard = screen.getByText('支持').closest('.bg-green-50');
      expect(supportCard).toBeInTheDocument();
    });

    it('反对卡片应该有红色背景', () => {
      render(<VoteStatistics stats={mockStats} />);

      const opposeCard = screen.getByText('反对').closest('.bg-red-50');
      expect(opposeCard).toBeInTheDocument();
    });

    it('弃权卡片应该有灰色背景（如果有弃权）', () => {
      render(<VoteStatistics stats={mockStats} abstainCount={2} />);

      const abstainCard = screen.getByText('弃权').closest('.bg-gray-50');
      expect(abstainCard).toBeInTheDocument();
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的标题层级', () => {
      render(<VoteStatistics stats={mockStats} />);

      // 标题包含"统计"和"投票统计"文本
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('投票统计');
    });

    it('参与率进度条应该有正确的ARIA属性', () => {
      render(<VoteStatistics stats={mockStats} totalUsers={20} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '65');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', '投票参与率');
    });

    it('表情符号应该有正确的role属性', () => {
      render(<VoteStatistics stats={mockStats} />);

      const emojis = screen.getAllByRole('img');
      expect(emojis.length).toBeGreaterThan(0);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理所有票数都是0的情况', () => {
      const zeroStats: VoteStats = {
        taskId: 'task-1',
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0,
        score: 0,
      };

      render(<VoteStatistics stats={zeroStats} />);

      // 检查有多个0（支持、反对、总票数、得分）
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
      
      // 检查有两个0%（支持和反对）
      const percentageElements = screen.getAllByText('(0%)');
      expect(percentageElements.length).toBe(2);
    });

    it('应该处理大量票数', () => {
      const largeStats: VoteStats = {
        taskId: 'task-1',
        upvotes: 1000000,
        downvotes: 500000,
        totalVotes: 1500000,
        score: 500000,
      };

      render(<VoteStatistics stats={largeStats} />);

      // 数字直接渲染（不格式化），检查数字是否存在
      const upvoteElements = screen.getAllByText('1000000');
      expect(upvoteElements.length).toBeGreaterThan(0);
      
      const downvoteElements = screen.getAllByText('500000');
      expect(downvoteElements.length).toBeGreaterThan(0);
    });

    it('应该处理只有支持票的情况', () => {
      const onlyUpvotes: VoteStats = {
        taskId: 'task-1',
        upvotes: 10,
        downvotes: 0,
        totalVotes: 10,
        score: 10,
      };

      render(<VoteStatistics stats={onlyUpvotes} />);

      expect(screen.getByText('(100%)')).toBeInTheDocument(); // 支持100%
      expect(screen.getByText('(0%)')).toBeInTheDocument(); // 反对0%
    });

    it('应该处理只有反对票的情况', () => {
      const onlyDownvotes: VoteStats = {
        taskId: 'task-1',
        upvotes: 0,
        downvotes: 10,
        totalVotes: 10,
        score: -10,
      };

      render(<VoteStatistics stats={onlyDownvotes} />);

      expect(screen.getByText('(0%)')).toBeInTheDocument(); // 支持0%
      expect(screen.getByText('(100%)')).toBeInTheDocument(); // 反对100%
    });
  });
});
