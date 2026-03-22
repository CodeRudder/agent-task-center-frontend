/**
 * UserService 单元测试
 * 
 * 测试用户管理API服务的所有方法
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserService } from '@/services/userService';
import apiClient from '@/services/api';
import {
  UserStatus,
  RoleStatus,
  PermissionType,
  PermissionResource,
  PermissionAction,
} from '@/types/user';

// Mock apiClient
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    // 清除所有mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========== 用户列表相关测试 ==========

  describe('getUsers', () => {
    it('should_return_user_list_when_called_with_params', async () => {
      // Arrange
      const mockResponse = {
        data: {
          users: [
            {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: { id: '1', code: 'admin', name: '管理员' },
              status: UserStatus.ACTIVE,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getUsers({ page: 1, pageSize: 20 });

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/users', {
        params: { page: 1, pageSize: 20 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should_return_user_list_when_called_without_params', async () => {
      // Arrange
      const mockResponse = {
        data: {
          users: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getUsers();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/users', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should_handle_error_when_api_fails', async () => {
      // Arrange
      const mockError = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.getUsers()).rejects.toThrow('Network error');
    });
  });

  describe('getUserById', () => {
    it('should_return_user_detail_when_given_valid_userId', async () => {
      // Arrange
      const userId = 'user-123';
      const mockResponse = {
        data: {
          id: userId,
          email: 'test@example.com',
          name: 'Test User',
          role: {
            id: '1',
            code: 'admin',
            name: '管理员',
            permissions: [],
            status: RoleStatus.ACTIVE,
            isSystem: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
          status: UserStatus.ACTIVE,
          loginCount: 10,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getUserById(userId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should_handle_error_when_user_not_found', async () => {
      // Arrange
      const userId = 'non-existent';
      const mockError = new Error('User not found');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.getUserById(userId)).rejects.toThrow('User not found');
    });
  });

  describe('updateUserRole', () => {
    it('should_update_user_role_when_given_valid_data', async () => {
      // Arrange
      const userId = 'user-123';
      const requestData = { roleId: 'role-456', reason: '晋升为管理员' };
      const mockResponse = {
        data: {
          id: userId,
          email: 'test@example.com',
          name: 'Test User',
          role: {
            id: requestData.roleId,
            code: 'admin',
            name: '管理员',
            permissions: [],
            status: RoleStatus.ACTIVE,
            isSystem: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
          status: UserStatus.ACTIVE,
          loginCount: 10,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        },
      };
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.updateUserRole(userId, requestData);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(`/users/${userId}/role`, requestData);
      expect(result.role.id).toBe(requestData.roleId);
    });

    it('should_handle_error_when_role_update_fails', async () => {
      // Arrange
      const userId = 'user-123';
      const requestData = { roleId: 'invalid-role' };
      const mockError = new Error('Invalid role');
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.updateUserRole(userId, requestData)).rejects.toThrow('Invalid role');
    });
  });

  describe('updateUserStatus', () => {
    it('should_update_user_status_when_given_valid_data', async () => {
      // Arrange
      const userId = 'user-123';
      const requestData = { status: UserStatus.SUSPENDED, reason: '违规操作' };
      const mockResponse = {
        data: {
          id: userId,
          email: 'test@example.com',
          name: 'Test User',
          role: {
            id: '1',
            code: 'user',
            name: '普通用户',
            permissions: [],
            status: RoleStatus.ACTIVE,
            isSystem: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
          status: UserStatus.SUSPENDED,
          loginCount: 10,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        },
      };
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.updateUserStatus(userId, requestData);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(`/users/${userId}/status`, requestData);
      expect(result.status).toBe(UserStatus.SUSPENDED);
    });

    it('should_handle_error_when_status_update_fails', async () => {
      // Arrange
      const userId = 'user-123';
      const requestData = { status: UserStatus.LOCKED };
      const mockError = new Error('Permission denied');
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.updateUserStatus(userId, requestData)).rejects.toThrow('Permission denied');
    });
  });

  describe('batchUpdateUserStatus', () => {
    it('should_batch_update_user_status_when_given_valid_data', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];
      const status = UserStatus.INACTIVE;
      const mockResponse = {
        data: { successCount: 3 },
      };
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.batchUpdateUserStatus(userIds, status);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith('/users/batch/status', {
        userIds,
        status,
      });
      expect(result.successCount).toBe(3);
    });

    it('should_handle_error_when_batch_update_fails', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];
      const status = UserStatus.SUSPENDED;
      const mockError = new Error('Batch update failed');
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.batchUpdateUserStatus(userIds, status)).rejects.toThrow('Batch update failed');
    });
  });

  // ========== 角色管理相关测试 ==========

  describe('getRoles', () => {
    it('should_return_role_list_when_called_with_params', async () => {
      // Arrange
      const mockResponse = {
        data: [
          {
            id: '1',
            code: 'admin',
            name: '管理员',
            permissions: [],
            status: RoleStatus.ACTIVE,
            isSystem: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        ],
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getRoles({ status: RoleStatus.ACTIVE });

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/roles', {
        params: { status: RoleStatus.ACTIVE },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should_return_role_list_when_called_without_params', async () => {
      // Arrange
      const mockResponse = {
        data: [],
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getRoles();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/roles', { params: undefined });
      expect(result).toEqual([]);
    });

    it('should_handle_error_when_get_roles_fails', async () => {
      // Arrange
      const mockError = new Error('Failed to get roles');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.getRoles()).rejects.toThrow('Failed to get roles');
    });
  });

  describe('getRoleById', () => {
    it('should_return_role_detail_when_given_valid_roleId', async () => {
      // Arrange
      const roleId = 'role-123';
      const mockResponse = {
        data: {
          id: roleId,
          code: 'admin',
          name: '管理员',
          permissions: [],
          status: RoleStatus.ACTIVE,
          isSystem: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getRoleById(roleId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/roles/${roleId}`);
      expect(result.id).toBe(roleId);
    });

    it('should_handle_error_when_role_not_found', async () => {
      // Arrange
      const roleId = 'non-existent';
      const mockError = new Error('Role not found');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.getRoleById(roleId)).rejects.toThrow('Role not found');
    });
  });

  describe('createRole', () => {
    it('should_create_role_when_given_valid_data', async () => {
      // Arrange
      const requestData = {
        code: 'project_manager',
        name: '项目经理',
        description: '项目经理角色',
        permissions: ['perm-1', 'perm-2'],
      };
      const mockResponse = {
        data: {
          id: 'role-new',
          ...requestData,
          status: RoleStatus.ACTIVE,
          isSystem: false,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.createRole(requestData);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/roles', requestData);
      expect(result.code).toBe(requestData.code);
    });

    it('should_handle_error_when_create_role_fails', async () => {
      // Arrange
      const requestData = {
        code: 'duplicate',
        name: '重复角色',
        permissions: [],
      };
      const mockError = new Error('Role code already exists');
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.createRole(requestData)).rejects.toThrow('Role code already exists');
    });
  });

  describe('updateRole', () => {
    it('should_update_role_when_given_valid_data', async () => {
      // Arrange
      const roleId = 'role-123';
      const requestData = { name: '高级管理员', description: '高级管理员角色' };
      const mockResponse = {
        data: {
          id: roleId,
          code: 'admin',
          name: requestData.name,
          description: requestData.description,
          permissions: [],
          status: RoleStatus.ACTIVE,
          isSystem: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        },
      };
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.updateRole(roleId, requestData);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith(`/roles/${roleId}`, requestData);
      expect(result.name).toBe(requestData.name);
    });

    it('should_handle_error_when_update_role_fails', async () => {
      // Arrange
      const roleId = 'role-123';
      const requestData = { status: RoleStatus.DISABLED };
      const mockError = new Error('Cannot disable system role');
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.updateRole(roleId, requestData)).rejects.toThrow('Cannot disable system role');
    });
  });

  describe('deleteRole', () => {
    it('should_delete_role_when_given_valid_roleId', async () => {
      // Arrange
      const roleId = 'role-123';
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

      // Act
      await UserService.deleteRole(roleId);

      // Assert
      expect(apiClient.delete).toHaveBeenCalledWith(`/roles/${roleId}`);
    });

    it('should_handle_error_when_delete_role_fails', async () => {
      // Arrange
      const roleId = 'system-role';
      const mockError = new Error('Cannot delete system role');
      vi.mocked(apiClient.delete).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.deleteRole(roleId)).rejects.toThrow('Cannot delete system role');
    });
  });

  // ========== 权限管理相关测试 ==========

  describe('getPermissions', () => {
    it('should_return_permission_list_when_called_with_params', async () => {
      // Arrange
      const mockResponse = {
        data: [
          {
            id: 'perm-1',
            code: 'user:create',
            name: '创建用户',
            type: PermissionType.ACTION,
            resource: PermissionResource.USER,
            action: PermissionAction.CREATE,
            status: RoleStatus.ACTIVE,
            sortOrder: 1,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        ],
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getPermissions({
        type: PermissionType.ACTION,
      });

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/permissions', {
        params: { type: PermissionType.ACTION },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should_return_permission_list_when_called_without_params', async () => {
      // Arrange
      const mockResponse = {
        data: [],
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getPermissions();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/permissions', { params: undefined });
      expect(result).toEqual([]);
    });

    it('should_handle_error_when_get_permissions_fails', async () => {
      // Arrange
      const mockError = new Error('Failed to get permissions');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.getPermissions()).rejects.toThrow('Failed to get permissions');
    });
  });

  describe('getPermissionById', () => {
    it('should_return_permission_detail_when_given_valid_permissionId', async () => {
      // Arrange
      const permissionId = 'perm-123';
      const mockResponse = {
        data: {
          id: permissionId,
          code: 'user:create',
          name: '创建用户',
          type: PermissionType.ACTION,
          resource: PermissionResource.USER,
          action: PermissionAction.CREATE,
          status: RoleStatus.ACTIVE,
          sortOrder: 1,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getPermissionById(permissionId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/permissions/${permissionId}`);
      expect(result.id).toBe(permissionId);
    });

    it('should_handle_error_when_permission_not_found', async () => {
      // Arrange
      const permissionId = 'non-existent';
      const mockError = new Error('Permission not found');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.getPermissionById(permissionId)).rejects.toThrow('Permission not found');
    });
  });

  // ========== 统计数据相关测试 ==========

  describe('getUserStatistics', () => {
    it('should_return_user_statistics_when_called', async () => {
      // Arrange
      const mockResponse = {
        data: {
          total: 100,
          active: 80,
          inactive: 10,
          suspended: 5,
          locked: 5,
          todayNew: 3,
          todayLogin: 25,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getUserStatistics();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/users/statistics');
      expect(result).toEqual(mockResponse.data);
    });

    it('should_handle_error_when_get_statistics_fails', async () => {
      // Arrange
      const mockError = new Error('Failed to get statistics');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.getUserStatistics()).rejects.toThrow('Failed to get statistics');
    });
  });

  describe('getRoleStatistics', () => {
    it('should_return_role_statistics_when_called', async () => {
      // Arrange
      const mockResponse = {
        data: {
          total: 10,
          active: 8,
          disabled: 2,
          systemRoles: 3,
          customRoles: 7,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getRoleStatistics();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/roles/statistics');
      expect(result).toEqual(mockResponse.data);
    });

    it('should_handle_error_when_get_statistics_fails', async () => {
      // Arrange
      const mockError = new Error('Failed to get role statistics');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.getRoleStatistics()).rejects.toThrow('Failed to get role statistics');
    });
  });

  // ========== 操作日志相关测试 ==========

  describe('getUserOperationLogs', () => {
    it('should_return_operation_logs_when_given_valid_userId', async () => {
      // Arrange
      const userId = 'user-123';
      const mockResponse = {
        data: {
          logs: [
            {
              id: 'log-1',
              userId,
              operatorId: 'admin-1',
              operatorName: 'Admin',
              operation: 'update_status',
              ip: '192.168.1.1',
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getUserOperationLogs(userId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/users/${userId}/logs`, {
        params: undefined,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should_return_logs_with_params_when_given_query_params', async () => {
      // Arrange
      const userId = 'user-123';
      const params = { page: 2, pageSize: 10, operation: 'update_status' };
      const mockResponse = {
        data: {
          logs: [],
          total: 0,
          page: 2,
          pageSize: 10,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await UserService.getUserOperationLogs(userId, params);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/users/${userId}/logs`, {
        params,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should_handle_error_when_get_logs_fails', async () => {
      // Arrange
      const userId = 'user-123';
      const mockError = new Error('Failed to get logs');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.getUserOperationLogs(userId)).rejects.toThrow('Failed to get logs');
    });
  });

  // ========== 导出功能测试 ==========

  describe('exportUsers', () => {
    it('should_export_users_when_called_with_params', async () => {
      // Arrange
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const mockResponse = {
        data: mockBlob,
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Mock DOM methods
      const mockLink = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      
      // Mock URL.createObjectURL and revokeObjectURL
      const mockUrl = 'blob:mock-url';
      vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(mockUrl);
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

      // Act
      const result = await UserService.exportUsers({ status: UserStatus.ACTIVE });

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/users/export', {
        params: { status: UserStatus.ACTIVE },
        responseType: 'blob',
      });
      expect(mockLink.click).toHaveBeenCalled();
      expect(result).toBe('导出成功');
    });

    it('should_handle_error_when_export_fails', async () => {
      // Arrange
      const mockError = new Error('Export failed');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(UserService.exportUsers()).rejects.toThrow('Export failed');
    });
  });
});
