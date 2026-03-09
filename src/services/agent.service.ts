import api from './api';

export interface Agent {
  id: number;
  name: string;
  type: 'developer' | 'tester' | 'designer' | 'manager';
  status: 'online' | 'offline' | 'busy';
  capabilities: string[];
  maxConcurrentTasks: number;
  currentTaskCount: number;
  lastHeartbeatAt: string;
  createdAt: string;
  apiToken?: string;
}

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
  getAgent: async (id: number): Promise<Agent> => {
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
  updateAgent: async (id: number, data: Partial<Agent>): Promise<Agent> => {
    const response = await api.patch(`/agents/${id}`, data);
    return response.data.data;
  },

  // 删除Agent
  deleteAgent: async (id: number): Promise<void> => {
    await api.delete(`/agents/${id}`);
  },

  // 重新生成Agent Token
  regenerateToken: async (id: number): Promise<{ apiToken: string; expiresAt: string }> => {
    const response = await api.post(`/agents/${id}/api-token/regenerate`);
    return response.data.data;
  },
};
