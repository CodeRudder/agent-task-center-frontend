/**
 * 认证相关类型定义
 */

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  PROJECT_MANAGER = 'project_manager',
  USER = 'user',
}

// 用户状态
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status?: UserStatus; // 用户状态
  avatar?: string; // 用户头像
  department?: string; // 部门
  phone?: string; // 电话
  createdAt: string;
  updatedAt?: string; // 更新时间
  lastLoginAt?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Session {
  id: string;
  userId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName: string;
  browser: string;
  ip: string;
  loginTime: string;
  lastActiveTime: string;
  isCurrent: boolean;
}

export interface PasswordValidation {
  isValid: boolean;
  strength: PasswordStrength;
  requirements: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

export interface LoginAttempt {
  failedAttempts: number;
  remainingAttempts: number;
  isLocked: boolean;
  lockExpiresAt?: string;
  lockRemainingTime?: number;
}
