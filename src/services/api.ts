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
    
    // 先设置 Authorization 头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 🔍 调试日志（在设置 Authorization 头之后）
    console.log('🔍 ========== API Request Debug ==========');
    console.log('🔍 Request URL:', config.url);
    console.log('🔍 Request Method:', config.method);
    console.log('🔍 Request Headers:', config.headers);
    console.log('🔍 Authorization Header:', config.headers?.Authorization);
    console.log('🔍 Token from localStorage:', token ? `${token.substring(0, 50)}...` : 'NO TOKEN');
    console.log('🔍 =====================================');
    
    // 💾 将调试日志保存到 localStorage（供 QA 读取）
    try {
      const debugLog = {
        timestamp: new Date().toISOString(),
        url: config.url,
        method: config.method,
        hasAuthHeader: !!config.headers?.Authorization,
        authHeaderValue: config.headers?.Authorization || 'NO AUTH HEADER',
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 50)}...` : 'NO TOKEN'
      };
      
      // 保存最近10条日志
      const logs = JSON.parse(localStorage.getItem('__API_DEBUG_LOGS__') || '[]');
      logs.push(debugLog);
      if (logs.length > 10) logs.shift();
      localStorage.setItem('__API_DEBUG_LOGS__', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save debug log to localStorage:', e);
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
    // 🔍 详细错误日志
    console.error('🔍 ========== API Response Error ==========');
    console.error('🔍 Request URL:', error.config?.url);
    console.error('🔍 Request Method:', error.config?.method);
    console.error('🔍 Error Status:', error.response?.status);
    console.error('🔍 Error Status Text:', error.response?.statusText);
    console.error('🔍 Error Data:', error.response?.data);
    console.error('🔍 Error Message:', error.message);
    console.error('🔍 =====================================');

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
