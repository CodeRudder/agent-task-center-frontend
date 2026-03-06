import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeleteConfirmationDialog, { DeleteConfirmationDialogProps } from '../index';

describe('DeleteConfirmationDialog', () => {
  const defaultProps: DeleteConfirmationDialogProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: '确认删除',
    message: '确定要删除吗？此操作不可恢复。',
    itemInfo: [
      { label: '任务标题', value: '测试任务' },
      { label: '任务ID', value: '123' }
    ],
    danger: true,
  };

  describe('渲染测试', () => {
    it('应该正确渲染弹窗标题', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByText('确认删除')).toBeInTheDocument();
    });

    it('应该显示消息', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByText('确定要删除吗？此操作不可恢复。')).toBeInTheDocument();
    });

    it('应该显示项目信息', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByText('任务标题：测试任务')).toBeInTheDocument();
      expect(screen.getByText('任务ID：123')).toBeInTheDocument();
    });

    it('应该显示警告信息', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByText('此操作不可恢复，请谨慎操作。')).toBeInTheDocument();
    });

    it('应该显示取消和确认按钮', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      expect(screen.getByText('取消')).toBeInTheDocument();
      expect(screen.getByText('确认删除')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击取消按钮应该调用onClose', () => {
      const mockOnClose = vi.fn();
      
      render(
        <DeleteConfirmationDialog 
          {...defaultProps} 
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('点击确认删除按钮应该调用onConfirm', () => {
      const mockOnConfirm = vi.fn();
      
      render(
        <DeleteConfirmationDialog 
          {...defaultProps} 
          onConfirm={mockOnConfirm}
        />
      );

      const confirmButton = screen.getByText('确认删除');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('当isOpen为false时不应该渲染弹窗', () => {
      render(<DeleteConfirmationDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('确认删除')).not.toBeInTheDocument();
    });

    it('当danger为false时应该使用primary按钮', () => {
      render(<DeleteConfirmationDialog {...defaultProps} danger={false} />);

      const confirmButton = screen.getByText('确认删除');
      expect(confirmButton).toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('没有itemInfo时不应该显示项目信息', () => {
      render(
        <DeleteConfirmationDialog 
          {...defaultProps} 
          itemInfo={undefined}
        />
      );

      expect(screen.queryByText('任务标题：')).not.toBeInTheDocument();
    });

    it('空itemInfo时不应该显示项目信息', () => {
      render(
        <DeleteConfirmationDialog 
          {...defaultProps} 
          itemInfo={[]}
        />
      );

      expect(screen.queryByText('任务标题：')).not.toBeInTheDocument();
    });

    it('应该正确处理多条itemInfo', () => {
      const multiItemInfo = [
        { label: '项目1', value: '值1' },
        { label: '项目2', value: '值2' },
        { label: '项目3', value: '值3' }
      ];

      render(
        <DeleteConfirmationDialog 
          {...defaultProps} 
          itemInfo={multiItemInfo}
        />
      );

      expect(screen.getByText('项目1：值1')).toBeInTheDocument();
      expect(screen.getByText('项目2：值2')).toBeInTheDocument();
      expect(screen.getByText('项目3：值3')).toBeInTheDocument();
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的角色标识', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      const modal = document.querySelector('[role="dialog"]');
      expect(modal).toBeInTheDocument();
    });

    it('应该正确显示警告图标', () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);

      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
