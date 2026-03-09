import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  List,
  Button,
  Space,
  message,
  Spin,
  Modal,
  Form,
  Select,
  Tag,
  Alert,
  Descriptions,
  Popconfirm,
  Tooltip,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import TaskService from '@/services/taskService';
import { TaskDependency, ExtendedTask, SetDependenciesRequest } from '@/types/task';

const { Option } = Select;

const TaskDependencies: React.FC = () => {
  const { id: taskId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<ExtendedTask | null>(null);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [availableTasks, setAvailableTasks] = useState<ExtendedTask[]>([]);
  
  // 添加依赖关系模态框
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (taskId) {
      loadData();
    }
  }, [taskId]);

  const loadData = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      // 加载当前任务详情
      const taskResponse = await TaskService.getTask(taskId).catch(() => null);
      if (taskResponse) {
        setTask(taskResponse);
      }

      // 加载依赖关系
      const depsResponse = await TaskService.getDependencies(taskId).catch(() => []);
      setDependencies(depsResponse);

      // 加载可用任务列表（排除当前任务和已添加的依赖）
      const tasksResponse = await TaskService.getTasks().catch(() => ({ items: [] }));
      const filteredTasks = tasksResponse.items.filter(
        (t) => t.id !== taskId && !depsResponse.some((d) => d.dependsOnTaskId === t.id)
      );
      setAvailableTasks(filteredTasks);
    } catch (error) {
      console.error('加载依赖关系数据失败:', error);
      message.error('加载依赖关系数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getDependencyTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      FS: '完成后开始',
      SS: '同时开始',
    };
    return typeMap[type] || type;
  };

  const handleAddDependency = async () => {
    if (!taskId) return;

    try {
      const values = await form.validateFields();
      setAdding(true);

      const data: SetDependenciesRequest = {
        dependsOnTaskIds: [values.taskId],
        dependencyType: values.dependencyType || 'FS',
      };

      await TaskService.setDependencies(taskId, data);

      message.success('依赖关系添加成功');
      setAddModalVisible(false);
      form.resetFields();

      // 重新加载数据
      await loadData();
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误，不显示message
        return;
      }
      console.error('添加依赖关系失败:', error);
      message.error('添加依赖关系失败');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveDependency = async (depId: string) => {
    if (!taskId) return;

    try {
      await TaskService.removeDependency(taskId, depId);
      message.success('依赖关系删除成功');
      await loadData();
    } catch (error) {
      console.error('删除依赖关系失败:', error);
      message.error('删除依赖关系失败');
    }
  };

  // 获取依赖任务详情
  const getDependencyTask = (depTaskId: string) => {
    return availableTasks.find((t) => t.id === depTaskId);
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const isBlocked = dependencies.some((dep) => {
    const depTask = getDependencyTask(dep.dependsOnTaskId);
    return depTask && depTask.status !== 'done';
  });

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
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>任务依赖关系管理</h1>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModalVisible(true)}
        >
          添加依赖
        </Button>
      </div>

      {/* 当前任务信息 */}
      {task && (
        <Card style={{ marginBottom: 24 }}>
          <Descriptions title="当前任务" bordered column={3}>
            <Descriptions.Item label="任务标题" span={3}>
              {task.title}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={task.status === 'done' ? 'success' : 'processing'}>
                {task.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={task.priority === 'urgent' ? 'error' : 'blue'}>
                {task.priority.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="阻塞状态">
              {isBlocked ? (
                <Tag color="error" icon={<ExclamationCircleOutlined />}>
                  被阻塞
                </Tag>
              ) : (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  未阻塞
                </Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* 阻塞提示 */}
      {isBlocked && (
        <Alert
          message="任务被阻塞"
          description="当前任务依赖于未完成的前置任务，无法开始执行。请等待前置任务完成后再继续。"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 依赖关系列表 */}
      <Card
        title={
          <Space>
            <LinkOutlined />
            <span>依赖关系列表</span>
            <Tag color="blue">{dependencies.length}</Tag>
          </Space>
        }
      >
        {dependencies.length > 0 ? (
          <List
            dataSource={dependencies}
            renderItem={(dep) => {
              const depTask = getDependencyTask(dep.dependsOnTaskId);
              const isCompleted = depTask?.status === 'done';

              return (
                <List.Item
                  actions={[
                    <Popconfirm
                      key="delete"
                      title="确定删除这个依赖关系吗？"
                      onConfirm={() => handleRemoveDependency(dep.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                      >
                        删除
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      isCompleted ? (
                        <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                      ) : (
                        <CloseCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />
                      )
                    }
                    title={
                      <Space>
                        <span style={{ fontWeight: 500 }}>
                          {depTask?.title || `任务 ${dep.dependsOnTaskId}`}
                        </span>
                        <Tag color={isCompleted ? 'success' : 'warning'}>
                          {depTask?.status?.toUpperCase() || 'UNKNOWN'}
                        </Tag>
                        {isCompleted && (
                          <Tag color="success">已完成</Tag>
                        )}
                        {!isCompleted && (
                          <Tag color="warning">进行中</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Space>
                          <span>依赖类型：</span>
                          <Tag>{getDependencyTypeLabel(dep.dependencyType)}</Tag>
                        </Space>
                        <Space>
                          <span>创建时间：</span>
                          <span style={{ color: '#999' }}>
                            {new Date(dep.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </Space>
                        {!isCompleted && (
                          <Tooltip title="当前任务需要等待此依赖任务完成后才能开始">
                            <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                              阻塞中
                            </Tag>
                          </Tooltip>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty
            description="暂无依赖关系"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              添加依赖
            </Button>
          </Empty>
        )}
      </Card>

      {/* 添加依赖关系模态框 */}
      <Modal
        title="添加依赖关系"
        open={addModalVisible}
        onOk={handleAddDependency}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={adding}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="taskId"
            label="选择依赖任务"
            rules={[{ required: true, message: '请选择依赖任务' }]}
          >
            <Select placeholder="请选择一个任务作为依赖">
              {availableTasks.map((task) => (
                <Option key={task.id} value={task.id}>
                  <Space>
                    <span>{task.title}</span>
                    <Tag color={task.status === 'done' ? 'success' : 'processing'}>
                      {task.status.toUpperCase()}
                    </Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dependencyType"
            label="依赖类型"
            initialValue="FS"
            tooltip={
              <div>
                <div><strong>FS (Finish-Start):</strong> 依赖任务完成后，当前任务才能开始</div>
                <div><strong>SS (Start-Start):</strong> 依赖任务开始时，当前任务也可以开始</div>
              </div>
            }
          >
            <Select>
              <Option value="FS">完成后开始 (FS)</Option>
              <Option value="SS">同时开始 (SS)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskDependencies;
