/**
 * DependencyList组件单元测试
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DependencyList from '../DependencyList';
import { useDependencyStore } from '../../../stores/dependencyStore';

// Mock useDependencyStore
jest.mock('../../../stores/dependencyStore');

describe('DependencyList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when no dependencies', () => {
    (useDependencyStore as unknown as jest.Mock).mockReturnValue({
      dependencies: [],
      removeDependency: jest.fn(),
    });

    render(<DependencyList />);

    expect(screen.getByText('暂无依赖关系')).toBeInTheDocument();
  });

  it('should render dependency items', () => {
    const mockDependencies = [
      {
        id: '1',
        taskId: 'task-1',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS',
      },
      {
        id: '2',
        taskId: 'task-3',
        dependsOnTaskId: 'task-1',
        dependencyType: 'SS',
      },
    ];

    (useDependencyStore as unknown as jest.Mock).mockReturnValue({
      dependencies: mockDependencies,
      removeDependency: jest.fn(),
    });

    render(<DependencyList />);

    // 应该显示依赖关系类型
    expect(screen.getByText('完成-开始 (FS)')).toBeInTheDocument();
    expect(screen.getByText('开始-开始 (SS)')).toBeInTheDocument();
    // 应该显示任务ID
    expect(screen.getByText('task-1')).toBeInTheDocument();
    expect(screen.getByText('task-2')).toBeInTheDocument();
    expect(screen.getByText('task-3')).toBeInTheDocument();
  });

  it('should filter dependencies by search query', () => {
    const mockDependencies = [
      {
        id: '1',
        taskId: 'task-1',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS',
      },
      {
        id: '2',
        taskId: 'task-3',
        dependsOnTaskId: 'task-4',
        dependencyType: 'SS',
      },
    ];

    (useDependencyStore as unknown as jest.Mock).mockReturnValue({
      dependencies: mockDependencies,
      removeDependency: jest.fn(),
    });

    render(<DependencyList showSearch={true} />);

    // 输入搜索关键词
    const searchInput = screen.getByPlaceholderText('搜索依赖关系...');
    fireEvent.change(searchInput, { target: { value: 'task-1' } });

    // 应该只显示包含task-1的依赖关系
    expect(screen.getByText('task-1')).toBeInTheDocument();
    expect(screen.queryByText('task-3')).not.toBeInTheDocument();
  });

  it('should delete dependency on delete button click', () => {
    const mockRemoveDependency = jest.fn();
    const mockDependencies = [
      {
        id: '1',
        taskId: 'task-1',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS',
      },
    ];

    (useDependencyStore as unknown as jest.Mock).mockReturnValue({
      dependencies: mockDependencies,
      removeDependency: mockRemoveDependency,
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(<DependencyList />);

    // 点击删除按钮
    const deleteButton = screen.getByTitle('删除');
    fireEvent.click(deleteButton);

    // 应该调用removeDependency
    expect(mockRemoveDependency).toHaveBeenCalledWith('1');
  });

  it('should show batch actions when items are selected', () => {
    const mockDependencies = [
      {
        id: '1',
        taskId: 'task-1',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS',
      },
    ];

    (useDependencyStore as unknown as jest.Mock).mockReturnValue({
      dependencies: mockDependencies,
      removeDependency: jest.fn(),
    });

    render(<DependencyList showBatchActions={true} />);

    // 选中第一个项目
    const checkbox = screen.getAllByRole('checkbox')[1]; // 第一个是全选
    fireEvent.click(checkbox);

    // 应该显示批量操作栏
    expect(screen.getByText('已选择 1 项')).toBeInTheDocument();
  });

  it('should show total count of dependencies', () => {
    const mockDependencies = [
      {
        id: '1',
        taskId: 'task-1',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS',
      },
      {
        id: '2',
        taskId: 'task-3',
        dependsOnTaskId: 'task-4',
        dependencyType: 'SS',
      },
    ];

    (useDependencyStore as unknown as jest.Mock).mockReturnValue({
      dependencies: mockDependencies,
      removeDependency: jest.fn(),
    });

    render(<DependencyList />);

    // 应该显示统计信息
    expect(screen.getByText('共 2 个依赖关系')).toBeInTheDocument();
  });

  it('should filter by taskId when provided', () => {
    const mockDependencies = [
      {
        id: '1',
        taskId: 'task-1',
        dependsOnTaskId: 'task-2',
        dependencyType: 'FS',
      },
      {
        id: '2',
        taskId: 'task-3',
        dependsOnTaskId: 'task-1',
        dependencyType: 'SS',
      },
      {
        id: '3',
        taskId: 'task-4',
        dependsOnTaskId: 'task-5',
        dependencyType: 'FF',
      },
    ];

    (useDependencyStore as unknown as jest.Mock).mockReturnValue({
      dependencies: mockDependencies,
      removeDependency: jest.fn(),
    });

    render(<DependencyList taskId="task-1" />);

    // 应该只显示与task-1相关的依赖关系
    expect(screen.getByText('task-1')).toBeInTheDocument();
    expect(screen.getByText('task-2')).toBeInTheDocument();
    expect(screen.queryByText('task-4')).not.toBeInTheDocument();
    expect(screen.queryByText('task-5')).not.toBeInTheDocument();
  });
});
