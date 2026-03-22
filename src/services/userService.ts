/**
 * 用户管理 API 服务
 * 
 * 提供用户、角色、权限相关的API调用
 */
import apiClient from './api';
import {
  UserListParams,
  UserListResponse,
  UserDetail,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  Role,
  RoleListParams,
  Permission,
  PermissionListParams,
  UserStatistics,
  RoleStatistics,
  UserOperationLog,
} from '@/types/user';

/**
 * 用户管理服务
 */
export class UserService {
  // ========== 用户列表相关 ==========

  /**
   * 获取用户列表
   * @param params 查询参数
   * @returns 用户列表响应
   */
  static async getUsers(params?: UserListParams): Promise<UserListResponse> {
    const response = await apiClient.get<UserListResponse>('/users', {
      params,
    });
    return response.data;
  }

  /**
   * 获取用户详情
   * @param userId 用户ID
   * @returns 用户详细信息
   */
  static async getUserById(userId: string): Promise<UserDetail> {
    const response = await apiClient.get<UserDetail>(`/users/${userId}`);
    return response.data;
  }

  /**
   * 更新用户角色
   * @param userId 用户ID
   * @param data 更新角色请求数据
   * @returns 更新后的用户信息
   */
  static async updateUserRole(
    userId: string,
    data: UpdateUserRoleRequest
  ): Promise<UserDetail> {
    const response = await apiClient.put<UserDetail>(
      `/users/${userId}/role`,
      data
    );
    return response.data;
  }

  /**
   * 更新用户状态
   * @param userId 用户ID
   * @param data 更新状态请求数据
   * @returns 更新后的用户信息
   */
  static async updateUserStatus(
    userId: string,
    data: UpdateUserStatusRequest
  ): Promise<UserDetail> {
    const response = await apiClient.put<UserDetail>(
      `/users/${userId}/status`,
      data
    );
    return response.data;
  }

  /**
   * 批量更新用户状态
   * @param userIds 用户ID列表
   * @param status 新状态
   * @returns 更新成功数量
   */
  static async batchUpdateUserStatus(
    userIds: string[],
    status: string
  ): Promise<{ successCount: number }> {
    const response = await apiClient.put<{ successCount: number }>(
      '/users/batch/status',
      {
        userIds,
        status,
      }
    );
    return response.data;
  }

  // ========== 角色管理相关 ==========

  /**
   * 获取角色列表
   * @param params 查询参数
   * @returns 角色列表
   */
  static async getRoles(params?: RoleListParams): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('/roles', {
      params,
    });
    return response.data;
  }

  /**
   * 获取角色详情
   * @param roleId 角色ID
   * @returns 角色详细信息
   */
  static async getRoleById(roleId: string): Promise<Role> {
    const response = await apiClient.get<Role>(`/roles/${roleId}`);
    return response.data;
  }

  /**
   * 创建角色
   * @param data 角色数据
   * @returns 新创建的角色
   */
  static async createRole(data: {
    code: string;
    name: string;
    description?: string;
    permissions: string[];
  }): Promise<Role> {
    const response = await apiClient.post<Role>('/roles', data);
    return response.data;
  }

  /**
   * 更新角色
   * @param roleId 角色ID
   * @param data 更新数据
   * @returns 更新后的角色
   */
  static async updateRole(
    roleId: string,
    data: Partial<{
      name: string;
      description: string;
      permissions: string[];
      status: string;
    }>
  ): Promise<Role> {
    const response = await apiClient.put<Role>(`/roles/${roleId}`, data);
    return response.data;
  }

  /**
   * 删除角色
   * @param roleId 角色ID
   */
  static async deleteRole(roleId: string): Promise<void> {
    await apiClient.delete(`/roles/${roleId}`);
  }

  // ========== 权限管理相关 ==========

  /**
   * 获取权限列表
   * @param params 查询参数
   * @returns 权限列表
   */
  static async getPermissions(params?: PermissionListParams): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>('/permissions', {
      params,
    });
    return response.data;
  }

  /**
   * 获取权限详情
   * @param permissionId 权限ID
   * @returns 权限详细信息
   */
  static async getPermissionById(permissionId: string): Promise<Permission> {
    const response = await apiClient.get<Permission>(
      `/permissions/${permissionId}`
    );
    return response.data;
  }

  // ========== 统计数据相关 ==========

  /**
   * 获取用户统计数据
   * @returns 用户统计数据
   */
  static async getUserStatistics(): Promise<UserStatistics> {
    const response = await apiClient.get<UserStatistics>('/users/statistics');
    return response.data;
  }

  /**
   * 获取角色统计数据
   * @returns 角色统计数据
   */
  static async getRoleStatistics(): Promise<RoleStatistics> {
    const response = await apiClient.get<RoleStatistics>('/roles/statistics');
    return response.data;
  }

  // ========== 操作日志相关 ==========

  /**
   * 获取用户操作日志
   * @param userId 用户ID
   * @param params 查询参数
   * @returns 操作日志列表
   */
  static async getUserOperationLogs(
    userId: string,
    params?: {
      page?: number;
      pageSize?: number;
      operation?: string;
    }
  ): Promise<{
    logs: UserOperationLog[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const response = await apiClient.get(`/users/${userId}/logs`, {
      params,
    });
    return response.data;
  }

  // ========== 导出功能 ==========

  /**
   * 导出用户列表
   * @param params 查询参数
   * @returns 文件下载URL
   */
  static async exportUsers(params?: UserListParams): Promise<string> {
    const response = await apiClient.get('/users/export', {
      params,
      responseType: 'blob',
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return '导出成功';
  }
}

export default UserService;
