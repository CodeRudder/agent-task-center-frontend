/**
 * V5.3 依赖关系图小地图组件
 * 使用React Flow的MiniMap组件
 * 自定义节点颜色，视口同步
 */

import React from 'react';
import { MiniMap } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { useDependencyStore } from '../../stores/dependencyStore';
import type { TaskNodeData } from '../../types/dependency';

/**
 * 自定义节点颜色函数
 * 根据任务状态返回不同的颜色
 */
const getNodeColor = (node: Node): string => {
  const nodeData = node.data as TaskNodeData;
  
  // 状态颜色映射
  const statusColors: Record<string, string> = {
    completed: '#22c55e',      // 绿色 - 已完成
    in_progress: '#3b82f6',    // 蓝色 - 进行中
    blocked: '#ef4444',        // 红色 - 阻塞
    pending: '#6b7280',        // 灰色 - 待处理
  };
  
  return statusColors[nodeData?.status] || statusColors.pending;
};

/**
 * DependencyMinimap组件属性
 */
interface DependencyMinimapProps {
  /** 是否显示小地图 */
  show?: boolean;
  /** 小地图位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** 类名 */
  className?: string;
}

/**
 * DependencyMinimap组件
 * 显示依赖关系图的缩略图
 */
const DependencyMinimap: React.FC<DependencyMinimapProps> = ({
  show = true,
  position = 'bottom-right',
  className = '',
}) => {
  const { dependencies } = useDependencyStore();

  // 如果不需要显示，返回null
  if (!show) {
    return null;
  }

  // 位置样式映射
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  };

  return (
    <div 
      className={`absolute ${className}`}
      style={positionStyles[position]}
    >
      <MiniMap
        nodeColor={getNodeColor}
        nodeStrokeWidth={3}
        zoomable
        pannable
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
        }}
        maskColor="rgba(0, 0, 0, 0.1)"
      />
    </div>
  );
};

export default DependencyMinimap;
export type { DependencyMinimapProps };
