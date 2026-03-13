/**
 * V5.3 任务依赖关系自定义Hook
 * 提供任务依赖关系的便捷操作方法
 */

import { useCallback, useEffect } from 'react';
import { useDependencyStore } from '../stores/dependencyStore';
import type { 
  TaskDependency, 
  CreateDependencyParams,
  DependencyType 
} from '../types/dependency';

/**
 * 任务依赖关系Hook
 * 提供依赖关系的增删改查操作
 */
export const useTaskDependencies = (taskId?: string) => {
  const {
    dependencies,
    selectedTaskId,
    loading,
    error,
    setDependencies,
    addDependency,
    removeDependency,
    setSelectedTaskId,
    fetchDependencies,
    createDependency,
    detectCycle,
    clearError,
  } = useDependencyStore();

  /**
   * 获取指定任务的依赖关系
   */
  const loadDependencies = useCallback(async (id: string) => {
    await fetchDependencies(id);
  }, [fetchDependencies]);

  /**
   * 创建新的依赖关系
   */
  const addNewDependency = useCallback(async (
    dependsOnTaskId: string,
    dependencyType: DependencyType = DependencyType.FINISH_TO_START
  ) => {
    if (!taskId) {
      throw new Error('任务ID不能为空');
    }

    const params: CreateDependencyParams = {
      taskId,
      dependsOnTaskId,
      dependencyType,
    };

    await createDependency(params);
  }, [taskId, createDependency]);

  /**
   * 删除依赖关系
   */
  const deleteDependency = useCallback((dependencyId: string) => {
    removeDependency(dependencyId);
  }, [removeDependency]);

  /**
   * 检查是否存在循环依赖
   */
  const checkCycle = useCallback((dependsOnTaskId: string) => {
    if (!taskId) {
      return false;
    }
    return detectCycle(taskId, dependsOnTaskId);
  }, [taskId, detectCycle]);

  /**
   * 选择任务
   */
  const selectTask = useCallback((id: string | null) => {
    setSelectedTaskId(id);
  }, [setSelectedTaskId]);

  /**
   * 获取当前任务的依赖关系
   */
  const currentTaskDependencies = taskId
    ? dependencies.filter((dep) => dep.taskId === taskId)
    : [];

  /**
   * 获取依赖于当前任务的其他任务
   */
  const dependentTasks = taskId
    ? dependencies.filter((dep) => dep.dependsOnTaskId === taskId)
    : [];

  /**
   * 组件挂载时自动加载依赖关系
   */
  useEffect(() => {
    if (taskId) {
      loadDependencies(taskId);
    }
  }, [taskId, loadDependencies]);

  return {
    // 状态
    dependencies,
    currentTaskDependencies,
    dependentTasks,
    selectedTaskId,
    loading,
    error,

    // 操作方法
    loadDependencies,
    addNewDependency,
    deleteDependency,
    checkCycle,
    selectTask,
    clearError,

    // 工具方法
    setDependencies,
  };
};

/**
 * 导出类型
 */
export type { TaskDependency, CreateDependencyParams, DependencyType };
