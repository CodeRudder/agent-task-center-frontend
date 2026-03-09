import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Checkbox } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { authService, LoginDTO } from '../../services/auth.service';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form] = Form.useForm();

  // 从本地存储恢复邮箱
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      form.setFieldsValue({ email: savedEmail });
      setRememberMe(true);
    }
  }, [form]);

  const onFinish = async (values: LoginDTO) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      const { accessToken, user } = response;
      
      // 保存Token
      login(user, accessToken);
      
      // 记住邮箱
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', values.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      message.success('登录成功！');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '登录失败，请重试';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 450,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8, color: '#667eea' }}>
            Agent任务管理系统
          </h1>
          <p style={{ color: '#999', fontSize: 14 }}>登录您的账户</p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="example@email.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              >
                记住邮箱
              </Checkbox>
              <Link to="/forgot-password" style={{ fontSize: 14 }}>
                忘记密码？
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 48, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ color: '#999' }}>还没有账户？</span>
            <Link to="/register" style={{ marginLeft: 8 }}>
              立即注册
            </Link>
          </div>
        </Form>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
            测试账户：admin@example.com / 123456
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
