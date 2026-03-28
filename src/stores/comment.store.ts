import { create } from 'zustand';
import { commentService, Comment, CreateCommentDTO, UpdateCommentDTO } from '../services/comment.service';

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  
  // 获取评论列表
  fetchComments: (taskId: string, page?: number) => Promise<void>;
  
  // 创建评论
  createComment: (taskId: string, data: CreateCommentDTO) => Promise<void>;
  
  // 更新评论
  updateComment: (commentId: string, data: UpdateCommentDTO) => Promise<void>;
  
  // 删除评论
  deleteComment: (commentId: string) => Promise<void>;
  
  // 清空评论
  clearComments: () => void;
  
  // 设置错误
  setError: (error: string | null) => void;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  
  // 获取评论列表
  fetchComments: async (taskId: string, page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await commentService.getComments(taskId, page);
      set({
        comments: response.comments,
        total: response.total,
        page: response.page,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '获取评论失败',
        loading: false,
      });
    }
  },
  
  // 创建评论
  createComment: async (taskId: string, data: CreateCommentDTO) => {
    set({ loading: true, error: null });
    try {
      const newComment = await commentService.createComment(taskId, data);
      set((state) => ({
        comments: [newComment, ...state.comments],
        total: state.total + 1,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '创建评论失败',
        loading: false,
      });
      throw error;
    }
  },
  
  // 更新评论
  updateComment: async (commentId: string, data: UpdateCommentDTO) => {
    set({ loading: true, error: null });
    try {
      const updatedComment = await commentService.updateComment(commentId, data);
      set((state) => ({
        comments: state.comments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '更新评论失败',
        loading: false,
      });
      throw error;
    }
  },
  
  // 删除评论
  deleteComment: async (commentId: string) => {
    set({ loading: true, error: null });
    try {
      await commentService.deleteComment(commentId);
      set((state) => ({
        comments: state.comments.filter((comment) => comment.id !== commentId),
        total: state.total - 1,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '删除评论失败',
        loading: false,
      });
      throw error;
    }
  },
  
  // 清空评论
  clearComments: () => {
    set({
      comments: [],
      total: 0,
      page: 1,
      error: null,
    });
  },
  
  // 设置错误
  setError: (error: string | null) => {
    set({ error });
  },
}));
