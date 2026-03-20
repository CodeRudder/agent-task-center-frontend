import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Progress,
  Button,
  Space,
  message,
  Spin,
  Modal,
  Alert,
  Typography,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  StopOutlined,
  CopyOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { agentService } from '../../services/agent.service';
import { Agent } from '@/types';
import { formatDate } from '../../utils/storage';

const { Text, Paragraph } = Typography;

const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const agentId = id ? parseInt(id) : null;

  useEffect(() => {
    loadAgent();
  }, [id]);

  const loadAgent = async () => {
    if (!agentId) return;
    
    try {
      setLoading(true);
      const agentData = await agentService.getAgent(agentId);
      setAgent(agentData);
    } catch (error) {
      message.error('加载Agent详情失败');
      navigate('/agents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      online: 'success',
      offline: 'default',
      busy: 'warning',
    };
    return colorMap[status] || 'default';
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      developer: '开发',
      tester: '测试',
      designer: '设计',
      manager: '管理',
    };
    return typeMap[type] || type;
  };

  const getLoadPercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((current / max) * 100);
  };

  const handleRegenerateToken = async () => {
    if (!agentId) return;
    
    try {
      setRegenerating(true);
      const result = await agentService.regenerateToken(agentId);
      if (result.apiToken) {
        setNewToken(result.apiToken);
        setTokenModalVisible(true);
        message.success('Token重新生成成功');
        // 刷新Agent数据
        await loadAgent();
      } else {
        message.error('Token重新生成失败');
      }
    } catch (error) {
      message.error('Token重新生成失败');
      console.error('重新生成Token失败:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!agentId) return;
    
    try {
      await agentService.revokeToken(agentId);
      message.success('Token已撤销');
      // 刷新Agent数据
      await loadAgent();
    } catch (error) {
      message.error('Token撤销失败');
      console.error('撤销Token失败:', error);
    }
  };

  const handleDelete = async () => {
    if (!agentId) return;
    
    try {
      await agentService.deleteAgent(agentId);
      message.success('Agent删除成功');
      navigate('/agents');
    } catch (error) {
      message.error('删除失败');
    }
  };

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

  const handleTokenModalClose = () => {
    setTokenModalVisible(false);
    setNewToken('');
    setCopied(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!agent) {
    return <div>Agent不存在</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/agents')}
        >
          返回
        </Button>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>{agent.name}</h1>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/agents/${agent.id}/edit`)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这个Agent吗？"
              description="删除后无法恢复，请谨慎操作。"
              onConfirm={handleDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="类型">
            <Tag>{getTypeLabel(agent.type)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={getStatusColor(agent.status)}>
              {agent.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="负载">
            <Progress
              percent={getLoadPercentage(agent.currentTaskCount, agent.maxConcurrentTasks)}
              size="small"
              format={() => `${agent.currentTaskCount}/${agent.maxConcurrentTasks}`}
            />
          </Descriptions.Item>
          <Descriptions.Item label="最大并发任务">
            {agent.maxConcurrentTasks}
          </Descriptions.Item>
          <Descriptions.Item label="当前任务数">
            {agent.currentTaskCount}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDate(agent.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="最后活跃">
            {formatDate(agent.lastHeartbeatAt)}
          </Descriptions.Item>
          <Descriptions.Item label="API Token" span={2}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {agent.apiToken ? (
                <>
                  <Paragraph
                    copyable={{
                      text: agent.apiToken,
                      onCopy: () => {
                        message.success('Token已复制到剪贴板');
                      },
                    }}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      padding: '8px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      wordBreak: 'break-all',
                      marginBottom: 12,
                      maxWidth: '600px',
                    }}
                  >
                    {agent.apiToken}
                  </Paragraph>
                  {agent.tokenCreatedAt && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      创建时间: {formatDate(agent.tokenCreatedAt)}
                    </Text>
                  )}
                  {agent.tokenExpiresAt && (
                    <div>
                      <Text
                        type={
                          new Date(agent.tokenExpiresAt) < new Date()
                            ? 'danger'
                            : 'secondary'
                        }
                        style={{ fontSize: '12px' }}
                      >
                        过期时间: {formatDate(agent.tokenExpiresAt)}
                        {new Date(agent.tokenExpiresAt) < new Date() && ' (已过期)'}
                      </Text>
                    </div>
                  )}
                  <Space>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRegenerateToken}
                      loading={regenerating}
                    >
                      重新生成Token
                    </Button>
                    <Popconfirm
                      title="确定要撤销Token吗？"
                      description="撤销后Agent将无法访问API，需要重新生成Token。"
                      onConfirm={handleRevokeToken}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button danger icon={<StopOutlined />}>
                        撤销Token
                      </Button>
                    </Popconfirm>
                  </Space>
                </>
              ) : (
                <>
                  <Text type="secondary">Token已被撤销</Text>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRegenerateToken}
                    loading={regenerating}
                  >
                    生成Token
                  </Button>
                </>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="能力" span={2}>
            <Space size={[0, 8]} wrap>
              {agent.capabilities.map((cap) => (
                <Tag key={cap} color="blue">
                  {cap}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Token重新生成成功"
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
            description="新的Token已生成，请妥善保管。旧Token将立即失效。"
            type="warning"
            showIcon
          />

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              新的API Token:
            </Text>
            <Paragraph
              copyable={{
                text: newToken,
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
              {newToken}
            </Paragraph>
          </div>

          <Button
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={() => copyToClipboard(newToken)}
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

export default AgentDetail;
