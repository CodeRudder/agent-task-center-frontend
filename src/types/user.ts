/**
 * 用户管理RBAC权限系统类型定义
 * 
 * 包含用户、角色、权限相关的类型定义
 */

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',       // 活跃
  INACTIVE = 'inactive',   // 未激活
  SUSPENDED = 'suspended', // 已停用
  LOCKED = 'locked',       // 已锁定
}

/**
 * 角色状态枚举
 */
export enum RoleStatus {
  ACTIVE = 'active',   // 活跃
  DISABLED = 'disabled', // 已禁用
}

/**
 * 权限类型枚举
 */
export enum PermissionType {
  MENU = 'menu',         // 菜单权限
  ACTION = 'action',     // 操作权限
  DATA = 'data',         // 数据权限
  API = 'api',           // API权限
}

/**
 * 权限资源枚举
 */
export enum PermissionResource {
  USER = 'user',         // 用户管理
  ROLE = 'role',         // 角色管理
  PERMISSION = 'permission', // 权限管理
  TASK = 'task',         // 任务管理
  AGENT = 'agent',       // Agent管理
  TEMPLATE = 'template', // 模板管理
  DASHBOARD = 'dashboard', // 仪表盘
  SYSTEM = 'system',     // 系统设置
}

/**
 * 权限操作枚举
 */
export enum PermissionAction {
  CREATE = 'create',     // 创建
  READ = 'read',         // 读取
  UPDATE = 'update',     // 更新
  DELETE = 'delete',     // 删除
  EXPORT = 'export',     // 导出
  IMPORT = 'import',     // 导入
  ASSIGN = 'assign',     // 分配
}

/**
 * 权限定义
 */
export interface Permission {
  id: string;
  code: string;                    // 权限代码，如：user:create
  name: string;                    // 权限名称
  description?: string;            // 权限描述
  type: PermissionType;            // 权限类型
  resource: PermissionResource;    // 权限资源
  action: PermissionAction;        // 权限操作
  parentId?: string;               // 父权限ID
  status: RoleStatus;              // 权限状态
  sortOrder: number;               // 排序
  createdAt: string;               // 创建时间
  updatedAt: string;               // 更新时间
}

/**
 * 角色定义
 */
export interface Role {
  id: string;
  code: string;                    // 角色代码，如：admin
  name: string;                    // 角色名称
  description?: string;            // 角色描述
  permissions: Permission[];       // 权限列表
  status: RoleStatus;              // 角色状态
  isSystem: boolean;               // 是否系统角色（系统角色不可删除）
  userCount?: number;              // 角色下的用户数量
  createdAt: string;               // 创建时间
  updatedAt: string;               // 更新时间
}

/**
 * 用户详细信息（扩展自auth.ts中的User）
 */
export interface UserDetail {
  id: string;
  email: string;
  username?: string;               // 用户名
  name: string;                    // 姓名
  avatar?: string;                 // 头像URL
  phone?: string;                  // 手机号
  department?: string;             // 部门
  position?: string;               // 职位
  role: Role;                      // 用户角色
  status: UserStatus;              // 用户状态
  lastLoginAt?: string;            // 最后登录时间
  lastLoginIp?: string;            // 最后登录IP
  loginCount: number;              // 登录次数
  createdAt: string;               // 创建时间
  updatedAt: string;               // 更新时间
  createdBy?: string;              // 创建人
}

/**
 * 用户列表项（简化版，用于列表展示）
 */
export interface UserListItem {
  id: string;
  email: string;
  username?: string;
  name: string;
  avatar?: string;
  department?: string;
  position?: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  page?: number;                   // 页码
  pageSize?: number;               // 每页数量
  keyword?: string;                // 搜索关键词（邮箱、姓名、用户名）
  status?: UserStatus;             // 状态筛选
  roleId?: string;                 // 角色筛选
  department?: string;             // 部门筛选
  sortBy?: string;                 // 排序字段
  sortOrder?: 'asc' | 'desc';      // 排序方向
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
  users: UserListItem[];
  total: number;                   // 总数
  page: number;                    // 当前页
  pageSize: number;                // 每页数量
  totalPages: number;              // 总页数
}

/**
 * 更新用户角色请求
 */
export interface UpdateUserRoleRequest {
  roleId: string;                  // 新角色ID
  reason?: string;                 // 变更原因
}

/**
 * 更新用户状态请求
 */
export interface UpdateUserStatusRequest {
  status: UserStatus;              // 新状态
  reason?: string;                 // 变更原因
}

/**
 * 角色列表查询参数
 */
export interface RoleListParams {
  status?: RoleStatus;             // 状态筛选
  keyword?: string;                // 搜索关键词
}

/**
 * 权限列表查询参数
 */
export interface PermissionListParams {
  type?: PermissionType;           // 权限类型筛选
  resource?: PermissionResource;   // 权限资源筛选
}

/**
 * 用户操作日志
 */
export interface UserOperationLog {
  id: string;
  userId: string;                  // 操作用户ID
  operatorId: string;              // 操作人ID
  operatorName: string;            // 操作人姓名
  operation: string;               // 操作类型
  details?: string;                // 操作详情（JSON字符串）
  ip: string;                      // 操作IP
  createdAt: string;               // 操作时间
}

/**
 * 用户统计数据
 */
export interface UserStatistics {
  total: number;                   // 总用户数
  active: number;                  // 活跃用户数
  inactive: number;                // 未激活用户数
  suspended: number;               // 已停用用户数
  locked: number;                  // 已锁定用户数
  todayNew: number;                // 今日新增
  todayLogin: number;              // 今日登录
}

/**
 * 角色统计数据
 */
export interface RoleStatistics {
  total: number;                   // 总角色数
  active: number;                  // 活跃角色数
  disabled: number;                // 已禁用角色数
  systemRoles: number;             // 系统角色数
  customRoles: number;             // 自定义角色数
}
