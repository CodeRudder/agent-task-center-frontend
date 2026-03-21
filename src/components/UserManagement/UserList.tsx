/**
 * 用户列表组件
 * 
 * 功能：
 * - 显示用户列表（表格形式）
 * - 支持分页、筛选、搜索
 * - 显示用户名、邮箱、角色、状态、创建时间、最后登录时间
 */
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Select,
  Tag,
  Avatar,
  Modal,
  message,
  Popconfirm,
  Dropdown,
  Menu,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ReloadOutlined,
  FilterOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StopOutlined,
  LockOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { User, UserRole, UserStatus, UserQueryParams, ROLES } from '@/types';
import { formatDate } from '@/utils/storage';
import RoleSelector, { getRoleColor, getRoleLabel } from './RoleSelector';

const { Search } = Input;
const { Option } = Select;

interface UserListProps {
  users?: User[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Partial<UserQueryParams>) => void;
  onRefresh?: () => void;
  onCreateUser?: () => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onBatchDelete?: (userIds: string[]) => void;
  onActivateUser?: (userId: string) => void;
  onDeactivateUser?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
  showStatistics?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// 获取状态标签
const getStatusTag = (status: UserStatus) => {
  const statusConfig: Record<UserStatus, { color: string; text: string }> = {
    [UserStatus.ACTIVE]: { color: 'success', text: '活跃' },
    [UserStatus.INACTIVE]: { color: 'default', text: '未激活' },
    [UserStatus.PENDING]: { color: 'processing', text: '待审核' },
    [UserStatus.SUSPENDED]: { color: 'error', text: '已停用' },
  };
  const config = statusConfig[status] || { color: 'default', text: status };
  return <Tag color={config.color}>{config.text}</Tag>;
};

/**
 * 用户列表组件
 */
const UserList: React.FC<UserListProps> = ({
  users = [],
  loading = false,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onSearch,
  onFilter,
  onRefresh,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onBatchDelete,
  onActivateUser,
  onDeactivateUser,
  onResetPassword,
  showStatistics = true,
  className,
  style,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>();

  // 处理表格分页变化
  const handleTableChange = (pagination: TablePaginationConfig) => {
    onPageChange?.(pagination.current || 1, pagination.pageSize || 10);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  // 处理筛选
  const handleFilter = () => {
    onFilter?.({
      role: roleFilter,
      status: statusFilter,
    });
  };

  // 清除筛选
  const handleClearFilters = () => {
    setRoleFilter(undefined);
    setStatusFilter(undefined);
    onFilter?.({});
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个用户吗？此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        onBatchDelete?.(selectedRowKeys as string[]);
        setSelectedRowKeys([]);
      },
    });
  };

  // 操作菜单
  const getActionMenu = (user: User) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEditUser?.(user)}>
        编辑
      </Menu.Item>
      {user.status === UserStatus.ACTIVE ? (
        <Menu.Item
          key="deactivate"
          icon={<StopOutlined />}
          onClick={() => onDeactivateUser?.(user.id)}
        >
          停用
        </Menu.Item>
      ) : (
        <Menu.Item
          key="activate"
          icon={<CheckCircleOutlined />}
          onClick={() => onActivateUser?.(user.id)}
        >
          激活
        </Menu.Item>
      )}
      <Menu.Item
        key="reset-password"
        icon={<LockOutlined />}
        onClick={() => {
          Modal.confirm({
            title: '确认重置密码',
            content: `确定要重置用户 "${user.name}" 的密码吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => onResetPassword?.(user.id),
          });
        }}
      >
        重置密码
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        danger
        onClick={() => {
          Modal.confirm({
            title: '确认删除',
            content: `确定要删除用户 "${user.name}" 吗？`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => onDeleteUser?.(user.id),
          });
        }}
      >
        删除
      </Menu.Item>
    </Menu>
  );

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 280,
      render: (_, user) => (
        <div className="flex items-center">
          <Avatar size={40} src={user.avatar} icon={<UserOutlined />} className="mr-3" />
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>{getRoleLabel(role)}</Tag>
      ),
      filters: ROLES.map((role) => ({ text: role.label, value: role.value })),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: UserStatus) => getStatusTag(status),
      filters: [
        { text: '活跃', value: UserStatus.ACTIVE },
        { text: '未激活', value: UserStatus.INACTIVE },
        { text: '待审核', value: UserStatus.PENDING },
        { text: '已停用', value: UserStatus.SUSPENDED },
      ],
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => formatDate(date),
      sorter: true,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      render: (date: string) => (date ? formatDate(date) : '-'),
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, user) => (
        <Dropdown menu={{ items: [] }} dropdownRender={() => getActionMenu(user)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  // 统计数据
  const statistics = {
    total: users.length,
    activeCount: users.filter((u) => u.status === UserStatus.ACTIVE).length,
    inactiveCount: users.filter((u) => u.status === UserStatus.INACTIVE).length,
    pendingCount: users.filter((u) => u.status === UserStatus.PENDING).length,
  };

  return (
    <div className={className} style={style}>
      {/* 统计卡片 */}
      {showStatistics && (
        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Card>
              <Statistic
                title="总用户数"
                value={total}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃用户"
                value={statistics.activeCount}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="未激活用户"
                value={statistics.inactiveCount}
                valueStyle={{ color: '#cf1322' }}
                prefix={<StopOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待审核"
                value={statistics.pendingCount}
                valueStyle={{ color: '#faad14' }}
                prefix={<FilterOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 主卡片 */}
      <Card>
        {/* 工具栏 */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <Space wrap>
            <Search
              placeholder="搜索用户名或邮箱"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="角色筛选"
              allowClear
              style={{ width: 150 }}
              value={roleFilter}
              onChange={setRoleFilter}
            >
              {ROLES.map((role) => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value={UserStatus.ACTIVE}>活跃</Option>
              <Option value={UserStatus.INACTIVE}>未激活</Option>
              <Option value={UserStatus.PENDING}>待审核</Option>
              <Option value={UserStatus.SUSPENDED}>已停用</Option>
            </Select>
            <Button icon={<FilterOutlined />} onClick={handleFilter}>
              应用筛选
            </Button>
            <Button onClick={handleClearFilters}>清除筛选</Button>
          </Space>

          <Space>
            {selectedRowKeys.length > 0 && (
              <Button danger onClick={handleBatchDelete}>
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateUser}>
              新建用户
            </Button>
          </Space>
        </div>

        {/* 用户表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个用户`,
          }}
          rowSelection={rowSelection}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default UserList;
