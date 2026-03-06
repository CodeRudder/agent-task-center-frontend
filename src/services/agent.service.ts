import api from './api';

export interface Agent {
  id: string;
  name: string;
  type: 'developer' | 'tester' | 'designer' | 'manager';
  status: 'online' | 'offline' | 'busy';
  capabilities: string[];
  maxConcurrentTasks: number;
  currentTaskCount: number;
  lastHeartbeatAt: string;
  createdAt: string;
  apiToken?: string;
  tokenCreatedAt?: string;
  tokenExpiresAt?: string;
}

export const agentService = {
  // 获取Agent列表
  getAgents: async (params?: {
    status?: string;
    type?: string;
  }): Promise<Agent[]> => {
    const response = await api.get('/agents', { params });
    return response.data;
  },

  // 获取Agent详情
  getAgent: async (id: number): Promise<Agent> => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  // 创建Agent
  createAgent: async (data: {
    name: string;
    type: string;
    description?: string;
    capabilities: string[];
    maxConcurrentTasks: number;
  }): Promise<{ success: boolean; data: Agent; timestamp: string }> => {
    const response = await api.post('/agents', data);
    return response.data;
  },

  // 更新Agent
  updateAgent: async (id: number, data: Partial<Agent>): Promise<Agent> => {
    const response = await api.patch(`/agents/${id}`, data);
    return response.data;
  },

  // 删除Agent
  deleteAgent: async (id: number): Promise<void> => {
    await api.delete(`/agents/${id}`);
  },

  // 重新生成Token
  regenerateToken: async (id: number): Promise<{ success: boolean; data: { apiToken: string } }> => {
    const response = await api.post(`/agents/${id}/regenerate-token`);
    return response.data;
  },

  // 撤销Token
  revokeToken: async (id: number): Promise<{ success: boolean }> => {
    const response = await api.post(`/agents/${id}/revoke-token`);
    return response.data;
  },
};
