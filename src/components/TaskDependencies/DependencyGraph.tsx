/**
 * V5.3 依赖关系图 - 主组件
 * 基于React Flow实现任务依赖关系的可视化
 * Day 3完成：集成循环检测、图控制、小地图功能
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow as ReactFlowComponent,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react';
import type { Node, Edge, NodeTypes, EdgeTypes, OnNodesChange, OnEdgesChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDependencyStore } from '../../stores/dependencyStore';
import DependencyNode from './DependencyNode';
import DependencyEdge from './DependencyEdge';
import CycleDetection from './CycleDetection';
import DependencyControls from './DependencyControls';
import DependencyMinimap from './DependencyMinimap';
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
  /** 是否锁定布局（禁止拖拽）- 已废弃，使用store中的isLocked */
  isLocked?: boolean;
  /** 是否显示小地图 */
  showMinimap?: boolean;
  /** 是否显示控制面板 */
  showControls?: boolean;
  /** 是否显示循环检测 */
  showCycleDetection?: boolean;
  /** 类名 */
  className?: string;
}

/**
 * DependencyGraph主组件内容
 * Day 3实现内容：集成循环检测、图控制、小地图
 */
const DependencyGraphContent: React.FC<DependencyGraphProps> = ({
  taskId,
  isLocked: propIsLocked,
  showMinimap = true,
  showControls = true,
  showCycleDetection = true,
  className = '',
}) => {
  // 状态管理
  const { 
    dependencies, 
    loading, 
    layoutDirection, 
    isLocked: storeIsLocked,
    setLayoutDirection,
    setIsLocked,
    setCyclePath,
    fetchDependencies 
  } = useDependencyStore();
  
  // 使用store中的锁定状态，如果没有则使用props中的
  const isLocked = storeIsLocked || propIsLocked || false;
  
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
        dependencyType: 'FS' as any,
      },
      {
        id: 'dep-2',
        taskId: 'task-3',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS' as any,
      },
      {
        id: 'dep-3',
        taskId: 'task-4',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS' as any,
      },
    ];
    
    // 转换数据格式
    const initialNodes = convertTasksToNodes(mockTasks);
    const initialEdges = convertDependenciesToEdges(mockDependencies);
    
    // 应用布局算法（根据布局方向）
    const layoutedNodes = getLayoutedElements(initialNodes, initialEdges, layoutDirection);
    
    setNodes(layoutedNodes);
    setEdges(initialEdges);
  }, [taskId, layoutDirection]);
  
  /**
   * 处理节点变化（拖拽等）
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
   */
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // TODO: Day 3实现节点选中、详情显示等功能
  }, []);
  
  /**
   * 处理边点击
   */
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    console.log('Edge clicked:', edge);
    // TODO: Day 3实现边选中、删除等功能
  }, []);
  
  /**
   * 处理循环检测
   */
  const handleCycleDetected = useCallback((cyclePath: { taskIds: string[]; description: string } | null) => {
    if (cyclePath) {
      setCyclePath(cyclePath.taskIds);
    } else {
      setCyclePath(null);
    }
  }, [setCyclePath]);
  
  /**
   * 处理布局方向变化
   */
  const handleLayoutDirectionChange = useCallback((direction: 'horizontal' | 'vertical') => {
    setLayoutDirection(direction);
  }, [setLayoutDirection]);
  
  /**
   * 处理节点锁定状态变化
   */
  const handleLockChange = useCallback((locked: boolean) => {
    setIsLocked(locked);
  }, [setIsLocked]);

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* 循环检测警告 */}
      {showCycleDetection && (
        <div className="absolute top-2 left-2 right-2 z-10">
          <CycleDetection
            enabled={true}
            onCycleDetected={handleCycleDetected}
            showAlert={true}
          />
        </div>
      )}
      
      {/* 图控制面板 */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10">
          <DependencyControls
            layoutDirection={layoutDirection}
            onLayoutDirectionChange={handleLayoutDirectionChange}
            isLocked={isLocked}
            onLockChange={handleLockChange}
          />
        </div>
      )}
      
      {/* 主图区域 */}
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
          
          {/* 小地图 */}
          {showMinimap && <DependencyMinimap show={true} position="bottom-right" />}
        </ReactFlowComponent>
      )}
    </div>
  );
};

/**
 * DependencyGraph主组件（包装器）
 * 使用ReactFlowProvider包装，提供useReactFlow钩子
 */
const DependencyGraph: React.FC<DependencyGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <DependencyGraphContent {...props} />
    </ReactFlowProvider>
  );
};

export default DependencyGraph;
