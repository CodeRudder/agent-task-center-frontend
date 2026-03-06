/**
 * 认证 API 服务
 */
import apiClient from './api';
import {
  LoginCredentials,
  LoginResponse,
  User,
  Session,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  LoginAttempt,
} from '@/types';

export class AuthService {
  /**
   * 用户登录
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * 刷新Token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  /**
   * 检查登录尝试次数
   */
  static async checkLoginAttempts(username: string): Promise<LoginAttempt> {
    const response = await apiClient.get('/auth/login-attempts', { params: { username } });
    return response.data;
  }

  /**
   * 发送密码重置邮件
   */
  static async sendPasswordResetEmail(request: PasswordResetRequest): Promise<void> {
    await apiClient.post('/auth/password-reset/request', request);
  }

  /**
   * 确认密码重置
   */
  static async confirmPasswordReset(confirm: PasswordResetConfirm): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm', confirm);
  }

  /**
   * 修改密码
   */
  static async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password', request);
  }

  /**
   * 获取活跃会话列表
   */
  static async getSessions(): Promise<Session[]> {
    const response = await apiClient.get('/auth/sessions');
    return response.data;
  }

  /**
   * 登出指定会话
   */
  static async logoutSession(sessionId: string): Promise<void> {
    await apiClient.post(`/auth/sessions/${sessionId}/logout`);
  }

  /**
   * 登出所有其他会话
   */
  static async logoutOtherSessions(): Promise<void> {
    await apiClient.post('/auth/sessions/logout-others');
  }
}

export default AuthService;
