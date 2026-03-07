import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentItem } from '../CommentItem';
import { Comment } from '@/types/comment';

describe('CommentItem', () => {
  const mockComment: Comment = {
    id: '1',
    content: 'This is a test comment',
    taskId: 'task-1',
    authorId: 'user-1',
    authorName: 'Test User',
    authorType: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultProps = {
    comment: mockComment,
    currentUserId: 'user-1',
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  describe('渲染测试', () => {
    it('应该正确渲染评论内容', () => {
      render(<CommentItem {...defaultProps} />);

      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('应该显示用户图标', () => {
      render(<CommentItem {...defaultProps} />);

      const userIcon = document.querySelector('[data-lucide="user"]');
      expect(userIcon).toBeInTheDocument();
    });

    it('应该显示AI助手标记', () => {
      const agentComment: Comment = {
        ...mockComment,
        authorType: 'agent',
      };

      render(<CommentItem {...defaultProps} comment={agentComment} />);

      expect(screen.getByText('AI助手')).toBeInTheDocument();
    });

    it('当前用户是作者时应该显示编辑和删除菜单', () => {
      render(<CommentItem {...defaultProps} />);

      const menuButton = document.querySelector('[aria-label="更多操作"]');
      expect(menuButton).toBeInTheDocument();
    });

    it('当前用户不是作者时不应该显示编辑和删除菜单', () => {
      render(
        <CommentItem
          {...defaultProps}
          currentUserId="different-user"
        />
      );

      const menuButton = document.querySelector('[aria-label="更多操作"]');
      expect(menuButton).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击菜单按钮应该显示菜单', () => {
      render(<CommentItem {...defaultProps} />);

      const menuButton = document.querySelector('[aria-label="更多操作"]') as HTMLElement;
      fireEvent.click(menuButton);

      expect(screen.getByText('编辑')).toBeInTheDocument();
      expect(screen.getByText('删除')).toBeInTheDocument();
    });

    it('点击编辑应该调用onEdit', () => {
      render(<CommentItem {...defaultProps} />);

      const menuButton = document.querySelector('[aria-label="更多操作"]') as HTMLElement;
      fireEvent.click(menuButton);

      const editButton = screen.getByText('编辑');
      fireEvent.click(editButton);

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockComment);
    });

    it('点击删除应该调用onDelete', () => {
      render(<CommentItem {...defaultProps} />);

      const menuButton = document.querySelector('[aria-label="更多操作"]') as HTMLElement;
      fireEvent.click(menuButton);

      const deleteButton = screen.getByText('删除');
      fireEvent.click(deleteButton);

      expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
    });

    it('点击外部应该关闭菜单', () => {
      render(<CommentItem {...defaultProps} />);

      const menuButton = document.querySelector('[aria-label="更多操作"]') as HTMLElement;
      fireEvent.click(menuButton);

      expect(screen.getByText('编辑')).toBeInTheDocument();

      const overlay = document.querySelector('.fixed.inset-0') as HTMLElement;
      fireEvent.click(overlay);

      expect(screen.queryByText('编辑')).not.toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('当没有onEdit时不应该显示编辑选项', () => {
      const props = {
        ...defaultProps,
        onEdit: undefined,
      };

      render(<CommentItem {...props} />);

      const menuButton = document.querySelector('[aria-label="更多操作"]') as HTMLElement;
      fireEvent.click(menuButton);

      expect(screen.queryByText('编辑')).not.toBeInTheDocument();
      expect(screen.getByText('删除')).toBeInTheDocument();
    });

    it('当没有onDelete时不应该显示删除选项', () => {
      const props = {
        ...defaultProps,
        onDelete: undefined,
      };

      render(<CommentItem {...props} />);

      const menuButton = document.querySelector('[aria-label="更多操作"]') as HTMLElement;
      fireEvent.click(menuButton);

      expect(screen.queryByText('删除')).not.toBeInTheDocument();
      expect(screen.getByText('编辑')).toBeInTheDocument();
    });

    it('应该正确处理编辑过的评论', () => {
      const editedComment: Comment = {
        ...mockComment,
        content: 'Updated comment',
        updatedAt: new Date(Date.now() + 100000).toISOString(),
      };

      render(<CommentItem {...defaultProps} comment={editedComment} />);

      expect(screen.getByText('Updated comment')).toBeInTheDocument();
      expect(screen.getByText(/已于.*编辑/)).toBeInTheDocument();
    });

    it('应该处理长文本内容', () => {
      const longComment: Comment = {
        ...mockComment,
        content: 'A'.repeat(500),
      };

      render(<CommentItem {...defaultProps} comment={longComment} />);

      const commentText = screen.getByText(/A+/);
      expect(commentText).toBeInTheDocument();
    });
  });
});
