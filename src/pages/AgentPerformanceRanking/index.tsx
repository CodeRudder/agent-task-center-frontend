import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Select,
  Space,
  message,
  Button,
  Tag,
  Progress,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  TrophyOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import AgentService from '@/services/agentService';
import { ExtendedAgent, AgentPerformance } from '@/types';

const { Option } = Select;

interface RankingItem {
  agent: ExtendedAgent;
  performance: AgentPerformance;
  rank: number;
}

const AgentPerformanceRanking: React.FC = () => {
  const navigate = useNavigate();
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('last_30_days');
  const [sortBy, setSortBy] = useState<'completionRate' | 'onTimeRate' | 'avgCompletionTimeHours'>('completionRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadRankingData();
  }, [period, sortBy, sortOrder]);

  const loadRankingData = async () => {
    setLoading(true);
    try {
      const response = await AgentService.getPerformanceRanking({
        period,
        sortBy,
        sortOrder,
      });

      const dataWithRank = response.agents.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      setRankingData(dataWithRank);
    } catch (error) {
      console.error('加载排行榜数据失败:', error);
      message.error('加载排行榜数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyOutlined style={{ color: '#ffd700', fontSize: 20 }} />;
    if (rank === 2) return <TrophyOutlined style={{ color: '#c0c0c0', fontSize: 18 }} />;
    if (rank === 3) return <TrophyOutlined style={{ color: '#cd7f32', fontSize: 16 }} />;
    return <span style={{ color: '#999', fontWeight: 600 }}>{rank}</span>;
  };

  const getRankTag = (rank: number) => {
    if (rank === 1) return <Tag color="gold">第1名</Tag>;
    if (rank === 2) return <Tag color="default">第2名</Tag>;
    if (rank === 3) return <Tag color="orange">第3名</Tag>;
    return <Tag color="blue">第{rank}名</Tag>;
  };

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 100,
      align: 'center' as const,
      render: (rank: number) => getRankIcon(rank),
    },
    {
      title: 'Agent',
      key: 'agent',
      render: (_: any, record: RankingItem) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.agent.name}</span>
          {getRankTag(record.rank)}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: ['agent', 'type'],
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          development: '开发',
          testing: '测试',
          design: '设计',
          operations: '运维',
        };
        return <Tag color="blue">{typeMap[type] || type}</Tag>;
      },
    },
    {
      title: '任务总数',
      dataIndex: ['performance', 'stats', 'totalTasksAssigned'],
      key: 'totalTasks',
      render: (value: number) => (
        <Statistic value={value} valueStyle={{ fontSize: 14 }} />
      ),
    },
    {
      title: '完成率',
      dataIndex: ['performance', 'stats', 'completionRate'],
      key: 'completionRate',
      sorter: true,
      render: (value: number) => (
        <Space>
          <Progress
            type="circle"
            percent={value * 100}
            width={50}
            format={() => `${(value * 100).toFixed(0)}%`}
            strokeColor={
              value >= 0.9 ? '#52c41a' :
              value >= 0.8 ? '#faad14' : '#ff4d4f'
            }
          />
        </Space>
      ),
    },
    {
      title: '按时完成率',
      dataIndex: ['performance', 'stats', 'onTimeRate'],
      key: 'onTimeRate',
      sorter: true,
      render: (value: number) => (
        <Progress
          percent={value * 100}
          size="small"
          format={(percent) => `${percent?.toFixed(0)}%`}
          strokeColor={
            value >= 0.9 ? '#52c41a' :
            value >= 0.8 ? '#faad14' : '#ff4d4f'
          }
        />
      ),
    },
    {
      title: '平均时长',
      dataIndex: ['performance', 'stats', 'avgCompletionTimeHours'],
      key: 'avgTime',
      sorter: true,
      render: (value: number) => (
        <Space>
          <ClockCircleOutlined />
          <span>{value.toFixed(1)}小时</span>
        </Space>
      ),
    },
    {
      title: '表现评分',
      dataIndex: ['agent', 'performanceScore'],
      key: 'score',
      sorter: true,
      render: (score: number) => (
        <Space>
          <TrophyOutlined style={{ color: score >= 4.5 ? '#ffd700' : score >= 4.0 ? '#c0c0c0' : '#cd7f32' }} />
          <span style={{ fontWeight: 600 }}>{score.toFixed(1)}</span>
        </Space>
      ),
    },
    {
      title: '趋势',
      dataIndex: ['performance', 'trend'],
      key: 'trend',
      render: (trend: string) => {
        const trendMap: Record<string, { color: string; text: string }> = {
          improving: { color: 'success', text: '上升' },
          stable: { color: 'default', text: '稳定' },
          declining: { color: 'error', text: '下降' },
        };
        const { color, text } = trendMap[trend] || { color: 'default', text: trend };
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  // 计算统计信息
  const totalAgents = rankingData.length;
  const avgCompletionRate = rankingData.length > 0
    ? rankingData.reduce((sum, item) => sum + item.performance.stats.completionRate, 0) / rankingData.length
    : 0;
  const avgOnTimeRate = rankingData.length > 0
    ? rankingData.reduce((sum, item) => sum + item.performance.stats.onTimeRate, 0) / rankingData.length
    : 0;

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
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Agent表现排行榜</h1>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="参与排名Agent数"
              value={totalAgents}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="平均完成率"
              value={avgCompletionRate * 100}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="平均按时完成率"
              value={avgOnTimeRate * 100}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选器 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <div>
            <label style={{ marginRight: 8 }}>统计周期：</label>
            <Select
              style={{ width: 150 }}
              value={period}
              onChange={setPeriod}
            >
              <Option value="last_7_days">最近7天</Option>
              <Option value="last_30_days">最近30天</Option>
              <Option value="last_90_days">最近90天</Option>
            </Select>
          </div>

          <div>
            <label style={{ marginRight: 8 }}>排序方式：</label>
            <Select
              style={{ width: 180 }}
              value={sortBy}
              onChange={setSortBy}
            >
              <Option value="completionRate">完成率</Option>
              <Option value="onTimeRate">按时完成率</Option>
              <Option value="avgCompletionTimeHours">平均完成时长</Option>
            </Select>
          </div>

          <div>
            <label style={{ marginRight: 8 }}>排序顺序：</label>
            <Select
              style={{ width: 120 }}
              value={sortOrder}
              onChange={setSortOrder}
            >
              <Option value="desc">降序</Option>
              <Option value="asc">升序</Option>
            </Select>
          </div>
        </Space>
      </Card>

      {/* 排行榜 */}
      <Card>
        <Table
          dataSource={rankingData}
          columns={columns}
          rowKey="agent.id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个Agent`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/agents/${record.agent.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
};

export default AgentPerformanceRanking;
