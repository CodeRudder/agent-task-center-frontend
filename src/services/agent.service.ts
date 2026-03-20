import api from './api';
import { Agent } from '@/types';

export const agentService = {
  // 获取Agent列表
  getAgents: async (params?: {
    status?: string;
    type?: string;
  }): Promise<Agent[]> => {
    const response = await api.get('/agents', { params });
    return response.data.data.items;
  },

  // 获取Agent详情
  getAgent: async (id: number | string): Promise<Agent> => {
    const response = await api.get(`/agents/${id}`);
    return response.data.data;
  },

  // 创建Agent
  createAgent: async (data: {
    name: string;
    type: string;
    capabilities: string[];
    maxConcurrentTasks: number;
  }): Promise<Agent> => {
    const response = await api.post('/agents', data);
    return response.data.data;
  },

  // 更新Agent
  updateAgent: async (id: number | string, data: Partial<Agent>): Promise<Agent> => {
    const response = await api.patch(`/agents/${id}`, data);
    return response.data.data;
  },

  // 删除Agent
  deleteAgent: async (id: number | string): Promise<void> => {
    await api.delete(`/agents/${id}`);
  },

  // 重新生成Agent Token
  regenerateToken: async (id: number | string): Promise<{ apiToken: string; expiresAt: string }> => {
    const response = await api.post(`/agents/${id}/api-token/regenerate`);
    return response.data.data;
  },

  // 撤销Agent Token
  revokeToken: async (id: number | string): Promise<void> => {
    await api.delete(`/agents/${id}/api-token`);
  },
};
