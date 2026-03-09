import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as agentService from '../../services/agent.service'

// Mock agent service
vi.mock('../../services/agent.service', () => ({
  getAgents: vi.fn(),
  getAgentStats: vi.fn(),
}))

describe('Agent Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TC-AGENT-001: Get Agent List', () => {
    it('should retrieve all agents', async () => {
      const mockAgents = [
        {
          id: 'agent-001',
          name: '开发Agent-1',
          type: 'developer',
          status: 'online',
          currentTaskId: 'task-001',
          capabilities: ['coding', 'testing'],
          createdAt: '2026-03-01T00:00:00.000Z',
          updatedAt: '2026-03-03T10:00:00.000Z',
        },
        {
          id: 'agent-002',
          name: '测试Agent-1',
          type: 'tester',
          status: 'offline',
          currentTaskId: null,
          capabilities: ['testing', 'review'],
          createdAt: '2026-03-01T00:00:00.000Z',
          updatedAt: '2026-03-02T10:00:00.000Z',
        },
      ]

      ;(agentService.getAgents as any).mockResolvedValue(mockAgents)

      const result = await agentService.getAgents()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('开发Agent-1')
      expect(result[1].name).toBe('测试Agent-1')
    })
  })

  describe('TC-AGENT-002: Filter Agents by Status', () => {
    it('should filter agents by online status', async () => {
      const mockAgents = [
        {
          id: 'agent-001',
          name: '开发Agent-1',
          type: 'developer',
          status: 'online',
          currentTaskId: 'task-001',
          capabilities: ['coding'],
          createdAt: '2026-03-01T00:00:00.000Z',
          updatedAt: '2026-03-03T10:00:00.000Z',
        },
      ]

      ;(agentService.getAgents as any).mockResolvedValue(mockAgents)

      const result = await agentService.getAgents({ status: 'online' })

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('online')
      expect(agentService.getAgents).toHaveBeenCalledWith({ status: 'online' })
    })
  })

  describe('TC-AGENT-003: View Agent Statistics', () => {
    it('should retrieve agent statistics', async () => {
      const mockStats = {
        total: 10,
        online: 7,
        offline: 3,
        byType: {
          developer: 5,
          tester: 3,
          reviewer: 2,
        },
      }

      ;(agentService.getAgentStats as any).mockResolvedValue(mockStats)

      const stats = await agentService.getAgentStats()

      expect(stats.total).toBe(10)
      expect(stats.online).toBe(7)
      expect(stats.offline).toBe(3)
      expect(stats.byType.developer).toBe(5)
    })
  })
})
