import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './CustomModal.css';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ open, onClose, title, children }) => {
  // 按Esc键关闭Modal
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // 添加和移除键盘事件监听器
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, handleKeyDown]);

  // 点击遮罩层关闭Modal
  const handleMaskClick = () => {
    onClose();
  };

  // 阻止Modal内容区域的点击事件冒泡
  const handleModalContentClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  // 如果Modal未打开，不渲染任何内容
  if (!open) {
    return null;
  }

  // 使用React Portal将Modal渲染到body
  return ReactDOM.createPortal(
    <div className="custom-modal-mask" onClick={handleMaskClick}>
      <div className="custom-modal-wrapper">
        <div className="custom-modal-content" onClick={handleModalContentClick}>
          <div className="custom-modal-header">
            <div className="custom-modal-title">{title}</div>
            <button className="custom-modal-close" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="custom-modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomModal;
