import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommentForm } from '../CommentForm';

describe('CommentForm', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    loading: false,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('渲染测试', () => {
    it('应该正确渲染评论表单', () => {
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...');
      const button = screen.getByText('发布评论');
      
      expect(textarea).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('应该显示自定义占位符', () => {
      render(
        <CommentForm
          {...defaultProps}
          placeholder="请输入评论..."
        />
      );

      expect(screen.getByPlaceholderText('请输入评论...')).toBeInTheDocument();
    });

    it('应该显示剩余字符数', () => {
      render(<CommentForm {...defaultProps} />);

      expect(screen.getByText('剩余 500 字符')).toBeInTheDocument();
    });

    it('应该显示快捷键提示', () => {
      render(<CommentForm {...defaultProps} />);

      expect(screen.getByText('提示: Ctrl+Enter 快速发布')).toBeInTheDocument();
    });

    it('应该显示取消按钮', () => {
      const mockOnCancel = vi.fn();
      render(
        <CommentForm
          {...defaultProps}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('取消')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('输入内容应该更新状态', () => {
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test comment' } });

      expect(textarea.value).toBe('Test comment');
    });

    it('点击发布按钮应该调用onSubmit', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test comment' } });

      const button = screen.getByText('发布评论');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('Test comment');
      });
    });

    it('按Ctrl+Enter应该调用onSubmit', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test comment' } });

      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('Test comment');
      });
    });

    it('提交成功后应该清空输入框', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test comment' } });

      const button = screen.getByText('发布评论');
      fireEvent.click(button);

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('点击取消按钮应该调用onCancel', () => {
      const mockOnCancel = vi.fn();
      
      render(
        <CommentForm
          {...defaultProps}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('验证测试', () => {
    it('空内容不应该提交', () => {
      render(<CommentForm {...defaultProps} />);

      const button = screen.getByText('发布评论');
      fireEvent.click(button);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('评论内容不能为空')).toBeInTheDocument();
    });

    it('超过500字符不应该提交', () => {
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'A'.repeat(501) } });

      const button = screen.getByText('发布评论');
      fireEvent.click(button);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('评论内容不能超过500个字符')).toBeInTheDocument();
    });

    it('应该实时更新剩余字符数', () => {
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test' } });

      expect(screen.getByText('剩余 496 字符')).toBeInTheDocument();
    });

    it('只包含空格的内容不应该提交', () => {
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '   ' } });

      const button = screen.getByText('发布评论');
      fireEvent.click(button);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('应该自动trim内容', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '  Test comment  ' } });

      const button = screen.getByText('发布评论');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('Test comment');
      });
    });
  });

  describe('加载状态测试', () => {
    it('加载时应该禁用提交按钮', () => {
      render(<CommentForm {...defaultProps} loading={true} />);

      const button = screen.getByText('发布评论');
      expect(button).toBeDisabled();
    });

    it('空内容时提交按钮应该禁用', () => {
      render(<CommentForm {...defaultProps} />);

      const button = screen.getByText('发布评论');
      expect(button).toBeDisabled();
    });

    it('有内容时提交按钮应该启用', () => {
      render(<CommentForm {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('写下你的评论...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const button = screen.getByText('发布评论');
      expect(button).not.toBeDisabled();
    });
  });
});
