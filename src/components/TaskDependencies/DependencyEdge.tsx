/**
 * V5.3 依赖关系图 - 自定义边
 * 基于React Flow的Edge类型，实现依赖关系连线的自定义样式
 */

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { cn } from '../../lib/utils';

/**
 * 依赖边配置
 */
const DEPENDENCY_COLORS = {
  FS: {
    label: '完成-开始',
    color: '#3b82f6', // blue
    strokeWidth: 2,
  },
  SS: {
    label: '开始-开始',
    color: '#8b5cf6', // purple
    strokeWidth: 2,
  },
  FF: {
    label: '完成-完成',
    color: '#f59e0b', // amber
    strokeWidth: 2,
  },
  SF: {
    label: '开始-完成',
    color: '#ef4444', // red
    strokeWidth: 2,
  },
};

/**
 * DependencyEdge组件
 * 显示依赖关系的自定义连线
 */
const DependencyEdge: React.FC<any> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  // 获取依赖类型，默认为FS
  const dependencyType = (data?.dependencyType as keyof typeof DEPENDENCY_COLORS) || 'FS';
  const config = DEPENDENCY_COLORS[dependencyType];

  // 计算贝塞尔曲线路径
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* 主边 */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : config.strokeWidth,
          stroke: selected ? '#2563eb' : config.color,
        }}
        className={cn(
          'transition-all duration-200',
          selected && 'drop-shadow-md'
        )}
      />

      {/* 边标签 */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 10,
            pointerEvents: 'all',
          }}
          className={cn(
            'px-2 py-1 rounded-md border shadow-sm',
            'bg-white font-medium',
            selected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          )}
        >
          {config.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

/**
 * 使用memo优化性能，避免不必要的重渲染
 */
export default memo(DependencyEdge);
