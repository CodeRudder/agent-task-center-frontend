/**
 * 用户个人信息页面
 * 
 * 功能：
 * - 显示当前登录用户的基本信息
 * - 支持编辑个人信息
 * - 修改密码
 * - 路由：/user/profile
 */
import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Spin,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  LockOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { UserService } from '@/services/userService';

const { Item: FormItem } = Form;
const { Password } = Input;

interface UserProfilePageProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 用户个人信息页面
 */
const UserProfilePage: React.FC<UserProfilePageProps> = ({
  className,
  style,
}) => {
  const { user, getCurrentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 加载用户信息
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      await getCurrentUser();
    } catch (error: any) {
      message.error('加载用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 编辑个人信息
  const handleEditProfile = () => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        phone: user.phone,
        department: user.department,
      });
      setEditModalVisible(true);
    }
  };

  // 提交编辑
  const handleSubmitEdit = async () => {
    try {
      const values = await form.validateFields();
      if (user?.id) {
        await UserService.updateUser(user.id, values);
        message.success('个人信息更新成功');
        setEditModalVisible(false);
        await loadUserProfile();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || '更新个人信息失败';
      message.error(errorMessage);
    }
  };

  // 修改密码
  const handleChangePassword = () => {
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  // 提交密码修改
  const handleSubmitPassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (user?.id) {
        await UserService.changePassword(user.id, {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        });
        message.success('密码修改成功');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || '修改密码失败';
      message.error(errorMessage);
    }
  };

  // 获取角色显示名称
  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: '管理员',
      manager: '经理',
      user: '普通用户',
      guest: '访客',
    };
    return roleMap[role] || role;
  };

  // 获取角色标签颜色
  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      admin: 'red',
      manager: 'orange',
      user: 'blue',
      guest: 'default',
    };
    return colorMap[role] || 'default';
  };

  // 获取状态显示名称
  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      active: '活跃',
      inactive: '未激活',
      disabled: '已禁用',
    };
    return statusMap[status] || status;
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Card>
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <UserOutlined className="mr-2" />
            个人信息
          </h1>
          <p className="text-gray-500 mt-2">
            查看和管理您的个人信息
          </p>
        </div>

        {/* 用户头像和基本信息 */}
        <div className="flex items-center mb-8">
          <Avatar size={80} icon={<UserOutlined />} className="mr-6" />
          <div>
            <h2 className="text-xl font-semibold">{user?.name || '未知用户'}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <Space className="mt-2">
              <Tag color={getRoleColor(user?.role || '')}>
                {getRoleName(user?.role || '')}
              </Tag>
              <Tag color={user?.status === 'active' ? 'success' : 'default'}>
                {getStatusName(user?.status || '')}
              </Tag>
            </Space>
          </div>
        </div>

        {/* 详细信息 */}
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2, lg: 2 }}>
          <Descriptions.Item 
            label={
              <span>
                <UserOutlined className="mr-1" />
                姓名
              </span>
            }
          >
            {user?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <span>
                <MailOutlined className="mr-1" />
                邮箱
              </span>
            }
          >
            {user?.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <span>
                <PhoneOutlined className="mr-1" />
                电话
              </span>
            }
          >
            {user?.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <span>
                <TeamOutlined className="mr-1" />
                部门
              </span>
            }
          >
            {user?.department || '-'}
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <span>
                <CalendarOutlined className="mr-1" />
                创建时间
              </span>
            }
          >
            {formatDate(user?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item 
            label={
              <span>
                <CalendarOutlined className="mr-1" />
                更新时间
              </span>
            }
          >
            {formatDate(user?.updatedAt)}
          </Descriptions.Item>
        </Descriptions>

        {/* 操作按钮 */}
        <div className="mt-6">
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditProfile}
            >
              编辑信息
            </Button>
            <Button
              icon={<LockOutlined />}
              onClick={handleChangePassword}
            >
              修改密码
            </Button>
          </Space>
        </div>
      </Card>

      {/* 编辑个人信息弹窗 */}
      <Modal
        title="编辑个人信息"
        open={editModalVisible}
        onOk={handleSubmitEdit}
        onCancel={() => setEditModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <FormItem
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入姓名"
            />
          </FormItem>
          <FormItem label="电话" name="phone">
            <Input
              prefix={<PhoneOutlined />}
              placeholder="请输入电话"
            />
          </FormItem>
          <FormItem label="部门" name="department">
            <Input placeholder="请输入部门" />
          </FormItem>
        </Form>
      </Modal>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onOk={handleSubmitPassword}
        onCancel={() => setPasswordModalVisible(false)}
        width={400}
      >
        <Form form={passwordForm} layout="vertical">
          <FormItem
            label="原密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Password
              prefix={<LockOutlined />}
              placeholder="请输入原密码"
            />
          </FormItem>
          <FormItem
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
            />
          </FormItem>
          <FormItem
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Password
              prefix={<LockOutlined />}
              placeholder="请确认新密码"
            />
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfilePage;
