import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import TaskCard from '../../components/TaskCard';
import { useTaskStore } from '../../stores/task.store';
import { taskService, Task, CreateTaskDTO, UpdateTaskDTO } from '../../services/task.service';
import { usePolling } from '../../hooks/usePolling';

const { TextArea } = Input;
const { Option } = Select;

const TaskList: React.FC = () => {
  const { tasks, setTasks, addTask, updateTask, removeTask } = useTaskStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [form] = Form.useForm();

  // 初始加载任务
  useEffect(() => {
    loadTasks();
  }, []);

  // 轮询更新任务（30秒间隔）
  const { loading: pollingLoading } = usePolling<{ tasks: Task[]; total: number }>({
    url: '/tasks',
    interval: 30000,
    enabled: true,
  });

  // 加载任务列表
  const loadTasks = async () => {
    try {
      const response = await taskService.getTasks();
      setTasks(response.tasks);
    } catch (error) {
      message.error('加载任务失败');
    }
  };

  // 打开创建模态框
  const handleCreate = () => {
    setEditingTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      dueDate: dayjs(task.dueDate),
    });
    setModalVisible(true);
  };

  // 删除任务
  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(id);
      await taskService.deleteTask(id);
      removeTask(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setDeleteLoading(null);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const taskData: CreateTaskDTO | UpdateTaskDTO = {
        ...values,
        dueDate: values.dueDate.toISOString(),
      };

      if (editingTask) {
        // 更新任务
        const updatedTask = await taskService.updateTask(editingTask.id, taskData);
        updateTask(editingTask.id, updatedTask);
        message.success('更新成功');
      } else {
        // 创建任务
        const newTask = await taskService.createTask(taskData as CreateTaskDTO);
        addTask(newTask);
        message.success('创建成功');
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(editingTask ? '更新失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { status: 'todo', title: '待办' },
    { status: 'in_progress', title: '进行中' },
    { status: 'review', title: '待验收' },
    { status: 'done', title: '已完成' },
    { status: 'accepted', title: '已验收' },
    { status: 'rejected', title: '已驳回' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>任务看板</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          创建任务
        </Button>
      </div>
      
      <Row gutter={[16, 16]}>
        {columns.map((col) => {
          const columnTasks = getTasksByStatus(col.status);
          
          return (
            <Col xs={24} sm={12} md={6} key={col.status}>
              <div
                style={{
                  background: '#f0f2f5',
                  padding: '16px',
                  borderRadius: '8px',
                  minHeight: '600px',
                }}
              >
                <h3 style={{ marginBottom: 16 }}>
                  {col.title} ({columnTasks.length})
                </h3>
                
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deleteLoading={deleteLoading === task.id}
                  />
                ))}
              </div>
            </Col>
          );
        })}
      </Row>

      {/* 创建/编辑任务模态框 */}
      <Modal
        title={editingTask ? '编辑任务' : '创建任务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priority: 'medium',
            progress: 0,
          }}
        >
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
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="截止日期"
                rules={[{ required: true, message: '请选择截止日期' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {editingTask && (
            <Form.Item
              name="progress"
              label="进度"
            >
              <InputNumber
                min={0}
                max={100}
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace('%', '') as any}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default TaskList;
