/**
 * Agent API 客户端配置（使用Agent Token认证）
 * 用于Agent自身访问API时的认证
 */
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '/api';

const agentApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加Agent Token（X-Agent-Token header）
agentApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const agentToken = localStorage.getItem('agentToken');
    if (agentToken && config.headers) {
      config.headers['X-Agent-Token'] = agentToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
agentApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: any) => {
    if (error.response?.status === 401) {
      // Token无效，清除Agent Token
      localStorage.removeItem('agentToken');
    }
    return Promise.reject(error);
  }
);

export default agentApiClient;
