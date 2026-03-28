import api, { getWithETag } from './api';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export const authService = {
  // 登录
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    // 修复：后端返回格式是 { success: true, data: { accessToken, user } }
    // 需要返回 response.data.data 获取真正的数据
    return response.data.data as AuthResponse;
  },

  // 注册
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // 刷新Token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // 退出登录
  logout: async () => {
    await api.post('/auth/logout');
  },
};
