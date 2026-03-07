/**
 * TaskService 状态流转相关API单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TaskService from '../taskService';
import apiClient from '../api';
import type { TaskStatus, StatusHistoryItem } from '@/types/task';

// Mock apiClient
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('TaskService - 状态流转API', () => {
  const mockTaskId = 'task-123';
  const mockTask = {
    id: mockTaskId,
    title: '测试任务',
    description: '这是一个测试任务',
    status: 'in_progress' as TaskStatus,
    priority: 'medium',
    tags: [],
    attachments: [],
    createdBy: 'user-1',
    createdAt: '2026-03-08T00:00:00Z',
    updatedAt: '2026-03-08T00:00:00Z',
  };

  const mockStatusHistories: StatusHistoryItem[] = [
    {
      id: 'history-1',
      taskId: mockTaskId,
      oldStatus: 'todo',
      newStatus: 'in_progress',
      changedBy: 'user-1',
      changedByType: 'user',
      changerName: '张三',
      reason: '开始处理任务',
      changedAt: '2026-03-08T01:00:00Z',
    },
    {
      id: 'history-2',
      taskId: mockTaskId,
      oldStatus: 'in_progress',
      newStatus: 'review',
      changedBy: 'user-1',
      changedByType: 'user',
      changerName: '张三',
      changedAt: '2026-03-08T02:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updateTaskStatus', () => {
    it('应该成功更新任务状态（不需要原因）', async () => {
      const newStatus: TaskStatus = 'in_progress';
      const mockResponse = { data: { ...mockTask, status: newStatus } };

      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

      const result = await TaskService.updateTaskStatus(mockTaskId, { status: newStatus });

      expect(apiClient.patch).toHaveBeenCalledWith(
        `/tasks/${mockTaskId}/status`,
        { status: newStatus }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('应该成功更新任务状态（需要原因）', async () => {
      const newStatus: TaskStatus = 'blocked';
      const reason = '等待外部资源';
      const mockResponse = { data: { ...mockTask, status: newStatus } };

      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

      const result = await TaskService.updateTaskStatus(mockTaskId, { status: newStatus, reason });

      expect(apiClient.patch).toHaveBeenCalledWith(
        `/tasks/${mockTaskId}/status`,
        { status: newStatus, reason }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('应该处理API错误', async () => {
      const newStatus: TaskStatus = 'blocked';
      const mockError = new Error('状态流转不合法');
      vi.mocked(apiClient.patch).mockRejectedValue(mockError);

      await expect(TaskService.updateTaskStatus(mockTaskId, { status: newStatus }))
        .rejects.toThrow('状态流转不合法');
    });
  });

  describe('getStatusHistories', () => {
    it('应该成功获取状态历史记录（使用默认分页参数）', async () => {
      const mockResponse = {
        data: {
          items: mockStatusHistories,
          total: 2,
          page: 1,
          limit: 20,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await TaskService.getStatusHistories(mockTaskId);

      expect(apiClient.get).toHaveBeenCalledWith(`/tasks/${mockTaskId}/status-histories`, {
        params: { page: 1, limit: 20 },
      });
      expect(result).toEqual(mockResponse.data);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].oldStatus).toBe('todo');
      expect(result.items[0].newStatus).toBe('in_progress');
    });

    it('应该成功获取状态历史记录（使用自定义分页参数）', async () => {
      const mockResponse = {
        data: {
          items: mockStatusHistories,
          total: 2,
          page: 2,
          limit: 10,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await TaskService.getStatusHistories(mockTaskId, 2, 10);

      expect(apiClient.get).toHaveBeenCalledWith(`/tasks/${mockTaskId}/status-histories`, {
        params: { page: 2, limit: 10 },
      });
      expect(result).toEqual(mockResponse.data);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('应该处理空历史记录', async () => {
      const mockResponse = {
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 20,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await TaskService.getStatusHistories(mockTaskId);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('应该处理API错误', async () => {
      const mockError = new Error('任务不存在');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(TaskService.getStatusHistories(mockTaskId))
        .rejects.toThrow('任务不存在');
    });
  });

  describe('状态流转场景测试', () => {
    it('应该支持从todo流转到in_progress', async () => {
      const newStatus: TaskStatus = 'in_progress';
      const mockResponse = { data: { ...mockTask, status: newStatus } };

      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

      const result = await TaskService.updateTaskStatus(mockTaskId, { status: newStatus });

      expect(result.status).toBe('in_progress');
    });

    it('应该支持从in_progress流转到review', async () => {
      const newStatus: TaskStatus = 'review';
      const mockResponse = { data: { ...mockTask, status: newStatus } };

      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

      const result = await TaskService.updateTaskStatus(mockTaskId, { status: newStatus });

      expect(result.status).toBe('review');
    });

    it('应该支持从review流转到done', async () => {
      const newStatus: TaskStatus = 'done';
      const mockResponse = { data: { ...mockTask, status: newStatus } };

      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

      const result = await TaskService.updateTaskStatus(mockTaskId, { status: newStatus });

      expect(result.status).toBe('done');
    });

    it('应该支持从blocked流转到in_progress（解除阻塞）', async () => {
      const mockBlockedTask = { ...mockTask, status: 'blocked' as TaskStatus };
      const newStatus: TaskStatus = 'in_progress';
      const mockResponse = { data: { ...mockBlockedTask, status: newStatus } };

      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

      const result = await TaskService.updateTaskStatus(mockTaskId, { status: newStatus });

      expect(result.status).toBe('in_progress');
    });
  });
});
