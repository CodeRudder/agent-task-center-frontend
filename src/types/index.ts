/**
 * 统一导出所有类型定义
 */

export * from './agent';
// export * from './auth'; // 避免User和UserRole冲突，使用user.ts的定义
export * from './api';
export * from './task';
export * from './comment';
export * from './dashboard';
export * from './template';
export * from './user';

// 明确导出auth.ts中不冲突的类型
// PasswordStrength是枚举，需要作为值使用，不能使用export type
export { 
  PasswordStrength,
} from './auth';

export type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  Session,
  PasswordValidation,
} from './auth';
