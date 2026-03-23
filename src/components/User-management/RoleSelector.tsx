/**
 * RoleSelector 组件
 * 用于选择用户角色的多选组件
 */
import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'
import type { RoleSelectorProps, Role } from './types'

/**
 * RoleSelector 组件
 */
export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRoleIds,
  onChange,
  disabled = false,
  className,
}) => {
  // 模拟角色数据 - 实际项目中应该从store或API获取
  const [roles] = React.useState<Role[]>([
    {
      id: '1',
      name: '管理员',
      description: '系统管理员，拥有所有权限',
      permissions: [],
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: '项目经理',
      description: '负责项目管理',
      permissions: [],
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      name: '普通用户',
      description: '普通用户，基本权限',
      permissions: [],
      isSystem: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ])

  /**
   * 处理角色选择
   */
  const handleRoleToggle = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      onChange(selectedRoleIds.filter(id => id !== roleId))
    } else {
      onChange([...selectedRoleIds, roleId])
    }
  }

  /**
   * 处理全选/取消全选
   */
  const handleSelectAll = () => {
    if (selectedRoleIds.length === roles.length) {
      onChange([])
    } else {
      onChange(roles.map(r => r.id))
    }
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            角色分配
          </CardTitle>
          <button
            onClick={handleSelectAll}
            disabled={disabled}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {selectedRoleIds.length === roles.length ? '取消全选' : '全选'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roles.map((role) => {
            const isSelected = selectedRoleIds.includes(role.id)
            return (
              <div
                key={role.id}
                className={cn(
                  'flex items-start space-x-3 p-3 rounded-lg border transition-colors',
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Checkbox
                  id={`role-${role.id}`}
                  checked={isSelected}
                  onChange={() => !disabled && handleRoleToggle(role.id)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`role-${role.id}`}
                  className={cn(
                    'flex-1 cursor-pointer',
                    disabled && 'cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{role.name}</span>
                    {role.isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        系统角色
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {role.description}
                  </p>
                  {isSelected && role.permissions.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      包含 {role.permissions.length} 个权限
                    </p>
                  )}
                </label>
              </div>
            )
          })}
        </div>

        {selectedRoleIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              已选择 <span className="font-semibold text-blue-600">{selectedRoleIds.length}</span> 个角色
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

RoleSelector.displayName = 'RoleSelector'
