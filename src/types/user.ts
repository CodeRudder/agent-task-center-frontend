/**
 * 用户管理相关类型定义
 */

// 从 auth.ts 导入 UserRole, UserStatus 和 User 类型
import { UserRole, UserStatus, User } from './auth';
// 重新导出以供其他模块使用
// 注意: UserRole 和 UserStatus 是枚举值，User 是类型，需要分别导出
export { UserRole, UserStatus };
export type { User };

// 权限定义
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

// 角色权限关联
export interface RolePermission {
  roleId: UserRole;
  permissions: string[]; // Permission ID 数组
}

// 用户查询参数
export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 用户列表响应
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 创建用户请求
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  department?: string;
  phone?: string;
}

// 更新用户请求
export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  phone?: string;
  avatar?: string;
}

// 角色信息（用于显示）
export interface RoleInfo {
  value: UserRole;
  label: string;
  description: string;
  color: string;
}

// 角色列表（静态数据）
export const ROLES: RoleInfo[] = [
  {
    value: UserRole.ADMIN,
    label: '管理员',
    description: '拥有系统所有权限，可以管理用户和系统配置',
    color: 'red',
  },
  {
    value: UserRole.PROJECT_MANAGER,
    label: '项目经理',
    description: '可以管理项目和任务，分配任务给团队成员',
    color: 'blue',
  },
  {
    value: UserRole.USER,
    label: '普通用户',
    description: '可以查看和执行分配给自己的任务',
    color: 'green',
  },
];

// 用户统计
export interface UserStatistics {
  total: number;
  activeCount: number;
  inactiveCount: number;
  pendingCount: number;
  suspendedCount: number;
  byRole: Record<UserRole, number>;
  byDepartment: Record<string, number>;
}
