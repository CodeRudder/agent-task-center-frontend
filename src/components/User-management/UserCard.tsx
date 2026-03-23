/**
 * UserCard 组件
 * 显示单个用户信息的卡片组件
 */
import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Edit, Trash2, MoreVertical } from 'lucide-react'
import type { UserCardProps, UserStatus } from './types'
import { formatDate } from '@/lib/utils'

/**
 * 获取状态徽章的变体
 */
const getStatusBadgeVariant = (status: UserStatus) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'suspended':
      return 'destructive'
    default:
      return 'default'
  }
}

/**
 * 获取状态文本
 */
const getStatusText = (status: UserStatus) => {
  switch (status) {
    case 'active':
      return '活跃'
    case 'inactive':
      return '未激活'
    case 'suspended':
      return '已停用'
    default:
      return status
  }
}

/**
 * UserCard 组件
 */
export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onStatusChange,
  className,
}) => {
  const [showMenu, setShowMenu] = React.useState(false)

  /**
   * 处理编辑
   */
  const handleEdit = () => {
    onEdit?.(user)
    setShowMenu(false)
  }

  /**
   * 处理删除
   */
  const handleDelete = () => {
    if (window.confirm(`确定要删除用户 "${user.displayName}" 吗？`)) {
      onDelete?.(user.id)
    }
    setShowMenu(false)
  }

  /**
   * 处理状态变更
   */
  const handleStatusChange = (status: UserStatus) => {
    onStatusChange?.(user.id, status)
    setShowMenu(false)
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* 用户基本信息 */}
          <div className="flex items-center space-x-4">
            <Avatar
              src={user.avatar}
              alt={user.displayName}
              fallback={user.displayName.charAt(0).toUpperCase()}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {user.displayName}
                </h3>
                <Badge variant={getStatusBadgeVariant(user.status)}>
                  {getStatusText(user.status)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
              <p className="text-sm text-gray-600 mb-3">{user.email}</p>
              
              {/* 角色标签 */}
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role.id} variant="outline">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 操作菜单 */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="更多操作"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <button
                      onClick={handleEdit}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="mr-3 h-4 w-4" />
                      编辑用户
                    </button>
                    
                    <hr className="my-1" />
                    
                    <p className="px-4 py-2 text-xs text-gray-500">更改状态</p>
                    <button
                      onClick={() => handleStatusChange('active')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span className="w-4 h-4 mr-3 rounded-full bg-green-500" />
                      活跃
                    </button>
                    <button
                      onClick={() => handleStatusChange('inactive')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span className="w-4 h-4 mr-3 rounded-full bg-gray-400" />
                      未激活
                    </button>
                    <button
                      onClick={() => handleStatusChange('suspended')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span className="w-4 h-4 mr-3 rounded-full bg-red-500" />
                      已停用
                    </button>
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="mr-3 h-4 w-4" />
                      删除用户
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 用户详细信息 */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">创建时间：</span>
            <span className="text-gray-900">{formatDate(user.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-500">最后登录：</span>
            <span className="text-gray-900">
              {user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

UserCard.displayName = 'UserCard'
