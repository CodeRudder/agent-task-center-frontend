/**
 * Axios API 客户端配置
 */
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和Token刷新
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * 带ETag缓存的GET请求
 */
export const getWithETag = async <T = any>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const etagKey = `etag:${url}`;
  const storedEtag = localStorage.getItem(etagKey);

  const requestConfig: InternalAxiosRequestConfig = {
    ...config,
  };

  // 添加If-None-Match头
  if (storedEtag) {
    if (!requestConfig.headers) {
      requestConfig.headers = {} as any;
    }
    (requestConfig.headers as any)['If-None-Match'] = storedEtag;
  }

  const response = await apiClient.get<T>(url, requestConfig);

  // 如果返回新数据，存储ETag
  if (response.status === 200 && response.headers['etag']) {
    localStorage.setItem(etagKey, response.headers['etag']);
  }

  return response;
};

export default apiClient;
