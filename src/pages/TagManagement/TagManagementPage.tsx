/**
 * V5.3 P2-4: Tags & Classification 页面
 * 标签管理界面（列表、创建、编辑、删除）
 */
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TagOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { TagService } from '@/services/tagService';
import {
  Tag as TagType,
  Category,
  CreateTagRequest,
  UpdateTagRequest,
  TAG_COLORS,
} from '@/types/tag';

const { Option } = Select;

/**
 * 标签管理页面
 */
const TagManagementPage: React.FC = () => {
  const [tags, setTags] = useState<TagType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // 加载标签列表
  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await TagService.getTags({
        categoryId: selectedCategory,
        search: searchText,
      });
      setTags(response.items || []);
    } catch (error) {
      message.error('加载标签失败');
      console.error('Load tags failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const data = await TagService.getCategories();
      setCategories(data);
    } catch (error) {
      message.error('加载分类失败');
      console.error('Load categories failed:', error);
    }
  };

  useEffect(() => {
    loadTags();
    loadCategories();
  }, [selectedCategory, searchText]);

  // 打开创建/编辑模态框
  const handleOpenModal = (tag?: TagType) => {
    setEditingTag(tag || null);
    if (tag) {
      form.setFieldsValue(tag);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTag(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTag) {
        // 更新标签
        await TagService.updateTag(editingTag.id, values as UpdateTagRequest);
        message.success('标签更新成功');
      } else {
        // 创建标签
        await TagService.createTag(values as CreateTagRequest);
        message.success('标签创建成功');
      }
      
      handleCloseModal();
      loadTags();
    } catch (error) {
      message.error(editingTag ? '更新标签失败' : '创建标签失败');
      console.error('Submit failed:', error);
    }
  };

  // 删除标签
  const handleDelete = async (id: string) => {
    try {
      await TagService.deleteTag(id);
      message.success('标签删除成功');
      loadTags();
    } catch (error) {
      message.error('删除标签失败');
      console.error('Delete failed:', error);
    }
  };

  // 颜色选择器渲染
  const renderColorPicker = () => {
    return (
      <div className="grid grid-cols-6 gap-2">
        {TAG_COLORS.map((color) => (
          <Tooltip key={color.value} title={color.name}>
            <div
              className={`w-8 h-8 rounded cursor-pointer border-2 border-transparent hover:border-gray-400 transition-all ${
                form.getFieldValue('color') === color.value ? 'border-gray-800' : ''
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => form.setFieldsValue({ color: color.value })}
            />
          </Tooltip>
        ))}
      </div>
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TagType) => (
        <Space>
          <Tag color={record.color} icon={<TagOutlined />}>
            {text}
          </Tag>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text: string) => text || <span className="text-gray-400">未分类</span>,
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      sorter: (a: TagType, b: TagType) => a.usageCount - b.usageCount,
      render: (count: number) => <Badge count={count} showZero color="blue" />,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: TagType, b: TagType) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TagType) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个标签吗？删除后无法恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <Space>
            <TagOutlined />
            <span>标签管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            创建标签
          </Button>
        }
      >
        {/* 过滤器 */}
        <Row gutter={16} className="mb-4">
          <Col span={8}>
            <Input
              placeholder="搜索标签名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="选择分类"
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
              allowClear
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  <Space>
                    <FolderOutlined style={{ color: cat.color }} />
                    {cat.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* 标签列表 */}
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 创建/编辑标签模态框 */}
      <Modal
        title={editingTag ? '编辑标签' : '创建标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" maxLength={50} />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea
              placeholder="请输入标签描述"
              rows={3}
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="color"
            label="标签颜色"
            rules={[{ required: true, message: '请选择标签颜色' }]}
          >
            {renderColorPicker()}
          </Form.Item>

          <Form.Item name="categoryId" label="所属分类">
            <Select placeholder="请选择分类" allowClear>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  <Space>
                    <FolderOutlined style={{ color: cat.color }} />
                    {cat.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagManagementPage;
