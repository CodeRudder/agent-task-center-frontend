import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Progress,
  Button,
  Space,
  Divider,
  message,
  Spin,
  Avatar,
  Form,
  Input,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { taskService, Task } from '../../services/task.service';
import { useTaskStore } from '../../stores/task.store';
import { formatDate, getPriorityColor } from '../../utils/storage';
import CommentList from '../../components/Comment/CommentList';

const { TextArea } = Input;

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

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateTask, removeTask } = useTaskStore();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const taskData = await taskService.getTask(parseInt(id));
      setTask(taskData);
    } catch (error) {
      message.error('加载任务失败');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!task) return;
    
    try {
      const updatedTask = await taskService.acceptTask(task.id, comment);
      updateTask(task.id, updatedTask);
      message.success('验收成功');
      navigate('/tasks');
    } catch (error) {
      message.error('验收失败');
    }
  };

  const handleReject = async () => {
    if (!task) return;
    
    try {
      const updatedTask = await taskService.rejectTask(task.id, comment);
      updateTask(task.id, updatedTask);
      message.success('已驳回');
      navigate('/tasks');
    } catch (error) {
      message.error('驳回失败');
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    try {
      await taskService.deleteTask(task.id);
      removeTask(task.id);
      message.success('删除成功');
      navigate('/tasks');
    } catch (error) {
      message.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!task) {
    return <div>任务不存在</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/tasks')}
        >
          返回
        </Button>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>{task.title}</h1>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/tasks/${task.id}/edit`)}
            >
              编辑
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              删除
            </Button>
          </Space>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="任务状态">
            <Tag color={getStatusColor(task.status)}>
              {getStatusText(task.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag color={getPriorityColor(task.priority)}>
              {task.priority}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="进度">
            <Progress percent={task.progress} />
          </Descriptions.Item>
          <Descriptions.Item label="截止日期">
            {formatDate(task.dueDate)}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDate(task.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {formatDate(task.updatedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="负责人" span={2}>
            {task.assignments.length > 0 ? (
              <Space>
                {task.assignments.map((assignment) => (
                  <Tag key={assignment.agentId} icon={<Avatar size="small">{assignment.agentName[0]}</Avatar>}>
                    {assignment.agentName} ({assignment.role})
                  </Tag>
                ))}
              </Space>
            ) : (
              '未分配'
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <div>
          <h3>任务描述</h3>
          <p style={{ lineHeight: 1.8 }}>{task.description}</p>
        </div>

        <Divider />

        <CommentList taskId={String(task.id)} />

        {task.status === 'done' && (
          <div>
            <h3>任务验收</h3>
            <p style={{ color: '#666', marginBottom: 16 }}>
              任务已完成，请进行验收
            </p>
            <Form.Item>
              <TextArea
                rows={4}
                placeholder="输入验收意见或驳回原因..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleAccept}
              >
                验收通过
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleReject}
                disabled={!comment}
              >
                驳回
              </Button>
            </Space>
          </div>
        )}

        {task.status === 'accepted' && task.metadata?.acceptComment && (
          <div>
            <h3>验收记录</h3>
            <Card style={{ backgroundColor: '#f6ffed', borderColor: '#52c41a' }}>
              <Tag color="success" icon={<CheckOutlined />} style={{ marginBottom: 8 }}>
                已通过验收
              </Tag>
              <p style={{ marginBottom: 0 }}>{task.metadata.acceptComment}</p>
              {task.metadata.acceptedAt && (
                <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                  验收时间: {formatDate(task.metadata.acceptedAt)}
                </p>
              )}
            </Card>
          </div>
        )}

        {task.status === 'rejected' && task.metadata?.rejectReason && (
          <div>
            <h3>驳回记录</h3>
            <Card style={{ backgroundColor: '#fff2f0', borderColor: '#ff4d4f' }}>
              <Tag color="error" icon={<CloseOutlined />} style={{ marginBottom: 8 }}>
                已驳回
              </Tag>
              <p style={{ marginBottom: 8 }}>{task.metadata.rejectReason}</p>
              {task.metadata.requiredChanges && task.metadata.requiredChanges.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <strong>需要修改：</strong>
                  <ul style={{ marginTop: 4, marginBottom: 0 }}>
                    {task.metadata.requiredChanges.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}
              {task.metadata.rejectedAt && (
                <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                  驳回时间: {formatDate(task.metadata.rejectedAt)}
                </p>
              )}
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TaskDetail;
