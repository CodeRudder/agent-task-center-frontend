import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface DeleteConfirmationDialogProps {
  visible: boolean;
  taskTitle: string;
  taskId: number;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  visible,
  taskTitle,
  taskId,
  onCancel,
  onConfirm,
  loading = false,
}) => {
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={480}
      centered
      closable={false}
      mask={{ closable: false }}
    >
      {/* 标题区域 */}
      <div
        style={{
          padding: '16px 0',
          borderBottom: '1px solid #F0F0F0',
          marginBottom: '24px',
        }}
      >
        <WarningOutlined
          style={{
            fontSize: '20px',
            color: '#FA8C16',
            marginRight: '8px',
          }}
        />
        <span
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FA8C16',
          }}
        >
          确认删除
        </span>
      </div>

      {/* 内容区域 */}
      <div style={{ marginBottom: '24px' }}>
        <Text
          style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}
        >
          您确定要删除任务吗？
        </Text>

        <div
          style={{
            padding: '12px',
            background: '#F5F5F5',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <Text
            style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}
          >
            <strong>任务标题：</strong>
            {taskTitle}
          </Text>
          <Text style={{ fontSize: '14px', display: 'block' }}>
            <strong>任务ID：</strong>
            {taskId}
          </Text>
        </div>

        <div
          style={{
            padding: '12px',
            background: '#FFF7E6',
            borderRadius: '4px',
            border: '1px solid #FFD591',
          }}
        >
          <ExclamationCircleOutlined
            style={{
              color: '#FA8C16',
              marginRight: '8px',
            }}
          />
          <Text style={{ fontSize: '14px', color: '#FA8C16' }}>
            此操作不可恢复
          </Text>
        </div>
      </div>

      {/* 按钮区域 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}
      >
        <Button
          onClick={onCancel}
          style={{ width: '88px', height: '32px' }}
          disabled={loading}
        >
          取消
        </Button>
        <Button
          type="primary"
          danger
          onClick={onConfirm}
          loading={loading}
          style={{
            width: '100px',
            height: '32px',
            background: '#FF4D4F',
            borderColor: '#FF4D4F',
          }}
        >
          确认删除
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
