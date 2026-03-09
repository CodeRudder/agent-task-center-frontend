/**
 * Task API 服务
 */
import apiClient from './api';
import {
  Task,
  TaskComment,
  TaskAttachment,
  TaskHistory,
  TaskFilters,
  TaskSorting,
  UpdateTaskStatusRequest,
  StatusHistoriesResponse,
  ExtendedTask,
  SubTask,
  TaskDependency,
  SubTaskListResponse,
  CreateSubTaskRequest,
  TaskTreeNode,
  SetDependenciesRequest,
} from '@/types/task';
import { PaginatedResponse } from '@/types/api';

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

  /**
   * 更新任务状态（P1-6 状态流转优化）
   * @param taskId 任务ID
   * @param data 状态更新请求
   * @returns 更新后的任务
   */
  static async updateTaskStatus(
    taskId: string,
    data: UpdateTaskStatusRequest
  ): Promise<Task> {
    const response = await apiClient.patch(`/tasks/${taskId}/status`, data);
    return response.data;
  }

  /**
   * 获取任务状态变更历史（P1-6 状态流转优化）
   * @param taskId 任务ID
   * @param page 页码，默认1
   * @param limit 每页数量，默认20
   * @returns 状态历史列表
   */
  static async getStatusHistories(
    taskId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<StatusHistoriesResponse> {
    const response = await apiClient.get(`/tasks/${taskId}/status-histories`, {
      params: { page, limit },
    });
    return response.data;
  }

  // ============ V5.2 P0 新增API ============

  /**
   * 创建子任务 - V5.2 P0
   */
  static async createSubTask(
    parentId: string,
    data: CreateSubTaskRequest
  ): Promise<SubTask> {
    const response = await apiClient.post(`/api/v1/tasks/${parentId}/subtasks`, data);
    return response.data;
  }

  /**
   * 获取子任务列表 - V5.2 P0
   */
  static async getSubTasks(
    parentId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<SubTaskListResponse> {
    const response = await apiClient.get(`/api/v1/tasks/${parentId}/subtasks`, { params });
    return response.data;
  }

  /**
   * 获取任务树形结构 - V5.2 P0
   */
  static async getTaskTree(parentId?: string): Promise<TaskTreeNode[]> {
    const params = parentId ? { parentId } : {};
    const response = await apiClient.get('/api/v1/tasks/tree', { params });
    return response.data;
  }

  /**
   * 设置任务依赖关系 - V5.2 P0
   */
  static async setDependencies(
    taskId: string,
    data: SetDependenciesRequest
  ): Promise<TaskDependency[]> {
    const response = await apiClient.put(`/api/v1/tasks/${taskId}/dependencies`, data);
    return response.data;
  }

  /**
   * 获取任务依赖关系 - V5.2 P0
   */
  static async getDependencies(taskId: string): Promise<TaskDependency[]> {
    const response = await apiClient.get(`/api/v1/tasks/${taskId}/dependencies`);
    return response.data;
  }

  /**
   * 删除任务依赖关系 - V5.2 P0
   */
  static async removeDependency(taskId: string, depId: string): Promise<void> {
    await apiClient.delete(`/api/v1/tasks/${taskId}/dependencies/${depId}`);
  }

  /**
   * 检测任务依赖关系（循环依赖检测）- V5.2 P0
   */
  static async checkDependencies(taskId: string): Promise<{
    hasCycle: boolean;
    cyclePath?: string[];
    blockedBy?: string[];
  }> {
    const response = await apiClient.post(`/api/v1/tasks/${taskId}/check-dependencies`);
    return response.data;
  }
}

export default TaskService;
