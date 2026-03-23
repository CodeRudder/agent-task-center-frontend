import api from './api';
import type { VoteResponse, VoteStats, CreateVoteDto } from '../types/vote';

/**
 * 投票服务
 */
export class VoteService {
  /**
   * 对任务投票
   */
  static async vote(taskId: string, voteType: 'upvote' | 'downvote'): Promise<VoteResponse> {
    const dto: CreateVoteDto = {
      taskId,
      voteType,
    };
    const response = await api.post<VoteResponse>(`/tasks/${taskId}/votes`, dto);
    return response.data;
  }

  /**
   * 取消投票
   * 
   * 注意：后端当前没有取消投票的API
   * 这里通过投反对票来模拟（临时方案）
   */
  static async unvote(taskId: string): Promise<void> {
    // 后端没有取消投票API，暂时不实现
    // 可以考虑通过更新投票类型为null或其他方式
    console.warn(`unvote API not implemented in backend yet for task: ${taskId}`);
  }

  /**
   * 获取任务的投票统计
   */
  static async getVoteStats(taskId: string): Promise<VoteStats> {
    const response = await api.get<VoteStats>(`/tasks/${taskId}/votes`);
    return response.data;
  }

  /**
   * 获取当前用户对任务的投票
   */
  static async getUserVote(taskId: string): Promise<VoteResponse | null> {
    try {
      const response = await api.get<VoteResponse | null>(`/tasks/${taskId}/votes/me`);
      return response.data;
    } catch {
      // 如果没有投票记录，返回null
      return null;
    }
  }
}

export default VoteService;
