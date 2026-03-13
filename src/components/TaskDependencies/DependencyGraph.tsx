/**
 * V5.3 依赖关系图 - 主组件
 * 基于React Flow实现任务依赖关系的可视化
 * Day 2完成度：50%（基本框架、节点和边渲染、缩放平移）
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow as ReactFlowComponent,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from '@xyflow/react';
import type { Node, Edge, NodeTypes, EdgeTypes, OnNodesChange, OnEdgesChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDependencyStore } from '../../stores/dependencyStore';
import DependencyNode from './DependencyNode';
import DependencyEdge from './DependencyEdge';
import { getLayoutedElements, convertTasksToNodes, convertDependenciesToEdges } from '../../utils/dependencyUtils';
import type { TaskNodeData } from '../../types/dependency';

/**
 * 注册自定义节点类型
 */
const nodeTypes: NodeTypes = {
  dependencyNode: DependencyNode,
};

/**
 * 注册自定义边类型
 */
const edgeTypes: EdgeTypes = {
  dependencyEdge: DependencyEdge,
};

/**
 * DependencyGraph组件属性
 */
interface DependencyGraphProps {
  /** 任务ID（可选，用于显示特定任务的依赖关系） */
  taskId?: string;
  /** 是否锁定布局（禁止拖拽） */
  isLocked?: boolean;
  /** 是否显示小地图 */
  showMinimap?: boolean;
  /** 是否显示控制面板 */
  showControls?: boolean;
  /** 类名 */
  className?: string;
}

/**
 * DependencyGraph主组件
 * Day 2实现内容：基本框架、节点和边渲染、缩放平移
 */
const DependencyGraph: React.FC<DependencyGraphProps> = ({
  taskId,
  isLocked = false,
  showMinimap = true,
  showControls = true,
  className = '',
}) => {
  // 状态管理
  const { dependencies, loading, fetchDependencies } = useDependencyStore();
  
  // React Flow状态
  const [nodes, setNodes] = useState<Node<TaskNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  /**
   * 初始化数据
   * TODO: Day 4将从API获取任务数据
   */
  useEffect(() => {
    // 模拟任务数据（Day 4将替换为API调用）
    const mockTasks = [
      {
        id: 'task-1',
        title: '需求分析',
        status: 'completed',
        priority: 'high',
        startDate: '2026-03-01',
        endDate: '2026-03-03',
      },
      {
        id: 'task-2',
        title: '架构设计',
        status: 'in_progress',
        priority: 'high',
        startDate: '2026-03-04',
        endDate: '2026-03-08',
      },
      {
        id: 'task-3',
        title: '数据库设计',
        status: 'pending',
        priority: 'medium',
        startDate: '2026-03-09',
        endDate: '2026-03-11',
      },
      {
        id: 'task-4',
        title: 'API开发',
        status: 'pending',
        priority: 'high',
        startDate: '2026-03-12',
        endDate: '2026-03-15',
      },
    ];
    
    // 模拟依赖关系数据（Day 4将替换为API调用）
    const mockDependencies = [
      {
        id: 'dep-1',
        taskId: 'task-2',
        dependsOnTaskId: 'task-1',
        dependencyType: 'FS',
      },
      {
        id: 'dep-2',
        taskId: 'task-3',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS',
      },
      {
        id: 'dep-3',
        taskId: 'task-4',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS',
      },
    ];
    
    // 转换数据格式
    const initialNodes = convertTasksToNodes(mockTasks);
    const initialEdges = convertDependenciesToEdges(mockDependencies);
    
    // 应用布局算法
    const layoutedNodes = getLayoutedElements(initialNodes, initialEdges);
    
    setNodes(layoutedNodes);
    setEdges(initialEdges);
  }, [taskId]);
  
  /**
   * 处理节点变化（拖拽等）
   * Day 3将实现更完善的交互逻辑
   */
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (isLocked) return;
      setNodes((nds) => applyNodeChanges(changes, nds) as Node<TaskNodeData>[]);
    },
    [isLocked]
  );
  
  /**
   * 处理边变化
   * Day 3将实现更完善的交互逻辑
   */
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (isLocked) return;
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [isLocked]
  );
  
  /**
   * 处理节点点击
   * Day 3将实现更完善的交互逻辑
   */
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // TODO: Day 3实现节点选中、详情显示等功能
  }, []);
  
  /**
   * 处理边点击
   * Day 3将实现更完善的交互逻辑
   */
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    console.log('Edge clicked:', edge);
    // TODO: Day 3实现边选中、删除等功能
  }, []);

  return (
    <div className={`w-full h-full ${className}`}>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <ReactFlowComponent
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'dependencyEdge',
            animated: false,
          }}
          nodesDraggable={!isLocked}
          nodesConnectable={false}
          elementsSelectable={!isLocked}
        >
          {/* 背景 */}
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          
          {/* 控制面板（缩放、居中等） */}
          {showControls && <Controls />}
          
          {/* 小地图 */}
          {showMinimap && (
            <MiniMap
              nodeColor={(node) => {
                const nodeData = node.data as TaskNodeData;
                const statusColors: Record<string, string> = {
                  completed: '#22c55e',
                  in_progress: '#3b82f6',
                  blocked: '#ef4444',
                  pending: '#6b7280',
                };
                return statusColors[nodeData?.status] || statusColors.pending;
              }}
              style={{
                backgroundColor: '#f8fafc',
              }}
            />
          )}
        </ReactFlowComponent>
      )}
    </div>
  );
};

export default DependencyGraph;
