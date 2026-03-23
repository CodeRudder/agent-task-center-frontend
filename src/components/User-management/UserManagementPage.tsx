/**
 * UserManagementPage 组件
 * V5.6 P0 用户管理主页面，整合所有用户管理功能
 */
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserList } from './UserList'
import { RoleSelector } from './RoleSelector'
import { PermissionManager } from './PermissionManager'
import { useUserStore } from './userStore'
import { Plus, X, Save, UserPlus, Shield, Settings } from 'lucide-react'
import type { User, Role, UserStatus } from './types'

/**
 * 用户管理页面
 */
export const UserManagementPage: React.FC = ({ className }: { className?: string }) => {
  const {
    users,
    roles,
    permissions,
    loading,
    error,
    fetchUsers,
    fetchRoles,
    fetchPermissions,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  } = useUserStore()

  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'permissions'>('list')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    roleIds: [] as string[],
  })

  /**
   * 初始化数据
   */
  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchPermissions()
  }, [fetchUsers, fetchRoles, fetchPermissions])

  /**
   * 处理创建用户
   */
  const handleCreateUser = async () => {
    try {
      await createUser({
        username: formData.username,
        email: formData.email,
        displayName: formData.displayName,
        password: formData.password,
        roleIds: formData.roleIds,
      })
      setMode('list')
      resetForm()
    } catch (error) {
      console.error('创建用户失败:', error)
    }
  }

  /**
   * 处理更新用户
   */
  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      await updateUser(selectedUser.id, {
        displayName: formData.displayName,
        email: formData.email,
        roles: roles.filter(r => formData.roleIds.includes(r.id)),
      })
      setMode('list')
      resetForm()
    } catch (error) {
      console.error('更新用户失败:', error)
    }
  }

  /**
   * 处理删除用户
   */
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }

  /**
   * 处理状态变更
   */
  const handleStatusChange = async (userId: string, status: UserStatus) => {
    try {
      await updateUser(userId, { status })
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }

  /**
   * 处理编辑用户
   */
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      password: '',
      roleIds: user.roles.map(r => r.id),
    })
    setMode('edit')
  }

  /**
   * 处理管理权限
   */
  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role)
    setMode('permissions')
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      displayName: '',
      password: '',
      roleIds: [],
    })
    setSelectedUser(null)
  }

  /**
   * 取消操作
   */
  const handleCancel = () => {
    setMode('list')
    resetForm()
    clearError()
  }

  return (
    <div className={cn('container mx-auto py-6', className)}>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-600 mt-2">管理系统用户、角色和权限</p>
      </div>

      {/* 主内容区域 */}
      {mode === 'list' && (
        <>
          {/* 操作按钮 */}
          <div className="mb-6 flex space-x-3">
            <Button onClick={() => setMode('create')}>
              <Plus className="w-4 h-4 mr-2" />
              创建用户
            </Button>
            <Button variant="outline" onClick={() => setMode('permissions')}>
              <Shield className="w-4 h-4 mr-2" />
              管理权限
            </Button>
          </div>

          {/* 用户列表 */}
          <UserList
            users={users}
            loading={loading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onStatusChange={handleStatusChange}
          />

          {/* 角色和权限概览 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 角色统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">角色统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roles.map(role => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleManagePermissions(role)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{role.name}</p>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {role.permissions.length} 个权限
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setMode('create')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    添加新用户
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setMode('permissions')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    配置角色权限
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* 创建/编辑用户 */}
      {(mode === 'create' || mode === 'edit') && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {mode === 'create' ? '创建新用户' : '编辑用户'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={e => { e.preventDefault(); mode === 'create' ? handleCreateUser() : handleUpdateUser(); }}>
              <div className="space-y-4">
                {/* 用户名 */}
                <div>
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    disabled={mode === 'edit'}
                    required
                  />
                </div>

                {/* 显示名称 */}
                <div>
                  <Label htmlFor="displayName">显示名称</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    required
                  />
                </div>

                {/* 邮箱 */}
                <div>
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* 密码 (仅创建时) */}
                {mode === 'create' && (
                  <div>
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}

                {/* 角色选择 */}
                <div>
                  <RoleSelector
                    selectedRoleIds={formData.roleIds}
                    onChange={roleIds => setFormData({ ...formData, roleIds })}
                  />
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="mt-6 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  取消
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? '创建' : '保存'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 权限管理 */}
      {mode === 'permissions' && selectedRole && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              返回用户列表
            </Button>
          </div>
          <PermissionManager
            role={selectedRole}
            allPermissions={permissions}
            onUpdate={(updatedRole) => {
              console.log('更新角色权限:', updatedRole)
              setMode('list')
              setSelectedRole(null)
            }}
          />
        </div>
      )}
    </div>
  )
}

UserManagementPage.displayName = 'UserManagementPage'
