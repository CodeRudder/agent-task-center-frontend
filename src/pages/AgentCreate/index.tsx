import React from 'react';
import { Form, Input, Select, Button, Card, message, Modal, Alert, Space, Typography } from 'antd';
import { PlusOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface AgentCreateFormValues {
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  maxConcurrentTasks: number;
}

const AgentCreate: React.FC = () => {
  const [form] = Form.useForm<AgentCreateFormValues>();
  const [loading, setLoading] = React.useState(false);
  const [tokenModalVisible, setTokenModalVisible] = React.useState(false);
  const [token, setToken] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      message.success('Token已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      message.error('复制失败，请手动复制');
    }
  };

  const onFinish = async (values: AgentCreateFormValues) => {
    setLoading(true);
    try {
      const { agentService } = await import('../../services/agent.service');
      const result = await agentService.createAgent({
        name: values.name,
        type: values.type,
        // Note: description is not supported in createAgent API
        capabilities: values.capabilities || [],
        maxConcurrentTasks: values.maxConcurrentTasks,
      });

      if (result.apiToken) {
        setToken(result.apiToken);
        setTokenModalVisible(true);
        message.success('Agent创建成功');
        form.resetFields();
      } else {
        message.error('Agent创建成功，但未获取到Token');
        form.resetFields();
      }
    } catch (error) {
      message.error('Agent创建失败');
      console.error('创建Agent失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenModalClose = () => {
    setTokenModalVisible(false);
    setToken('');
    setCopied(false);
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>创建Agent</h1>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            type: 'developer',
            maxConcurrentTasks: 3,
          }}
        >
          <Form.Item
            label="Agent名称"
            name="name"
            rules={[
              { required: true, message: '请输入Agent名称' },
              { min: 2, message: '名称至少2个字符' },
              { max: 50, message: '名称最多50个字符' },
            ]}
          >
            <Input placeholder="请输入Agent名称" />
          </Form.Item>

          <Form.Item
            label="Agent类型"
            name="type"
            rules={[{ required: true, message: '请选择Agent类型' }]}
          >
            <Select placeholder="请选择Agent类型">
              <Option value="developer">开发</Option>
              <Option value="tester">测试</Option>
              <Option value="designer">设计</Option>
              <Option value="manager">管理</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[
              { required: true, message: '请输入描述' },
              { max: 500, message: '描述最多500个字符' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请输入Agent描述信息"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="能力标签"
            name="capabilities"
          >
            <Select
              mode="tags"
              placeholder="输入能力标签后回车"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            label="最大并发任务数"
            name="maxConcurrentTasks"
            rules={[
              { required: true, message: '请输入最大并发任务数' },
              { type: 'number', min: 1, max: 10, message: '并发任务数为1-10' },
            ]}
          >
            <Input type="number" min={1} max={10} placeholder="1-10" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={loading}
              size="large"
            >
              创建Agent
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Agent创建成功"
        open={tokenModalVisible}
        onCancel={handleTokenModalClose}
        footer={[
          <Button key="close" type="primary" onClick={handleTokenModalClose}>
            我已复制Token
          </Button>,
        ]}
        maskClosable={false}
        centered
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="重要提示"
            description="Token是Agent的身份凭证，请妥善保管。Token只会显示一次，请立即复制并保存。"
            type="warning"
            showIcon
          />

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              API Token:
            </Text>
            <Paragraph
              copyable={{
                text: token,
                onCopy: () => {
                  setCopied(true);
                  message.success('Token已复制到剪贴板');
                  setTimeout(() => setCopied(false), 2000);
                },
              }}
              style={{
                fontFamily: 'monospace',
                fontSize: '16px',
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                wordBreak: 'break-all',
                marginBottom: 0,
              }}
            >
              {token}
            </Paragraph>
          </div>

          <Button
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={() => copyToClipboard(token)}
            block
            type={copied ? 'default' : 'primary'}
          >
            {copied ? '已复制' : '复制Token'}
          </Button>
        </Space>
      </Modal>
    </div>
  );
};

export default AgentCreate;
