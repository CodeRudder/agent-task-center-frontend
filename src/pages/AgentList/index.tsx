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
  message,
  Input,
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import AgentService from '@/services/agentService';
import { ExtendedAgent, AgentLoadSummary, Agent } from '@/types';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Search } = Input;

const AgentList: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<ExtendedAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [loadSummary, setLoadSummary] = useState<AgentLoadSummary | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadAgents();
    loadLoadSummary();
  }, [statusFilter, typeFilter, searchText]);

  const loadAgents = async () => {
    setLoading(true);
    try {
      // 尝试使用新的API（V5.2 P0），如果失败则回退到旧API
      try {
        const params: any = {
          page: 1,
          pageSize: 100, // 简化处理，一次性加载所有
        };
        if (statusFilter) params.status = statusFilter;
        if (typeFilter) params.type = typeFilter;
        if (searchText) params.search = searchText;

        const response = await AgentService.getAgentsWithLoad(params);
        setAgents(response.items || []);
      } catch (error) {
        // 回退到旧API
        console.log('V5.2 API不可用，使用旧API');
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        if (typeFilter) params.type = typeFilter;
        
        const response = await AgentService.getAgents(params);
        // 将旧API返回的Agent类型转换为ExtendedAgent类型
        const extendedAgents: ExtendedAgent[] = (response.items || []).map((agent: Agent) => ({
          ...agent,
          currentTaskCount: agent.currentTasks || 0,
          maxConcurrentTasks: agent.maxTasks || 5,
          loadPercentage: 0,
          capabilities: agent.tags || [],
          performanceScore: 4.0,
        }));
        setAgents(extendedAgents);
      }
    } catch (error) {
      console.error('加载Agent列表失败:', error);
      message.error('加载Agent列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadLoadSummary = async () => {
    try {
      const summary = await AgentService.getLoadSummary();
      setLoadSummary(summary);
    } catch (error) {
      console.log('负载汇总API不可用:', error);
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
      development: '开发',
      testing: '测试',
      design: '设计',
      operations: '运维',
    };
    return typeMap[type] || type;
  };

  const getLoadColor = (percentage: number) => {
    if (percentage < 60) return '#52c41a'; // 绿色
    if (percentage < 80) return '#faad14'; // 黄色
    return '#ff4d4f'; // 红色
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{getTypeLabel(type)}</Tag>,
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
      width: 200,
      render: (_: any, agent: ExtendedAgent) => {
        const percentage = agent.loadPercentage || 0;
        const current = agent.currentTaskCount || agent.currentTasks || 0;
        const max = agent.maxConcurrentTasks || agent.maxTasks || 5;
        
        return (
          <div>
            <Progress
              percent={percentage}
              size="small"
              strokeColor={getLoadColor(percentage)}
              format={() => `${current}/${max}`}
            />
          </div>
        );
      },
    },
    {
      title: '能力标签',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities: string[]) => (
        <Space size={[0, 8]} wrap>
          {capabilities && capabilities.length > 0 ? (
            capabilities.slice(0, 3).map((cap) => (
              <Tag key={cap} color="purple">
                {cap}
              </Tag>
            ))
          ) : (
            <span style={{ color: '#999' }}>-</span>
          )}
          {capabilities && capabilities.length > 3 && (
            <Tag>+{capabilities.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '表现评分',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
      render: (score: number) => (
        <Space>
          <TrophyOutlined style={{ color: score >= 4.5 ? '#ffd700' : score >= 4.0 ? '#c0c0c0' : '#cd7f32' }} />
          <span style={{ fontWeight: 500 }}>{score.toFixed(1)}</span>
        </Space>
      ),
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined />
          <span>{date ? new Date(date).toLocaleString('zh-CN') : '未知'}</span>
        </Space>
      ),
    },
  ];

  // 使用loadSummary数据或计算本地统计
  const totalAgents = loadSummary?.totalAgents || agents.length;
  const onlineCount = loadSummary?.online || agents.filter((a) => a.status === 'online').length;
  const busyCount = loadSummary?.busy || agents.filter((a) => a.status === 'busy').length;
  const offlineCount = loadSummary?.offline || agents.filter((a) => a.status === 'offline').length;
  const avgLoadPercentage = loadSummary?.avgLoadPercentage || 
    (agents.length > 0 
      ? agents.reduce((sum, a) => sum + (a.loadPercentage || 0), 0) / agents.length 
      : 0);

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Agent档案管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/agents/create')}
        >
          创建Agent
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总Agent数"
              value={totalAgents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
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
              title="平均负载"
              value={avgLoadPercentage}
              suffix="%"
              precision={1}
              valueStyle={{ color: avgLoadPercentage > 80 ? '#ff4d4f' : '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选器和搜索 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
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
              <Option value="development">开发</Option>
              <Option value="testing">测试</Option>
              <Option value="design">设计</Option>
              <Option value="operations">运维</Option>
            </Select>
          </div>

          <div>
            <Search
              placeholder="搜索Agent名称"
              allowClear
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
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
          onRow={(record) => ({
            onClick: () => navigate(`/agents/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
};

export default AgentList;
