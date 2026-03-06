/**
 * Agent相关类型定义
 */

export enum AgentStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
}

export enum TokenStatus {
  GENERATED = 'generated',
  REVOKED = 'revoked',
  NONE = 'none',
}

export enum AgentType {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  DESIGN = 'design',
  OPERATIONS = 'operations',
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  status: AgentStatus;
  tokenStatus: TokenStatus;
  currentTasks: number;
  maxTasks: number;
  lastActiveAt: string;
  createdAt: string;
  tags: string[];
}

export interface TokenInfo {
  status: TokenStatus;
  createdAt?: string;
  lastUsedAt?: string;
  usageCount?: number;
}

export interface AgentStatistics {
  currentTasks: number;
  maxTasks: number;
  loadRate: number;
  totalTasks: number;
  completionRate: number;
  averageDuration: number;
}

export interface TokenLog {
  id: string;
  agentId: string;
  action: TokenAction;
  operator: string;
  details: string;
  timestamp: string;
}

export enum TokenAction {
  GENERATE = 'generate',
  REGENERATE = 'regenerate',
  REVOKE = 'revoke',
  CREATE_AGENT = 'create_agent',
}
