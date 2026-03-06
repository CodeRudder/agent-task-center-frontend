import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeleteConfirmationDialog, { DeleteConfirmationDialogProps } from '../index';

describe('DeleteConfirmationDialog', () => {
  const defaultProps: DeleteConfirmationDialogProps = {
    visible: true,
    taskTitle: '测试任务',
    taskId: 123,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该正确渲染弹窗标题', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getAllByText('确认删除')).toHaveLength(2);
    });

    it('应该显示任务标题', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByText('测试任务')).toBeInTheDocument();
    });

    it('应该显示任务ID', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('应该显示警告信息', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByText('此操作不可恢复')).toBeInTheDocument();
    });

    it('应该显示取消和确认按钮', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('应该正确显示loading状态', () => {
      render(<DeleteConfirmationDialog {...defaultProps} loading={true} />);

      const buttons = screen.getAllByRole('button');
      const loadingButton = buttons.find(btn => btn.textContent?.includes('确认删除'));
      expect(loadingButton).toHaveClass('ant-btn-loading');
    });
  });

  describe('交互测试', () => {
    it('点击取消按钮应该调用onCancel', () => {
      const onCancel = vi.fn();
      const props = { ...defaultProps, onCancel };

      render(<DeleteConfirmationDialog {...props} />);

      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find(btn => btn.textContent?.includes('取消'));
      
      if (cancelButton) {
        fireEvent.click(cancelButton);
        expect(onCancel).toHaveBeenCalledTimes(1);
      }
    });

    it('点击确认按钮应该调用onConfirm', () => {
      const onConfirm = vi.fn();
      const props = { ...defaultProps, onConfirm };

      render(<DeleteConfirmationDialog {...props} />);

      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(btn => btn.textContent?.includes('确认删除'));
      
      if (confirmButton) {
        fireEvent.click(confirmButton);
        expect(onConfirm).toHaveBeenCalledTimes(1);
      }
    });

    it('loading状态下取消按钮应该被禁用', () => {
      render(<DeleteConfirmationDialog {...defaultProps} loading={true} />);

      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find(btn => btn.textContent?.includes('取消'));
      
      expect(cancelButton?.disabled).toBe(true);
    });
  });

  describe('边界情况测试', () => {
    it('visible=false时不应该显示弹窗', () => {
      render(<DeleteConfirmationDialog {...defaultProps} visible={false} />);

      expect(screen.queryByText('确认删除')).not.toBeInTheDocument();
    });

    it('空任务标题应该正确显示', () => {
      const props = { ...defaultProps, taskTitle: '' };
      render(<DeleteConfirmationDialog {...props} />);

      expect(screen.getByText(/任务标题：/)).toBeInTheDocument();
    });

    it('长任务标题应该正确显示', () => {
      const longTitle = '这是一个非常长的任务标题用于测试UI布局是否正确处理长文本内容';
      const props = { ...defaultProps, taskTitle: longTitle };
      render(<DeleteConfirmationDialog {...props} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('负数任务ID应该正确显示', () => {
      const props = { ...defaultProps, taskId: -1 };
      render(<DeleteConfirmationDialog {...props} />);

      expect(screen.getByText('-1')).toBeInTheDocument();
    });

    it('未提供loading属性应该默认为false', () => {
      const { loading, ...propsWithoutLoading } = defaultProps;
      render(<DeleteConfirmationDialog {...propsWithoutLoading as any} />);

      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find(btn => btn.textContent?.includes('取消'));
      
      expect(cancelButton?.disabled).not.toBe(true);
    });
  });

  describe('样式和UI测试', () => {
    it('确认按钮应该有danger样式', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(btn => btn.textContent?.includes('确认删除'));
      
      expect(confirmButton).toHaveClass('ant-btn-dangerous');
    });
  });

  describe('回调函数测试', () => {
    it('onCancel应该被正确调用', () => {
      const onCancel = vi.fn();
      const props = { ...defaultProps, onCancel };

      render(<DeleteConfirmationDialog {...props} />);

      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find(btn => btn.textContent?.includes('取消'));
      
      if (cancelButton) {
        fireEvent.click(cancelButton);
        expect(onCancel).toHaveBeenCalledTimes(1);
      }
    });

    it('onConfirm应该被正确调用', () => {
      const onConfirm = vi.fn();
      const props = { ...defaultProps, onConfirm };

      render(<DeleteConfirmationDialog {...props} />);

      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(btn => btn.textContent?.includes('确认删除'));
      
      if (confirmButton) {
        fireEvent.click(confirmButton);
        expect(onConfirm).toHaveBeenCalledTimes(1);
      }
    });

    it('loading时点击确认按钮不应该调用onConfirm', () => {
      const onConfirm = vi.fn();
      const props = { ...defaultProps, onConfirm, loading: true };

      render(<DeleteConfirmationDialog {...props} />);

      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(btn => btn.textContent?.includes('确认删除'));
      
      if (confirmButton && !confirmButton.disabled) {
        fireEvent.click(confirmButton);
      }

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('可访问性测试', () => {
    it('按钮应该是可点击的', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find(btn => btn.textContent?.includes('取消'));
      const confirmButton = buttons.find(btn => btn.textContent?.includes('确认删除'));

      expect(cancelButton?.disabled).toBe(false);
      expect(confirmButton?.disabled).toBe(false);
    });
  });

  describe('组件快照测试', () => {
    it('应该匹配快照', () => {
      const { asFragment } = render(<DeleteConfirmationDialog {...defaultProps} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('loading状态下应该匹配快照', () => {
      const { asFragment } = render(<DeleteConfirmationDialog {...defaultProps} loading={true} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
