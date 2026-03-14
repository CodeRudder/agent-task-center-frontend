/**
 * V5.3 P2-5: Reports & Statistics 类型定义
 */

/**
 * 任务统计数据
 */
export interface TaskStatistics {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  blocked: number;
  cancelled: number;
  overdue: number;
  completionRate: number;
  avgCompletionTime: number; // 平均完成时间（小时）
}

/**
 * 工作量统计数据
 */
export interface WorkloadStatistics {
  userId: string;
  userName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgCompletionTime: number; // 平均完成时间（小时）
  workloadScore: number; // 工作量评分（0-100）
}

/**
 * 趋势数据点
 */
export interface TrendDataPoint {
  date: string;
  total: number;
  completed: number;
  created: number;
  overdue: number;
}

/**
 * 趋势统计数据
 */
export interface TrendStatistics {
  period: 'day' | 'week' | 'month';
  data: TrendDataPoint[];
  summary: {
    avgCompletionRate: number;
    avgTasksPerDay: number;
    trend: 'up' | 'down' | 'stable';
  };
}

/**
 * 统计过滤器
 */
export interface StatisticsFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  categoryId?: string;
  tagId?: string;
}

/**
 * 导出数据请求
 */
export interface ExportDataRequest {
  type: 'tasks' | 'workload' | 'trends';
  format: 'csv' | 'excel';
  filters?: StatisticsFilters;
}

/**
 * 统计图表数据
 */
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
  }[];
}
