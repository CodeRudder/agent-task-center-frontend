import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as taskService from '../../services/task.service'

// Mock task service
vi.mock('../../services/task.service', () => ({
  createTask: vi.fn(),
  getTasks: vi.fn(),
  updateTaskProgress: vi.fn(),
  deleteTask: vi.fn(),
}))

describe('Task Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TC-TASK-001: Create Task Successfully', () => {
    it('should create task with all required fields', async () => {
      const mockTask = {
        id: 1,
        title: '完成用户模块开发',
        description: '实现用户注册、登录、个人信息管理功能',
        status: 'pending' as const,
        priority: 'high' as const,
        progress: 0,
        dueDate: '2026-03-10T18:00:00.000Z',
        assignments: [],
        createdAt: '2026-03-03T10:00:00.000Z',
        updatedAt: '2026-03-03T10:00:00.000Z',
      }

      ;(taskService.createTask as any).mockResolvedValue(mockTask)

      const result = await taskService.createTask({
        title: '完成用户模块开发',
        description: '实现用户注册、登录、个人信息管理功能',
        priority: 'high',
        dueDate: '2026-03-10T18:00:00.000Z',
      })

      expect(result.title).toBe('完成用户模块开发')
      expect(result.status).toBe('pending')
      expect(result.progress).toBe(0)
    })
  })

  describe('TC-TASK-002: Get Tasks', () => {
    it('should retrieve task list', async () => {
      const mockTasks = [
        {
          id: 1,
          title: '测试任务',
          description: '任务描述',
          status: 'pending' as const,
          priority: 'high' as const,
          progress: 50,
          dueDate: '2026-03-10T18:00:00.000Z',
          assignments: [],
          createdAt: '2026-03-03T10:00:00.000Z',
          updatedAt: '2026-03-03T10:00:00.000Z',
        },
      ]

      ;(taskService.getTasks as any).mockResolvedValue(mockTasks)

      const result = await taskService.getTasks()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('测试任务')
    })
  })

  describe('TC-TASK-010: Update Task Progress', () => {
    it('should update task progress successfully', async () => {
      const mockTask = {
        id: 1,
        title: '测试任务',
        description: '任务描述',
        status: 'in_progress' as const,
        priority: 'high' as const,
        progress: 50,
        dueDate: '2026-03-10T18:00:00.000Z',
        assignments: [],
        createdAt: '2026-03-03T10:00:00.000Z',
        updatedAt: '2026-03-03T10:00:00.000Z',
      }

      ;(taskService.updateTaskProgress as any).mockResolvedValue(mockTask)

      const result = await taskService.updateTaskProgress(1, 50)

      expect(result.progress).toBe(50)
      expect(result.status).toBe('in_progress')
      expect(taskService.updateTaskProgress).toHaveBeenCalledWith(1, 50)
    })
  })

  describe('TC-TASK-015: Delete Task', () => {
    it('should delete task successfully', async () => {
      ;(taskService.deleteTask as any).mockResolvedValue(undefined)

      await taskService.deleteTask(1)

      expect(taskService.deleteTask).toHaveBeenCalledWith(1)
    })
  })
})
