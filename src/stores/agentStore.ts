/**
 * Agent状态管理
 */
import { create } from 'zustand';
import { Agent, TokenLog, AgentStatistics, PaginatedResponse, FilterParams, PaginationParams } from '@/types';
import AgentService from '@/services/agentService';

interface AgentState {
  // 状态
  agents: Agent[];
  selectedAgents: string[];
  currentAgent: Agent | null;
  tokenLogs: TokenLog[];
  agentStatistics: AgentStatistics | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: FilterParams;

  // Actions
  loadAgents: (params?: PaginationParams & FilterParams) => Promise<void>;
  loadAgent: (id: string) => Promise<void>;
  createAgent: (data: Partial<Agent>) => Promise<Agent>;
  updateAgent: (id: string, data: Partial<Agent>) => Promise<Agent>;
  deleteAgent: (id: string) => Promise<void>;
  generateToken: (agentId: string) => Promise<string>;
  regenerateToken: (agentId: string) => Promise<string>;
  revokeToken: (agentId: string) => Promise<void>;
  batchRevokeTokens: (agentIds: string[]) => Promise<{ success: number; failed: number }>;
  loadTokenLogs: (agentId: string, params?: any) => Promise<void>;
  loadAgentStatistics: (agentId: string) => Promise<void>;
  toggleAgentSelection: (agentId: string) => void;
  toggleAllAgents: () => void;
  clearSelection: () => void;
  setFilters: (filters: FilterParams) => void;
  clearError: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // 初始状态
  agents: [],
  selectedAgents: [],
  currentAgent: null,
  tokenLogs: [],
  agentStatistics: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {},

  // 加载Agent列表
  loadAgents: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const mergedParams = { ...get().filters, ...params };
      const response: PaginatedResponse<Agent> = await AgentService.getAgents(mergedParams);

      set({
        agents: response.items,
        pagination: {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages,
        },
        filters: mergedParams,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载Agent列表失败',
      });
      throw error;
    }
  },

  // 加载Agent详情
  loadAgent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const agent = await AgentService.getAgent(id);
      set({
        currentAgent: agent,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载Agent详情失败',
      });
      throw error;
    }
  },

  // 创建Agent
  createAgent: async (data: Partial<Agent>) => {
    set({ isLoading: true, error: null });
    try {
      const agent = await AgentService.createAgent(data);
      set((state) => ({
        agents: [agent, ...state.agents],
        isLoading: false,
      }));
      return agent;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '创建Agent失败',
      });
      throw error;
    }
  },

  // 更新Agent
  updateAgent: async (id: string, data: Partial<Agent>) => {
    set({ isLoading: true, error: null });
    try {
      const agent = await AgentService.updateAgent(id, data);
      set((state) => ({
        agents: state.agents.map((a) => (a.id === id ? agent : a)),
        currentAgent: state.currentAgent?.id === id ? agent : state.currentAgent,
        isLoading: false,
      }));
      return agent;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '更新Agent失败',
      });
      throw error;
    }
  },

  // 删除Agent
  deleteAgent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await AgentService.deleteAgent(id);
      set((state) => ({
        agents: state.agents.filter((a) => a.id !== id),
        selectedAgents: state.selectedAgents.filter((aid) => aid !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '删除Agent失败',
      });
      throw error;
    }
  },

  // 生成Token
  generateToken: async (agentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = await AgentService.generateToken(agentId);
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, tokenStatus: 'generated' as const } : a
        ),
        currentAgent:
          state.currentAgent?.id === agentId
            ? { ...state.currentAgent, tokenStatus: 'generated' as const }
            : state.currentAgent,
        isLoading: false,
      }));
      return token;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '生成Token失败',
      });
      throw error;
    }
  },

  // 重新生成Token
  regenerateToken: async (agentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = await AgentService.regenerateToken(agentId);
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, tokenStatus: 'generated' as const } : a
        ),
        currentAgent:
          state.currentAgent?.id === agentId
            ? { ...state.currentAgent, tokenStatus: 'generated' as const }
            : state.currentAgent,
        isLoading: false,
      }));
      return token;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '重新生成Token失败',
      });
      throw error;
    }
  },

  // 撤销Token
  revokeToken: async (agentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await AgentService.revokeToken(agentId);
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, tokenStatus: 'revoked' as const } : a
        ),
        currentAgent:
          state.currentAgent?.id === agentId
            ? { ...state.currentAgent, tokenStatus: 'revoked' as const }
            : state.currentAgent,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '撤销Token失败',
      });
      throw error;
    }
  },

  // 批量撤销Token
  batchRevokeTokens: async (agentIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const result = await AgentService.batchRevokeTokens(agentIds);
      set((state) => ({
        agents: state.agents.map((a) =>
          agentIds.includes(a.id) ? { ...a, tokenStatus: 'revoked' as const } : a
        ),
        isLoading: false,
      }));
      return result;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '批量撤销Token失败',
      });
      throw error;
    }
  },

  // 加载Token操作日志
  loadTokenLogs: async (agentId: string, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response: PaginatedResponse<TokenLog> = await AgentService.getTokenLogs(agentId, params);
      set({
        tokenLogs: response.items,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载操作日志失败',
      });
      throw error;
    }
  },

  // 加载Agent统计信息
  loadAgentStatistics: async (agentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const statistics = await AgentService.getAgentStatistics(agentId);
      set({
        agentStatistics: statistics,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载统计信息失败',
      });
      throw error;
    }
  },

  // 切换Agent选择状态
  toggleAgentSelection: (agentId: string) => {
    set((state) => ({
      selectedAgents: state.selectedAgents.includes(agentId)
        ? state.selectedAgents.filter((id) => id !== agentId)
        : [...state.selectedAgents, agentId],
    }));
  },

  // 切换所有Agent选择状态
  toggleAllAgents: () => {
    const { agents, selectedAgents } = get();
    const allSelected = selectedAgents.length === agents.length && agents.length > 0;

    set({
      selectedAgents: allSelected ? [] : agents.map((a) => a.id),
    });
  },

  // 清除选择
  clearSelection: () => {
    set({ selectedAgents: [] });
  },

  // 设置筛选条件
  setFilters: (filters: FilterParams) => {
    set({ filters });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));

export default useAgentStore;
