import api from './api';

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  mentions?: Mention[];
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Mention {
  id: string;
  name: string;
}

export interface CreateCommentDTO {
  content: string;
  mentions?: string[];
}

export interface UpdateCommentDTO {
  content: string;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}

export const commentService = {
  // 获取任务评论列表
  getComments: async (taskId: string, page = 1, limit = 20): Promise<CommentListResponse> => {
    const response = await api.get<CommentListResponse>(`/tasks/${taskId}/comments`, {
      params: { page, limit }
    });
    return response.data;
  },

  // 创建评论
  createComment: async (taskId: string, data: CreateCommentDTO): Promise<Comment> => {
    const response = await api.post<Comment>(`/tasks/${taskId}/comments`, data);
    return response.data;
  },

  // 更新评论
  updateComment: async (commentId: string, data: UpdateCommentDTO): Promise<Comment> => {
    const response = await api.put<Comment>(`/comments/${commentId}`, data);
    return response.data;
  },

  // 删除评论
  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },

  // 获取评论历史
  getCommentHistory: async (commentId: string): Promise<any[]> => {
    const response = await api.get(`/comments/${commentId}/history`);
    return response.data;
  },
};
