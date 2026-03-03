import { create } from 'zustand';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'accepted' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  dueDate: string;
  assignments: Array<{
    agentId: number;
    agentName: string;
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

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
