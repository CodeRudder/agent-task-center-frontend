
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskCard from '../index';
import { Task } from '../../../services/task.service';

const mockTask: Task = {
  id: 1,
  title: '测试任务',
  description: '这是一个测试任务',
  status: 'todo',
  priority: 'medium',
  progress: 50,
  dueDate: '2024-12-31T23:59:59Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  assignments: [],
};

describe('TaskCard', () => {
  const defaultProps = {
    task: mockTask,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    deleteLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该正确渲染任务标题', () => {
      render(<TaskCard {...defaultProps} />);

      expect(screen.getByText('测试任务')).toBeInTheDocument();
    });

    it('应该正确渲染任务进度', () => {
      render(<TaskCard {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('应该正确渲染任务优先级标签', () => {
      render(<TaskCard {...defaultProps} />);

      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('应该正确渲染任务状态标签', () => {
      render(<TaskCard {...defaultProps} />);

      expect(screen.getByText('待办')).toBeInTheDocument();
    });

    it('应该正确渲染截止日期', () => {
      render(<TaskCard {...defaultProps} />);

      expect(screen.getByText(/截止：/)).toBeInTheDocument();
    });

    it('应该正确渲染编辑和删除按钮', () => {
      render(<TaskCard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('交互测试', () => {
    it('点击编辑按钮应该调用onEdit', () => {
      const onEdit = vi.fn();
      const props = { ...defaultProps, onEdit };

      render(<TaskCard {...props} />);

      const buttons = screen.getAllByRole('button');
      const editButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('edit'));
      
      if (editButton) {
        fireEvent.click(editButton);
      }

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockTask);
    });

    it('点击删除按钮应该显示删除确认弹窗', async () => {
      render(<TaskCard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('delete'));
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      await waitFor(() => {
        expect(screen.getByText('确认删除')).toBeInTheDocument();
      });
    });

    it('在删除确认弹窗中点击取消应该关闭弹窗', async () => {
      render(<TaskCard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('delete'));
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      await waitFor(() => {
        expect(screen.getByText('确认删除')).toBeInTheDocument();
      });

      const dialogButtons = screen.getAllByRole('button').filter(btn => btn.textContent?.includes('取消'));
      const cancelButton = dialogButtons[dialogButtons.length - 1];
      
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('确认删除')).not.toBeInTheDocument();
      });
    });

    it('在删除确认弹窗中点击确认应该调用onDelete', async () => {
      const onDelete = vi.fn();
      const props = { ...defaultProps, onDelete };

      render(<TaskCard {...props} />);

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('delete'));
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      await waitFor(() => {
        expect(screen.getByText('确认删除')).toBeInTheDocument();
      });

      const dialogButtons = screen.getAllByRole('button').filter(btn => btn.textContent?.includes('确认删除'));
      const confirmButton = dialogButtons[dialogButtons.length - 1];
      
      if (confirmButton) {
        fireEvent.click(confirmButton);
      }

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith(mockTask.id);
      });
    });
  });

  describe('边界情况测试', () => {
    it('没有onEdit回调时不应该显示编辑按钮', () => {
      const { onEdit, ...propsWithoutEdit } = defaultProps;

      render(<TaskCard {...propsWithoutEdit} />);

      const buttons = screen.getAllByRole('button');
      const editButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('edit'));
      
      expect(editButton).not.toBeInTheDocument();
    });

    it('没有onDelete回调时不应该显示删除按钮', () => {
      const { onDelete, ...propsWithoutDelete } = defaultProps;

      render(<TaskCard {...propsWithoutDelete} />);

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('delete'));
      
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('没有assignments时不应该显示负责人信息', () => {
      const props = { ...defaultProps, task: { ...mockTask, assignments: [] } };

      render(<TaskCard {...props} />);

      expect(screen.queryByText(/负责人：/)).not.toBeInTheDocument();
    });

    it('有assignments时应该显示负责人信息', () => {
      const taskWithAssignments: Task = {
        ...mockTask,
        assignments: [
          { agentId: 1, agentName: 'Agent 1', role: 'developer' },
          { agentId: 2, agentName: 'Agent 2', role: 'tester' },
        ],
      };

      render(<TaskCard {...defaultProps} task={taskWithAssignments} />);

      expect(screen.getByText(/负责人：Agent 1, Agent 2/)).toBeInTheDocument();
    });
  });

  describe('loading状态测试', () => {
    it('deleteLoading=true时确认按钮应该显示loading状态', async () => {
      const props = { ...defaultProps, deleteLoading: true };

      render(<TaskCard {...props} />);

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('delete'));
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      await waitFor(() => {
        expect(screen.getByText('确认删除')).toBeInTheDocument();
      });

      const dialogButtons = screen.getAllByRole('button');
      const confirmButton = dialogButtons.find(btn => btn.textContent?.includes('确认删除'));
      
      expect(confirmButton).toHaveClass('ant-btn-loading');
    });
  });

  describe('组件快照测试', () => {
    it('应该匹配快照', () => {
      const { asFragment } = render(<TaskCard {...defaultProps} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('loading状态下应该匹配快照', () => {
      const props = { ...defaultProps, deleteLoading: true };
      const { asFragment } = render(<TaskCard {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('可访问性测试', () => {
    it('应该是可交互的', () => {
      const { container } = render(<TaskCard {...defaultProps} />);

      const card = container.querySelector('.ant-card');
      expect(card).toHaveClass('ant-card-hoverable');
    });
  });
});
