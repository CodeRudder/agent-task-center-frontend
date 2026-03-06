/**
 * 任务相关类型定义
 */

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

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
