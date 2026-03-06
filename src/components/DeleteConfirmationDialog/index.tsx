/**
 * 删除确认弹窗组件
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemInfo?: {
    label: string;
    value: string;
  }[];
  danger?: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '确认删除',
  message = '确定要删除吗？此操作不可恢复。',
  itemInfo,
  danger = true,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showCloseButton={false}
      closeOnOverlayClick={false}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="min-w-[100px]"
          >
            确认删除
          </Button>
        </div>
      }
    >
      {/* 图标和标题 */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-orange-600">
          {title}
        </h3>
      </div>

      {/* 内容 */}
      <div className="space-y-4">
        <p className="text-gray-700">{message}</p>

        {/* 项目信息 */}
        {itemInfo && itemInfo.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {itemInfo.map((item, index) => (
              <div key={index} className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{item.label}：</span>
                {item.value}
              </div>
            ))}
          </div>
        )}

        {/* 警告提示 */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-700 font-medium">
            此操作不可恢复，请谨慎操作。
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
