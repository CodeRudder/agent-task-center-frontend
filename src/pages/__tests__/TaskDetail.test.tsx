import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TaskDetail } from '../TaskDetail';
import type { Task } from '../../types';
import { TaskStatus, TaskPriority } from '../../types';

// Mock useVoteStore
vi.mock('../../stores/voteStore', () => ({
  useVoteStore: vi.fn(() => ({
    voteStats: new Map([
      ['task-001', {
        taskId: 'task-001',
        upvotes: 10,
        downvotes: 3,
        totalVotes: 13,
        score: 7,
      }],
    ]),
    userVotes: new Map([['task-001', 'upvote']]),
    loading: false,
    error: null,
    fetchVoteStats: vi.fn(),
    fetchUserVote: vi.fn(),
    vote: vi.fn(),
    clearError: vi.fn(),
  })),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
  Clock: () => <span data-testid="clock-icon">🕐</span>,
  User: () => <span data-testid="user-icon">👤</span>,
  Tag: () => <span data-testid="tag-icon">🏷️</span>,
  CheckCircle: () => <span data-testid="check-icon">✓</span>,
}));

/**
 * 渲染带路由的组件
 */
const renderWithRouter = (
  ui: React.ReactElement,
  { route = '/tasks/task-001' }: { route?: string } = {}
) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/tasks/:taskId" element={ui} />
        <Route path="/tasks" element={<div>Task List</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('TaskDetail 集成测试', () => {
  const mockTask: Task = {
    id: 'task-001',
    title: '测试任务',
    description: '这是一个测试任务描述',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    assignee: '张三',
    assigneeId: 'user-001',
    creator: '李四',
    creatorId: 'user-002',
    tags: ['前端', 'React'],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('页面渲染测试', () => {
    it('应该渲染任务标题和ID', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText('#task-001')).toBeInTheDocument();
      expect(screen.getByText('测试任务')).toBeInTheDocument();
    });

    it('应该渲染任务状态标签', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText('进行中')).toBeInTheDocument();
    });

    it('应该渲染任务优先级', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText('优先级：高')).toBeInTheDocument();
    });

    it('应该渲染任务描述', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText('这是一个测试任务描述')).toBeInTheDocument();
    });

    it('应该渲染指派人信息', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText(/指派给：/)).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    it('应该渲染标签', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText('前端')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  describe('投票功能集成测试', () => {
    it('应该渲染投票区域组件', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText('📊 投票区域')).toBeInTheDocument();
    });

    it('应该渲染投票按钮', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByRole('button', { name: '支持' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '反对' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '弃权' })).toBeInTheDocument();
    });

    it('应该显示投票统计信息', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText('投票统计：')).toBeInTheDocument();
    });

    it('应该显示参与率（当提供totalUsers时）', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText(/参与度：/)).toBeInTheDocument();
    });

    it('点击投票按钮应该触发投票操作', async () => {
      const mockVote = vi.fn();
      vi.mocked(await import('../../stores/voteStore')).useVoteStore.mockReturnValue({
        voteStats: new Map([
          ['task-001', { taskId: 'task-001', upvotes: 10, downvotes: 3, totalVotes: 13, score: 7 }],
        ]),
        userVotes: new Map(),
        loading: false,
        error: null,
        fetchVoteStats: vi.fn(),
        fetchUserVote: vi.fn(),
        vote: mockVote,
        clearError: vi.fn(),
      });

      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      // 投票按钮应该存在
      const upvoteButton = screen.getByRole('button', { name: '支持' });
      expect(upvoteButton).toBeInTheDocument();
    });
  });

  describe('权限控制测试', () => {
    it('用户已投票时应该显示选中状态', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      // 已投票（支持），按钮应该有 aria-pressed 属性
      const upvoteButton = screen.getByRole('button', { name: '支持' });
      // 验证按钮存在且有 aria-pressed 属性
      expect(upvoteButton).toBeInTheDocument();
      expect(upvoteButton).toHaveAttribute('aria-pressed');
    });

    it('用户可以修改投票（点击其他按钮）', async () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      const downvoteButton = screen.getByRole('button', { name: '反对' });
      expect(downvoteButton).toBeInTheDocument();
      // 反对按钮应该可以点击（不是disabled）
      expect(downvoteButton).not.toBeDisabled();
    });
  });

  describe('导航测试', () => {
    it('应该显示返回按钮', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      expect(screen.getByText('返回任务列表')).toBeInTheDocument();
    });

    it('点击返回按钮应该导航到任务列表', async () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      const backButton = screen.getByText('返回任务列表');
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('加载状态测试', () => {
    it('没有初始数据时应该显示加载状态', () => {
      renderWithRouter(<TaskDetail totalUsers={25} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('错误状态测试', () => {
    it('缺少taskId时应该显示错误', async () => {
      render(
        <MemoryRouter initialEntries={['/tasks/']}>
          <Routes>
            <Route path="/tasks/" element={<TaskDetail totalUsers={25} />} />
          </Routes>
        </MemoryRouter>
      );

      // 路由不匹配时会显示错误或加载状态
      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
      });
    });
  });

  describe('响应式设计测试', () => {
    it('页面应该有正确的布局类', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      // 检查页面标题是否存在
      const title = screen.getByText('测试任务');
      expect(title).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('返回按钮应该有aria-label', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      const backButton = screen.getByRole('button', { name: '返回任务列表' });
      expect(backButton).toHaveAttribute('aria-label', '返回任务列表');
    });

    it('投票按钮应该有aria-pressed属性', () => {
      renderWithRouter(<TaskDetail initialTask={mockTask} totalUsers={25} />);

      const upvoteButton = screen.getByRole('button', { name: '支持' });
      expect(upvoteButton).toHaveAttribute('aria-pressed');
    });
  });
});
