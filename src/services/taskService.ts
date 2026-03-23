import api from './api';
import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

/**
 * 任务服务 - 负责任务相关的API调用
 */

/**
 * 后端任务数据接口
 */
interface BackendTask {
  id: string;
  shortId?: string; // 短ID（数字ID，用于友好显示）
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  dueDate?: string | null;
  assigneeId?: string | null;
  creatorId?: string;
  parentId?: string | null;
  metadata?: any;
  templateId?: string | null;
  startedAt?: string | null;
  blockedAt?: string | null;
  blockReason?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  version?: number;
  assignee?: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    role: string;
  };
}

/**
 * API响应包装
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode: number;
}

/**
 * 任务列表响应
 */
interface TaskListResponse {
  items: BackendTask[];
  total: number;
}

/**
 * 状态映射：后端状态 -> 前端状态
 */
const STATUS_MAP: Record<string, TaskStatus> = {
  'todo': TaskStatus.PENDING,
  'in_progress': TaskStatus.IN_PROGRESS,
  'completed': TaskStatus.COMPLETED,
  'blocked': TaskStatus.CANCELLED, // 暂时将blocked映射为cancelled
};

/**
 * 优先级映射：后端优先级 -> 前端优先级
 */
const PRIORITY_MAP: Record<string, TaskPriority> = {
  'low': TaskPriority.LOW,
  'medium': TaskPriority.MEDIUM,
  'high': TaskPriority.HIGH,
  'urgent': TaskPriority.URGENT,
};

/**
 * 转换后端任务数据为前端格式
 */
const transformTask = (backendTask: BackendTask): Task => {
  return {
    id: backendTask.id,
    shortId: backendTask.shortId, // 短ID（数字ID）
    title: backendTask.title,
    description: backendTask.description,
    status: STATUS_MAP[backendTask.status] || TaskStatus.PENDING,
    priority: PRIORITY_MAP[backendTask.priority] || TaskPriority.MEDIUM,
    assignee: backendTask.assignee?.displayName,
    assigneeId: backendTask.assigneeId || undefined,
    creator: backendTask.creatorId,
    dueDate: backendTask.dueDate || undefined,
    createdAt: backendTask.createdAt,
    tags: [], // 后端暂无tags字段，暂时返回空数组
  };
};

/**
 * 获取任务列表
 * @param search 搜索关键词（可选）
 * @param shortId 短ID查询（可选）
 * @returns 任务列表
 */
export const getTasks = async (search?: string, shortId?: string): Promise<Task[]> => {
  try {
    // 实现真实的API调用
    const params: any = {};
    if (search) {
      params.search = search;
    }
    if (shortId) {
      params.shortId = shortId;
    }

    const response = await api.get<ApiResponse<TaskListResponse>>('/tasks', { params });

    if (response.data.success && response.data.data) {
      // 转换后端数据为前端格式
      return response.data.data.items.map(transformTask);
    }

    throw new Error(response.data.message || '获取任务列表失败');
  } catch (error: any) {
    console.error('获取任务列表失败:', error);
    
    // 如果是401错误，提示用户登录
    if (error.response?.status === 401) {
      throw new Error('请先登录');
    }
    
    throw error;
  }
};

/**
 * 获取任务详情
 * @param taskId 任务ID
 * @returns 任务详情
 */
export const getTaskById = async (taskId: string): Promise<Task> => {
  try {
    const response = await api.get<ApiResponse<BackendTask>>(`/tasks/${taskId}`);

    if (response.data.success && response.data.data) {
      return transformTask(response.data.data);
    }

    throw new Error(response.data.message || '获取任务详情失败');
  } catch (error: any) {
    console.error('获取任务详情失败:', error);
    
    if (error.response?.status === 401) {
      throw new Error('请先登录');
    }
    
    if (error.response?.status === 404) {
      throw new Error('任务不存在');
    }
    
    throw error;
  }
};

/**
 * 创建任务
 * @param taskData 任务数据
 * @returns 创建的任务
 */
export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  try {
    const response = await api.post<ApiResponse<BackendTask>>('/tasks', taskData);

    if (response.data.success && response.data.data) {
      return transformTask(response.data.data);
    }

    throw new Error(response.data.message || '创建任务失败');
  } catch (error: any) {
    console.error('创建任务失败:', error);
    
    if (error.response?.status === 401) {
      throw new Error('请先登录');
    }
    
    throw error;
  }
};

/**
 * 更新任务
 * @param taskId 任务ID
 * @param taskData 更新的任务数据
 * @returns 更新后的任务
 */
export const updateTask = async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
  try {
    const response = await api.patch<ApiResponse<BackendTask>>(`/tasks/${taskId}`, taskData);

    if (response.data.success && response.data.data) {
      return transformTask(response.data.data);
    }

    throw new Error(response.data.message || '更新任务失败');
  } catch (error: any) {
    console.error('更新任务失败:', error);
    
    if (error.response?.status === 401) {
      throw new Error('请先登录');
    }
    
    throw error;
  }
};

/**
 * 删除任务
 * @param taskId 任务ID
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const response = await api.delete<ApiResponse<void>>(`/tasks/${taskId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || '删除任务失败');
    }
  } catch (error: any) {
    console.error('删除任务失败:', error);
    
    if (error.response?.status === 401) {
      throw new Error('请先登录');
    }
    
    throw error;
  }
};

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  isAuthenticated,
};
