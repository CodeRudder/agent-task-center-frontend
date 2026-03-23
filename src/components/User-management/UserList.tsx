/**
 * UserList 组件
 * 显示用户列表，支持搜索、过滤和分页
 */
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { UserCard } from './UserCard'
import { Search, Filter, RefreshCw, Users } from 'lucide-react'
import type { UserListProps, UserStatus } from './types'
import { useUserStore } from './userStore'

/**
 * UserList 组件
 */
export const UserList: React.FC<UserListProps> = ({
  users,
  loading = false,
  onEdit,
  onDelete,
  onStatusChange,
  className,
}) => {
  const {
    fetchUsers,
    queryParams,
    setQueryParams,
    totalUsers,
    error,
    clearError,
  } = useUserStore()

  const [searchInput, setSearchInput] = useState(queryParams.search || '')
  const [showFilters, setShowFilters] = useState(false)

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    setQueryParams({ search: searchInput, page: 1 })
    fetchUsers({ ...queryParams, search: searchInput, page: 1 })
  }

  /**
   * 处理搜索输入框的按键事件
   */
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  /**
   * 处理状态过滤
   */
  const handleStatusFilter = (status: string) => {
    const newStatus = status === 'all' ? undefined : (status as UserStatus)
    setQueryParams({ status: newStatus, page: 1 })
    fetchUsers({ ...queryParams, status: newStatus, page: 1 })
  }

  /**
   * 处理刷新
   */
  const handleRefresh = () => {
    clearError()
    fetchUsers()
  }

  /**
   * 处理分页
   */
  const handlePageChange = (newPage: number) => {
    setQueryParams({ page: newPage })
    fetchUsers({ ...queryParams, page: newPage })
  }

  /**
   * 计算总页数
   */
  const totalPages = Math.ceil(totalUsers / (queryParams.pageSize || 10))
  const currentPage = queryParams.page || 1

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            用户列表
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              过滤
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="mt-4 space-y-3">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索用户名、邮箱或显示名称..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              搜索
            </Button>
          </div>

          {showFilters && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">状态:</span>
              <Select
                value={queryParams.status || 'all'}
                onChange={e => handleStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'active', label: '活跃' },
                  { value: 'inactive', label: '未激活' },
                  { value: 'suspended', label: '已停用' },
                ]}
              />
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* 用户统计 */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            共 <span className="font-semibold">{totalUsers}</span> 个用户，
            当前显示第 <span className="font-semibold">{(currentPage - 1) * (queryParams.pageSize || 10) + 1}</span> -{' '}
            <span className="font-semibold">
              {Math.min(currentPage * (queryParams.pageSize || 10), totalUsers)}
            </span> 个
          </p>
        </div>

        {/* 用户列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-600">加载中...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">没有找到用户</p>
            <p className="text-sm text-gray-400">尝试调整搜索条件或添加新用户</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              第 {currentPage} / {totalPages} 页
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

UserList.displayName = 'UserList'
