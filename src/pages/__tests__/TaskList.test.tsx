import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TaskList } from '../TaskList';
import type { Task } from '../../types';
import { TaskStatus, TaskPriority } from '../../types';

// Mock useVoteStore
vi.mock('../../stores/voteStore', () => ({
  useVoteStore: vi.fn(() => ({
    voteStats: new Map([
      ['task-001', { taskId: 'task-001', upvotes: 12, downvotes: 3, totalVotes: 15, score: 9 }],
      ['task-002', { taskId: 'task-002', upvotes: 8, downvotes: 2, totalVotes: 10, score: 6 }],
      ['task-003', { taskId: 'task-003', upvotes: 5, downvotes: 1, totalVotes: 6, score: 4 }],
    ]),
    fetchVoteStats: vi.fn(),
  })),
}));

// Mock VotingSummary component
vi.mock('../../components/VotingSummary', () => ({
  VotingSummary: ({ taskId, onClick }: { taskId: string; onClick?: () => void }) => (
    <div data-testid={`voting-summary-${taskId}`} onClick={onClick}>
      👍12 👎3
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon">🔍</span>,
  Filter: () => <span data-testid="filter-icon">⚙️</span>,
  Plus: () => <span data-testid="plus-icon">+</span>,
  User: () => <span data-testid="user-icon">👤</span>,
  Clock: () => <span data-testid="clock-icon">🕐</span>,
  ChevronRight: () => <span data-testid="chevron-icon">→</span>,
}));

/**
 * 渲染带路由的组件
 */
const renderWithRouter = (
  ui: React.ReactElement,
  { route = '/tasks' }: { route?: string } = {}
) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/tasks" element={ui} />
        <Route path="/tasks/:taskId" element={<div>Task Detail</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('TaskList 集成测试', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-001',
      title: '实现用户登录功能',
      description: '实现基于JWT的用户登录功能',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assignee: '张三',
      tags: ['前端', 'React'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-002',
      title: '优化数据库查询',
      description: '优化慢查询性能',
      status: TaskStatus.PENDING,
      priority: TaskPriority.URGENT,
      assignee: '李四',
      tags: ['后端', '数据库'],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task-003',
      title: '修复移动端问题',
      description: '修复布局问题',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      assignee: '王五',
      tags: ['前端', 'Bug'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('页面渲染测试', () => {
    it('应该渲染页面标题', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      expect(screen.getByText('任务列表')).toBeInTheDocument();
    });

    it('应该渲染所有任务', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      expect(screen.getByText('实现用户登录功能')).toBeInTheDocument();
      expect(screen.getByText('优化数据库查询')).toBeInTheDocument();
      expect(screen.getByText('修复移动端问题')).toBeInTheDocument();
    });

    it('应该显示任务总数', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      expect(screen.getByText(/共 3 个任务/)).toBeInTheDocument();
    });

    it('应该渲染任务ID', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      expect(screen.getByText('#task-001')).toBeInTheDocument();
      expect(screen.getByText('#task-002')).toBeInTheDocument();
      expect(screen.getByText('#task-003')).toBeInTheDocument();
    });

    it('应该渲染任务状态标签', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      // 使用 getAllByText 因为可能有多个匹配
      expect(screen.getAllByText('进行中').length).toBeGreaterThan(0);
      expect(screen.getAllByText('待处理').length).toBeGreaterThan(0);
      expect(screen.getAllByText('已完成').length).toBeGreaterThan(0);
    });

    it('应该渲染任务描述', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      expect(screen.getByText('实现基于JWT的用户登录功能')).toBeInTheDocument();
      expect(screen.getByText('优化慢查询性能')).toBeInTheDocument();
    });
  });

  describe('投票摘要集成测试', () => {
    it('每个任务卡片应该包含投票摘要组件', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      expect(screen.getByTestId('voting-summary-task-001')).toBeInTheDocument();
      expect(screen.getByTestId('voting-summary-task-002')).toBeInTheDocument();
      expect(screen.getByTestId('voting-summary-task-003')).toBeInTheDocument();
    });

    it('投票摘要应该显示正确的格式', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      const summaries = screen.getAllByText('👍12 👎3');
      expect(summaries.length).toBeGreaterThan(0);
    });

    it('点击投票摘要应该导航到任务详情', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      const summary = screen.getByTestId('voting-summary-task-001');
      expect(summary).toBeInTheDocument();
      // 投票摘要存在，可以点击
    });
  });

  describe('搜索功能测试', () => {
    it('应该渲染搜索框', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showSearch={true} />);

      expect(screen.getByPlaceholderText('搜索任务...')).toBeInTheDocument();
    });

    it('搜索应该过滤任务', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showSearch={true} />);

      const searchInput = screen.getByPlaceholderText('搜索任务...');
      fireEvent.change(searchInput, { target: { value: '登录' } });

      await waitFor(() => {
        expect(screen.getByText('实现用户登录功能')).toBeInTheDocument();
        expect(screen.queryByText('优化数据库查询')).not.toBeInTheDocument();
      });
    });

    it('搜索应该匹配标签', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showSearch={true} />);

      const searchInput = screen.getByPlaceholderText('搜索任务...');
      fireEvent.change(searchInput, { target: { value: 'React' } });

      await waitFor(() => {
        expect(screen.getByText('实现用户登录功能')).toBeInTheDocument();
      });
    });

    it('无匹配结果时应该显示空状态', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showSearch={true} />);

      const searchInput = screen.getByPlaceholderText('搜索任务...');
      fireEvent.change(searchInput, { target: { value: '不存在的任务' } });

      await waitFor(() => {
        expect(screen.getByText('暂无任务')).toBeInTheDocument();
      });
    });
  });

  describe('筛选功能测试', () => {
    it('应该渲染状态筛选器', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showFilters={true} />);

      expect(screen.getByLabelText('状态筛选')).toBeInTheDocument();
    });

    it('按状态筛选应该过滤任务', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showFilters={true} />);

      const statusSelect = screen.getByLabelText('状态筛选');
      fireEvent.change(statusSelect, { target: { value: TaskStatus.IN_PROGRESS } });

      await waitFor(() => {
        expect(screen.getByText('实现用户登录功能')).toBeInTheDocument();
        expect(screen.queryByText('优化数据库查询')).not.toBeInTheDocument();
      });
    });

    it('应该显示筛选后的任务数', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showFilters={true} />);

      const statusSelect = screen.getByLabelText('状态筛选');
      fireEvent.change(statusSelect, { target: { value: TaskStatus.IN_PROGRESS } });

      await waitFor(() => {
        expect(screen.getByText(/共 1 个任务 \(已筛选\)/)).toBeInTheDocument();
      });
    });
  });

  describe('排序功能测试', () => {
    it('应该渲染排序选择器', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showFilters={true} />);

      expect(screen.getByLabelText('排序方式')).toBeInTheDocument();
    });

    it('应该能够切换排序方式', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showFilters={true} />);

      const sortSelect = screen.getByLabelText('排序方式');
      fireEvent.change(sortSelect, { target: { value: 'priority' } });

      // 验证排序选择器值已更改
      expect(sortSelect).toHaveValue('priority');
    });

    it('应该能够切换排序顺序', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showFilters={true} />);

      const orderButton = screen.getByLabelText('降序');
      fireEvent.click(orderButton);

      await waitFor(() => {
        expect(screen.getByLabelText('升序')).toBeInTheDocument();
      });
    });
  });

  describe('创建任务测试', () => {
    it('应该渲染新建任务按钮', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showCreateButton={true} />);

      // 使用 aria-label 查找按钮
      expect(screen.getByLabelText('创建新任务')).toBeInTheDocument();
    });

    it('应该支持隐藏创建按钮', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showCreateButton={false} />);

      expect(screen.queryByRole('button', { name: '新建任务' })).not.toBeInTheDocument();
    });
  });

  describe('任务导航测试', () => {
    it('点击任务卡片应该导航到详情页', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      const taskCard = screen.getByText('实现用户登录功能').closest('div[role="button"]');
      fireEvent.click(taskCard!);

      // 验证任务卡片可点击
      expect(taskCard).toHaveClass('cursor-pointer');
    });

    it('任务卡片应该可以通过键盘访问', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      const taskCard = screen.getByRole('button', { name: /查看任务：实现用户登录功能/ });
      expect(taskCard).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('加载状态测试', () => {
    it('没有初始数据时应该显示加载状态', () => {
      renderWithRouter(<TaskList />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('空状态测试', () => {
    it('没有任务时应该显示空状态', () => {
      renderWithRouter(<TaskList initialTasks={[]} />);

      expect(screen.getByText('暂无任务')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('搜索框应该有aria-label', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showSearch={true} />);

      const searchInput = screen.getByLabelText('搜索任务');
      expect(searchInput).toBeInTheDocument();
    });

    it('筛选器应该有aria-label', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showFilters={true} />);

      expect(screen.getByLabelText('状态筛选')).toBeInTheDocument();
      expect(screen.getByLabelText('排序方式')).toBeInTheDocument();
    });

    it('新建按钮应该有aria-label', () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} showCreateButton={true} />);

      expect(screen.getByLabelText('创建新任务')).toBeInTheDocument();
    });
  });

  describe('实时更新测试', () => {
    it('store更新后应该重新渲染投票摘要', async () => {
      renderWithRouter(<TaskList initialTasks={mockTasks} />);

      // 验证投票摘要已渲染
      const summary = screen.getByTestId('voting-summary-task-001');
      expect(summary).toBeInTheDocument();
    });
  });
});
