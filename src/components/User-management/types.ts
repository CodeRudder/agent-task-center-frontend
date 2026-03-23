/**
 * User Management Types
 * V5.6 P0 用户管理功能
 */

/**
 * 用户状态
 */
export type UserStatus = 'active' | 'inactive' | 'suspended'

/**
 * 权限类型
 */
export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

/**
 * 角色定义
 */
export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystem?: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 用户信息
 */
export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  roles: Role[]
  status: UserStatus
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * 用户列表查询参数
 */
export interface UserQueryParams {
  search?: string
  status?: UserStatus
  roleId?: string
  page?: number
  pageSize?: number
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
  users: User[]
  total: number
  page: number
  pageSize: number
}

/**
 * 创建用户请求
 */
export interface CreateUserRequest {
  username: string
  email: string
  displayName: string
  password: string
  roleIds: string[]
}

/**
 * 更新用户请求
 */
export interface UpdateUserRequest {
  displayName?: string
  email?: string
  roleIds?: string[]
  status?: UserStatus
}

/**
 * 角色选择器Props
 */
export interface RoleSelectorProps {
  selectedRoleIds: string[]
  onChange: (roleIds: string[]) => void
  disabled?: boolean
  className?: string
}

/**
 * 用户卡片Props
 */
export interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void
  onStatusChange?: (userId: string, status: UserStatus) => void
  className?: string
}

/**
 * 用户列表Props
 */
export interface UserListProps {
  users: User[]
  loading?: boolean
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void
  onStatusChange?: (userId: string, status: UserStatus) => void
  className?: string
}

/**
 * 权限管理器Props
 */
export interface PermissionManagerProps {
  role: Role
  onUpdate: (role: Role) => void
  allPermissions: Permission[]
  disabled?: boolean
  className?: string
}

/**
 * 用户管理页面Props
 */
export interface UserManagementPageProps {
  className?: string
}

/**
 * API响应包装
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
