/**
 * Task状态管理
 */
import { create } from 'zustand';
import {
  Task,
  TaskComment,
  TaskAttachment,
  TaskHistory,
  PaginatedResponse,
  TaskFilters,
  TaskSorting,
} from '@/types/task';
import TaskService from '@/services/taskService';

interface TaskState {
  // 状态
  tasks: Task[];
  selectedTasks: string[];
  currentTask: Task | null;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  history: TaskHistory[];
  statistics: any;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: TaskFilters;
  sorting: TaskSorting;

  // Actions
  loadTasks: (
    filters?: TaskFilters,
    sorting?: TaskSorting,
    page?: number
  ) => Promise<void>;
  loadTask: (id: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  batchDeleteTasks: (ids: string[]) => Promise<{ success: number; failed: number }>;
  batchArchiveTasks: (ids: string[]) => Promise<{ success: number; failed: number }>;
  batchAssignTasks: (
    ids: string[],
    assigneeId: string
  ) => Promise<{ success: number; failed: number }>;
  loadComments: (taskId: string) => Promise<void>;
  createComment: (taskId: string, content: string) => Promise<TaskComment>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;
  loadAttachments: (taskId: string) => Promise<void>;
  uploadAttachment: (taskId: string, file: File) => Promise<TaskAttachment>;
  deleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  loadHistory: (taskId: string) => Promise<void>;
  loadStatistics: () => Promise<void>;
  toggleTaskSelection: (taskId: string) => void;
  toggleAllTasks: () => void;
  clearSelection: () => void;
  setFilters: (filters: TaskFilters) => void;
  setSorting: (sorting: TaskSorting) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // 初始状态
  tasks: [],
  selectedTasks: [],
  currentTask: null,
  comments: [],
  attachments: [],
  history: [],
  statistics: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  sorting: {},

  // 加载任务列表
  loadTasks: async (filters, sorting, page) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilters = { ...get().filters, ...filters };
      const mergedSorting = { ...get().sorting, ...sorting };
      const currentPage = page || get().pagination.page;

      const response: PaginatedResponse<Task> = await TaskService.getTasks(
        mergedFilters,
        mergedSorting,
        currentPage,
        get().pagination.pageSize
      );

      set({
        tasks: response.items,
        pagination: {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages,
        },
        filters: mergedFilters,
        sorting: mergedSorting,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载任务列表失败',
      });
      throw error;
    }
  },

  // 加载任务详情
  loadTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const task = await TaskService.getTask(id);
      set({
        currentTask: task,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载任务详情失败',
      });
      throw error;
    }
  },

  // 创建任务
  createTask: async (data: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      const task = await TaskService.createTask(data);
      set((state) => ({
        tasks: [task, ...state.tasks],
        isLoading: false,
      }));
      return task;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '创建任务失败',
      });
      throw error;
    }
  },

  // 更新任务
  updateTask: async (id: string, data: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      const task = await TaskService.updateTask(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? task : t)),
        currentTask: state.currentTask?.id === id ? task : state.currentTask,
        isLoading: false,
      }));
      return task;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '更新任务失败',
      });
      throw error;
    }
  },

  // 删除任务
  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await TaskService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        selectedTasks: state.selectedTasks.filter((tid) => tid !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '删除任务失败',
      });
      throw error;
    }
  },

  // 批量删除任务
  batchDeleteTasks: async (ids: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const result = await TaskService.batchDeleteTasks(ids);
      set((state) => ({
        tasks: state.tasks.filter((t) => !ids.includes(t.id)),
        selectedTasks: state.selectedTasks.filter((tid) => !ids.includes(tid)),
        isLoading: false,
      }));
      return result;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '批量删除任务失败',
      });
      throw error;
    }
  },

  // 批量归档任务
  batchArchiveTasks: async (ids: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const result = await TaskService.batchArchiveTasks(ids);
      set((state) => ({
        tasks: state.tasks.filter((t) => !ids.includes(t.id)),
        selectedTasks: state.selectedTasks.filter((tid) => !ids.includes(tid)),
        isLoading: false,
      }));
      return result;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '批量归档任务失败',
      });
      throw error;
    }
  },

  // 批量分配任务
  batchAssignTasks: async (ids: string[], assigneeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await TaskService.batchAssignTasks(ids, assigneeId);
      set((state) => ({
        tasks: state.tasks.map((t) =>
          ids.includes(t.id)
            ? { ...t, assigneeId, assigneeName: state.currentTask?.assigneeName }
            : t
        ),
        isLoading: false,
      }));
      return result;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '批量分配任务失败',
      });
      throw error;
    }
  },

  // 加载评论
  loadComments: async (taskId: string) => {
    set({ isLoading: true, error: null });
    try {
      const comments = await TaskService.getTaskComments(taskId);
      set({
        comments,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载评论失败',
      });
      throw error;
    }
  },

  // 创建评论
  createComment: async (taskId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const comment = await TaskService.createTaskComment(taskId, content);
      set((state) => ({
        comments: [...state.comments, comment],
        isLoading: false,
      }));
      return comment;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '创建评论失败',
      });
      throw error;
    }
  },

  // 删除评论
  deleteComment: async (taskId: string, commentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await TaskService.deleteTaskComment(taskId, commentId);
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== commentId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '删除评论失败',
      });
      throw error;
    }
  },

  // 加载附件
  loadAttachments: async (taskId: string) => {
    set({ isLoading: true, error: null });
    try {
      const attachments = await TaskService.getTaskAttachments(taskId);
      set({
        attachments,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载附件失败',
      });
      throw error;
    }
  },

  // 上传附件
  uploadAttachment: async (taskId: string, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const attachment = await TaskService.uploadTaskAttachment(taskId, file);
      set((state) => ({
        attachments: [...state.attachments, attachment],
        isLoading: false,
      }));
      return attachment;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '上传附件失败',
      });
      throw error;
    }
  },

  // 删除附件
  deleteAttachment: async (taskId: string, attachmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await TaskService.deleteTaskAttachment(taskId, attachmentId);
      set((state) => ({
        attachments: state.attachments.filter((a) => a.id !== attachmentId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '删除附件失败',
      });
      throw error;
    }
  },

  // 加载历史记录
  loadHistory: async (taskId: string) => {
    set({ isLoading: true, error: null });
    try {
      const history = await TaskService.getTaskHistory(taskId);
      set({
        history,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载历史记录失败',
      });
      throw error;
    }
  },

  // 加载统计信息
  loadStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const statistics = await TaskService.getTaskStatistics();
      set({
        statistics,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || '加载统计信息失败',
      });
      throw error;
    }
  },

  // 切换任务选择状态
  toggleTaskSelection: (taskId: string) => {
    set((state) => ({
      selectedTasks: state.selectedTasks.includes(taskId)
        ? state.selectedTasks.filter((id) => id !== taskId)
        : [...state.selectedTasks, taskId],
    }));
  },

  // 切换所有任务选择状态
  toggleAllTasks: () => {
    const { tasks, selectedTasks } = get();
    const allSelected = selectedTasks.length === tasks.length && tasks.length > 0;

    set({
      selectedTasks: allSelected ? [] : tasks.map((t) => t.id),
    });
  },

  // 清除选择
  clearSelection: () => {
    set({ selectedTasks: [] });
  },

  // 设置筛选条件
  setFilters: (filters: TaskFilters) => {
    set({ filters });
  },

  // 设置排序条件
  setSorting: (sorting: TaskSorting) => {
    set({ sorting });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));

export default useTaskStore;
