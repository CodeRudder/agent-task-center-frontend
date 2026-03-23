/**
 * User Management Store
 * 使用Zustand管理用户状态
 */
import { create } from 'zustand'
import type { User, Role, Permission, UserQueryParams, CreateUserRequest } from './types'

interface UserStore {
  users: User[]
  roles: Role[]
  permissions: Permission[]
  loading: boolean
  error: string | null
  queryParams: UserQueryParams
  totalUsers: number

  // Actions
  fetchUsers: (params?: UserQueryParams) => Promise<void>
  fetchRoles: () => Promise<void>
  fetchPermissions: () => Promise<void>
  createUser: (user: CreateUserRequest) => Promise<void>
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  setQueryParams: (params: Partial<UserQueryParams>) => void
  clearError: () => void
}

// Mock数据 - 实际项目中应该从API获取
const mockPermissions: Permission[] = [
  { id: '1', name: 'user.read', description: '查看用户', category: '用户管理' },
  { id: '2', name: 'user.write', description: '编辑用户', category: '用户管理' },
  { id: '3', name: 'user.delete', description: '删除用户', category: '用户管理' },
  { id: '4', name: 'role.read', description: '查看角色', category: '角色管理' },
  { id: '5', name: 'role.write', description: '编辑角色', category: '角色管理' },
  { id: '6', name: 'role.delete', description: '删除角色', category: '角色管理' },
  { id: '7', name: 'task.read', description: '查看任务', category: '任务管理' },
  { id: '8', name: 'task.write', description: '编辑任务', category: '任务管理' },
  { id: '9', name: 'task.delete', description: '删除任务', category: '任务管理' },
  { id: '10', name: 'system.admin', description: '系统管理员', category: '系统' },
]

const mockRoles: Role[] = [
  {
    id: '1',
    name: '管理员',
    description: '系统管理员，拥有所有权限',
    permissions: mockPermissions,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '项目经理',
    description: '负责项目管理',
    permissions: mockPermissions.filter(p => p.category === '任务管理' || p.category === '用户管理'),
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: '普通用户',
    description: '普通用户，基本权限',
    permissions: mockPermissions.filter(p => p.name.includes('read')),
    isSystem: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    displayName: '系统管理员',
    roles: [mockRoles[0]],
    status: 'active',
    lastLoginAt: '2024-03-21T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-21T10:00:00Z',
  },
  {
    id: '2',
    username: 'john.doe',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    roles: [mockRoles[1]],
    status: 'active',
    lastLoginAt: '2024-03-20T15:30:00Z',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z',
  },
  {
    id: '3',
    username: 'jane.smith',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    roles: [mockRoles[2]],
    status: 'inactive',
    lastLoginAt: '2024-03-15T08:00:00Z',
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
  },
]

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  roles: [],
  permissions: [],
  loading: false,
  error: null,
  queryParams: {
    page: 1,
    pageSize: 10,
  },
  totalUsers: 0,

  fetchUsers: async (params?: UserQueryParams) => {
    set({ loading: true, error: null })
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const queryParams = { ...get().queryParams, ...params }
      let filteredUsers = [...mockUsers]

      // 应用搜索过滤
      if (queryParams.search) {
        const search = queryParams.search.toLowerCase()
        filteredUsers = filteredUsers.filter(
          u =>
            u.username.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            u.displayName.toLowerCase().includes(search)
        )
      }

      // 应用状态过滤
      if (queryParams.status) {
        filteredUsers = filteredUsers.filter(u => u.status === queryParams.status)
      }

      // 应用角色过滤
      if (queryParams.roleId) {
        filteredUsers = filteredUsers.filter(u =>
          u.roles.some(r => r.id === queryParams.roleId)
        )
      }

      // 分页
      const page = queryParams.page || 1
      const pageSize = queryParams.pageSize || 10
      const start = (page - 1) * pageSize
      const paginatedUsers = filteredUsers.slice(start, start + pageSize)

      set({
        users: paginatedUsers,
        totalUsers: filteredUsers.length,
        queryParams,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取用户列表失败',
        loading: false,
      })
    }
  },

  fetchRoles: async () => {
    set({ loading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      set({ roles: mockRoles, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取角色列表失败',
        loading: false,
      })
    }
  },

  fetchPermissions: async () => {
    set({ loading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      set({ permissions: mockPermissions, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取权限列表失败',
        loading: false,
      })
    }
  },

  createUser: async (user: CreateUserRequest) => {
    set({ loading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const roles = get().roles.filter(r => user.roleIds.includes(r.id))
      const newUser: User = {
        id: Date.now().toString(),
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        roles: roles,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockUsers.push(newUser)
      set({ loading: false })
      get().fetchUsers()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '创建用户失败',
        loading: false,
      })
    }
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    set({ loading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = mockUsers.findIndex(u => u.id === userId)
      if (index !== -1) {
        mockUsers[index] = {
          ...mockUsers[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      }
      set({ loading: false })
      get().fetchUsers()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新用户失败',
        loading: false,
      })
    }
  },

  deleteUser: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = mockUsers.findIndex(u => u.id === userId)
      if (index !== -1) {
        mockUsers.splice(index, 1)
      }
      set({ loading: false })
      get().fetchUsers()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除用户失败',
        loading: false,
      })
    }
  },

  setQueryParams: (params: Partial<UserQueryParams>) => {
    set(state => ({
      queryParams: { ...state.queryParams, ...params },
    }))
  },

  clearError: () => {
    set({ error: null })
  },
}))
