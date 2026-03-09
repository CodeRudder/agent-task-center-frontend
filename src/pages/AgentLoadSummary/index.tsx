import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Space,
  message,
  Button,
  Progress,
  Statistic,
  Row,
  Col,
  Alert,
  Tag,
  Switch,
} from 'antd';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import AgentService from '@/services/agentService';
import { ExtendedAgent } from '@/types';
import type { AgentLoadSummary } from '@/types';

const AgentLoadSummary: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<ExtendedAgent[]>([]);
  const [loadSummary, setLoadSummary] = useState<AgentLoadSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      // 每10秒自动刷新
      intervalId = setInterval(() => {
        loadData();
      }, 10000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agentsResponse, summaryResponse] = await Promise.all([
        AgentService.getAgentsWithLoad({ page: 1, pageSize: 100 }).catch(() => ({ items: [] })),
        AgentService.getLoadSummary().catch(() => null),
      ]);

      setAgents(agentsResponse.items || []);
      setLoadSummary(summaryResponse);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
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

  const getLoadColor = (percentage: number) => {
    if (percentage < 60) return '#52c41a';
    if (percentage < 80) return '#faad14';
    return '#ff4d4f';
  };

  const getLoadStatus = (percentage: number) => {
    if (percentage < 60) return { text: '正常', color: 'success' };
    if (percentage < 80) return { text: '较高', color: 'warning' };
    return { text: '过载', color: 'error' };
  };

  const columns = [
    {
      title: 'Agent名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ExtendedAgent) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span 
            style={{ fontWeight: 500, cursor: 'pointer' }}
            onClick={() => navigate(`/agents/${record.id}`)}
          >
            {text}
          </span>
        </Space>
      ),
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
      title: '负载百分比',
      key: 'loadPercentage',
      sorter: (a: ExtendedAgent, b: ExtendedAgent) => 
        (a.loadPercentage || 0) - (b.loadPercentage || 0),
      render: (_: any, record: ExtendedAgent) => {
        const percentage = record.loadPercentage || 0;
        const { text, color } = getLoadStatus(percentage);
        return (
          <div>
            <Progress
              percent={percentage}
              size="small"
              strokeColor={getLoadColor(percentage)}
            />
            <Tag color={color} style={{ marginTop: 4 }}>{text}</Tag>
          </div>
        );
      },
    },
    {
      title: '任务数',
      key: 'taskCount',
      render: (_: any, record: ExtendedAgent) => {
        const current = record.currentTaskCount || record.currentTasks || 0;
        const max = record.maxConcurrentTasks || record.maxTasks || 5;
        return (
          <Space>
            <span>{current}</span>
            <span style={{ color: '#999' }}>/ {max}</span>
          </Space>
        );
      },
    },
    {
      title: '表现评分',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
      sorter: (a: ExtendedAgent, b: ExtendedAgent) => 
        (a.performanceScore || 0) - (b.performanceScore || 0),
      render: (score: number) => (
        <span style={{ fontWeight: 600, color: score >= 4.0 ? '#52c41a' : '#faad14' }}>
          {score.toFixed(1)}
        </span>
      ),
    },
    {
      title: '能力数',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities: string[]) => (
        <span>{capabilities?.length || 0}</span>
      ),
    },
  ];

  // 使用loadSummary数据或计算本地统计
  const totalAgents = loadSummary?.totalAgents || agents.length;
  const onlineCount = loadSummary?.online || agents.filter((a) => a.status === 'online').length;
  const offlineCount = loadSummary?.offline || agents.filter((a) => a.status === 'offline').length;
  const busyCount = loadSummary?.busy || agents.filter((a) => a.status === 'busy').length;
  const avgLoadPercentage = loadSummary?.avgLoadPercentage || 
    (agents.length > 0 
      ? agents.reduce((sum, a) => sum + (a.loadPercentage || 0), 0) / agents.length 
      : 0);
  const totalLoad = loadSummary?.totalLoad || 
    agents.reduce((sum, a) => sum + (a.currentTaskCount || a.currentTasks || 0), 0);

  const overloadedAgents = agents.filter(a => (a.loadPercentage || 0) >= 80);
  const highLoadAgents = agents.filter(a => {
    const p = a.loadPercentage || 0;
    return p >= 60 && p < 80;
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
            onClick={() => navigate('/agents')}
          >
            返回
          </Button>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Agent负载监控</h1>
        </Space>
        <Space>
          <Switch
            checked={autoRefresh}
            onChange={setAutoRefresh}
            checkedChildren="自动刷新"
            unCheckedChildren="手动刷新"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      </div>

      {/* 负载预警 */}
      {overloadedAgents.length > 0 && (
        <Alert
          message="负载预警"
          description={`${overloadedAgents.length} 个Agent负载过高（>=80%），请及时调整任务分配`}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={() => navigate('/agents')}>
              查看详情
            </Button>
          }
        />
      )}

      {highLoadAgents.length > 0 && overloadedAgents.length === 0 && (
        <Alert
          message="负载提醒"
          description={`${highLoadAgents.length} 个Agent负载较高（60-80%），建议关注`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="总Agent数"
              value={totalAgents}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="在线"
              value={onlineCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="忙碌"
              value={busyCount}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="离线"
              value={offlineCount}
              prefix={<CloseOutlined />}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="总任务数"
              value={totalLoad}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="平均负载"
              value={avgLoadPercentage}
              suffix="%"
              precision={1}
              valueStyle={{ 
                color: avgLoadPercentage > 80 ? '#ff4d4f' : 
                        avgLoadPercentage > 60 ? '#faad14' : '#52c41a' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 负载分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="过载Agent (>=80%)"
              value={overloadedAgents.length}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={`/ ${totalAgents}`}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="高负载Agent (60-80%)"
              value={highLoadAgents.length}
              valueStyle={{ color: '#faad14' }}
              suffix={`/ ${totalAgents}`}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="正常Agent (<60%)"
              value={totalAgents - overloadedAgents.length - highLoadAgents.length}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${totalAgents}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Agent列表 */}
      <Card>
        <Table
          dataSource={agents}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个Agent`,
          }}
          rowClassName={(record) => {
            const percentage = record.loadPercentage || 0;
            if (percentage >= 80) return 'danger-row';
            if (percentage >= 60) return 'warning-row';
            return '';
          }}
        />
      </Card>

      <style>{`
        .danger-row {
          background-color: #fff2f0;
        }
        .warning-row {
          background-color: #fffbe6;
        }
      `}</style>
    </div>
  );
};

export default AgentLoadSummary;
