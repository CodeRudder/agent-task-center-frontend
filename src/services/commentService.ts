/**
 * Comment API 服务
 */
import apiClient from './api';
import {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
  CommentListParams,
  CommentListResponse,
} from '@/types/comment';

export class CommentService {
  /**
   * 获取任务评论列表
   */
  static async getCommentsByTask(
    taskId: string,
    params?: CommentListParams
  ): Promise<CommentListResponse> {
    const response = await apiClient.get(`/comments/task/${taskId}`, { params });
    return response.data;
  }

  /**
   * 获取单个评论
   */
  static async getComment(id: string): Promise<Comment> {
    const response = await apiClient.get(`/comments/${id}`);
    return response.data;
  }

  /**
   * 创建评论
   */
  static async createComment(
    taskId: string,
    data: CreateCommentInput
  ): Promise<Comment> {
    const response = await apiClient.post(`/comments/task/${taskId}`, data);
    return response.data;
  }

  /**
   * 更新评论
   */
  static async updateComment(
    id: string,
    data: UpdateCommentInput
  ): Promise<Comment> {
    const response = await apiClient.patch(`/comments/${id}`, data);
    return response.data;
  }

  /**
   * 删除评论
   */
  static async deleteComment(id: string): Promise<void> {
    await apiClient.delete(`/comments/${id}`);
  }
}

export default CommentService;
