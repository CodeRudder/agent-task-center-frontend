import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  TagsOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>仪表盘</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={15}
              prefix={<TagsOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="进行中"
              value={5}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={8}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="在线Agent"
              value={6}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <h3>欢迎使用Agent任务管理系统</h3>
        <p>这是一个基于AI Agent的任务管理系统，用于协调多个AI Agent协作完成任务。</p>
      </Card>
    </div>
  );
};

export default Dashboard;
