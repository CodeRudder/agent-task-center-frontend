/**
 * V5.3 P2-5: Reports & Statistics API 服务
 */
import apiClient from './api';
import {
  TaskStatistics,
  WorkloadStatistics,
  TrendStatistics,
  StatisticsFilters,
  ExportDataRequest,
} from '@/types/statistics';
import { saveAs } from 'file-saver';

/**
 * 统计服务
 */
export class StatisticsService {
  /**
   * 获取任务统计数据
   */
  static async getTaskStatistics(filters?: StatisticsFilters): Promise<TaskStatistics> {
    const response = await apiClient.get('/api/v1/statistics/tasks', { params: filters });
    return response.data;
  }

  /**
   * 获取工作量统计数据
   */
  static async getWorkloadStatistics(filters?: StatisticsFilters): Promise<WorkloadStatistics[]> {
    const response = await apiClient.get('/api/v1/statistics/workload', { params: filters });
    return response.data;
  }

  /**
   * 获取趋势统计数据
   */
  static async getTrendStatistics(
    period: 'day' | 'week' | 'month',
    filters?: StatisticsFilters
  ): Promise<TrendStatistics> {
    const response = await apiClient.get('/api/v1/statistics/trends', {
      params: { ...filters, period },
    });
    return response.data;
  }

  /**
   * 导出统计数据为CSV
   */
  static async exportToCSV(type: 'tasks' | 'workload' | 'trends', filters?: StatisticsFilters): Promise<void> {
    try {
      const response = await apiClient.get('/api/v1/statistics/export/csv', {
        params: { type, ...filters },
        responseType: 'blob',
      });

      // 从响应头获取文件名
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${type}_statistics.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // 使用file-saver保存文件
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Export CSV failed:', error);
      throw error;
    }
  }

  /**
   * 导出统计数据为Excel
   */
  static async exportToExcel(type: 'tasks' | 'workload' | 'trends', filters?: StatisticsFilters): Promise<void> {
    try {
      const response = await apiClient.get('/api/v1/statistics/export/excel', {
        params: { type, ...filters },
        responseType: 'blob',
      });

      // 从响应头获取文件名
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${type}_statistics.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // 使用file-saver保存文件
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Export Excel failed:', error);
      throw error;
    }
  }
}

export default StatisticsService;
