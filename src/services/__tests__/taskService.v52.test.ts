/**
 * TaskService V5.2 P0 测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskService from '../taskService';
import apiClient from '../api';

// Mock apiClient
vi.mock('../api');

describe('TaskService V5.2 P0', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSubTask', () => {
    it('应该成功创建子任务', async () => {
      const mockSubTask = {
        id: '2',
        parentId: '1',
        title: '子任务',
        status: 'todo',
        priority: 'medium',
        isBlocked: false,
        dependencies: [],
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockSubTask });

      const result = await TaskService.createSubTask('1', {
        title: '子任务',
        description: '子任务描述',
        priority: 'medium',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/tasks/1/subtasks', {
        title: '子任务',
        description: '子任务描述',
        priority: 'medium',
      });
      expect(result.parentId).toBe('1');
    });
  });

  describe('getSubTasks', () => {
    it('应该成功获取子任务列表', async () => {
      const mockResponse = {
        parentTask: {
          id: '1',
          title: '父任务',
          status: 'in_progress',
          progress: 50,
          subtaskCount: 2,
        },
        subtasks: [
          {
            id: '2',
            parentId: '1',
            title: '子任务1',
            status: 'done',
            isBlocked: false,
            dependencies: [],
          },
          {
            id: '3',
            parentId: '1',
            title: '子任务2',
            status: 'todo',
            isBlocked: false,
            dependencies: [],
          },
        ],
        pagination: {
          total: 2,
          page: 1,
          pageSize: 20,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await TaskService.getSubTasks('1', { page: 1 });

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/tasks/1/subtasks', {
        params: { page: 1 },
      });
      expect(result.subtasks).toHaveLength(2);
      expect(result.parentTask.subtaskCount).toBe(2);
    });
  });

  describe('getTaskTree', () => {
    it('应该成功获取任务树形结构', async () => {
      const mockTree = [
        {
          key: '1',
          title: '任务1',
          data: { id: '1', title: '任务1', status: 'todo' },
          children: [
            {
              key: '2',
              title: '子任务1',
              data: { id: '2', title: '子任务1', status: 'done' },
              isLeaf: true,
            },
          ],
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTree });

      const result = await TaskService.getTaskTree();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/tasks/tree', {
        params: {},
      });
      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(1);
    });

    it('应该成功获取指定父任务下的树形结构', async () => {
      const mockTree = [
        {
          key: '2',
          title: '子任务1',
          data: { id: '2', title: '子任务1', status: 'done' },
          isLeaf: true,
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTree });

      const result = await TaskService.getTaskTree('1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/tasks/tree', {
        params: { parentId: '1' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('setDependencies', () => {
    it('应该成功设置任务依赖关系', async () => {
      const mockDependencies = [
        {
          id: 'dep-1',
          taskId: '1',
          dependsOnTaskId: '2',
          dependencyType: 'FS',
          createdAt: '2026-03-08T00:00:00Z',
        },
      ];

      vi.mocked(apiClient.put).mockResolvedValue({ data: mockDependencies });

      const result = await TaskService.setDependencies('1', {
        dependsOnTaskIds: ['2'],
        dependencyType: 'FS',
      });

      expect(apiClient.put).toHaveBeenCalledWith('/api/v1/tasks/1/dependencies', {
        dependsOnTaskIds: ['2'],
        dependencyType: 'FS',
      });
      expect(result).toHaveLength(1);
      expect(result[0].dependencyType).toBe('FS');
    });
  });

  describe('getDependencies', () => {
    it('应该成功获取任务依赖关系', async () => {
      const mockDependencies = [
        {
          id: 'dep-1',
          taskId: '1',
          dependsOnTaskId: '2',
          dependencyType: 'FS',
          createdAt: '2026-03-08T00:00:00Z',
        },
        {
          id: 'dep-2',
          taskId: '1',
          dependsOnTaskId: '3',
          dependencyType: 'SS',
          createdAt: '2026-03-08T00:00:00Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockDependencies });

      const result = await TaskService.getDependencies('1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/tasks/1/dependencies');
      expect(result).toHaveLength(2);
    });
  });

  describe('removeDependency', () => {
    it('应该成功删除任务依赖关系', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: null });

      await TaskService.removeDependency('1', 'dep-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/tasks/1/dependencies/dep-1');
    });
  });

  describe('checkDependencies', () => {
    it('应该成功检测任务依赖关系（无循环）', async () => {
      const mockResult = {
        hasCycle: false,
        blockedBy: [],
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult });

      const result = await TaskService.checkDependencies('1');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/tasks/1/check-dependencies');
      expect(result.hasCycle).toBe(false);
    });

    it('应该成功检测任务依赖关系（有循环）', async () => {
      const mockResult = {
        hasCycle: true,
        cyclePath: ['1', '2', '3', '1'],
        blockedBy: ['2', '3'],
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult });

      const result = await TaskService.checkDependencies('1');

      expect(result.hasCycle).toBe(true);
      expect(result.cyclePath).toEqual(['1', '2', '3', '1']);
      expect(result.blockedBy).toEqual(['2', '3']);
    });
  });
});
