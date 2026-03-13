/**
 * V5.3 循环检测组件
 * 使用DFS算法检测任务依赖关系中的循环
 * 提供循环路径提示和警告
 */

import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useDependencyStore } from '../../stores/dependencyStore';
import type { TaskDependency } from '../../types/dependency';

/**
 * 循环路径信息
 */
interface CyclePath {
  /** 循环路径中的任务ID列表 */
  taskIds: string[];
  /** 循环路径描述 */
  description: string;
}

/**
 * CycleDetection组件属性
 */
interface CycleDetectionProps {
  /** 是否启用循环检测 */
  enabled?: boolean;
  /** 检测到循环时的回调 */
  onCycleDetected?: (cyclePath: CyclePath | null) => void;
  /** 显示警告 */
  showAlert?: boolean;
  /** 类名 */
  className?: string;
}

/**
 * 深度优先搜索检测循环
 */
const findCyclePath = (
  graph: Map<string, string[]>,
  startTaskId: string,
  targetTaskId: string,
  visited: Set<string> = new Set(),
  path: string[] = []
): string[] | null => {
  visited.add(startTaskId);
  path.push(startTaskId);

  const neighbors = graph.get(startTaskId) || [];
  
  for (const neighbor of neighbors) {
    if (neighbor === targetTaskId) {
      return [...path, neighbor];
    }
    
    if (!visited.has(neighbor)) {
      const cyclePath = findCyclePath(graph, neighbor, targetTaskId, visited, path);
      if (cyclePath) {
        return cyclePath;
      }
    }
  }

  path.pop();
  return null;
};

/**
 * 构建依赖图（邻接表）
 */
const buildDependencyGraph = (dependencies: TaskDependency[]): Map<string, string[]> => {
  const graph: Map<string, string[]> = new Map();
  
  dependencies.forEach((dep) => {
    if (!graph.has(dep.dependsOnTaskId)) {
      graph.set(dep.dependsOnTaskId, []);
    }
    graph.get(dep.dependsOnTaskId)!.push(dep.taskId);
  });
  
  return graph;
};

/**
 * CycleDetection组件
 * 检测任务依赖关系中的循环并显示警告
 */
const CycleDetection: React.FC<CycleDetectionProps> = ({
  enabled = true,
  onCycleDetected,
  showAlert = true,
  className = '',
}) => {
  const { dependencies } = useDependencyStore();
  const [cyclePath, setCyclePath] = useState<CyclePath | null>(null);

  const detectCycles = useCallback(() => {
    if (!enabled || dependencies.length === 0) {
      setCyclePath(null);
      onCycleDetected?.(null);
      return;
    }

    const graph = buildDependencyGraph(dependencies);
    
    for (const dep of dependencies) {
      const path = findCyclePath(
        graph,
        dep.taskId,
        dep.dependsOnTaskId,
        new Set(),
        []
      );
      
      if (path) {
        const cycleInfo: CyclePath = {
          taskIds: path,
          description: `检测到循环依赖：${path.join(' → ')}`,
        };
        setCyclePath(cycleInfo);
        onCycleDetected?.(cycleInfo);
        return;
      }
    }
    
    setCyclePath(null);
    onCycleDetected?.(null);
  }, [enabled, dependencies, onCycleDetected]);

  useEffect(() => {
    detectCycles();
  }, [detectCycles]);

  if (!showAlert || !cyclePath) {
    return null;
  }

  return (
    <div className={`p-4 border-l-4 border-red-500 bg-red-50 rounded ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h3 className="font-semibold text-red-900">检测到循环依赖</h3>
          </div>
          <p className="font-medium text-red-800 mb-1">{cyclePath.description}</p>
          <p className="text-sm text-red-600">
            循环依赖会导致任务无法正常执行，请调整依赖关系以消除循环。
          </p>
        </div>
      </div>
    </div>
  );
};

export default CycleDetection;
export type { CycleDetectionProps, CyclePath };
