import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tree,
  Button,
  Space,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Progress,
  Descriptions,
  List,
  Alert,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileOutlined,
  LockOutlined,
} from '@ant-design/icons';
import TaskService from '@/services/taskService';
import { ExtendedTask, SubTask, TaskTreeNode, CreateSubTaskRequest } from '@/types/task';
import dayjs from 'dayjs';

const { Option } = Select;

const SubTaskManagement: React.FC = () => {
  const { id: parentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [parentTask, setParentTask] = useState<ExtendedTask | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [taskTree, setTaskTree] = useState<TaskTreeNode[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');

  // 子任务创建模态框
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (parentId) {
      loadData();
    }
  }, [parentId]);

  const loadData = async () => {
    if (!parentId) return;

    setLoading(true);
    try {
      // 并行加载数据
      const [subtasksResponse, treeResponse] = await Promise.all([
        TaskService.getSubTasks(parentId).catch(() => ({ parentTask: null, subtasks: [] })),
        TaskService.getTaskTree(parentId).catch(() => []),
      ]);

      setParentTask(subtasksResponse.parentTask);
      setSubtasks(subtasksResponse.subtasks);
      setTaskTree(treeResponse);
    } catch (error) {
      console.error('加载子任务数据失败:', error);
      message.error('加载子任务数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      todo: 'default',
      in_progress: 'processing',
      review: 'warning',
      done: 'success',
      blocked: 'error',
    };
    return colorMap[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: 'default',
      medium: 'blue',
      high: 'warning',
      urgent: 'error',
    };
    return colorMap[priority] || 'default';
  };

  const getPriorityLabel = (priority: string) => {
    const labelMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return labelMap[priority] || priority;
  };

  const handleCreateSubTask = async () => {
    if (!parentId) return;

    try {
      const values = await form.validateFields();
      setCreating(true);

      const data: CreateSubTaskRequest = {
        title: values.title,
        description: values.description,
        assigneeId: values.assigneeId,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };

      await TaskService.createSubTask(parentId, data);

      message.success('子任务创建成功');
      setCreateModalVisible(false);
      form.resetFields();

      // 重新加载数据
      await loadData();
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误，不显示message
        return;
      }
      console.error('创建子任务失败:', error);
      message.error('创建子任务失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSubTask = async (subtaskId: string) => {
    try {
      await TaskService.deleteTask(subtaskId);
      message.success('子任务删除成功');
      await loadData();
    } catch (error) {
      console.error('删除子任务失败:', error);
      message.error('删除子任务失败');
    }
  };

  // 构建树形数据
  const buildTreeData = (nodes: TaskTreeNode[]): any[] => {
    return nodes.map((node) => ({
      key: node.key,
      title: (
        <Space>
          {node.children && node.children.length > 0 ? (
            <FolderOutlined style={{ color: '#1890ff' }} />
          ) : (
            <FileOutlined />
          )}
          <span>{node.title}</span>
          <Tag color={getStatusColor(node.data.status)}>
            {node.data.status.toUpperCase()}
          </Tag>
          {node.data.progress !== undefined && (
            <Progress
              type="circle"
              percent={node.data.progress}
              width={20}
              format={() => ''}
              strokeColor={node.data.progress === 100 ? '#52c41a' : '#1890ff'}
            />
          )}
          {node.data.isBlockedByDependency && (
            <LockOutlined style={{ color: '#ff4d4f' }} title="被阻塞" />
          )}
        </Space>
      ),
      children: node.children ? buildTreeData(node.children) : undefined,
      data: node.data,
    }));
  };

  // 树形节点的点击事件
  const onTreeSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      const taskId = selectedKeys[0] as string;
      navigate(`/tasks/${taskId}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const completedSubtasks = subtasks.filter(s => s.status === 'done').length;
  const totalSubtasks = subtasks.length;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面头部 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/tasks')}
          >
            返回
          </Button>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>子任务管理</h1>
        </Space>
        <Space>
          <Button
            onClick={() => setViewMode(viewMode === 'tree' ? 'list' : 'tree')}
          >
            {viewMode === 'tree' ? '列表视图' : '树形视图'}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            创建子任务
          </Button>
        </Space>
      </div>

      {/* 父任务信息 */}
      {parentTask && (
        <Card style={{ marginBottom: 24 }}>
          <Descriptions title="父任务信息" bordered column={3}>
            <Descriptions.Item label="任务标题" span={3}>
              {parentTask.title}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(parentTask.status)}>
                {parentTask.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={getPriorityColor(parentTask.priority)}>
                {getPriorityLabel(parentTask.priority)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="完成进度">
              <Progress percent={progress} />
            </Descriptions.Item>
            <Descriptions.Item label="子任务数" span={3}>
              {totalSubtasks} 个（已完成 {completedSubtasks} 个）
            </Descriptions.Item>
            {parentTask.isBlockedByDependency && (
              <Descriptions.Item label="阻塞状态" span={3}>
                <Alert
                  message="任务被依赖关系阻塞"
                  type="warning"
                  showIcon
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* 子任务列表/树形视图 */}
      <Card>
        {viewMode === 'tree' ? (
          <Tree
            showIcon
            defaultExpandAll
            treeData={buildTreeData(taskTree)}
            onSelect={onTreeSelect}
          />
        ) : (
          <List
            dataSource={subtasks}
            renderItem={(subtask) => (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/tasks/${subtask.id}`)}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="确定删除这个子任务吗？"
                    onConfirm={() => handleDeleteSubTask(subtask.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    subtask.isBlocked ? (
                      <LockOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                    ) : (
                      <FileOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    )
                  }
                  title={
                    <Space>
                      <span style={{ fontWeight: 500 }}>{subtask.title}</span>
                      <Tag color={getStatusColor(subtask.status)}>
                        {subtask.status.toUpperCase()}
                      </Tag>
                      <Tag color={getPriorityColor(subtask.priority)}>
                        {getPriorityLabel(subtask.priority)}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <span>{subtask.description || '暂无描述'}</span>
                      {subtask.assigneeName && (
                        <span>负责人：{subtask.assigneeName}</span>
                      )}
                      {subtask.dueDate && (
                        <span>截止日期：{dayjs(subtask.dueDate).format('YYYY-MM-DD')}</span>
                      )}
                      {subtask.isBlocked && (
                        <Tag color="error">被依赖关系阻塞</Tag>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 创建子任务模态框 */}
      <Modal
        title="创建子任务"
        open={createModalVisible}
        onOk={handleCreateSubTask}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={creating}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <Input.TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            initialValue="medium"
          >
            <Select>
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="assigneeId"
            label="负责人"
          >
            <Select placeholder="请选择负责人" allowClear>
              {/* TODO: 从API加载Agent列表 */}
              <Option value="agent-1">Agent 1</Option>
              <Option value="agent-2">Agent 2</Option>
              <Option value="agent-3">Agent 3</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="截止日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubTaskManagement;
