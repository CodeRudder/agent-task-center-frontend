/**
 * 用户管理 API 服务
 */
import apiClient from './api';
import {
  User,
  UserQueryParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserStatistics,
  Permission,
  RolePermission,
} from '@/types';

export class UserService {
  /**
   * 获取用户列表（支持分页和筛选）
   */
  static async getUsers(params?: UserQueryParams): Promise<UserListResponse> {
    const response = await apiClient.get('/users', { params });
    return response.data;
  }

  /**
   * 获取单个用户详情
   */
  static async getUser(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }

  /**
   * 创建新用户
   */
  static async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post('/users', data);
    return response.data;
  }

  /**
   * 更新用户信息
   */
  static async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  /**
   * 批量删除用户
   */
  static async batchDeleteUsers(ids: string[]): Promise<void> {
    await apiClient.post('/users/batch-delete', { ids });
  }

  /**
   * 激活用户
   */
  static async activateUser(id: string): Promise<User> {
    const response = await apiClient.put(`/users/${id}/activate`);
    return response.data;
  }

  /**
   * 停用用户
   */
  static async deactivateUser(id: string): Promise<User> {
    const response = await apiClient.put(`/users/${id}/deactivate`);
    return response.data;
  }

  /**
   * 重置用户密码
   */
  static async resetPassword(id: string): Promise<void> {
    await apiClient.post(`/users/${id}/reset-password`);
  }

  /**
   * 修改密码
   */
  static async changePassword(
    id: string,
    data: { oldPassword: string; newPassword: string }
  ): Promise<void> {
    await apiClient.put(`/users/${id}/password`, data);
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStatistics(): Promise<UserStatistics> {
    const response = await apiClient.get('/users/statistics');
    return response.data;
  }

  /**
   * 获取所有权限列表
   */
  static async getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get('/permissions');
    return response.data;
  }

  /**
   * 获取角色权限关联
   */
  static async getRolePermissions(roleId: string): Promise<RolePermission> {
    const response = await apiClient.get(`/roles/${roleId}/permissions`);
    return response.data;
  }

  /**
   * 更新角色权限
   */
  static async updateRolePermissions(
    roleId: string,
    permissions: string[]
  ): Promise<RolePermission> {
    const response = await apiClient.put(`/roles/${roleId}/permissions`, {
      permissions,
    });
    return response.data;
  }

  /**
   * 搜索用户（用于下拉选择等场景）
   */
  static async searchUsers(query: string, limit = 10): Promise<User[]> {
    const response = await apiClient.get('/users/search', {
      params: { query, limit },
    });
    return response.data;
  }

  /**
   * 上传用户头像
   */
  static async uploadAvatar(
    id: string,
    file: File
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export default UserService;
