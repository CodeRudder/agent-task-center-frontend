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
  AgentCapability,
  AgentLoad,
  AgentPerformance,
  AgentLoadSummary,
  ExtendedAgent,
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
   * 获取Agent列表（含负载信息）- V5.2 P0
   */
  static async getAgentsWithLoad(
    params?: PaginationParams & FilterParams
  ): Promise<PaginatedResponse<ExtendedAgent>> {
    const response = await apiClient.get('/api/v1/agents', { params });
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
   * 获取Agent详情（含能力标签）- V5.2 P0
   */
  static async getAgentDetails(id: string): Promise<ExtendedAgent> {
    const response = await apiClient.get(`/api/v1/agents/${id}`);
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

  // ============ V5.2 P0 新增API ============

  /**
   * 获取Agent负载详情 - V5.2 P0
   */
  static async getAgentLoad(agentId: string): Promise<AgentLoad> {
    const response = await apiClient.get(`/api/v1/agents/${agentId}/load`);
    return response.data;
  }

  /**
   * 获取负载汇总 - V5.2 P0
   */
  static async getLoadSummary(): Promise<AgentLoadSummary> {
    const response = await apiClient.get('/api/v1/agents/load-summary');
    return response.data;
  }

  /**
   * 获取Agent表现统计 - V5.2 P0
   */
  static async getAgentPerformance(
    agentId: string,
    period: string = 'last_30_days'
  ): Promise<AgentPerformance> {
    const response = await apiClient.get(`/api/v1/agents/${agentId}/performance`, {
      params: { period },
    });
    return response.data;
  }

  /**
   * 获取Agent表现排行榜 - V5.2 P0
   */
  static async getPerformanceRanking(params?: {
    period?: string;
    sortBy?: 'completionRate' | 'onTimeRate' | 'avgCompletionTimeHours';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ agents: Array<{ agent: ExtendedAgent; performance: AgentPerformance }> }> {
    const response = await apiClient.get('/api/v1/agents/performance-ranking', { params });
    return response.data;
  }

  /**
   * 添加Agent能力标签 - V5.2 P0
   */
  static async addCapability(
    agentId: string,
    capability: string,
    proficiency: number = 3
  ): Promise<AgentCapability> {
    const response = await apiClient.post(`/api/v1/agents/${agentId}/capabilities`, {
      capability,
      proficiency,
    });
    return response.data;
  }

  /**
   * 删除Agent能力标签 - V5.2 P0
   */
  static async removeCapability(agentId: string, capId: string): Promise<void> {
    await apiClient.delete(`/api/v1/agents/${agentId}/capabilities/${capId}`);
  }

  /**
   * 获取Agent能力标签列表 - V5.2 P0
   */
  static async getCapabilities(agentId: string): Promise<AgentCapability[]> {
    const response = await apiClient.get(`/api/v1/agents/${agentId}/capabilities`);
    return response.data;
  }
}

export default AgentService;

  /**
   * 验证Agent Token - V5.0 P0-1 (基于Dev1 f3b18f6修复)
   * 使用 X-Agent-Token header（不是 Authorization: Bearer）
   * 正确路径：/api/v1/agent/auth/verify
   */
  static async verifyAgentToken(): Promise<{
    success: boolean;
    data?: {
      id: string;
      name: string;
      status: string;
      role: string;
      type: string;
    };
    message: string;
  }> {
    // 使用专用的agentApiClient（不是apiClient）
    const agentApiClient = await import('./agentApi').then(m => m.default);
    const response = await agentApiClient.get('/agent/auth/verify');
    return response.data;
  }

  /**
   * 验证Agent Token - 别名方法（PM要求的接口）
   * @deprecated 使用 verifyAgentToken 代替
   * V5.0 P0-1 (基于Dev1 f3b18f6修复)
   * 使用 X-Agent-Token header（不是 Authorization: Bearer）
   * 正确路径：/api/v1/agent/auth/verify
   */
  static async verifyAgent(token?: string): Promise<{
    success: boolean;
    data?: {
      id: string;
      name: string;
      status: string;
      role: string;
      type: string;
    };
    message: string;
  }> {
    // 使用专用的agentApiClient（不是apiClient）
    const agentApiClient = await import('./agentApi').then(m => m.default);
    const response = await agentApiClient.get('/agent/auth/verify');
    return response.data;
  }
}
