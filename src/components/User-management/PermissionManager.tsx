/**
 * PermissionManager 组件
 * 用于管理角色的权限分配
 */
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Shield, Check, X } from 'lucide-react'
import type { PermissionManagerProps, Permission } from './types'

/**
 * PermissionManager 组件
 */
export const PermissionManager: React.FC<PermissionManagerProps> = ({
  role,
  onUpdate,
  allPermissions = [],
  disabled = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role.permissions.map(p => p.id))
  )

  // 按分类组织权限
  const categorizedPermissions = React.useMemo(() => {
    const filtered = searchQuery
      ? allPermissions.filter(
          p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allPermissions

    const categories = filtered.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    }, {} as Record<string, Permission[]>)

    return categories
  }, [allPermissions, searchQuery])

  /**
   * 切换权限选择
   */
  const handleTogglePermission = (permissionId: string) => {
    if (disabled) return

    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId)
    } else {
      newSelected.add(permissionId)
    }
    setSelectedPermissions(newSelected)
  }

  /**
   * 全选当前分类
   */
  const handleSelectCategory = (category: string) => {
    if (disabled) return

    const newSelected = new Set(selectedPermissions)
    const permissionsInCategory = categorizedPermissions[category] || []

    const allSelected = permissionsInCategory.every(p => newSelected.has(p.id))

    if (allSelected) {
      permissionsInCategory.forEach(p => newSelected.delete(p.id))
    } else {
      permissionsInCategory.forEach(p => newSelected.add(p.id))
    }

    setSelectedPermissions(newSelected)
  }

  /**
   * 保存更改
   */
  const handleSave = () => {
    const updatedPermissions = allPermissions.filter(p =>
      selectedPermissions.has(p.id)
    )
    onUpdate({
      ...role,
      permissions: updatedPermissions,
    })
  }

  /**
   * 取消更改
   */
  const handleCancel = () => {
    setSelectedPermissions(new Set(role.permissions.map(p => p.id)))
    setSearchQuery('')
  }

  /**
   * 检查分类是否全选
   */
  const isCategoryFullySelected = (category: string) => {
    const permissionsInCategory = categorizedPermissions[category] || []
    return permissionsInCategory.length > 0 &&
      permissionsInCategory.every(p => selectedPermissions.has(p.id))
  }

  /**
   * 检查分类是否部分选择
   */
  const isCategoryPartiallySelected = (category: string) => {
    const permissionsInCategory = categorizedPermissions[category] || []
    const selectedCount = permissionsInCategory.filter(p =>
      selectedPermissions.has(p.id)
    ).length
    return selectedCount > 0 && selectedCount < permissionsInCategory.length
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          权限管理 - {role.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 搜索栏 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索权限..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              disabled={disabled}
              className="pl-10"
            />
          </div>
        </div>

        {/* 权限列表 */}
        <div className="space-y-6">
          {Object.entries(categorizedPermissions).map(([category, permissions]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              {/* 分类标题 */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{category}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectCategory(category)}
                  disabled={disabled}
                  className="text-xs"
                >
                  {isCategoryFullySelected(category) ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      取消全选
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      {isCategoryPartiallySelected(category) ? '全选' : '全选'}
                    </>
                  )}
                </Button>
              </div>

              {/* 权限列表 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {permissions.map((permission) => {
                  const isSelected = selectedPermissions.has(permission.id)
                  return (
                    <button
                      key={permission.id}
                      onClick={() => handleTogglePermission(permission.id)}
                      disabled={disabled}
                      className={cn(
                        'flex items-start space-x-2 p-3 rounded-lg border text-left transition-colors',
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300',
                        disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center mt-0.5',
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'font-medium text-sm',
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          )}
                        >
                          {permission.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {permission.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              已选择{' '}
              <span className="font-semibold text-blue-600">
                {selectedPermissions.size}
              </span>{' '}
              / {allPermissions.length} 个权限
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel} disabled={disabled}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={disabled}>
                保存更改
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

PermissionManager.displayName = 'PermissionManager'
