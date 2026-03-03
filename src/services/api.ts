import axios from 'axios';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加Token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 错误处理和ETag自动保存
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 自动保存ETag
    if (response.headers.etag) {
      const url = response.config.url || '';
      localStorage.setItem(`etag:${url}`, response.headers.etag);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，跳转登录页
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 封装GET请求（支持ETag）
export const getWithETag = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<{ data: T; status: number }> => {
  const etag = localStorage.getItem(`etag:${url}`);
  const headers: any = config?.headers || {};
  
  if (etag) {
    headers['If-None-Match'] = etag;
  }

  const response = await api.get<T>(url, { ...config, headers });
  return { data: response.data, status: response.status };
};

export default api;
