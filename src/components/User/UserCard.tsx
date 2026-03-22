/**
 * 用户卡片组件
 * 
 * 显示单个用户的信息卡片
 * - 显示用户信息（头像、姓名、邮箱、角色、状态等）
 * - 角色更新按钮
 * - 状态更新按钮
 * 
 * @author Frontend Developer
 * @date 2026-03-23
 */
import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  Clock,
  MoreVertical,
  Edit,
  UserX,
  UserCheck,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { UserListItem, UserStatus, Role } from '@/types/user';

/**
 * UserCard组件属性
 */
export interface UserCardProps {
  /** 用户数据 */
  user: UserListItem;
  /** 角色列表（用于角色更新） */
  roles: Role[];
  /** 当前操作中的用户ID（用于显示loading状态） */
  updatingUserId?: string | null;
  /** 点击角色更新回调 */
  onRoleUpdate?: (userId: string) => void;
  /** 点击状态更新回调 */
  onStatusUpdate?: (userId: string) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 获取状态配置
 */
const getStatusConfig = (status: UserStatus) => {
  const configs = {
    [UserStatus.ACTIVE]: {
      label: '活跃',
      icon: UserCheck,
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    [UserStatus.INACTIVE]: {
      label: '未激活',
      icon: UserX,
      className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    [UserStatus.SUSPENDED]: {
      label: '已停用',
      icon: UserX,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    [UserStatus.LOCKED]: {
      label: '已锁定',
      icon: Lock,
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  };
  return configs[status] || configs[UserStatus.INACTIVE];
};

/**
 * 格式化日期
 */
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '-';
  }
};

/**
 * 格式化日期时间
 */
const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

/**
 * 用户卡片组件
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  roles,
  updatingUserId,
  onRoleUpdate,
  onStatusUpdate,
  className,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  
  const statusConfig = getStatusConfig(user.status);
  const StatusIcon = statusConfig.icon;
  const isUpdating = updatingUserId === user.id;

  /**
   * 处理角色更新
   */
  const handleRoleUpdate = () => {
    setShowMenu(false);
    onRoleUpdate?.(user.id);
  };

  /**
   * 处理状态更新
   */
  const handleStatusUpdate = () => {
    setShowMenu(false);
    onStatusUpdate?.(user.id);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 transition-all',
        'hover:shadow-md',
        isUpdating && 'opacity-60 pointer-events-none',
        className
      )}
    >
      {/* 移动端布局 */}
      <div className="md:hidden">
        {/* 头部：头像 + 姓名 + 状态 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* 头像 */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </div>
            
            {/* 姓名 + 角色 */}
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500">
                @{user.username || user.email.split('@')[0]}
              </p>
            </div>
          </div>

          {/* 状态标签 + 操作菜单 */}
          <div className="flex items-center space-x-2">
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                statusConfig.className
              )}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </span>
            
            {/* 更多操作 */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {/* 下拉菜单 */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <button
                      onClick={handleRoleUpdate}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      更新角色
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      更新状态
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="space-y-2 text-sm">
          {/* 邮箱 */}
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{user.email}</span>
          </div>

          {/* 角色 */}
          <div className="flex items-center text-gray-600">
            <Shield className="w-4 h-4 mr-2 text-gray-400" />
            <span>{user.role.name}</span>
          </div>

          {/* 部门/职位 */}
          {(user.department || user.position) && (
            <div className="flex items-center text-gray-600">
              <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                {[user.department, user.position].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {/* 最后登录 */}
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>最后登录: {formatDateTime(user.lastLoginAt)}</span>
          </div>

          {/* 创建时间 */}
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>创建于: {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 桌面端布局 */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {/* 左侧：头像 + 基本信息 */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* 头像 */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
              )}
            </div>

            {/* 基本信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </h3>
                <span className="text-xs text-gray-500">
                  @{user.username || user.email.split('@')[0]}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[200px]">{user.email}</span>
                </span>
                <span className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role.name}
                </span>
                {(user.department || user.position) && (
                  <span className="hidden lg:inline">
                    {[user.department, user.position].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：状态 + 时间 + 操作 */}
          <div className="flex items-center space-x-4">
            {/* 状态标签 */}
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                statusConfig.className
              )}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </span>

            {/* 最后登录 */}
            <div className="hidden lg:flex items-center text-xs text-gray-500 min-w-[140px]">
              <Clock className="w-3 h-3 mr-1" />
              {formatDateTime(user.lastLoginAt)}
            </div>

            {/* 创建时间 */}
            <div className="hidden xl:flex items-center text-xs text-gray-500 min-w-[100px]">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(user.createdAt)}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleRoleUpdate}
                disabled={isUpdating}
                className={cn(
                  'p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded',
                  'transition-colors',
                  isUpdating && 'opacity-50 cursor-not-allowed'
                )}
                title="更新角色"
              >
                <Shield className="w-4 h-4" />
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className={cn(
                  'p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded',
                  'transition-colors',
                  isUpdating && 'opacity-50 cursor-not-allowed'
                )}
                title="更新状态"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
