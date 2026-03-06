/**
 * 登录错误提示组件
 */
import React from 'react';
import { AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { LoginAttempt } from '@/types';
import Button from './Button';

export interface LoginErrorProps {
  type: 'invalid_credentials' | 'account_locked' | 'unknown';
  loginAttempt?: LoginAttempt;
  onRetry?: () => void;
  onForgotPassword?: () => void;
}

export const LoginError: React.FC<LoginErrorProps> = ({
  type,
  loginAttempt,
  onRetry,
  onForgotPassword,
}) => {
  if (type === 'invalid_credentials' && loginAttempt) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900">
              ❌ 用户名或密码错误
            </h3>
            <p className="text-sm text-red-700 mt-1">
              您还有 {loginAttempt.remainingAttempts} 次尝试机会
            </p>
            <p className="text-sm text-red-600 mt-1">
              超过5次失败将锁定账户15分钟
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            重试
          </Button>
          <Button variant="ghost" size="sm" onClick={onForgotPassword}>
            忘记密码？
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'account_locked' && loginAttempt) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900">
              🔒 账户已暂时锁定
            </h3>
            <p className="text-sm text-red-700 mt-1">
              由于多次登录失败，您的账户已被锁定。
            </p>
            {loginAttempt.lockRemainingTime !== undefined && (
              <p className="text-sm text-red-700 mt-1">
                锁定时间：剩余{' '}
                {Math.floor(loginAttempt.lockRemainingTime / 60)} 分{' '}
                {loginAttempt.lockRemainingTime % 60} 秒
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2 mt-3">
          <p className="text-sm text-red-700">
            您可以：
          </p>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            <li>等待锁定时间结束后重试</li>
            <li>通过邮箱验证找回账户</li>
          </ul>
        </div>
        <Button variant="danger" size="sm" onClick={onForgotPassword}>
          通过邮箱解锁
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-red-900">
            ❌ 登录失败
          </h3>
          <p className="text-sm text-red-700 mt-1">
            发生未知错误，请稍后重试
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginError;
