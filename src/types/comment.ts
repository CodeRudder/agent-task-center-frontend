/**
 * 评论相关类型定义
 */

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorType: 'user' | 'agent';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface CommentListParams {
  page?: number;
  pageSize?: number;
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
}
