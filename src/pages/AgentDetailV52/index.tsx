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
  Tabs,
  List,
  Rate,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Input,
  Select,
  Form,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import AgentService from '@/services/agentService';
import {
  ExtendedAgent,
  AgentCapability,
  AgentLoad,
  AgentPerformance,
} from '@/types';

const { Text, Paragraph, Title } = Typography;
const { TabPane } = Tabs;

const AgentDetailV52: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<ExtendedAgent | null>(null);
  const [agentLoad, setAgentLoad] = useState<AgentLoad | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance | null>(null);
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 能力标签管理状态
  const [addCapabilityModalVisible, setAddCapabilityModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [addingCapability, setAddingCapability] = useState(false);

  useEffect(() => {
    if (id) {
      loadAgentData(id);
    }
  }, [id]);

  const loadAgentData = async (agentId: string) => {
    try {
      setLoading(true);
      
      // 并行加载数据
      const [agentData, loadData, performanceData, capabilitiesData] = await Promise.all([
        AgentService.getAgentDetails(agentId).catch(() => null),
        AgentService.getAgentLoad(agentId).catch(() => null),
        AgentService.getAgentPerformance(agentId, 'last_30_days').catch(() => null),
        AgentService.getCapabilities(agentId).catch(() => []),
      ]);

      if (agentData) {
        setAgent(agentData);
      } else {
        // 如果新API不可用，尝试旧API
        message.warning('V5.2 API暂不可用，部分功能可能受限');
      }
      
      setAgentLoad(loadData);
      setAgentPerformance(performanceData);
      setCapabilities(capabilitiesData);
    } catch (error) {
      console.error('加载Agent数据失败:', error);
      message.error('加载Agent数据失败');
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
      development: '开发',
      testing: '测试',
      design: '设计',
      operations: '运维',
    };
    return typeMap[type] || type;
  };

  const getLoadColor = (percentage: number) => {
    if (percentage < 60) return '#52c41a';
    if (percentage < 80) return '#faad14';
    return '#ff4d4f';
  };

  const handleAddCapability = async () => {
    try {
      const values = await form.validateFields();
      if (!id) return;

      setAddingCapability(true);
      await AgentService.addCapability(id, values.capability, values.proficiency);
      
      message.success('能力标签添加成功');
      setAddCapabilityModalVisible(false);
      form.resetFields();
      
      // 重新加载数据
      await loadAgentData(id);
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误，不显示message
        return;
      }
      console.error('添加能力标签失败:', error);
      message.error('添加能力标签失败');
    } finally {
      setAddingCapability(false);
    }
  };

  const handleRemoveCapability = async (capId: string) => {
    if (!id) return;

    try {
      await AgentService.removeCapability(id, capId);
      message.success('能力标签删除成功');
      
      // 重新加载数据
      await loadAgentData(id);
    } catch (error) {
      console.error('删除能力标签失败:', error);
      message.error('删除能力标签失败');
    }
  };

  const getProficiencyStars = (proficiency: number) => {
    return <Rate disabled defaultValue={proficiency} count={5} />;
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await AgentService.deleteAgent(id);
      message.success('Agent删除成功');
      navigate('/agents');
    } catch (error) {
      message.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Agent不存在" type="error" />
      </div>
    );
  }

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
          <Title level={2} style={{ margin: 0 }}>{agent.name}</Title>
        </Space>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/agents/${id}/edit`)}
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

      <Tabs defaultActiveKey="basic">
        {/* 基本信息 */}
        <TabPane tab="基本信息" key="basic">
          <Card>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="类型">
                <Tag color="blue">{getTypeLabel(agent.type)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(agent.status)}>
                  {agent.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前任务数">
                {agent.currentTaskCount || agent.currentTasks}
              </Descriptions.Item>
              <Descriptions.Item label="最大并发任务">
                {agent.maxConcurrentTasks || agent.maxTasks}
              </Descriptions.Item>
              <Descriptions.Item label="负载百分比" span={2}>
                <Progress
                  percent={agent.loadPercentage || 0}
                  strokeColor={getLoadColor(agent.loadPercentage || 0)}
                  format={(percent) => `${percent}%`}
                />
              </Descriptions.Item>
              <Descriptions.Item label="表现评分" span={2}>
                <Space size="large">
                  <Statistic
                    value={agent.performanceScore}
                    precision={1}
                    suffix="/ 5.0"
                    prefix={<TrophyOutlined style={{ color: '#ffd700' }} />}
                    valueStyle={{ 
                      color: agent.performanceScore >= 4.5 ? '#52c41a' : 
                              agent.performanceScore >= 4.0 ? '#faad14' : '#ff4d4f' 
                    }}
                  />
                  <Text type="secondary">
                    {agent.performanceScore >= 4.5 ? '表现优秀' :
                     agent.performanceScore >= 4.0 ? '表现良好' : '待提升'}
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(agent.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="最后活跃">
                {agent.lastActiveAt ? new Date(agent.lastActiveAt).toLocaleString('zh-CN') : '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                <Paragraph>{agent.description || '暂无描述'}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        {/* 能力标签 */}
        <TabPane tab="能力标签" key="capabilities">
          <Card
            title="能力标签管理"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddCapabilityModalVisible(true)}
              >
                添加能力
              </Button>
            }
          >
            {capabilities.length > 0 ? (
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={capabilities}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      size="small"
                      hoverable
                      actions={[
                        <Popconfirm
                          key="delete"
                          title="确定删除这个能力标签吗？"
                          onConfirm={() => handleRemoveCapability(item.id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
                        </Popconfirm>,
                      ]}
                    >
                      <Card.Meta
                        title={item.capability}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">熟练度</Text>
                            {getProficiencyStars(item.proficiency)}
                          </Space>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Alert
                message="暂无能力标签"
                description="点击右上角按钮添加能力标签"
                type="info"
                showIcon
              />
            )}
          </Card>
        </TabPane>

        {/* 负载详情 */}
        <TabPane tab="负载详情" key="load">
          <Card>
            {agentLoad ? (
              <div>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Statistic
                      title="总任务数"
                      value={agentLoad.total}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="负载百分比"
                      value={agentLoad.loadPercentage}
                      suffix="%"
                      prefix={<ThunderboltOutlined />}
                      valueStyle={{ color: getLoadColor(agentLoad.loadPercentage) }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="预警状态"
                      value={agentLoad.loadWarning ? '是' : '否'}
                      prefix={agentLoad.loadWarning ? <CloseOutlined /> : <CheckCircleOutlined />}
                      valueStyle={{ 
                        color: agentLoad.loadWarning ? '#ff4d4f' : '#52c41a' 
                      }}
                    />
                  </Col>
                </Row>

                <Title level={4}>按优先级分布</Title>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="紧急"
                        value={agentLoad.byPriority.urgent}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="高"
                        value={agentLoad.byPriority.high}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="中"
                        value={agentLoad.byPriority.medium}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="低"
                        value={agentLoad.byPriority.low}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Title level={4}>按状态分布</Title>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="待办"
                        value={agentLoad.byStatus.todo}
                        valueStyle={{ color: '#d9d9d9' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="进行中"
                        value={agentLoad.byStatus.in_progress}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="审核中"
                        value={agentLoad.byStatus.review}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {agentLoad.loadWarning && (
                  <Alert
                    message="负载预警"
                    description="当前负载较高，建议适当调整任务分配"
                    type="warning"
                    showIcon
                    style={{ marginTop: 24 }}
                  />
                )}
              </div>
            ) : (
              <Alert
                message="暂无负载数据"
                description="Agent暂无正在进行的任务"
                type="info"
                showIcon
              />
            )}
          </Card>
        </TabPane>

        {/* 表现统计 */}
        <TabPane tab="表现统计" key="performance">
          <Card>
            {agentPerformance ? (
              <div>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="总任务数"
                        value={agentPerformance.stats.totalTasksAssigned}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="已完成"
                        value={agentPerformance.stats.completedTasks}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="完成率"
                        value={agentPerformance.stats.completionRate * 100}
                        suffix="%"
                        precision={1}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="按时完成率"
                        value={agentPerformance.stats.onTimeRate * 100}
                        suffix="%"
                        precision={1}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="平均完成时长"
                        value={agentPerformance.stats.avgCompletionTimeHours}
                        suffix="小时"
                        precision={1}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="拒绝任务数"
                        value={agentPerformance.stats.rejectedTasks}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={4}>表现趋势</Title>
                    <Space>
                      <Text>当前状态：</Text>
                      <Tag color={agentPerformance.trend === 'improving' ? 'success' : 
                                   agentPerformance.trend === 'stable' ? 'default' : 'error'}>
                        {agentPerformance.trend === 'improving' ? '持续提升' :
                         agentPerformance.trend === 'stable' ? '保持稳定' : '有所下降'}
                      </Tag>
                    </Space>
                    <Paragraph type="secondary">
                      {agentPerformance.trend === 'improving' && 
                       'Agent表现呈现上升趋势，继续保持！'}
                      {agentPerformance.trend === 'stable' && 
                       'Agent表现稳定，可以考虑提升挑战难度。'}
                      {agentPerformance.trend === 'declining' && 
                       'Agent表现有所下降，建议关注任务分配和质量。'}
                    </Paragraph>
                  </Space>
                </Card>
              </div>
            ) : (
              <Alert
                message="暂无表现数据"
                description="Agent暂无足够的表现统计数据"
                type="info"
                showIcon
              />
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* 添加能力标签模态框 */}
      <Modal
        title="添加能力标签"
        open={addCapabilityModalVisible}
        onOk={handleAddCapability}
        onCancel={() => {
          setAddCapabilityModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={addingCapability}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="capability"
            label="能力名称"
            rules={[{ required: true, message: '请输入能力名称' }]}
          >
            <Input placeholder="例如：React、Node.js、Python" />
          </Form.Item>
          <Form.Item
            name="proficiency"
            label="熟练度"
            rules={[{ required: true, message: '请选择熟练度' }]}
            initialValue={3}
          >
            <Select>
              <Select.Option value={1}>1 - 入门</Select.Option>
              <Select.Option value={2}>2 - 基础</Select.Option>
              <Select.Option value={3}>3 - 熟练</Select.Option>
              <Select.Option value={4}>4 - 精通</Select.Option>
              <Select.Option value={5}>5 - 专家</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentDetailV52;
