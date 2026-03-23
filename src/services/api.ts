import axios from 'axios';

/**
 * 智能获取API base URL
 * - 生产环境：固定使用相对路径 /api/v1（nginx代理）
 * - 开发环境：优先环境变量，否则使用相对路径 + Vite proxy
 */
const getBaseURL = (): string => {
  // 生产环境构建时，强制使用相对路径
  if (import.meta.env.PROD) {
    return '/api/v1';
  }
  
  // 开发环境：优先使用环境变量，否则使用相对路径（Vite会通过proxy转发）
  return import.meta.env.VITE_API_BASE_URL || '/api/v1';
};

/**
 * Axios实例配置
 */
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器 - 添加JWT token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一错误处理
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转登录
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
