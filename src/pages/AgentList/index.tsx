import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Progress,
  Select,
  Space,
  Card,
  Statistic,
  Row,
  Col,
  Button,
  Modal,
  message,
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  CopyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { agentService, Agent } from '../../services/agent.service';
import { formatDate } from '../../utils/storage';

const { Option } = Select;

const AgentList: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenValue, setTokenValue] = useState('');

  useEffect(() => {
    loadAgents();
  }, [statusFilter, typeFilter]);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      
      const data = await agentService.getAgents(params);
      setAgents(data);
    } catch (error) {
      console.error('加载Agent列表失败:', error);
      message.error('加载Agent列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewToken = async (agent: Agent) => {
    setSelectedAgent(agent);
    setTokenLoading(true);
    setTokenModalVisible(true);
    
    try {
      const fullAgent = await agentService.getAgent(agent.id);
      setTokenValue(fullAgent.apiToken || '');
    } catch (error) {
      console.error('获取Token失败:', error);
      message.error('获取Token失败');
      setTokenModalVisible(false);
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(tokenValue);
    message.success('Token已复制到剪贴板');
  };

  const handleResetToken = async () => {
    if (!selectedAgent) return;
    
    Modal.confirm({
      title: '确认重置Token',
      content: '重置Token后，原有Token将失效，需要更新所有使用该Token的配置。',
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        setTokenLoading(true);
        try {
          const result = await agentService.regenerateToken(selectedAgent.id);
          setTokenValue(result.token);
          message.success('Token重置成功');
        } catch (error) {
          console.error('重置Token失败:', error);
          message.error('重置Token失败');
        } finally {
          setTokenLoading(false);
        }
      },
    });
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

  const onlineCount = agents.filter((a) => a.status === 'online').length;
  const busyCount = agents.filter((a) => a.status === 'busy').length;

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{getTypeLabel(type)}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: '负载',
      key: 'load',
      render: (_: any, agent: Agent) => {
        const percentage = getLoadPercentage(agent.currentTaskCount, agent.maxConcurrentTasks);
        return (
          <Progress
            percent={percentage}
            size="small"
            format={() => `${agent.currentTaskCount}/${agent.maxConcurrentTasks}`}
          />
        );
      },
    },
    {
      title: '当前任务',
      dataIndex: 'currentTaskCount',
      key: 'currentTaskCount',
    },
    {
      title: '最后活跃',
      dataIndex: 'lastHeartbeatAt',
      key: 'lastHeartbeatAt',
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined />
          <span>{formatDate(date)}</span>
        </Space>
      ),
    },
    {
      title: '能力',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities: string[]) => (
        <Space size={[0, 8]} wrap>
          {capabilities.map((cap) => (
            <Tag key={cap} color="blue">
              {cap}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, agent: Agent) => (
        <Button
          type="primary"
          icon={<KeyOutlined />}
          onClick={() => handleViewToken(agent)}
        >
          管理Token
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Agent列表</h1>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总Agent数"
              value={agents.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="在线"
              value={onlineCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="忙碌"
              value={busyCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="离线"
              value={agents.length - onlineCount - busyCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选器 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <div>
            <label style={{ marginRight: 8 }}>状态：</label>
            <Select
              placeholder="选择状态"
              style={{ width: 120 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="online">在线</Option>
              <Option value="offline">离线</Option>
              <Option value="busy">忙碌</Option>
            </Select>
          </div>

          <div>
            <label style={{ marginRight: 8 }}>类型：</label>
            <Select
              placeholder="选择类型"
              style={{ width: 120 }}
              allowClear
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="developer">开发</Option>
              <Option value="tester">测试</Option>
              <Option value="designer">设计</Option>
              <Option value="manager">管理</Option>
            </Select>
          </div>
        </Space>
      </Card>

      {/* Agent列表 */}
      <Card>
        <Table
          dataSource={agents}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个Agent`,
          }}
        />
      </Card>

      {/* Token管理Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>管理Token - {selectedAgent?.name}</span>
          </Space>
        }
        open={tokenModalVisible}
        onCancel={() => {
          setTokenModalVisible(false);
          setSelectedAgent(null);
          setTokenValue('');
        }}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyToken} disabled={!tokenValue}>
            复制Token
          </Button>,
          <Button
            key="reset"
            icon={<ReloadOutlined />}
            onClick={handleResetToken}
            danger
            loading={tokenLoading}
          >
            重置Token
          </Button>,
          <Button key="close" onClick={() => {
            setTokenModalVisible(false);
            setSelectedAgent(null);
            setTokenValue('');
          }}>
            关闭
          </Button>,
        ]}
      >
        {tokenLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : (
          <div>
            <p style={{ marginBottom: 8 }}>API Token：</p>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                border: '1px solid #d9d9d9',
              }}
            >
              {tokenValue}
            </div>
            <p style={{ marginTop: 16, color: '#8c8c8c', fontSize: 12 }}>
              Token用于API认证，请妥善保管。重置后原Token将失效。
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AgentList;
