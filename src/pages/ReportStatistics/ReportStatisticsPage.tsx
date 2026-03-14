/**
 * V5.3 P2-5: Reports & Statistics 页面
 * 统计图表显示（任务统计、工作量统计、趋势分析）
 */
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
  Statistic,
  Table,
  Tabs,
  message,
  Spin,
} from 'antd';
import {
  DownloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { StatisticsService } from '@/services/statisticsService';
import {
  TaskStatistics,
  WorkloadStatistics,
  TrendStatistics,
  StatisticsFilters,
} from '@/types/statistics';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * 统计报表页面
 */
const ReportStatisticsPage: React.FC = () => {
  const [taskStats, setTaskStats] = useState<TaskStatistics | null>(null);
  const [workloadStats, setWorkloadStats] = useState<WorkloadStatistics[]>([]);
  const [trendStats, setTrendStats] = useState<TrendStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      const filters: StatisticsFilters = {
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
        userId: selectedUser,
      };

      // 并行加载所有统计数据
      const [taskData, workloadData, trendData] = await Promise.all([
        StatisticsService.getTaskStatistics(filters),
        StatisticsService.getWorkloadStatistics(filters),
        StatisticsService.getTrendStatistics(period, filters),
      ]);

      setTaskStats(taskData);
      setWorkloadStats(workloadData);
      setTrendStats(trendData);
    } catch (error) {
      message.error('加载统计数据失败');
      console.error('Load statistics failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [dateRange, selectedUser, period]);

  // 导出CSV
  const handleExportCSV = async (type: 'tasks' | 'workload' | 'trends') => {
    try {
      const filters: StatisticsFilters = {
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
        userId: selectedUser,
      };
      
      await StatisticsService.exportToCSV(type, filters);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('Export failed:', error);
    }
  };

  // 任务状态饼图数据
  const getTaskPieData = () => {
    if (!taskStats) return [];
    
    return [
      { name: '待办', value: taskStats.todo, color: '#1890ff' },
      { name: '进行中', value: taskStats.inProgress, color: '#52c41a' },
      { name: '审核中', value: taskStats.review, color: '#faad14' },
      { name: '已完成', value: taskStats.done, color: '#52c41a' },
      { name: '已阻塞', value: taskStats.blocked, color: '#ff4d4f' },
      { name: '已取消', value: taskStats.cancelled, color: '#d9d9d9' },
    ];
  };

  // 工作量统计表格列
  const workloadColumns = [
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      fixed: 'left' as const,
    },
    {
      title: '总任务数',
      dataIndex: 'totalTasks',
      key: 'totalTasks',
      sorter: (a: WorkloadStatistics, b: WorkloadStatistics) => a.totalTasks - b.totalTasks,
    },
    {
      title: '已完成',
      dataIndex: 'completedTasks',
      key: 'completedTasks',
      sorter: (a: WorkloadStatistics, b: WorkloadStatistics) => a.completedTasks - b.completedTasks,
    },
    {
      title: '进行中',
      dataIndex: 'inProgressTasks',
      key: 'inProgressTasks',
    },
    {
      title: '逾期任务',
      dataIndex: 'overdueTasks',
      key: 'overdueTasks',
      render: (count: number) => (
        <span style={{ color: count > 0 ? '#ff4d4f' : 'inherit' }}>
          {count}
        </span>
      ),
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => `${(rate * 100).toFixed(1)}%`,
      sorter: (a: WorkloadStatistics, b: WorkloadStatistics) => a.completionRate - b.completionRate,
    },
    {
      title: '平均完成时间(小时)',
      dataIndex: 'avgCompletionTime',
      key: 'avgCompletionTime',
      render: (time: number) => time.toFixed(1),
    },
    {
      title: '工作量评分',
      dataIndex: 'workloadScore',
      key: 'workloadScore',
      render: (score: number) => (
        <span style={{ color: score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f' }}>
          {score.toFixed(1)}
        </span>
      ),
      sorter: (a: WorkloadStatistics, b: WorkloadStatistics) => a.workloadScore - b.workloadScore,
    },
  ];

  return (
    <div className="p-6">
      {/* 过滤器栏 */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Space>
              <span>时间范围:</span>
              <RangePicker
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([
                      dates[0].format('YYYY-MM-DD'),
                      dates[1].format('YYYY-MM-DD'),
                    ]);
                  } else {
                    setDateRange(null);
                  }
                }}
              />
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <span>用户:</span>
              <Select
                placeholder="选择用户"
                style={{ width: 200 }}
                value={selectedUser}
                onChange={setSelectedUser}
                allowClear
              >
                {/* 这里应该从工作量统计中获取用户列表 */}
              </Select>
            </Space>
          </Col>
          <Col span={8}>
            <Space style={{ float: 'right' }}>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleExportCSV('tasks')}
              >
                导出任务统计
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleExportCSV('workload')}
              >
                导出工作量
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleExportCSV('trends')}
              >
                导出趋势
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {/* 任务统计概览 */}
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>任务统计概览</span>
            </Space>
          }
          className="mb-4"
        >
          <Row gutter={16}>
            <Col span={4}>
              <Statistic title="总任务数" value={taskStats?.total || 0} />
            </Col>
            <Col span={4}>
              <Statistic
                title="待办"
                value={taskStats?.todo || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="进行中"
                value={taskStats?.inProgress || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="已完成"
                value={taskStats?.done || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="逾期任务"
                value={taskStats?.overdue || 0}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="完成率"
                value={taskStats ? (taskStats.completionRate * 100).toFixed(1) : 0}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
        </Card>

        {/* 统计图表 */}
        <Tabs defaultActiveKey="tasks">
          {/* 任务统计图表 */}
          <TabPane
            tab={
              <Space>
                <PieChartOutlined />
                任务统计
              </Space>
            }
            key="tasks"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card title="任务状态分布">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={getTaskPieData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getTaskPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="任务统计柱状图">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={getTaskPieData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#1890ff">
                        {getTaskPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 工作量统计 */}
          <TabPane
            tab={
              <Space>
                <TeamOutlined />
                工作量统计
              </Space>
            }
            key="workload"
          >
            <Card>
              <Table
                columns={workloadColumns}
                dataSource={workloadStats}
                rowKey="userId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条`,
                }}
                scroll={{ x: 1200 }}
              />
            </Card>
          </TabPane>

          {/* 趋势分析 */}
          <TabPane
            tab={
              <Space>
                <LineChartOutlined />
                趋势分析
              </Space>
            }
            key="trends"
          >
            <Card>
              <Space className="mb-4">
                <span>统计周期:</span>
                <Select
                  value={period}
                  onChange={setPeriod}
                  style={{ width: 120 }}
                >
                  <Option value="day">按天</Option>
                  <Option value="week">按周</Option>
                  <Option value="month">按月</Option>
                </Select>
              </Space>

              {trendStats && (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendStats.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="created"
                        stroke="#1890ff"
                        name="创建任务"
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#52c41a"
                        name="完成任务"
                      />
                      <Line
                        type="monotone"
                        dataKey="overdue"
                        stroke="#ff4d4f"
                        name="逾期任务"
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <Row gutter={16} className="mt-4">
                    <Col span={8}>
                      <Statistic
                        title="平均完成率"
                        value={(trendStats.summary.avgCompletionRate * 100).toFixed(1)}
                        suffix="%"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="平均每日任务数"
                        value={trendStats.summary.avgTasksPerDay.toFixed(1)}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="趋势"
                        value={
                          trendStats.summary.trend === 'up'
                            ? '上升'
                            : trendStats.summary.trend === 'down'
                            ? '下降'
                            : '稳定'
                        }
                        valueStyle={{
                          color:
                            trendStats.summary.trend === 'up'
                              ? '#52c41a'
                              : trendStats.summary.trend === 'down'
                              ? '#ff4d4f'
                              : '#d9d9d9',
                        }}
                      />
                    </Col>
                  </Row>
                </>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default ReportStatisticsPage;
