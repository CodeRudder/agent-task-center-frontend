import { create } from 'zustand';
import { Task as TaskType } from '../services/task.service';

type Task = Omit<TaskType, 'categoryId'>;

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  setTasks: (tasks: Task[]) => void;
  setSelectedTask: (task: Task | null) => void;
  setLoading: (loading: boolean) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (id: number) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTask: null,
  loading: false,
  
  setTasks: (tasks) => set({ tasks }),
  
  setSelectedTask: (task) => set({ selectedTask: task }),
  
  setLoading: (loading) => set({ loading }),
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, ...updates }
          : state.selectedTask,
    }));
  },
  
  addTask: (task) => {
    set((state) => ({
      tasks: [...state.tasks, task],
    }));
  },
  
  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },
}));
