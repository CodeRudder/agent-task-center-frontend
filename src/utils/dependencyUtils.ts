/**
 * V5.3 依赖关系工具函数
 * 包含节点布局算法、数据转换函数等
 */

import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { TaskNodeData } from '../types/dependency';

/**
 * Dagre布局配置
 */
const DAGRE_CONFIG = {
  rankdir: 'TB', // 从上到下布局
  align: 'UL', // 对齐方式
  nodesep: 80, // 节点间距
  ranksep: 120, // 层级间距
  marginx: 50, // x轴边距
  marginy: 50, // y轴边距
};

/**
 * 节点尺寸配置
 */
const NODE_SIZE = {
  width: 260,
  height: 150,
};

/**
 * 使用dagre布局算法计算节点位置
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 布局后的节点列表
 */
export function getLayoutedElements(
  nodes: Node<TaskNodeData>[],
  edges: Edge[]
): Node<TaskNodeData>[] {
  // 创建dagre图
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // 设置图配置
  dagreGraph.setGraph(DAGRE_CONFIG);
  
  // 添加节点
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_SIZE.width,
      height: NODE_SIZE.height,
    });
  });
  
  // 添加边
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  // 执行布局算法
  dagre.layout(dagreGraph);
  
  // 获取布局后的节点位置
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_SIZE.width / 2,
        y: nodeWithPosition.y - NODE_SIZE.height / 2,
      },
    };
  });
  
  return layoutedNodes;
}

/**
 * 转换任务数据为React Flow节点格式
 * @param tasks 任务列表
 * @returns React Flow节点列表
 */
export function convertTasksToNodes(
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    startDate?: string;
    endDate?: string;
    assigneeId?: string;
  }>
): Node<TaskNodeData>[] {
  return tasks.map((task) => ({
    id: task.id,
    type: 'dependencyNode',
    data: {
      taskId: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate,
      endDate: task.endDate,
      selected: false,
    },
    position: { x: 0, y: 0 }, // 初始位置，将由布局算法计算
  }));
}

/**
 * 转换依赖关系数据为React Flow边格式
 * @param dependencies 依赖关系列表
 * @returns React Flow边列表
 */
export function convertDependenciesToEdges(
  dependencies: Array<{
    id: string;
    taskId: string;
    dependsOnTaskId: string;
    dependencyType?: string;
  }>
): Edge[] {
  return dependencies.map((dep) => ({
    id: dep.id,
    source: dep.dependsOnTaskId, // 前置任务
    target: dep.taskId, // 后置任务
    type: 'dependencyEdge',
    animated: false,
    data: {
      dependencyType: dep.dependencyType || 'FS',
    },
  }));
}

/**
 * 计算图的统计信息
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 统计信息
 */
export function calculateGraphStats(
  nodes: Node<TaskNodeData>[],
  edges: Edge[]
): {
  nodeCount: number;
  edgeCount: number;
  maxDepth: number;
  avgConnectivity: number;
} {
  // 构建邻接表
  const adjList: Map<string, string[]> = new Map();
  
  edges.forEach((edge) => {
    if (!adjList.has(edge.source)) {
      adjList.set(edge.source, []);
    }
    adjList.get(edge.source)!.push(edge.target);
  });
  
  // 计算最大深度（使用BFS）
  let maxDepth = 0;
  const visited: Set<string> = new Set();
  
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      const queue: Array<{ id: string; depth: number }> = [{ id: node.id, depth: 0 }];
      visited.add(node.id);
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        maxDepth = Math.max(maxDepth, current.depth);
        
        const neighbors = adjList.get(current.id) || [];
        neighbors.forEach((neighbor) => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push({ id: neighbor, depth: current.depth + 1 });
          }
        });
      }
    }
  });
  
  // 计算平均连接度
  const avgConnectivity = nodes.length > 0 ? edges.length / nodes.length : 0;
  
  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    maxDepth,
    avgConnectivity,
  };
}

/**
 * 查找节点的所有前置任务
 * @param taskId 任务ID
 * @param edges 边列表
 * @returns 前置任务ID列表
 */
export function getPredecessors(taskId: string, edges: Edge[]): string[] {
  return edges
    .filter((edge) => edge.target === taskId)
    .map((edge) => edge.source);
}

/**
 * 查找节点的所有后置任务
 * @param taskId 任务ID
 * @param edges 边列表
 * @returns 后置任务ID列表
 */
export function getSuccessors(taskId: string, edges: Edge[]): string[] {
  return edges
    .filter((edge) => edge.source === taskId)
    .map((edge) => edge.target);
}

/**
 * 检测节点是否可以拖拽
 * @param nodeId 节点ID
 * @param isLocked 是否锁定布局
 * @returns 是否可以拖拽
 */
export function canDragNode(nodeId: string, isLocked: boolean): boolean {
  return !isLocked;
}

/**
 * 获取节点样式类名
 * @param status 任务状态
 * @returns 样式类名
 */
export function getNodeStyleClass(status: string): string {
  const statusStyles: Record<string, string> = {
    completed: 'border-green-500 bg-green-50',
    in_progress: 'border-blue-500 bg-blue-50',
    blocked: 'border-red-500 bg-red-50',
    pending: 'border-gray-500 bg-gray-50',
  };
  
  return statusStyles[status] || statusStyles.pending;
}
