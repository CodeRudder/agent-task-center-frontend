/**
 * Task API 服务
 */
import apiClient from './api';
import {
  Task,
  TaskComment,
  TaskAttachment,
  TaskHistory,
  PaginatedResponse,
  TaskFilters,
  TaskSorting,
} from '@/types/task';

export class TaskService {
  /**
   * 获取任务列表
   */
  static async getTasks(
    filters?: TaskFilters,
    sorting?: TaskSorting,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<Task>> {
    const params = {
      ...filters,
      ...sorting,
      page,
      pageSize,
    };
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  }

  /**
   * 获取任务详情
   */
  static async getTask(id: string): Promise<Task> {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  }

  /**
   * 创建任务
   */
  static async createTask(data: Partial<Task>): Promise<Task> {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  }

  /**
   * 更新任务
   */
  static async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  }

  /**
   * 删除任务
   */
  static async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  }

  /**
   * 批量删除任务
   */
  static async batchDeleteTasks(ids: string[]): Promise<{ success: number; failed: number }> {
    const response = await apiClient.post('/tasks/batch-delete', { ids });
    return response.data;
  }

  /**
   * 批量归档任务
   */
  static async batchArchiveTasks(ids: string[]): Promise<{ success: number; failed: number }> {
    const response = await apiClient.post('/tasks/batch-archive', { ids });
    return response.data;
  }

  /**
   * 批量分配任务
   */
  static async batchAssignTasks(
    ids: string[],
    assigneeId: string
  ): Promise<{ success: number; failed: number }> {
    const response = await apiClient.post('/tasks/batch-assign', { ids, assigneeId });
    return response.data;
  }

  /**
   * 获取任务评论列表
   */
  static async getTaskComments(taskId: string): Promise<TaskComment[]> {
    const response = await apiClient.get(`/tasks/${taskId}/comments`);
    return response.data;
  }

  /**
   * 创建任务评论
   */
  static async createTaskComment(
    taskId: string,
    content: string
  ): Promise<TaskComment> {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  }

  /**
   * 删除任务评论
   */
  static async deleteTaskComment(taskId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
  }

  /**
   * 获取任务附件列表
   */
  static async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    const response = await apiClient.get(`/tasks/${taskId}/attachments`);
    return response.data;
  }

  /**
   * 上传任务附件
   */
  static async uploadTaskAttachment(
    taskId: string,
    file: File
  ): Promise<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * 删除任务附件
   */
  static async deleteTaskAttachment(
    taskId: string,
    attachmentId: string
  ): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  }

  /**
   * 获取任务历史记录
   */
  static async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    const response = await apiClient.get(`/tasks/${taskId}/history`);
    return response.data;
  }

  /**
   * 获取任务统计
   */
  static async getTaskStatistics(): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  }> {
    const response = await apiClient.get('/tasks/statistics');
    return response.data;
  }
}

export default TaskService;
