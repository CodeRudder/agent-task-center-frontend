/**
 * 任务相关类型定义
 */

/**
 * 任务状态
 */
export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus]

/**
 * 任务优先级
 */
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority]

/**
 * 任务数据接口
 */
export interface Task {
  id: string;
  shortId?: string; // 短ID（数字ID，用于友好显示，如 #12345）
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  assigneeId?: string;
  creator?: string;
  creatorId?: string;
  tags?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
}
