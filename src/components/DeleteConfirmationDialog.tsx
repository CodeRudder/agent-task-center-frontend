/**
 * 删除确认对话框组件
 * 
 * 用于确认删除操作的模态对话框
 * 支持显示详细信息、危险操作提示
 * 
 * @author Frontend Developer
 * @date 2026-03-25
 */
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface DeleteConfirmationDialogProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 确认回调 */
  onConfirm: () => void;
  /** 标题 */
  title: string;
  /** 消息 */
  message: string;
  /** 详细信息项 */
  itemInfo?: Array<{
    label: string;
    value: string;
  }>;
  /** 是否为危险操作 */
  danger?: boolean;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 加载状态 */
  loading?: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemInfo,
  danger = true,
  confirmText = '确认删除',
  cancelText = '取消',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="p-6">
        {/* 图标和标题 */}
        <div className="flex items-start gap-4 mb-4">
          <div 
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
              danger ? 'bg-red-100' : 'bg-yellow-100'
            )}
          >
            <AlertTriangle 
              className={cn(
                'w-6 h-6',
                danger ? 'text-red-600' : 'text-yellow-600'
              )} 
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>

        {/* 详细信息 */}
        {itemInfo && itemInfo.length > 0 && (
          <div className="mb-4 bg-gray-50 rounded-lg p-4">
            {itemInfo.map((item, index) => (
              <div 
                key={index}
                className="flex justify-between items-center py-2 first:pt-0 last:pb-0"
              >
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <span className="text-sm text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
