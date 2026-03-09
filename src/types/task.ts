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

// V5.2 P0: 扩展任务类型以支持子任务
export interface ExtendedTask extends Task {
  parentId?: string;
  subtaskCount?: number;
  isBlockedByDependency?: boolean;
  dependencyCount?: number;
  progress?: number;
}

// V5.2 P0: 子任务
export interface SubTask extends ExtendedTask {
  parentId: string;
  isBlocked: boolean;
  dependencies: TaskDependency[];
}

// V5.2 P0: 任务依赖关系
export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: 'FS' | 'SS'; // FS: Finish-Start, SS: Start-Start
  createdAt: string;
}

// V5.2 P0: 任务标签
export interface TaskTag {
  id: string;
  taskId: string;
  tagName: string;
  tagColor: string;
  createdAt: string;
}

// V5.2 P0: 子任务列表响应
export interface SubTaskListResponse {
  parentTask: ExtendedTask;
  subtasks: SubTask[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// V5.2 P0: 创建子任务请求
export interface CreateSubTaskRequest {
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: string;
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
  parentId?: string; // V5.2 P0: 筛选子任务
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

// V5.2 P0: 树形结构任务节点
export interface TaskTreeNode {
  key: string;
  title: string;
  children?: TaskTreeNode[];
  data: ExtendedTask;
  isLeaf?: boolean;
}

// V5.2 P0: 任务依赖检测结果
export interface DependencyCheckResult {
  hasCycle: boolean;
  cyclePath?: string[];
  blockedBy?: string[];
}

// V5.2 P0: 设置依赖关系请求
export interface SetDependenciesRequest {
  dependsOnTaskIds: string[];
  dependencyType?: 'FS' | 'SS';
}
