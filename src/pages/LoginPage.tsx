/**
 * 登录页面
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import PasswordInput from '@/components/PasswordInput';
import Input from '@/components/Input';
import Button from '@/components/Button';
import LoginError from '@/components/LoginError';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAttempts, checkLoginAttempts, error, clearError } = useAuthStore();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<'invalid_credentials' | 'account_locked' | 'unknown'>('unknown');

  // 检查登录尝试次数
  useEffect(() => {
    if (email) {
      checkLoginAttempts(email);
    }
  }, [email, checkLoginAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('请输入用户名和密码', 'warning');
      return;
    }

    // 检查账户是否锁定
    if (loginAttempts?.isLocked) {
      setErrorType('account_locked');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await login(email, password, rememberMe);
      showToast('登录成功', 'success');
      navigate('/');
    } catch (error: any) {
      setErrorType('invalid_credentials');

      // 重新检查登录尝试次数
      await checkLoginAttempts(email);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-4xl">🤖</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Agent任务管理系统
            </h1>
            <p className="text-gray-500 mt-2">登录以管理您的Agent和任务</p>
          </div>

          {/* 错误提示 */}
          {error && errorType === 'invalid_credentials' && loginAttempts && !loginAttempts.isLocked && (
            <div className="mb-6">
              <LoginError
                type="invalid_credentials"
                loginAttempt={loginAttempts}
                onRetry={() => setErrorType('unknown')}
                onForgotPassword={handleForgotPassword}
              />
            </div>
          )}

          {loginAttempts?.isLocked && (
            <div className="mb-6">
              <LoginError
                type="account_locked"
                loginAttempt={loginAttempts}
                onForgotPassword={handleForgotPassword}
              />
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="用户名"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || loginAttempts?.isLocked}
              autoComplete="username"
              autoFocus
            />

            <PasswordInput
              label="密码"
              placeholder="输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || loginAttempts?.isLocked}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  disabled={isLoading || loginAttempts?.isLocked}
                />
                <span className="ml-2 text-sm text-gray-600">
                  记住我（7天内免登录）
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={isLoading}
              >
                忘记密码？
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={loginAttempts?.isLocked}
            >
              登录
            </Button>
          </form>

          {/* 安全提示 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              💡 安全提示
            </h4>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• 密码至少8位，包含大小写字母、数字和特殊字符</li>
              <li>• 不要使用与其他网站相同的密码</li>
              <li>• 定期更新密码以保护账户安全</li>
            </ul>
          </div>
        </div>

        {/* 页脚 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          © 2026 Agent任务管理系统. All rights reserved.
        </div>
      </div>
    </div>
  );
}
