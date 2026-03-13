/**
 * V5.3 任务依赖关系状态管理
 * 使用Zustand管理任务依赖关系的全局状态
 */

import { create } from 'zustand';
import type { 
  TaskDependency, 
  CreateDependencyParams,
  DependencyType 
} from '../types/dependency';

/**
 * 依赖关系状态接口
 */
interface DependencyState {
  /** 任务依赖关系列表 */
  dependencies: TaskDependency[];
  
  /** 当前选中的任务ID */
  selectedTaskId: string | null;
  
  /** 加载状态 */
  loading: boolean;
  
  /** 错误信息 */
  error: string | null;
  
  /** 设置依赖关系列表 */
  setDependencies: (dependencies: TaskDependency[]) => void;
  
  /** 添加依赖关系 */
  addDependency: (dependency: TaskDependency) => void;
  
  /** 删除依赖关系 */
  removeDependency: (dependencyId: string) => void;
  
  /** 设置选中的任务ID */
  setSelectedTaskId: (taskId: string | null) => void;
  
  /** 获取任务依赖关系 */
  fetchDependencies: (taskId: string) => Promise<void>;
  
  /** 创建依赖关系 */
  createDependency: (params: CreateDependencyParams) => Promise<void>;
  
  /** 检测循环依赖 */
  detectCycle: (taskId: string, dependsOnTaskId: string) => boolean;
  
  /** 清除错误 */
  clearError: () => void;
}

/**
 * 使用Zustand创建依赖关系状态管理Store
 */
export const useDependencyStore = create<DependencyState>((set, get) => ({
  // 初始状态
  dependencies: [],
  selectedTaskId: null,
  loading: false,
  error: null,
  
  // 设置依赖关系列表
  setDependencies: (dependencies) => set({ dependencies }),
  
  // 添加依赖关系
  addDependency: (dependency) => 
    set((state) => ({
      dependencies: [...state.dependencies, dependency]
    })),
  
  // 删除依赖关系
  removeDependency: (dependencyId) => 
    set((state) => ({
      dependencies: state.dependencies.filter(
        (dep) => dep.id !== dependencyId
      )
    })),
  
  // 设置选中的任务ID
  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),
  
  // 获取任务依赖关系（模拟API调用）
  fetchDependencies: async (taskId) => {
    set({ loading: true, error: null });
    try {
      // TODO: 实际项目中应该调用真实的API
      // const response = await api.getDependencies(taskId);
      // set({ dependencies: response.data, loading: false });
      
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // 模拟返回空数据
      set({ dependencies: [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取依赖关系失败',
        loading: false 
      });
    }
  },
  
  // 创建依赖关系（模拟API调用）
  createDependency: async (params) => {
    set({ loading: true, error: null });
    try {
      // TODO: 实际项目中应该调用真实的API
      // const response = await api.createDependency(params);
      
      // 检测循环依赖
      if (get().detectCycle(params.taskId, params.dependsOnTaskId)) {
        throw new Error('检测到循环依赖，无法创建');
      }
      
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // 模拟创建的依赖关系
      const newDependency: TaskDependency = {
        id: `dep-${Date.now()}`,
        taskId: params.taskId,
        dependsOnTaskId: params.dependsOnTaskId,
        dependencyType: params.dependencyType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // 添加到状态中
      get().addDependency(newDependency);
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建依赖关系失败',
        loading: false 
      });
      throw error;
    }
  },
  
  // 检测循环依赖（使用DFS算法）
  detectCycle: (taskId, dependsOnTaskId) => {
    const dependencies = get().dependencies;
    
    // 如果依赖自己，则存在循环
    if (taskId === dependsOnTaskId) {
      return true;
    }
    
    // 构建邻接表（反向：从被依赖的任务指向依赖它的任务）
    const graph: Map<string, string[]> = new Map();
    
    dependencies.forEach((dep) => {
      if (!graph.has(dep.dependsOnTaskId)) {
        graph.set(dep.dependsOnTaskId, []);
      }
      graph.get(dep.dependsOnTaskId)!.push(dep.taskId);
    });
    
    // 添加新的依赖关系到图中（模拟添加后的状态）
    if (!graph.has(dependsOnTaskId)) {
      graph.set(dependsOnTaskId, []);
    }
    graph.get(dependsOnTaskId)!.push(taskId);
    
    // 使用DFS检测是否存在从taskId到dependsOnTaskId的路径
    // 如果存在，说明添加这条边会形成循环
    const visited: Set<string> = new Set();
    const recursionStack: Set<string> = new Set();
    
    const hasCycleDFS = (currentTaskId: string): boolean => {
      visited.add(currentTaskId);
      recursionStack.add(currentTaskId);
      
      const neighbors = graph.get(currentTaskId) || [];
      for (const neighbor of neighbors) {
        // 如果找到dependsOnTaskId，说明存在循环
        if (neighbor === dependsOnTaskId) {
          return true;
        }
        
        // 如果邻居在递归栈中，说明存在循环
        if (recursionStack.has(neighbor)) {
          return true;
        }
        
        // 如果邻居未被访问，继续DFS
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) {
            return true;
          }
        }
      }
      
      recursionStack.delete(currentTaskId);
      return false;
    };
    
    // 从taskId开始DFS，检测是否能到达dependsOnTaskId
    return hasCycleDFS(taskId);
  },
  
  // 清除错误
  clearError: () => set({ error: null }),
}));

/**
 * 导出类型
 */
export type { DependencyState };
