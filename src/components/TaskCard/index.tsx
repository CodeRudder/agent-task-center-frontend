import React, { useState } from 'react';
import { Card, Tag, Progress, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Task } from '../../services/task.service';
import { formatDate, getPriorityColor, isOverdue } from '../../utils/storage';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  deleteLoading?: boolean;
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    todo: 'default',
    in_progress: 'processing',
    review: 'warning',
    done: 'success',
    accepted: 'success',
    rejected: 'error',
  };
  return colorMap[status] || 'default';
};

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    todo: '待办',
    in_progress: '进行中',
    review: '待验收',
    done: '已完成',
    accepted: '已验收',
    rejected: '已驳回',
  };
  return textMap[status] || status;
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  deleteLoading = false,
}) => {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const isTaskOverdue = isOverdue(task.dueDate);

  const handleDeleteClick = () => {
    setDeleteDialogVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogVisible(false);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <>
      <Card
        size="small"
        style={{
          marginBottom: 12,
          border: isTaskOverdue ? '2px solid #ff4d4f' : undefined,
          background: isTaskOverdue ? '#fff1f0' : '#fff',
        }}
        hoverable
        actions={[
          onEdit && (
            <EditOutlined
              key="edit"
              onClick={() => onEdit(task)}
            />
          ),
          onDelete && (
            <DeleteOutlined
              key="delete"
              onClick={handleDeleteClick}
            />
          ),
        ].filter(Boolean)}
      >
        <h4 style={{ marginBottom: 8 }}>{task.title}</h4>

        <Progress
          percent={task.progress}
          size="small"
          style={{ marginBottom: 8 }}
        />

        <Space size={[0, 8]} wrap>
          <Tag color={getPriorityColor(task.priority)}>
            {task.priority}
          </Tag>
          <Tag color={getStatusColor(task.status)}>
            {getStatusText(task.status)}
          </Tag>
        </Space>

        <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          截止：{formatDate(task.dueDate)}
        </div>

        {task.assignments.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12 }}>
            负责人：{task.assignments.map((a) => a.agentName).join(', ')}
          </div>
        )}
      </Card>

      {/* 删除确认弹窗 */}
      {onDelete && (
        <DeleteConfirmationDialog
          visible={deleteDialogVisible}
          taskTitle={task.title}
          taskId={task.id}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </>
  );
};

export default TaskCard;
