/**
 * V5.3 依赖关系图控制组件
 * 提供缩放控制、布局切换、节点锁定等功能
 */

import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Lock, 
  Unlock, 
  ArrowRight, 
  ArrowDown 
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

/**
 * 布局方向类型
 */
export type LayoutDirection = 'horizontal' | 'vertical';

/**
 * DependencyControls组件属性
 */
interface DependencyControlsProps {
  /** 当前布局方向 */
  layoutDirection?: LayoutDirection;
  /** 布局方向变化回调 */
  onLayoutDirectionChange?: (direction: LayoutDirection) => void;
  /** 是否锁定节点 */
  isLocked?: boolean;
  /** 节点锁定状态变化回调 */
  onLockChange?: (locked: boolean) => void;
  /** 类名 */
  className?: string;
}

/**
 * DependencyControls组件
 * 提供图的缩放、布局和锁定控制
 */
const DependencyControls: React.FC<DependencyControlsProps> = ({
  layoutDirection = 'horizontal',
  onLayoutDirectionChange,
  isLocked = false,
  onLockChange,
  className = '',
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 300 });
  };

  const handleLayoutChange = (value: LayoutDirection) => {
    if (value && onLayoutDirectionChange) {
      onLayoutDirectionChange(value);
    }
  };

  const handleLockToggle = () => {
    if (onLockChange) {
      onLockChange(!isLocked);
    }
  };

  return (
    <div className={`flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm ${className}`}>
      {/* 缩放控制 */}
      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleZoomIn}
          disabled={isLocked}
          title="放大"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <button
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleZoomOut}
          disabled={isLocked}
          title="缩小"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <button
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleFitView}
          disabled={isLocked}
          title="适应屏幕"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* 分隔线 */}
      <div className="w-px h-8 bg-gray-300" />

      {/* 布局切换 */}
      <div className="flex items-center border rounded-md">
        <button
          className={`p-2 rounded-l ${layoutDirection === 'horizontal' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          onClick={() => handleLayoutChange('horizontal')}
          title="从左到右"
        >
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          className={`p-2 rounded-r ${layoutDirection === 'vertical' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          onClick={() => handleLayoutChange('vertical')}
          title="从上到下"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>

      {/* 分隔线 */}
      <div className="w-px h-8 bg-gray-300" />

      {/* 节点锁定 */}
      <button
        className={`p-2 rounded ${isLocked ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
        onClick={handleLockToggle}
        title={isLocked ? '解锁节点' : '锁定节点'}
      >
        {isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Unlock className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default DependencyControls;
export type { DependencyControlsProps };
