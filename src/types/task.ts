/**
 * 任务相关类型定义
 */

/**
 * 任务状态枚举
 * TODO: 待办
 * IN_PROGRESS: 进行中
 * REVIEW: 审核中
 * DONE: 已完成
 * BLOCKED: 已阻塞
 */
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  tags: string[];
  attachments: TaskAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

/**
 * 状态变更历史项
 */
export interface StatusHistoryItem {
  id: string;
  taskId: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  changedBy: string;
  changedByType: 'user' | 'agent';
  changerName?: string;
  reason?: string;
  changedAt: string;
}

/**
 * 更新任务状态请求参数
 */
export interface UpdateTaskStatusRequest {
  status: TaskStatus;
  reason?: string;
}

/**
 * 获取状态历史响应
 */
export interface StatusHistoriesResponse {
  items: StatusHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  tags?: string[];
  search?: string;
}

export interface TaskSorting {
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 状态流转规则
 */
export interface StatusTransition {
  from: TaskStatus;
  to: TaskStatus;
  allowed: boolean;
  requireReason?: boolean;
  description: string;
}
