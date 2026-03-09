/**
 * taskStore 状态流转相关单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTaskStore } from '../taskStore';
import TaskService from '@/services/taskService';
import type { TaskStatus } from '@/types/task';

// Mock TaskService
vi.mock('@/services/taskService');

describe('taskStore - 状态流转功能', () => {
  beforeEach(() => {
    // 重置store状态
    useTaskStore.setState({
      tasks: [],
      currentTask: null,
      statusHistories: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getNextStatuses', () => {
    it('应该返回todo状态可以流转的下一个状态', () => {
      const store = useTaskStore.getState();
      const nextStatuses = store.getNextStatuses('todo');

      expect(nextStatuses).toEqual(['in_progress']);
    });

    it('应该返回in_progress状态可以流转的下一个状态', () => {
      const store = useTaskStore.getState();
      const nextStatuses = store.getNextStatuses('in_progress');

      expect(nextStatuses).toEqual(['review', 'blocked', 'todo']);
    });

    it('应该返回review状态可以流转的下一个状态', () => {
      const store = useTaskStore.getState();
      const nextStatuses = store.getNextStatuses('review');

      expect(nextStatuses).toEqual(['done', 'in_progress']);
    });

    it('应该返回blocked状态可以流转的下一个状态', () => {
      const store = useTaskStore.getState();
      const nextStatuses = store.getNextStatuses('blocked');

      expect(nextStatuses).toEqual(['in_progress']);
    });

    it('应该返回done状态可以流转的下一个状态', () => {
      const store = useTaskStore.getState();
      const nextStatuses = store.getNextStatuses('done');

      expect(nextStatuses).toEqual(['in_progress']);
    });
  });

  describe('requireReason', () => {
    it('应该正确识别需要原因的状态流转：in_progress -> blocked', () => {
      const store = useTaskStore.getState();
      const requireReason = store.requireReason('in_progress', 'blocked');

      expect(requireReason).toBe(true);
    });

    it('应该正确识别需要原因的状态流转：in_progress -> todo', () => {
      const store = useTaskStore.getState();
      const requireReason = store.requireReason('in_progress', 'todo');

      expect(requireReason).toBe(true);
    });

    it('应该正确识别需要原因的状态流转：review -> in_progress', () => {
      const store = useTaskStore.getState();
      const requireReason = store.requireReason('review', 'in_progress');

      expect(requireReason).toBe(true);
    });

    it('应该正确识别需要原因的状态流转：done -> in_progress', () => {
      const store = useTaskStore.getState();
      const requireReason = store.requireReason('done', 'in_progress');

      expect(requireReason).toBe(true);
    });

    it('应该正确识别不需要原因的状态流转：todo -> in_progress', () => {
      const store = useTaskStore.getState();
      const requireReason = store.requireReason('todo', 'in_progress');

      expect(requireReason).toBe(false);
    });

    it('应该正确识别不需要原因的状态流转：in_progress -> review', () => {
      const store = useTaskStore.getState();
      const requireReason = store.requireReason('in_progress', 'review');

      expect(requireReason).toBe(false);
    });

    it('应该正确识别不需要原因的状态流转：review -> done', () => {
      const store = useTaskStore.getState();
      const requireReason = store.requireReason('review', 'done');

      expect(requireReason).toBe(false);
    });

    it('应该正确识别不需要原因的状态流转：blocked -> in_progress', () => {
      const store = useTaskStore.getState();
      const requireReason = store.requireReason('blocked', 'in_progress');

      expect(requireReason).toBe(false);
    });
  });

  describe('updateTaskStatus', () => {
    const mockTask = {
      id: 'task-123',
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

    it('应该成功更新任务状态（不需要原因）', async () => {
      const newStatus: TaskStatus = 'review';
      const updatedTask = { ...mockTask, status: newStatus };

      vi.mocked(TaskService.updateTaskStatus).mockResolvedValue(updatedTask);

      // 使用 setState 来设置初始状态
      useTaskStore.setState({
        tasks: [mockTask],
        currentTask: mockTask,
      });

      const store = useTaskStore.getState();
      
      // 更新状态
      const result = await store.updateTaskStatus(mockTask.id, newStatus);

      expect(TaskService.updateTaskStatus).toHaveBeenCalledWith(
        mockTask.id,
        { status: newStatus }
      );
      expect(result.status).toBe(newStatus);
      
      // 验证store状态已更新
      const updatedStore = useTaskStore.getState();
      expect(updatedStore.tasks[0].status).toBe(newStatus);
      expect(updatedStore.currentTask?.status).toBe(newStatus);
    });

    it('应该成功更新任务状态（需要原因）', async () => {
      const newStatus: TaskStatus = 'blocked';
      const reason = '等待外部资源';
      const updatedTask = { ...mockTask, status: newStatus };

      vi.mocked(TaskService.updateTaskStatus).mockResolvedValue(updatedTask);

      // 使用 setState 来设置初始状态
      useTaskStore.setState({
        tasks: [mockTask],
        currentTask: mockTask,
      });

      const store = useTaskStore.getState();
      
      // 更新状态
      const result = await store.updateTaskStatus(mockTask.id, newStatus, reason);

      expect(TaskService.updateTaskStatus).toHaveBeenCalledWith(
        mockTask.id,
        { status: newStatus, reason }
      );
      expect(result.status).toBe(newStatus);
      
      // 验证store状态已更新
      const updatedStore = useTaskStore.getState();
      expect(updatedStore.tasks[0].status).toBe(newStatus);
    });

    it('应该处理API错误并更新错误状态', async () => {
      const newStatus: TaskStatus = 'blocked';
      const mockError = new Error('状态流转不合法');

      vi.mocked(TaskService.updateTaskStatus).mockRejectedValue(mockError);

      // 使用 setState 来设置初始状态
      useTaskStore.setState({
        tasks: [mockTask],
        error: null,
      });

      const store = useTaskStore.getState();
      
      // 尝试更新状态
      await expect(store.updateTaskStatus(mockTask.id, newStatus))
        .rejects.toThrow('状态流转不合法');

      // 验证错误状态已更新
      const updatedStore = useTaskStore.getState();
      expect(updatedStore.error).toBe('更新任务状态失败');
      expect(updatedStore.isLoading).toBe(false);
    });

    it('应该正确更新loading状态', async () => {
      const newStatus: TaskStatus = 'review';
      const updatedTask = { ...mockTask, status: newStatus };

      vi.mocked(TaskService.updateTaskStatus).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(updatedTask), 100))
      );

      // 使用 setState 来设置初始状态
      useTaskStore.setState({
        tasks: [mockTask],
        isLoading: false,
      });

      const store = useTaskStore.getState();
      
      // 开始更新
      const updatePromise = store.updateTaskStatus(mockTask.id, newStatus);

      // 等待一个tick，确保loading状态已设置
      await new Promise(resolve => setTimeout(resolve, 10));

      // 检查loading状态
      const loadingStore = useTaskStore.getState();
      expect(loadingStore.isLoading).toBe(true);

      // 等待完成
      await updatePromise;

      // 检查loading状态已重置
      const completedStore = useTaskStore.getState();
      expect(completedStore.isLoading).toBe(false);
    });
  });

  describe('getStatusHistories', () => {
    const mockTaskId = 'task-123';
    const mockStatusHistories = [
      {
        id: 'history-1',
        taskId: mockTaskId,
        oldStatus: 'todo' as TaskStatus,
        newStatus: 'in_progress' as TaskStatus,
        changedBy: 'user-1',
        changedByType: 'user',
        changerName: '张三',
        reason: '开始处理任务',
        changedAt: '2026-03-08T01:00:00Z',
      },
      {
        id: 'history-2',
        taskId: mockTaskId,
        oldStatus: 'in_progress' as TaskStatus,
        newStatus: 'review' as TaskStatus,
        changedBy: 'user-1',
        changedByType: 'user',
        changerName: '张三',
        changedAt: '2026-03-08T02:00:00Z',
      },
    ];

    it('应该成功获取状态历史记录（使用默认参数）', async () => {
      const mockResponse = {
        items: mockStatusHistories,
        total: 2,
        page: 1,
        limit: 20,
      };

      vi.mocked(TaskService.getStatusHistories).mockResolvedValue(mockResponse);

      const store = useTaskStore.getState();
      const result = await store.getStatusHistories(mockTaskId);

      expect(TaskService.getStatusHistories).toHaveBeenCalledWith(mockTaskId, 1, 20);
      expect(result).toEqual(mockStatusHistories);
      
      // 验证store状态已更新
      const updatedStore = useTaskStore.getState();
      expect(updatedStore.statusHistories).toEqual(mockStatusHistories);
    });

    it('应该成功获取状态历史记录（使用自定义参数）', async () => {
      const mockResponse = {
        items: mockStatusHistories,
        total: 2,
        page: 2,
        limit: 10,
      };

      vi.mocked(TaskService.getStatusHistories).mockResolvedValue(mockResponse);

      const store = useTaskStore.getState();
      const result = await store.getStatusHistories(mockTaskId, 2, 10);

      expect(TaskService.getStatusHistories).toHaveBeenCalledWith(mockTaskId, 2, 10);
      expect(result).toEqual(mockStatusHistories);
    });

    it('应该处理空历史记录', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      };

      vi.mocked(TaskService.getStatusHistories).mockResolvedValue(mockResponse);

      const store = useTaskStore.getState();
      const result = await store.getStatusHistories(mockTaskId);

      expect(result).toEqual([]);
      
      const updatedStore = useTaskStore.getState();
      expect(updatedStore.statusHistories).toEqual([]);
    });

    it('应该处理API错误', async () => {
      const mockError = new Error('任务不存在');

      vi.mocked(TaskService.getStatusHistories).mockRejectedValue(mockError);

      const store = useTaskStore.getState();
      
      await expect(store.getStatusHistories(mockTaskId))
        .rejects.toThrow('任务不存在');

      // 验证错误状态已更新
      const updatedStore = useTaskStore.getState();
      expect(updatedStore.error).toBe('加载状态历史失败');
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe('状态流转规则完整测试', () => {
    it('应该正确验证所有状态流转规则', () => {
      const store = useTaskStore.getState();

      // 测试所有状态流转规则
      const transitions: Array<[TaskStatus, TaskStatus, boolean, boolean]> = [
        // [from, to, should be allowed, should require reason]
        ['todo', 'in_progress', true, false],
        
        ['in_progress', 'review', true, false],
        ['in_progress', 'blocked', true, true],
        ['in_progress', 'todo', true, true],
        
        ['review', 'done', true, false],
        ['review', 'in_progress', true, true],
        
        ['blocked', 'in_progress', true, false],
        
        ['done', 'in_progress', true, true],
      ];

      transitions.forEach(([from, to, shouldBeAllowed, shouldRequireReason]) => {
        const nextStatuses = store.getNextStatuses(from);
        const isAllowed = nextStatuses.includes(to);
        const requireReason = store.requireReason(from, to);

        expect(isAllowed).toBe(shouldBeAllowed);
        expect(requireReason).toBe(shouldRequireReason);
      });
    });
  });
});
