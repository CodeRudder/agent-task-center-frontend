/**
 * ReasonDialog 组件单元测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReasonDialog } from '../ReasonDialog';

describe('ReasonDialog 组件', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('当isOpen为false时不应该渲染', () => {
    const { container } = render(
      <ReasonDialog
        isOpen={false}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('应该渲染对话框内容', () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        targetStatus="blocked"
      />
    );

    expect(screen.getByText('状态变更原因')).toBeInTheDocument();
    expect(screen.getByText(/已阻塞/)).toBeInTheDocument();
  });

  it('应该渲染输入框和按钮', () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByPlaceholderText('请输入状态变更的原因...')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
    expect(screen.getByText('确认变更')).toBeInTheDocument();
  });

  it('应该显示字符计数', () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/0 \/ 500 字符/)).toBeInTheDocument();
  });

  it('输入文字应该更新字符计数', () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText('请输入状态变更的原因...');
    fireEvent.change(textarea, { target: { value: '测试原因' } });

    expect(screen.getByText(/4 \/ 500 字符/)).toBeInTheDocument();
  });

  it('点击取消按钮应该调用onCancel', () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('提交空表单不应该调用onSubmit', () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('确认变更');
    const form = submitButton.closest('form');
    
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('提交有效表单应该调用onSubmit', async () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText('请输入状态变更的原因...');
    fireEvent.change(textarea, { target: { value: '这是一个有效的变更原因' } });

    const submitButton = screen.getByText('确认变更');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('这是一个有效的变更原因');
    });
  });

  it('提交时应该trim原因文本', async () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const textarea = screen.getByPlaceholderText('请输入状态变更的原因...');
    fireEvent.change(textarea, { target: { value: '  这是一个有效的变更原因  ' } });

    const submitButton = screen.getByText('确认变更');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('这是一个有效的变更原因');
    });
  });

  it('isLoading状态下应该禁用按钮和输入框', () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const textarea = screen.getByPlaceholderText('请输入状态变更的原因...') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);

    const submitButton = screen.getByText('提交中...');
    expect(submitButton).toBeDisabled();
  });

  it('应该显示目标状态信息', () => {
    render(
      <ReasonDialog
        isOpen={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        targetStatus="review"
      />
    );

    expect(screen.getByText(/审核中/)).toBeInTheDocument();
  });
});
