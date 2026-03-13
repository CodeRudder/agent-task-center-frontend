/**
 * V5.3 任务依赖关系工具函数
 * 提供依赖关系处理的工具方法
 */

import dagre from 'dagre';
import type { 
  TaskDependency, 
  DependencyNode, 
  DependencyEdge,
  TaskNodeData 
} from '../types/dependency';

/**
 * 构建依赖图
 * 将任务依赖关系转换为React Flow可用的节点和边
 */
export const buildDependencyGraph = (
  dependencies: TaskDependency[],
  tasks: any[] // 任务列表，实际项目中应该有具体的类型
): { nodes: DependencyNode[]; edges: DependencyEdge[] } => {
  const nodes: DependencyNode[] = [];
  const edges: DependencyEdge[] = [];
  const nodeMap = new Map<string, TaskNodeData>();

  // 收集所有涉及的任务ID
  const taskIds = new Set<string>();
  dependencies.forEach((dep) => {
    taskIds.add(dep.taskId);
    taskIds.add(dep.dependsOnTaskId);
  });

  // 创建节点
  taskIds.forEach((taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const nodeData: TaskNodeData = {
        taskId: task.id,
        title: task.title || '未命名任务',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        startDate: task.startDate,
        endDate: task.endDate,
        selected: false,
      };
      nodeMap.set(taskId, nodeData);
    }
  });

  // 转换为React Flow节点
  nodeMap.forEach((data, taskId) => {
    nodes.push({
      id: taskId,
      type: 'default', // 使用默认节点类型
      data,
      position: { x: 0, y: 0 }, // 位置将由Dagre算法计算
    });
  });

  // 创建边
  dependencies.forEach((dep) => {
    edges.push({
      id: dep.id,
      source: dep.dependsOnTaskId,
      target: dep.taskId,
      type: 'smoothstep', // 使用平滑的阶梯线
      animated: false,
      label: getDependencyTypeLabel(dep.dependencyType),
    });
  });

  return { nodes, edges };
};

/**
 * 获取依赖类型标签
 */
export const getDependencyTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'FS': '完成-开始',
    'SS': '开始-开始',
    'FF': '完成-完成',
    'SF': '开始-完成',
  };
  return labels[type] || type;
};

/**
 * 使用Dagre算法计算节点布局
 * 自动排列节点位置，使依赖关系清晰可读
 */
export const calculateLayout = (
  nodes: DependencyNode[],
  edges: DependencyEdge[],
  direction: 'TB' | 'LR' | 'BT' | 'RL' = 'TB' // TB: 从上到下, LR: 从左到右
): DependencyNode[] => {
  const dagreGraph = new dagre.graphlib.Graph();
  
  // 设置图表属性
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 172;
  const nodeHeight = 36;
  
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 70,
    ranksep: 100,
    marginx: 50,
    marginy: 50,
  });

  // 添加节点到Dagre图表
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // 添加边到Dagre图表
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 执行布局算法
  dagre.layout(dagreGraph);

  // 更新节点位置
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return layoutedNodes;
};

/**
 * 查找任务的所有前置任务（依赖链）
 * 递归查找所有依赖的任务
 */
export const findPredecessors = (
  taskId: string,
  dependencies: TaskDependency[]
): string[] => {
  const predecessors: string[] = [];
  const visited = new Set<string>();

  const dfs = (currentTaskId: string) => {
    dependencies
      .filter((dep) => dep.taskId === currentTaskId)
      .forEach((dep) => {
        if (!visited.has(dep.dependsOnTaskId)) {
          visited.add(dep.dependsOnTaskId);
          predecessors.push(dep.dependsOnTaskId);
          dfs(dep.dependsOnTaskId); // 递归查找前置任务的前置任务
        }
      });
  };

  dfs(taskId);
  return predecessors;
};

/**
 * 查找任务的所有后继任务（被依赖的任务）
 * 递归查找所有被依赖的任务
 */
export const findSuccessors = (
  taskId: string,
  dependencies: TaskDependency[]
): string[] => {
  const successors: string[] = [];
  const visited = new Set<string>();

  const dfs = (currentTaskId: string) => {
    dependencies
      .filter((dep) => dep.dependsOnTaskId === currentTaskId)
      .forEach((dep) => {
        if (!visited.has(dep.taskId)) {
          visited.add(dep.taskId);
          successors.push(dep.taskId);
          dfs(dep.taskId); // 递归查找后继任务的后继任务
        }
      });
  };

  dfs(taskId);
  return successors;
};

/**
 * 获取任务的依赖深度
 * 用于确定任务在依赖图中的层级
 */
export const getDependencyDepth = (
  taskId: string,
  dependencies: TaskDependency[]
): number => {
  const predecessors = findPredecessors(taskId, dependencies);
  if (predecessors.length === 0) {
    return 0;
  }

  const depths = predecessors.map((predId) => 
    getDependencyDepth(predId, dependencies)
  );

  return Math.max(...depths) + 1;
};

/**
 * 验证依赖关系是否有效
 * 检查任务是否存在、是否形成循环等
 */
export const validateDependency = (
  taskId: string,
  dependsOnTaskId: string,
  dependencies: TaskDependency[]
): { valid: boolean; message?: string } => {
  // 检查是否依赖自己
  if (taskId === dependsOnTaskId) {
    return { valid: false, message: '任务不能依赖自己' };
  }

  // 检查是否已存在相同的依赖关系
  const exists = dependencies.some(
    (dep) => dep.taskId === taskId && dep.dependsOnTaskId === dependsOnTaskId
  );
  if (exists) {
    return { valid: false, message: '该依赖关系已存在' };
  }

  // 检查是否形成循环依赖（简单检查：反向依赖是否存在）
  const hasReverseDependency = dependencies.some(
    (dep) => dep.taskId === dependsOnTaskId && dep.dependsOnTaskId === taskId
  );
  if (hasReverseDependency) {
    return { valid: false, message: '会形成循环依赖' };
  }

  return { valid: true };
};

/**
 * 格式化依赖关系数据
 * 用于显示或导出
 */
export const formatDependency = (dependency: TaskDependency): string => {
  return `${dependency.dependsOnTaskId} -> ${dependency.taskId} (${dependency.dependencyType})`;
};

/**
 * 导出依赖关系为Mermaid格式
 * 可用于文档或可视化
 */
export const exportToMermaid = (
  dependencies: TaskDependency[]
): string => {
  const lines: string[] = ['graph TD'];
  
  dependencies.forEach((dep) => {
    lines.push(`  ${dep.dependsOnTaskId} --> ${dep.taskId}`);
  });

  return lines.join('\n');
};
