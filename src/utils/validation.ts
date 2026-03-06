/**
 * 验证工具函数
 */
import { PasswordStrength, PasswordValidation } from '@/types';

/**
 * 验证密码强度
 */
export function validatePassword(password: string): PasswordValidation {
  const requirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;

  let strength: PasswordStrength;
  if (metCount <= 2) {
    strength = PasswordStrength.WEAK;
  } else if (metCount <= 4) {
    strength = PasswordStrength.MEDIUM;
  } else {
    strength = PasswordStrength.STRONG;
  }

  return {
    isValid: metCount === 5,
    strength,
    requirements,
  };
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * 验证用户名格式
 */
export function validateUsername(username: string): boolean {
  // 用户名可以是邮箱或其他格式
  return username.length > 0 && username.length <= 100;
}

/**
 * 验证Agent名称
 */
export function validateAgentName(name: string): boolean {
  return name.length >= 2 && name.length <= 50;
}

/**
 * 验证Agent描述
 */
export function validateAgentDescription(description: string): boolean {
  return description.length <= 200;
}

/**
 * 验证两密码是否匹配
 */
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}
