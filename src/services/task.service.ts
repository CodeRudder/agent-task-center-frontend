import api, { getWithETag } from './api';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'accepted' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  dueDate: string;
  categoryId?: number;
  assignments: Array<{
    agentId: number;
    agentName: string;
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  categoryId?: number;
  assignments: Array<{
    agentId: number;
    role: string;
  }>;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  dueDate?: string;
}

export const taskService = {
  // 获取任务列表
  getTasks: async (params?: {
    status?: string;
    priority?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ tasks: Task[]; total: number }> => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // 获取任务详情
  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // 创建任务
  createTask: async (data: CreateTaskDTO): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // 更新任务
  updateTask: async (id: number, data: UpdateTaskDTO): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  // 更新任务状态
  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // 删除任务
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // 分配任务
  assignTask: async (id: number, assignments: Array<{ agentId: number; role: string }>): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/assignments`, { assignments });
    return response.data;
  },

  // 验收任务
  acceptTask: async (id: number, comment?: string): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/accept`, { comment });
    return response.data;
  },

  // 驳回任务
  rejectTask: async (id: number, reason: string, requiredChanges?: string[]): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/reject`, { reason, requiredChanges });
    return response.data;
  },
};
