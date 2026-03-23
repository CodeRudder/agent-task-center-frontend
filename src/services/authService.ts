import api from './api';

/**
 * 认证服务 - 负责用户登录、注册、登出等认证相关功能
 */

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * API响应包装
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode: number;
}

/**
 * 用户登录
 * @param credentials 登录凭证
 * @returns 认证响应（包含token和用户信息）
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      // 保存token到localStorage
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || '登录失败');
  } catch (error: any) {
    console.error('登录失败:', error);
    
    // 如果是401错误，提供更友好的提示
    if (error.response?.status === 401) {
      throw new Error('邮箱或密码错误，请重试');
    }
    
    throw error;
  }
};

/**
 * 用户注册
 * @param data 注册信息
 * @returns 认证响应（包含token和用户信息）
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    
    if (response.data.success && response.data.data) {
      // 保存token到localStorage
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || '注册失败');
  } catch (error: any) {
    console.error('注册失败:', error);
    
    // 如果是401错误（邮箱已存在）
    if (error.response?.status === 401) {
      throw new Error('该邮箱已被注册');
    }
    
    throw error;
  }
};

/**
 * 用户登出
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  // 可选：调用后端的登出接口
  // await api.post('/auth/logout');
};

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * 获取存储的token
 * @returns token字符串
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * 检查是否已登录
 * @returns 是否已登录
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * 从API获取最新的用户信息
 * @returns 用户信息
 */
export const fetchUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    
    if (response.data.success && response.data.data) {
      // 更新本地存储的用户信息
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    
    throw new Error(response.data.message || '获取用户信息失败');
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  fetchUserProfile,
};
