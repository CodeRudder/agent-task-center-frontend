/**
 * 任务列表页面
 */
import React, { useEffect, useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useAgentStore } from '@/stores/agentStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Modal } from '@/components/Modal';
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { TaskStatus, TaskPriority, Task } from '@/types/task';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  CheckSquare,
  Square,
} from 'lucide-react';

const TaskListPage: React.FC = () => {
  // 🔍 调试日志 - 组件开始渲染
  console.log('🔍 ========== TaskListPage 组件开始渲染 ==========');
  console.log('🔍 组件加载时间:', new Date().toISOString());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  
  // 删除确认弹窗状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [batchArchiveDialogOpen, setBatchArchiveDialogOpen] = useState(false);

  console.log('🔍 State初始化完成');

  const {
    tasks,
    selectedTasks,
    isLoading,
    pagination,
    filters,
    sorting,
    loadTasks,
    toggleTaskSelection,
    toggleAllTasks,
    clearSelection,
    setFilters,
    setSorting,
    batchDeleteTasks,
    batchArchiveTasks,
  } = useTaskStore();

  const { loadAgents } = useAgentStore();

  console.log('🔍 useTaskStore和useAgentStore加载完成');
  console.log('🔍 tasks数量:', tasks?.length || 0);
  console.log('🔍 isLoading:', isLoading);

  useEffect(() => {
    console.log('🔍 ========== useEffect [] 执行 ==========');
    console.log('🔍 开始加载tasks和agents');
    
    const loadData = async () => {
      try {
        console.log('🔍 Calling loadTasks...');
        await loadTasks();
        console.log('🔍 loadTasks completed');
        
        console.log('🔍 Calling loadAgents...');
        await loadAgents();
        console.log('🔍 loadAgents completed');
        
        console.log('🔍 loadTasks和loadAgents已成功完成');
      } catch (error) {
        console.error('🔍 useEffect错误:', error);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    console.log('🔍 ========== useEffect [searchTerm] 执行 ==========');
    console.log('🔍 searchTerm:', searchTerm);
    const timeoutId = setTimeout(() => {
      console.log('🔍 搜索超时触发，设置filters');
      setFilters({ search: searchTerm || undefined });
      loadTasks();
      console.log('🔍 loadTasks已调用（搜索）');
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, setFilters, loadTasks]);

  const handleStatusFilter = (value: string) => {
    setFilters({ status: value === 'all' ? undefined : (value as TaskStatus) });
    loadTasks();
  };

  const handlePriorityFilter = (value: string) => {
    setFilters({ priority: value === 'all' ? undefined : (value as TaskPriority) });
    loadTasks();
  };

  const handleSort = (sortBy: string) => {
    setSorting({
      sortBy: sortBy as any,
      sortOrder: sorting.sortBy === sortBy && sorting.sortOrder === 'asc' ? 'desc' : 'asc',
    });
    loadTasks();
  };

  const handlePageChange = (page: number) => {
    loadTasks(filters, sorting, page);
  };

  const handleViewTask = (taskId: string) => {
    window.location.href = `/tasks/${taskId}`;
  };

  const handleEditTask = (taskId: string) => {
    setEditTaskId(taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setTaskToDelete({ id: task.id, title: task.title });
    setDeleteDialogOpen(true);
  };

  const handleBatchDelete = async () => {
    if (selectedTasks.length === 0) return;
    setBatchDeleteDialogOpen(true);
  };

  const handleBatchArchive = async () => {
    if (selectedTasks.length === 0) return;
    setBatchArchiveDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await useTaskStore.getState().deleteTask(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      loadTasks();
    } catch (error) {
      console.error('删除任务失败:', error);
    }
  };

  const confirmBatchDelete = async () => {
    try {
      await batchDeleteTasks(selectedTasks);
      setBatchDeleteDialogOpen(false);
      clearSelection();
      loadTasks();
    } catch (error) {
      console.error('批量删除失败:', error);
    }
  };

  const confirmBatchArchive = async () => {
    try {
      await batchArchiveTasks(selectedTasks);
      setBatchArchiveDialogOpen(false);
      clearSelection();
      loadTasks();
    } catch (error) {
      console.error('批量归档失败:', error);
    }
  };

  const getStatusText = (status: TaskStatus) => {
    const statusMap: Record<TaskStatus, string> = {
      todo: '待办',
      in_progress: '进行中',
      done: '已完成',
      review: '审核中',
      blocked: '已阻塞',
    };
    return statusMap[status];
  };

  const getStatusColor = (status: TaskStatus) => {
    const colorMap: Record<TaskStatus, string> = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
      review: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return colorMap[status];
  };

  const getPriorityText = (priority: TaskPriority) => {
    const priorityMap: Record<TaskPriority, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return priorityMap[priority];
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colorMap: Record<TaskPriority, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colorMap[priority];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
        <p className="text-gray-600 mt-1">管理和跟踪所有任务</p>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="搜索任务标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              options={[
                { value: 'all', label: '所有状态' },
                { value: 'todo', label: '待办' },
                { value: 'in_progress', label: '进行中' },
                { value: 'done', label: '已完成' },
                { value: 'review', label: '审核中' },
              ]}
              value={filters.status || 'all'}
              onChange={handleStatusFilter}
              placeholder="状态"
            />

            <Select
              options={[
                { value: 'all', label: '所有优先级' },
                { value: 'low', label: '低' },
                { value: 'medium', label: '中' },
                { value: 'high', label: '高' },
                { value: 'urgent', label: '紧急' },
              ]}
              value={filters.priority || 'all'}
              onChange={handlePriorityFilter}
              placeholder="优先级"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {selectedTasks.length > 0 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBatchDelete}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  删除 ({selectedTasks.length})
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBatchArchive}
                  leftIcon={<Archive className="h-4 w-4" />}
                >
                  归档 ({selectedTasks.length})
                </Button>
              </>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              新建任务
            </Button>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无任务</div>
        ) : (
          <>
            {/* 桌面端表格视图 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedTasks.length === tasks.length && tasks.length > 0}
                        onChange={toggleAllTasks}
                      />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('title')}
                    >
                      标题
                      {sorting.sortBy === 'title' && (
                        <span>{sorting.sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      优先级
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      负责人
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('dueDate')}
                    >
                      截止日期
                      {sorting.sortBy === 'dueDate' && (
                        <span>{sorting.sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('createdAt')}
                    >
                      创建时间
                      {sorting.sortBy === 'createdAt' && (
                        <span>{sorting.sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewTask(task.id)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => toggleTaskSelection(task.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                              >
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {getStatusText(task.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {getPriorityText(task.priority)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {task.assigneeName || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(task.dueDate || '')}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(task.createdAt)}
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task.id)}
                            leftIcon={<Edit className="h-4 w-4" />}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            leftIcon={<Trash2 className="h-4 w-4" />}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 移动端卡片视图 */}
            <div className="md:hidden divide-y divide-gray-200">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewTask(task.id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {getStatusText(task.status)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{task.description?.slice(0, 50) || '无描述'}...</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>负责人: {task.assigneeName || '-'}</span>
                        <span>截止: {formatDate(task.dueDate || '')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 创建任务模态框 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新建任务"
        size="lg"
      >
        <TaskCreateModal onClose={() => setIsCreateModalOpen(false)} />
      </Modal>

      {/* 编辑任务模态框 */}
      <Modal
        isOpen={!!editTaskId}
        onClose={() => setEditTaskId(null)}
        title="编辑任务"
        size="lg"
      >
        {editTaskId && <TaskEditModal taskId={editTaskId} onClose={() => setEditTaskId(null)} />}
      </Modal>

      {/* 删除确认弹窗 */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmDeleteTask}
        title="确认删除任务"
        message="确定要删除此任务吗？"
        itemInfo={taskToDelete ? [
          { label: '任务标题', value: taskToDelete.title },
          { label: '任务ID', value: taskToDelete.id }
        ] : undefined}
      />

      {/* 批量删除确认弹窗 */}
      <DeleteConfirmationDialog
        isOpen={batchDeleteDialogOpen}
        onClose={() => setBatchDeleteDialogOpen(false)}
        onConfirm={confirmBatchDelete}
        title="确认批量删除"
        message={`确定要删除选中的 ${selectedTasks.length} 个任务吗？`}
        itemInfo={[
          { label: '删除数量', value: `${selectedTasks.length} 个任务` }
        ]}
      />

      {/* 批量归档确认弹窗 */}
      <DeleteConfirmationDialog
        isOpen={batchArchiveDialogOpen}
        onClose={() => setBatchArchiveDialogOpen(false)}
        onConfirm={confirmBatchArchive}
        title="确认批量归档"
        message={`确定要归档选中的 ${selectedTasks.length} 个任务吗？`}
        itemInfo={[
          { label: '归档数量', value: `${selectedTasks.length} 个任务` }
        ]}
        danger={false}
      />
    </div>
  );
};

export default TaskListPage;
