/**
 * 搜索状态管理 - V5.5
 */
import { create } from 'zustand';
import { Task } from '@/types/task';
import TaskService from '@/services/taskService';

interface SearchState {
  // 状态
  searchResults: Task[];
  searchId: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  /**
   * 搜索任务（支持ID和关键词搜索）
   */
  searchTasks: (searchTerm: string) => Promise<void>;

  /**
   * 根据ID搜索任务
   * @param searchId 搜索ID
   */
  searchTaskById: (searchId: string) => Promise<void>;

  /**
   * 批量查询任务
   * @param taskIds 任务ID列表
   */
  batchQueryTasks: (taskIds: string[]) => Promise<void>;

  /**
   * 清除搜索结果
   */
  clearSearch: () => void;

  /**
   * 清除错误信息
   */
  clearError: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  // 初始状态
  searchResults: [],
  searchId: '',
  isLoading: false,
  error: null,

  // 搜索任务（支持ID和关键词搜索）
  searchTasks: async (searchTerm: string) => {
    set({ isLoading: true, error: null });
    try {
      const trimmedTerm = searchTerm.trim();
      let results: Task[] = [];

      if (trimmedTerm.startsWith('#')) {
        // 精确ID搜索
        const taskId = trimmedTerm.substring(1);
        const task = await TaskService.getTask(taskId);
        results = [task];
      } else {
        // 关键词搜索（搜索标题和描述）
        const response = await TaskService.getTasks();
        results = response.items.filter((task: Task) =>
          task.title.toLowerCase().includes(trimmedTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(trimmedTerm.toLowerCase())
        );
      }

      set({
        searchResults: results,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { message?: string } } };
      set({
        isLoading: false,
        error: err.response?.data?.message || '搜索失败',
        searchResults: [],
      });
      throw error;
    }
  },

  // 根据ID搜索任务
  searchTaskById: async (searchId: string) => {
    set({ isLoading: true, error: null, searchId });
    try {
      const task = await TaskService.getTask(searchId);
      
      set({
        searchResults: [task],
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { message?: string } } };
      set({
        isLoading: false,
        error: err.response?.data?.message || '搜索失败',
        searchResults: [],
      });
      throw error;
    }
  },

  // 批量查询任务
  batchQueryTasks: async (taskIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      if (!taskIds || taskIds.length === 0) {
        set({
          searchResults: [],
          isLoading: false,
        });
        return;
      }

      // 使用Promise.all批量查询任务
      const tasks = await Promise.all(
        taskIds.map(taskId => TaskService.getTask(taskId))
      );
      
      set({
        searchResults: tasks,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { message?: string } } };
      set({
        isLoading: false,
        error: err.response?.data?.message || '批量查询失败',
        searchResults: [],
      });
      throw error;
    }
  },

  // 清除搜索结果
  clearSearch: () => {
    set({
      searchResults: [],
      searchId: '',
      error: null,
    });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));

export default useSearchStore;
