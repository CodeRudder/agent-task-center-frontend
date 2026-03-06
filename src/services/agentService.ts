/**
 * Agent API 服务
 */
import apiClient from './api';
import {
  Agent,
  TokenInfo,
  TokenLog,
  AgentStatistics,
  PaginatedResponse,
  FilterParams,
  PaginationParams,
} from '@/types';

export class AgentService {
  /**
   * 获取Agent列表
   */
  static async getAgents(
    params?: PaginationParams & FilterParams
  ): Promise<PaginatedResponse<Agent>> {
    const response = await apiClient.get('/admin/agents', { params });
    return response.data;
  }

  /**
   * 获取Agent详情
   */
  static async getAgent(id: string): Promise<Agent> {
    const response = await apiClient.get(`/admin/agents/${id}`);
    return response.data;
  }

  /**
   * 创建Agent
   */
  static async createAgent(data: Partial<Agent>): Promise<Agent> {
    const response = await apiClient.post('/admin/agents', data);
    return response.data;
  }

  /**
   * 更新Agent
   */
  static async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    const response = await apiClient.put(`/admin/agents/${id}`, data);
    return response.data;
  }

  /**
   * 删除Agent
   */
  static async deleteAgent(id: string): Promise<void> {
    await apiClient.delete(`/admin/agents/${id}`);
  }

  /**
   * 生成Token
   */
  static async generateToken(agentId: string): Promise<{ token: string }> {
    const response = await apiClient.post(`/admin/agents/${agentId}/generate-token`);
    return response.data;
  }

  /**
   * 重新生成Token
   */
  static async regenerateToken(agentId: string): Promise<{ token: string }> {
    const response = await apiClient.post(`/admin/agents/${agentId}/regenerate-token`);
    return response.data;
  }

  /**
   * 撤销Token
   */
  static async revokeToken(agentId: string): Promise<void> {
    await apiClient.post(`/admin/agents/${agentId}/revoke-token`);
  }

  /**
   * 批量撤销Token
   */
  static async batchRevokeTokens(agentIds: string[]): Promise<{ success: number; failed: number }> {
    const response = await apiClient.post('/admin/agents/batch-revoke-tokens', { agentIds });
    return response.data;
  }

  /**
   * 获取Token信息
   */
  static async getTokenInfo(agentId: string): Promise<TokenInfo> {
    const response = await apiClient.get(`/admin/agents/${agentId}/token-info`);
    return response.data;
  }

  /**
   * 获取Token操作日志
   */
  static async getTokenLogs(
    agentId: string,
    params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<TokenLog>> {
    const response = await apiClient.get(`/admin/agents/${agentId}/token-logs`, { params });
    return response.data;
  }

  /**
   * 获取Agent统计信息
   */
  static async getAgentStatistics(agentId: string): Promise<AgentStatistics> {
    const response = await apiClient.get(`/admin/agents/${agentId}/statistics`);
    return response.data;
  }
}

export default AgentService;
