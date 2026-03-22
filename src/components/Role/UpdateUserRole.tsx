/**
 * 用户角色更新组件
 * 
 * 更新用户角色，支持权限变更预览
 * - 用户角色选择下拉框
 * - 角色更新确认
 * - 权限变更预览
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Modal from '../Modal';
import Button from '../Button';
import Select from '../Select';
import { useUserStore } from '@/stores/userStore';
import { UserService } from '@/services/userService';
import { Role, Permission, UserListItem, RoleStatus } from '@/types/user';

/**
 * UpdateUserRole组件属性
 */
export interface UpdateUserRoleProps {
  /** 用户数据 */
  user: UserListItem;
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 更新成功回调 */
  onSuccess?: () => void;
}

/**
 * 权限变更对比
 */
interface PermissionChange {
  /** 权限 */
  permission: Permission;
  /** 变更类型 */
  changeType: 'added' | 'removed';
}

/**
 * 用户角色更新组件
 */
export const UpdateUserRole: React.FC<UpdateUserRoleProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // ========== Store状态 ==========
  const { roles, updateUserInList } = useUserStore();

  // ========== 本地状态 ==========
  const [selectedRoleId, setSelectedRoleId] = useState<string>(user.role.id);
  const [currentRoleId, setCurrentRoleId] = useState<string>(user.role.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // ========== 计算属性 ==========

  /**
   * 当前角色
   */
  const currentRole = useMemo(() => {
    return roles.find((r) => r.id === currentRoleId);
  }, [roles, currentRoleId]);

  /**
   * 新角色
   */
  const newRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId);
  }, [roles, selectedRoleId]);

  /**
   * 权限变更列表
   */
  const permissionChanges = useMemo((): PermissionChange[] => {
    if (!currentRole || !newRole) return [];

    const currentPermissions = new Set(currentRole.permissions.map((p) => p.id));
    const newPermissions = newRole.permissions;

    const changes: PermissionChange[] = [];

    newPermissions.forEach((permission) => {
      if (!currentPermissions.has(permission.id)) {
        changes.push({ permission, changeType: 'added' });
      }
    });

    currentRole.permissions.forEach((permission) => {
      if (!newPermissions.find((p) => p.id === permission.id)) {
        changes.push({ permission, changeType: 'removed' });
      }
    });

    return changes;
  }, [currentRole, newRole]);

  /**
   * 是否有权限变更
   */
  const hasPermissionChanges = useMemo(() => {
    return permissionChanges.length > 0;
  }, [permissionChanges]);

  /**
   * 角色选项（排除已禁用的角色）
   */
  const roleOptions = useMemo(() => {
    return roles
      .filter((role) => role.status === RoleStatus.ACTIVE)
      .map((role) => ({
        value: role.id,
        label: `${role.name} (@${role.code})`,
        disabled: role.isSystem && role.id !== user.role.id, // 系统角色可以选择当前角色
      }));
  }, [roles, user.role.id]);

  // ========== 事件处理 ==========

  /**
   * 重置状态
   */
  const resetState = () => {
    setSelectedRoleId(user.role.id);
    setCurrentRoleId(user.role.id);
    setLoading(false);
    setError(null);
    setShowPreview(false);
  };

  /**
   * 关闭弹窗
   */
  const handleClose = () => {
    if (!loading) {
      resetState();
      onClose();
    }
  };

  /**
   * 选择角色变化
   */
  const handleRoleChange = (value: string) => {
    setSelectedRoleId(value);
    setError(null);
  };

  /**
   * 切换预览
   */
  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
  };

  /**
   * 确认更新角色
   */
  const handleConfirm = async () => {
    // 如果角色没有变化，直接关闭
    if (selectedRoleId === currentRoleId) {
      handleClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 调用API更新用户角色
      const updatedUser = await UserService.updateUserRole(user.id, {
        roleId: selectedRoleId,
      });

      // 更新本地状态
      const newRoleData = roles.find((r) => r.id === selectedRoleId);
      if (newRoleData) {
        updateUserInList(user.id, {
          role: {
            id: newRoleData.id,
            code: newRoleData.code,
            name: newRoleData.name,
          },
        });
      }

      // 更新当前角色ID
      setCurrentRoleId(selectedRoleId);

      // 成功回调
      onSuccess?.();

      // 延迟关闭弹窗，让用户看到成功状态
      setTimeout(() => {
        resetState();
        onClose();
      }, 500);
    } catch (err) {
      console.error('更新用户角色失败:', err);
      setError(err instanceof Error ? err.message : '更新用户角色失败');
      setLoading(false);
    }
  };

  /**
   * 弹窗打开时重置状态
   */
  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, user.id, user.role.id]);

  // ========== 渲染函数 ==========

  /**
   * 渲染权限变更项
   */
  const renderPermissionChange = (change: PermissionChange) => {
    const isAdded = change.changeType === 'added';

    return (
      <div
        key={change.permission.id}
        className={cn(
          'flex items-start space-x-3 py-2 px-3 rounded-lg text-sm',
          isAdded ? 'bg-green-50' : 'bg-red-50'
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isAdded ? (
            <ArrowRight className="w-4 h-4 text-green-600 rotate-[270deg]" />
          ) : (
            <ArrowRight className="w-4 h-4 text-red-600 rotate-90" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={cn(
              'font-medium',
              isAdded ? 'text-green-700' : 'text-red-700'
            )}>
              {change.permission.name}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {change.permission.code}
            </span>
          </div>
          {change.permission.description && (
            <p className="text-xs text-gray-600 line-clamp-1">
              {change.permission.description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
            isAdded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {isAdded ? '新增' : '移除'}
          </span>
        </div>
      </div>
    );
  };

  /**
   * 渲染权限预览
   */
  const renderPermissionPreview = () => {
    if (!showPreview) {
      return (
        <button
          onClick={handleTogglePreview}
          className={cn(
            'w-full py-2 px-4 text-sm text-blue-600 bg-blue-50 rounded-lg',
            'hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2'
          )}
        >
          <Shield className="w-4 h-4" />
          <span>查看权限变更预览</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      );
    }

    if (!hasPermissionChanges) {
      return (
        <div className="py-4 px-4 bg-gray-50 rounded-lg text-center">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-gray-700">权限无变更</p>
          <p className="text-xs text-gray-500 mt-1">
            新旧角色的权限配置相同
          </p>
        </div>
      );
    }

    const addedCount = permissionChanges.filter((c) => c.changeType === 'added').length;
    const removedCount = permissionChanges.filter((c) => c.changeType === 'removed').length;

    return (
      <div className="space-y-3">
        {/* 变更统计 */}
        <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center text-gray-700">
              <Shield className="w-4 h-4 mr-1" />
              权限变更:
            </span>
            <span className="flex items-center text-green-600">
              <ArrowRight className="w-4 h-4 mr-1 rotate-[270deg]" />
              新增 {addedCount} 项
            </span>
            <span className="flex items-center text-red-600">
              <ArrowRight className="w-4 h-4 mr-1 rotate-90" />
              移除 {removedCount} 项
            </span>
          </div>
          <button
            onClick={handleTogglePreview}
            className="text-blue-600 hover:text-blue-700"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* 变更列表 */}
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {permissionChanges.map(renderPermissionChange)}
        </div>
      </div>
    );
  };

  /**
   * 渲染错误提示
   */
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="flex items-start space-x-3 py-3 px-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">更新失败</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  };

  /**
   * 渲染成功提示
   */
  const renderSuccess = () => {
    if (!loading && selectedRoleId !== currentRoleId) return null;

    return (
      <div className="flex items-center space-x-3 py-3 px-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">更新成功</p>
          <p className="text-sm text-green-700 mt-1">
            用户角色已更新为 {newRole?.name}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`更新用户角色 - ${user.name}`}
      size="md"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            fullWidth
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={loading || selectedRoleId === currentRoleId || !newRole}
            loading={loading}
            leftIcon={loading ? undefined : <CheckCircle2 className="w-4 h-4" />}
            fullWidth
          >
            {loading ? '更新中...' : '确认更新'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* 用户信息 */}
        <div className="flex items-center space-x-3 py-3 px-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* 当前角色 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            当前角色
          </label>
          <div className="flex items-center space-x-3 py-2 px-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {currentRole?.name}
              </p>
              <p className="text-xs text-gray-600">@{currentRole?.code}</p>
            </div>
          </div>
        </div>

        {/* 新角色选择 */}
        <div>
          <Select
            label="选择新角色"
            options={roleOptions}
            value={selectedRoleId}
            onChange={handleRoleChange}
            placeholder="请选择角色"
            helperText={
              newRole
                ? `该角色包含 ${newRole.permissions.length} 个权限`
                : undefined
            }
          />
        </div>

        {/* 权限变更预览 */}
        {selectedRoleId !== currentRoleId && newRole && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              权限变更
            </h4>
            {renderPermissionPreview()}
          </div>
        )}

        {/* 错误提示 */}
        {renderError()}

        {/* 成功提示 */}
        {renderSuccess()}
      </div>
    </Modal>
  );
};

export default UpdateUserRole;
