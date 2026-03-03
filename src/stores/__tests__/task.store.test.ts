import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from '../task.store'
import type { Task } from '../../services/task.service'

describe('useTaskStore', () => {
  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    dueDate: '2026-03-03T10:00:00.000Z',
    assignments: [],
    createdAt: '2026-03-03T10:00:00.000Z',
    updatedAt: '2026-03-03T10:00:00.000Z',
  }

  beforeEach(() => {
    useTaskStore.setState({ tasks: [], selectedTask: null, loading: false })
  })

  it('should have initial state', () => {
    const state = useTaskStore.getState()
    expect(state.tasks).toEqual([])
    expect(state.selectedTask).toBeNull()
    expect(state.loading).toBe(false)
  })

  it('should set tasks', () => {
    const tasks = [mockTask]
    useTaskStore.getState().setTasks(tasks)

    const state = useTaskStore.getState()
    expect(state.tasks).toEqual(tasks)
  })

  it('should add task', () => {
    useTaskStore.getState().addTask(mockTask)

    const state = useTaskStore.getState()
    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0]).toEqual(mockTask)
  })

  it('should update task', () => {
    useTaskStore.getState().addTask(mockTask)
    useTaskStore.getState().updateTask(1, { progress: 50 })

    const state = useTaskStore.getState()
    expect(state.tasks[0].progress).toBe(50)
  })

  it('should remove task', () => {
    useTaskStore.getState().addTask(mockTask)
    useTaskStore.getState().removeTask(1)

    const state = useTaskStore.getState()
    expect(state.tasks).toHaveLength(0)
  })

  it('should set selected task', () => {
    useTaskStore.getState().setSelectedTask(mockTask)

    const state = useTaskStore.getState()
    expect(state.selectedTask).toEqual(mockTask)
  })

  it('should set loading', () => {
    useTaskStore.getState().setLoading(true)

    const state = useTaskStore.getState()
    expect(state.loading).toBe(true)
  })
})
