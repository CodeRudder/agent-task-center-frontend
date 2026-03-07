import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCommentStore } from '../commentStore';
import { Comment } from '@/types/comment';

// Mock the CommentService
vi.mock('@/services/commentService', () => ({
  default: {
    getCommentsByTask: vi.fn(),
    getComment: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

import CommentService from '@/services/commentService';

describe('useCommentStore', () => {
  const mockComment: Comment = {
    id: '1',
    content: 'Test comment',
    taskId: 'task-1',
    authorId: 'user-1',
    authorName: 'Test User',
    authorType: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset store state
    useCommentStore.setState({
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
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('初始状态测试', () => {
    it('应该有正确的初始状态', () => {
      const state = useCommentStore.getState();
      
      expect(state.comments).toEqual([]);
      expect(state.currentComment).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.pagination).toEqual({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe('loadComments测试', () => {
    it('应该成功加载评论列表', async () => {
      const mockResponse = {
        items: [mockComment],
        total: 1,
      };
      
      (CommentService.getCommentsByTask as any).mockResolvedValue(mockResponse);

      const { loadComments } = useCommentStore.getState();
      await loadComments('task-1');

      const state = useCommentStore.getState();
      
      expect(state.comments).toEqual([mockComment]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(CommentService.getCommentsByTask).toHaveBeenCalledWith('task-1', undefined);
    });

    it('应该支持分页参数', async () => {
      const mockResponse = {
        items: [mockComment],
        total: 25,
      };
      
      (CommentService.getCommentsByTask as any).mockResolvedValue(mockResponse);

      const { loadComments } = useCommentStore.getState();
      await loadComments('task-1', { page: 2, pageSize: 10 });

      const state = useCommentStore.getState();
      
      expect(state.pagination.page).toBe(2);
      expect(state.pagination.pageSize).toBe(10);
      expect(state.pagination.total).toBe(25);
      expect(state.pagination.totalPages).toBe(3);
      expect(CommentService.getCommentsByTask).toHaveBeenCalledWith('task-1', {
        page: 2,
        pageSize: 10,
      });
    });

    it('加载失败应该设置错误信息', async () => {
      const mockError = new Error('Network error');
      (CommentService.getCommentsByTask as any).mockRejectedValue(mockError);

      const { loadComments } = useCommentStore.getState();
      
      await expect(loadComments('task-1')).rejects.toThrow();

      const state = useCommentStore.getState();
      
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('加载评论列表失败');
    });
  });

  describe('loadComment测试', () => {
    it('应该成功加载单个评论', async () => {
      (CommentService.getComment as any).mockResolvedValue(mockComment);

      const { loadComment } = useCommentStore.getState();
      await loadComment('1');

      const state = useCommentStore.getState();
      
      expect(state.currentComment).toEqual(mockComment);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(CommentService.getComment).toHaveBeenCalledWith('1');
    });

    it('加载失败应该设置错误信息', async () => {
      const mockError = new Error('Network error');
      (CommentService.getComment as any).mockRejectedValue(mockError);

      const { loadComment } = useCommentStore.getState();
      
      await expect(loadComment('1')).rejects.toThrow();

      const state = useCommentStore.getState();
      
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('加载评论失败');
    });
  });

  describe('createComment测试', () => {
    it('应该成功创建评论', async () => {
      (CommentService.createComment as any).mockResolvedValue(mockComment);

      const { createComment } = useCommentStore.getState();
      await createComment('task-1', { content: 'Test comment' });

      const state = useCommentStore.getState();
      
      expect(state.comments).toHaveLength(1);
      expect(state.comments[0]).toEqual(mockComment);
      expect(state.pagination.total).toBe(1);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(CommentService.createComment).toHaveBeenCalledWith('task-1', {
        content: 'Test comment',
      });
    });

    it('创建失败应该设置错误信息', async () => {
      const mockError = new Error('Network error');
      (CommentService.createComment as any).mockRejectedValue(mockError);

      const { createComment } = useCommentStore.getState();
      
      await expect(
        createComment('task-1', { content: 'Test comment' })
      ).rejects.toThrow();

      const state = useCommentStore.getState();
      
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('创建评论失败');
    });
  });

  describe('updateComment测试', () => {
    it('应该成功更新评论', async () => {
      const updatedComment = {
        ...mockComment,
        content: 'Updated content',
      };
      
      (CommentService.updateComment as any).mockResolvedValue(updatedComment);

      useCommentStore.setState({ comments: [mockComment] });

      const { updateComment } = useCommentStore.getState();
      await updateComment('1', { content: 'Updated content' });

      const state = useCommentStore.getState();
      
      expect(state.comments[0]).toEqual(updatedComment);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(CommentService.updateComment).toHaveBeenCalledWith('1', {
        content: 'Updated content',
      });
    });

    it('应该更新currentComment', async () => {
      const updatedComment = {
        ...mockComment,
        content: 'Updated content',
      };
      
      (CommentService.updateComment as any).mockResolvedValue(updatedComment);

      useCommentStore.setState({
        comments: [mockComment],
        currentComment: mockComment,
      });

      const { updateComment } = useCommentStore.getState();
      await updateComment('1', { content: 'Updated content' });

      const state = useCommentStore.getState();
      
      expect(state.currentComment).toEqual(updatedComment);
    });

    it('更新失败应该设置错误信息', async () => {
      const mockError = new Error('Network error');
      (CommentService.updateComment as any).mockRejectedValue(mockError);

      const { updateComment } = useCommentStore.getState();
      
      await expect(
        updateComment('1', { content: 'Updated content' })
      ).rejects.toThrow();

      const state = useCommentStore.getState();
      
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('更新评论失败');
    });
  });

  describe('deleteComment测试', () => {
    it('应该成功删除评论', async () => {
      (CommentService.deleteComment as any).mockResolvedValue(undefined);

      useCommentStore.setState({ comments: [mockComment] });

      const { deleteComment } = useCommentStore.getState();
      await deleteComment('1');

      const state = useCommentStore.getState();
      
      expect(state.comments).toHaveLength(0);
      expect(state.pagination.total).toBe(-1);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(CommentService.deleteComment).toHaveBeenCalledWith('1');
    });

    it('应该从currentComment中删除', async () => {
      (CommentService.deleteComment as any).mockResolvedValue(undefined);

      useCommentStore.setState({
        comments: [mockComment],
        currentComment: mockComment,
      });

      const { deleteComment } = useCommentStore.getState();
      await deleteComment('1');

      const state = useCommentStore.getState();
      
      expect(state.currentComment).toBeNull();
    });

    it('删除失败应该设置错误信息', async () => {
      const mockError = new Error('Network error');
      (CommentService.deleteComment as any).mockRejectedValue(mockError);

      const { deleteComment } = useCommentStore.getState();
      
      await expect(deleteComment('1')).rejects.toThrow();

      const state = useCommentStore.getState();
      
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('删除评论失败');
    });
  });

  describe('clearError测试', () => {
    it('应该清除错误信息', () => {
      useCommentStore.setState({ error: 'Test error' });

      const { clearError } = useCommentStore.getState();
      clearError();

      const state = useCommentStore.getState();
      
      expect(state.error).toBeNull();
    });
  });
});
