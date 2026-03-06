/**
 * Dashboard 类型定义
 */

// 系统统计
export interface SystemStats {
  totalTasks: number;
  totalAgents: number;
  activeAgents: number;
  totalTokens: number;
  availableTokens: number;
  todayTasks: number;
  todayCompletedTasks: number;
  todayFailedTasks: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

// 任务统计
export interface TaskStatistics {
  todo: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byAssignee: Array<{
    assigneeId: string;
    assigneeName: string;
    count: number;
  }>;
  trends: Array<{
    date: string;
    completed: number;
    created: number;
  }>;
}

// Agent运行状态
export interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'error' | 'stopped';
  lastHeartbeat: string;
  currentTask: string | null;
  uptime: number;
  successCount: number;
  errorCount: number;
  avgExecutionTime: number;
}

// 性能指标
export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: {
    in: number;
    out: number;
  };
  trends: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
    responseTime: number;
  }>;
}
