import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Tag,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { templateService } from '../../services/templateService';
import { TaskTemplate, CreateTemplateDTO, UpdateTemplateDTO, TaskFieldConfig } from '../../types/template';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const TaskTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TaskTemplate | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadTemplates();
  }, []);

  // 加载模板列表
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await templateService.getTemplates();
      setTemplates(response.templates);
    } catch {
      message.error('加载模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索过滤
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchText.toLowerCase()) ||
      template.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // 打开创建模态框
  const handleCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      name: template.name,
      description: template.description,
      ...template.fields,
      tags: template.fields.tags?.join(', '),
      dueDate: template.fields.dueDate ? dayjs(template.fields.dueDate) : undefined,
    });
    setModalVisible(true);
  };

  // 预览模板
  const handlePreview = (template: TaskTemplate) => {
    setPreviewTemplate(template);
    setPreviewVisible(true);
  };

  // 从模板创建任务
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateFromTemplate = (_template: TaskTemplate) => {
    // TODO: 跳转到创建任务页面并预填充模板数据
    message.info('即将跳转到创建任务页面');
    // window.location.href = `/tasks/create?templateId=${_template.id}`;
  };

  // 删除模板
  const handleDelete = async (id: number) => {
    try {
      await templateService.deleteTemplate(id);
      message.success('删除成功');
      loadTemplates();
    } catch {
      message.error('删除失败');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构建字段配置
      const fields: TaskFieldConfig = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : undefined,
        categoryId: values.categoryId,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        assignments: values.assignments,
      };

      const templateData: CreateTemplateDTO | UpdateTemplateDTO = {
        name: values.name,
        description: values.templateDescription,
        fields,
      };

      if (editingTemplate) {
        await templateService.updateTemplate(editingTemplate.id, templateData);
        message.success('更新成功');
      } else {
        await templateService.createTemplate(templateData as CreateTemplateDTO);
        message.success('创建成功');
      }

      setModalVisible(false);
      form.resetFields();
      loadTemplates();
    } catch {
      message.error(editingTemplate ? '更新失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 优先级标签
  const getPriorityTag = (priority?: string) => {
    if (!priority) return null;
    const colorMap: Record<string, string> = {
      low: 'default',
      medium: 'blue',
      high: 'orange',
      urgent: 'red',
    };
    const textMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return <Tag color={colorMap[priority]}>{textMap[priority]}</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: TaskTemplate, b: TaskTemplate) => a.name.localeCompare(b.name),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '优先级',
      key: 'priority',
      render: (_: unknown, record: TaskTemplate) => getPriorityTag(record.fields.priority),
    },
    {
      title: '标签',
      key: 'tags',
      render: (_: unknown, record: TaskTemplate) => (
        <>
          {record.fields.tags?.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a: TaskTemplate, b: TaskTemplate) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: TaskTemplate) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCreateFromTemplate(record)}
          >
            使用
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个模板吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>任务模板管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建模板
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索模板名称或描述"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredTemplates}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个模板`,
          }}
        />
      </Card>

      {/* 创建/编辑模板模态框 */}
      <Modal
        title={editingTemplate ? '编辑模板' : '创建模板'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <h3 style={{ marginTop: 0 }}>基本信息</h3>
          
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="例如：日常巡检任务模板" />
          </Form.Item>

          <Form.Item
            name="templateDescription"
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <TextArea rows={2} placeholder="描述这个模板的用途和适用场景" />
          </Form.Item>

          <h3>任务字段配置（可选）</h3>

          <Form.Item
            name="title"
            label="默认标题"
          >
            <Input placeholder="任务默认标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="默认描述"
          >
            <TextArea rows={3} placeholder="任务默认描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="默认优先级"
              >
                <Select placeholder="选择优先级" allowClear>
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="默认分类"
              >
                <InputNumber placeholder="分类ID" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tags"
            label="默认标签"
            extra="多个标签用逗号分隔"
          >
            <Input placeholder="例如：日常, 巡检, 重要" />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="默认截止日期"
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览模板模态框 */}
      <Modal
        title="模板预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => {
              setPreviewVisible(false);
              if (previewTemplate) {
                handleCreateFromTemplate(previewTemplate);
              }
            }}
          >
            使用此模板
          </Button>,
        ]}
        width={600}
      >
        {previewTemplate && (
          <div>
            <p>
              <strong>模板名称：</strong>
              {previewTemplate.name}
            </p>
            <p>
              <strong>描述：</strong>
              {previewTemplate.description}
            </p>
            <hr style={{ margin: '16px 0' }} />
            <h4>任务字段配置：</h4>
            <ul>
              {previewTemplate.fields.title && (
                <li>
                  <strong>标题：</strong> {previewTemplate.fields.title}
                </li>
              )}
              {previewTemplate.fields.description && (
                <li>
                  <strong>描述：</strong> {previewTemplate.fields.description}
                </li>
              )}
              {previewTemplate.fields.priority && (
                <li>
                  <strong>优先级：</strong> {getPriorityTag(previewTemplate.fields.priority)}
                </li>
              )}
              {previewTemplate.fields.tags && previewTemplate.fields.tags.length > 0 && (
                <li>
                  <strong>标签：</strong>{' '}
                  {previewTemplate.fields.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </li>
              )}
              {previewTemplate.fields.categoryId && (
                <li>
                  <strong>分类ID：</strong> {previewTemplate.fields.categoryId}
                </li>
              )}
              {previewTemplate.fields.dueDate && (
                <li>
                  <strong>截止日期：</strong> {dayjs(previewTemplate.fields.dueDate).format('YYYY-MM-DD HH:mm')}
                </li>
              )}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskTemplates;
