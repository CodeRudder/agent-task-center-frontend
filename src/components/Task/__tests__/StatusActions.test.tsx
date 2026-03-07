/**
 * StatusActions 组件单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatusActions } from '../StatusActions';
import { useTaskStore } from '@/stores/taskStore';

// Mock useTaskStore
vi.mock('@/stores/taskStore');

describe('StatusActions 组件', () => {
  const mockTaskId = 'task-123';
  const mockUpdateTaskStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock store 方法
    vi.mocked(useTaskStore).mockReturnValue({
      getNextStatuses: vi.fn(),
      updateTaskStatus: mockUpdateTaskStatus,
      requireReason: vi.fn(),
    });
  });

  it('应该渲染当前状态标签', () => {
    vi.mocked(useTaskStore).mockReturnValue({
      getNextStatuses: vi.fn(() => ['in_progress']),
      updateTaskStatus: mockUpdateTaskStatus,
      requireReason: vi.fn(() => false),
    });

    render(<StatusActions taskId={mockTaskId} currentStatus="todo" />);

    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('待办')).toBeInTheDocument();
  });

  it('应该渲染可流转的状态按钮', () => {
    const getNextStatuses = vi.fn(() => ['in_progress']);
    
    vi.mocked(useTaskStore).mockReturnValue({
      getNextStatuses,
      updateTaskStatus: mockUpdateTaskStatus,
      requireReason: vi.fn(() => false),
    });

    render(<StatusActions taskId={mockTaskId} currentStatus="todo" />);

    expect(screen.getByText('流转到：')).toBeInTheDocument();
    expect(screen.getByText('🔄')).toBeInTheDocument();
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('点击状态按钮应该调用updateTaskStatus（不需要原因）', async () => {
    const getNextStatuses = vi.fn(() => ['in_progress']);
    const requireReason = vi.fn(() => false);
    mockUpdateTaskStatus.mockResolvedValue({});

    vi.mocked(useTaskStore).mockReturnValue({
      getNextStatuses,
      updateTaskStatus: mockUpdateTaskStatus,
      requireReason,
    });

    render(<StatusActions taskId={mockTaskId} currentStatus="todo" />);

    const button = screen.getByText('进行中');
    fireEvent.click(button);

    await waitFor(() => {
      expect(requireReason).toHaveBeenCalledWith('todo', 'in_progress');
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(mockTaskId, 'in_progress');
    });
  });

  it('点击状态按钮应该显示原因对话框（需要原因）', async () => {
    const getNextStatuses = vi.fn(() => ['blocked']);
    const requireReason = vi.fn(() => true);
    mockUpdateTaskStatus.mockResolvedValue({});

    vi.mocked(useTaskStore).mockReturnValue({
      getNextStatuses,
      updateTaskStatus: mockUpdateTaskStatus,
      requireReason,
    });

    render(<StatusActions taskId={mockTaskId} currentStatus="in_progress" />);

    const button = screen.getByText('已阻塞');
    fireEvent.click(button);

    await waitFor(() => {
      expect(requireReason).toHaveBeenCalledWith('in_progress', 'blocked');
      expect(screen.getByText('状态变更原因')).toBeInTheDocument();
    });
  });

  it('disabled状态应该禁用按钮', () => {
    const getNextStatuses = vi.fn(() => ['in_progress']);

    vi.mocked(useTaskStore).mockReturnValue({
      getNextStatuses,
      updateTaskStatus: mockUpdateTaskStatus,
      requireReason: vi.fn(() => false),
    });

    render(<StatusActions taskId={mockTaskId} currentStatus="todo" disabled />);

    expect(screen.queryByText('流转到：')).not.toBeInTheDocument();
  });

  it('当没有可流转的状态时不应该显示按钮组', () => {
    const getNextStatuses = vi.fn(() => []);

    vi.mocked(useTaskStore).mockReturnValue({
      getNextStatuses,
      updateTaskStatus: mockUpdateTaskStatus,
      requireReason: vi.fn(() => false),
    });

    render(<StatusActions taskId={mockTaskId} currentStatus="todo" />);

    expect(screen.queryByText('流转到：')).not.toBeInTheDocument();
  });

  it('应该显示需要原因的状态按钮标记', () => {
    const getNextStatuses = vi.fn(() => ['blocked']);
    const requireReason = vi.fn(() => true);

    vi.mocked(useTaskStore).mockReturnValue({
      getNextStatuses,
      updateTaskStatus: mockUpdateTaskStatus,
      requireReason,
    });

    render(<StatusActions taskId={mockTaskId} currentStatus="in_progress" />);

    const button = screen.getByText('已阻塞');
    expect(button).toHaveTextContent('*');
  });
});
