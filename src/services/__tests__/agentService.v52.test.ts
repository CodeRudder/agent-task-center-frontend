/**
 * AgentService V5.2 P0 测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgentService from '../agentService';
import apiClient from '../api';

// Mock apiClient
vi.mock('../api');

describe('AgentService V5.2 P0', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAgentsWithLoad', () => {
    it('应该成功获取Agent列表（含负载信息）', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: '1',
              name: 'Agent 1',
              type: 'development',
              status: 'online',
              currentTaskCount: 3,
              maxConcurrentTasks: 5,
              loadPercentage: 60,
              capabilities: ['React', 'Node.js'],
              performanceScore: 4.5,
            },
          ],
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await AgentService.getAgentsWithLoad({ page: 1 });

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/agents', {
        params: { page: 1 },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].loadPercentage).toBe(60);
    });
  });

  describe('getAgentDetails', () => {
    it('应该成功获取Agent详情（含能力标签）', async () => {
      const mockAgent = {
        id: '1',
        name: 'Agent 1',
        type: 'development',
        status: 'online',
        currentTaskCount: 3,
        maxConcurrentTasks: 5,
        loadPercentage: 60,
        capabilities: ['React', 'Node.js'],
        performanceScore: 4.5,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAgent });

      const result = await AgentService.getAgentDetails('1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/agents/1');
      expect(result.capabilities).toEqual(['React', 'Node.js']);
      expect(result.performanceScore).toBe(4.5);
    });
  });

  describe('getAgentLoad', () => {
    it('应该成功获取Agent负载详情', async () => {
      const mockLoad = {
        total: 3,
        byPriority: {
          urgent: 1,
          high: 1,
          medium: 1,
          low: 0,
        },
        byStatus: {
          todo: 1,
          in_progress: 2,
          review: 0,
        },
        loadPercentage: 60,
        loadWarning: false,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockLoad });

      const result = await AgentService.getAgentLoad('1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/agents/1/load');
      expect(result.total).toBe(3);
      expect(result.loadPercentage).toBe(60);
    });
  });

  describe('getLoadSummary', () => {
    it('应该成功获取负载汇总', async () => {
      const mockSummary = {
        online: 5,
        offline: 2,
        busy: 3,
        totalAgents: 10,
        totalLoad: 25,
        avgLoadPercentage: 50,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSummary });

      const result = await AgentService.getLoadSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/agents/load-summary');
      expect(result.totalAgents).toBe(10);
      expect(result.avgLoadPercentage).toBe(50);
    });
  });

  describe('getAgentPerformance', () => {
    it('应该成功获取Agent表现统计', async () => {
      const mockPerformance = {
        agentId: '1',
        period: 'last_30_days',
        stats: {
          totalTasksAssigned: 25,
          completedTasks: 23,
          completionRate: 0.92,
          onTimeRate: 0.87,
          avgCompletionTimeHours: 4.5,
          rejectedTasks: 2,
        },
        trend: 'improving',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPerformance });

      const result = await AgentService.getAgentPerformance('1', 'last_30_days');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/agents/1/performance', {
        params: { period: 'last_30_days' },
      });
      expect(result.stats.completionRate).toBe(0.92);
      expect(result.trend).toBe('improving');
    });
  });

  describe('getPerformanceRanking', () => {
    it('应该成功获取Agent表现排行榜', async () => {
      const mockRanking = {
        agents: [
          {
            agent: {
              id: '1',
              name: 'Agent 1',
              performanceScore: 4.8,
            },
            performance: {
              stats: {
                totalTasksAssigned: 30,
                completedTasks: 29,
                completionRate: 0.97,
                onTimeRate: 0.95,
                avgCompletionTimeHours: 4.0,
                rejectedTasks: 1,
              },
              trend: 'improving',
            },
          },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockRanking });

      const result = await AgentService.getPerformanceRanking({
        period: 'last_30_days',
        sortBy: 'completionRate',
        sortOrder: 'desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/agents/performance-ranking', {
        params: {
          period: 'last_30_days',
          sortBy: 'completionRate',
          sortOrder: 'desc',
        },
      });
      expect(result.agents).toHaveLength(1);
    });
  });

  describe('addCapability', () => {
    it('应该成功添加能力标签', async () => {
      const mockCapability = {
        id: '1',
        agentId: '1',
        capability: 'React',
        proficiency: 4,
        createdAt: '2026-03-08T00:00:00Z',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockCapability });

      const result = await AgentService.addCapability('1', 'React', 4);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/agents/1/capabilities', {
        capability: 'React',
        proficiency: 4,
      });
      expect(result.capability).toBe('React');
      expect(result.proficiency).toBe(4);
    });
  });

  describe('removeCapability', () => {
    it('应该成功删除能力标签', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: null });

      await AgentService.removeCapability('1', 'cap-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/agents/1/capabilities/cap-1');
    });
  });

  describe('getCapabilities', () => {
    it('应该成功获取Agent能力标签列表', async () => {
      const mockCapabilities = [
        {
          id: '1',
          agentId: '1',
          capability: 'React',
          proficiency: 4,
          createdAt: '2026-03-08T00:00:00Z',
        },
        {
          id: '2',
          agentId: '1',
          capability: 'Node.js',
          proficiency: 3,
          createdAt: '2026-03-08T00:00:00Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCapabilities });

      const result = await AgentService.getCapabilities('1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/agents/1/capabilities');
      expect(result).toHaveLength(2);
    });
  });
});
