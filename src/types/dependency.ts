/**
 * V5.3 任务依赖关系类型定义
 * 用于定义任务之间的依赖关系和相关类型
 */

import type { Node, Edge } from '@xyflow/react';

/**
 * 任务依赖关系类型
 * 表示一个任务依赖于另一个任务
 */
export interface TaskDependency {
  /** 依赖关系ID */
  id: string;
  /** 任务ID（被依赖的任务） */
  taskId: string;
  /** 依赖的任务ID（前置任务） */
  dependsOnTaskId: string;
  /** 依赖类型 */
  dependencyType: DependencyType;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 依赖类型枚举
 */
export enum DependencyType {
  /** 完成-开始（FS）：前置任务完成后，后继任务才能开始 */
  FINISH_TO_START = 'FS',
  /** 开始-开始（SS）：前置任务开始后，后继任务才能开始 */
  START_TO_START = 'SS',
  /** 完成-完成（FF）：前置任务完成后，后继任务才能完成 */
  FINISH_TO_FINISH = 'FF',
  /** 开始-完成（SF）：前置任务开始后，后继任务才能完成 */
  START_TO_FINISH = 'SF',
}

/**
 * 依赖图节点数据
 * 用于React Flow节点显示
 * 注意：添加索引签名以兼容React Flow的Record<string, unknown>约束
 */
export interface TaskNodeData extends Record<string, unknown> {
  /** 任务ID */
  taskId: string;
  /** 任务标题 */
  title: string;
  /** 任务状态 */
  status: string;
  /** 任务优先级 */
  priority: string;
  /** 开始时间 */
  startDate?: string;
  /** 结束时间 */
  endDate?: string;
  /** 是否选中 */
  selected?: boolean;
}

/**
 * 依赖图节点类型
 * 继承自React Flow的Node类型
 */
export type DependencyNode = Node<TaskNodeData>;

/**
 * 依赖图边类型
 * 继承自React Flow的Edge类型
 */
export type DependencyEdge = Edge;

/**
 * 创建依赖关系的参数
 */
export interface CreateDependencyParams {
  /** 任务ID */
  taskId: string;
  /** 依赖的任务ID */
  dependsOnTaskId: string;
  /** 依赖类型 */
  dependencyType: DependencyType;
}

/**
 * 依赖关系响应
 */
export interface DependencyResponse {
  /** 成功标志 */
  success: boolean;
  /** 消息 */
  message: string;
  /** 依赖关系数据 */
  data?: TaskDependency;
}

/**
 * 依赖关系列表响应
 */
export interface DependencyListResponse {
  /** 成功标志 */
  success: boolean;
  /** 消息 */
  message: string;
  /** 依赖关系列表 */
  data: TaskDependency[];
}
