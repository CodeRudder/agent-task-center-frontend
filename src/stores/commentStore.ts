/**
 * Comment状态管理
 */
import { create } from 'zustand';
import {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
  CommentListParams,
  CommentListResponse,
} from '@/types/comment';
import CommentService from '@/services/commentService';

interface CommentState {
  // 状态
  comments: Comment[];
  currentComment: Comment | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // Actions
  loadComments: (taskId: string, params?: CommentListParams) => Promise<void>;
  loadComment: (id: string) => Promise<void>;
  createComment: (taskId: string, data: CreateCommentInput) => Promise<Comment>;
  updateComment: (id: string, data: UpdateCommentInput) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  // 初始状态
  comments: [],
  currentComment: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },

  // 加载评论列表
  loadComments: async (taskId: string, params?: CommentListParams) => {
    set({ isLoading: true, error: null });
    try {
      const response: CommentListResponse = await CommentService.getCommentsByTask(
        taskId,
        params
      );

      const totalPages = Math.ceil(response.total / (params?.pageSize || 20));

      set({
        comments: response.items,
        pagination: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 20,
          total: response.total,
          totalPages,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载评论列表失败',
      });
      throw error;
    }
  },

  // 加载单个评论
  loadComment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const comment = await CommentService.getComment(id);
      set({
        currentComment: comment,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载评论失败',
      });
      throw error;
    }
  },

  // 创建评论
  createComment: async (taskId: string, data: CreateCommentInput) => {
    set({ isLoading: true, error: null });
    try {
      const comment = await CommentService.createComment(taskId, data);
      set((state) => ({
        comments: [comment, ...state.comments],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        isLoading: false,
      }));
      return comment;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '创建评论失败',
      });
      throw error;
    }
  },

  // 更新评论
  updateComment: async (id: string, data: UpdateCommentInput) => {
    set({ isLoading: true, error: null });
    try {
      const comment = await CommentService.updateComment(id, data);
      set((state) => ({
        comments: state.comments.map((c) => (c.id === id ? comment : c)),
        currentComment: state.currentComment?.id === id ? comment : state.currentComment,
        isLoading: false,
      }));
      return comment;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '更新评论失败',
      });
      throw error;
    }
  },

  // 删除评论
  deleteComment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await CommentService.deleteComment(id);
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== id),
        currentComment: state.currentComment?.id === id ? null : state.currentComment,
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1,
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '删除评论失败',
      });
      throw error;
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));

export default useCommentStore;
