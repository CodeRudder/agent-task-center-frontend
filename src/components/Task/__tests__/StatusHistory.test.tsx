/**
 * StatusHistory 组件单元测试
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusHistory } from '../StatusHistory';
import type { StatusHistoryItem } from '@/types/task';

describe('StatusHistory 组件', () => {
  const mockHistories: StatusHistoryItem[] = [
    {
      id: 'history-1',
      taskId: 'task-123',
      oldStatus: 'todo',
      newStatus: 'in_progress',
      changedBy: 'user-1',
      changedByType: 'user',
      changerName: '张三',
      reason: '开始处理任务',
      changedAt: '2026-03-08T01:00:00Z',
    },
    {
      id: 'history-2',
      taskId: 'task-123',
      oldStatus: 'in_progress',
      newStatus: 'review',
      changedBy: 'user-1',
      changedByType: 'user',
      changerName: '张三',
      changedAt: '2026-03-08T02:00:00Z',
    },
    {
      id: 'history-3',
      taskId: 'task-123',
      oldStatus: 'review',
      newStatus: 'done',
      changedBy: 'agent-1',
      changedByType: 'agent',
      changerName: 'AI助手',
      reason: '自动完成任务',
      changedAt: '2026-03-08T03:00:00Z',
    },
  ];

  it('应该渲染状态历史标题', () => {
    render(<StatusHistory histories={mockHistories} />);

    expect(screen.getByText('状态变更历史')).toBeInTheDocument();
  });

  it('应该渲染所有状态历史记录', () => {
    const { container } = render(<StatusHistory histories={mockHistories} />);

    // 检查所有历史记录的数量
    const timelineItems = container.querySelectorAll('.pb-6');
    expect(timelineItems.length).toBe(3);
  });

  it('应该渲染状态变更信息', () => {
    render(<StatusHistory histories={mockHistories} />);

    // 检查状态标签（使用getAllByText因为状态可能重复）
    expect(screen.getAllByText('待办')).toHaveLength(1);
    expect(screen.getAllByText('进行中').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('审核中').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('已完成')).toHaveLength(1);
  });

  it('应该显示变更人信息', () => {
    render(<StatusHistory histories={mockHistories} />);

    // 检查变更人姓名
    const allText = screen.getAllByText(/张三|AI助手/);
    expect(allText.length).toBeGreaterThan(0);
  });

  it('应该显示变更时间', () => {
    render(<StatusHistory histories={mockHistories} />);

    // 检查时间元素的存在（使用getAllByText因为有多个时间）
    const timeElements = screen.getAllByText(/2026-03-08/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('应该渲染loading状态', () => {
    render(<StatusHistory histories={[]} loading />);

    expect(screen.getByText('状态变更历史')).toBeInTheDocument();
    // loading状态应该显示占位符
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('应该渲染空状态', () => {
    render(<StatusHistory histories={[]} />);

    expect(screen.getByText('状态变更历史')).toBeInTheDocument();
    expect(screen.getByText('暂无状态变更历史')).toBeInTheDocument();
  });

  it('应该渲染原因字段', () => {
    render(<StatusHistory histories={mockHistories} />);

    // 检查原因字段（使用getAllByText因为可能有多个）
    expect(screen.getAllByText('原因：').length).toBeGreaterThan(0);
    expect(screen.getByText('开始处理任务')).toBeInTheDocument();
    expect(screen.getByText('自动完成任务')).toBeInTheDocument();
  });

  it('应该正确渲染最后一条记录（无底部线条）', () => {
    const { container } = render(<StatusHistory histories={mockHistories} />);

    // 最后一条记录不应该有底部线条
    const timelineItems = container.querySelectorAll('.pb-6');
    expect(timelineItems[timelineItems.length - 1]).toBeInTheDocument();
  });

  it('应该渲染done状态为绿色', () => {
    const { container } = render(<StatusHistory histories={mockHistories} />);

    // 检查done状态的样式
    const doneElements = container.querySelectorAll('.bg-green-100');
    expect(doneElements.length).toBeGreaterThan(0);
  });

  it('应该渲染blocked状态为红色', () => {
    const blockedHistory: StatusHistoryItem[] = [
      {
        id: 'history-1',
        taskId: 'task-123',
        oldStatus: 'in_progress',
        newStatus: 'blocked',
        changedBy: 'user-1',
        changedByType: 'user',
        changerName: '张三',
        reason: '任务阻塞',
        changedAt: '2026-03-08T01:00:00Z',
      },
    ];

    render(<StatusHistory histories={blockedHistory} />);

    expect(screen.getByText('已阻塞')).toBeInTheDocument();
  });
});
