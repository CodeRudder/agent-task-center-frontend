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

// V5.2 P0: Agent能力标签
export interface AgentCapability {
  id: string;
  agentId: string;
  capability: string;
  proficiency: number; // 1-5 熟练度
  createdAt: string;
}

// V5.2 P0: Agent负载信息
export interface AgentLoad {
  total: number;
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    todo: number;
    in_progress: number;
    review: number;
  };
  loadPercentage: number;
  loadWarning: boolean;
  recommendedCapacity?: number;
}

// V5.2 P0: Agent表现统计
export interface AgentPerformance {
  agentId: string;
  period: string; // last_7_days, last_30_days, last_90_days
  stats: {
    totalTasksAssigned: number;
    completedTasks: number;
    completionRate: number;
    onTimeRate: number;
    avgCompletionTimeHours: number;
    rejectedTasks: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

// V5.2 P0: Agent负载汇总（按状态分布）
export interface AgentLoadSummary {
  online: number;
  offline: number;
  busy: number;
  totalAgents: number;
  totalLoad: number;
  avgLoadPercentage: number;
}

// V5.2 P0: 扩展Agent接口以支持新功能
export interface ExtendedAgent extends Agent {
  currentTaskCount: number;
  maxConcurrentTasks: number;
  loadPercentage: number;
  capabilities: string[];
  performanceScore: number;
  profileImage?: string;
}
