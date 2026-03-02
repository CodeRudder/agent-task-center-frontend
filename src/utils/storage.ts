// 本地存储工具函数

export const storage = {
  // 获取数据
  get: <T = any>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  // 设置数据
  set: <T = any>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  // 删除数据
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // 清空所有数据
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // ETag相关
  getEtag: (url: string): string | null => {
    return localStorage.getItem(`etag:${url}`);
  },

  setEtag: (url: string, etag: string): void => {
    localStorage.setItem(`etag:${url}`, etag);
  },

  clearEtags: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('etag:')) {
        localStorage.removeItem(key);
      }
    });
  },
};

// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 检查任务是否延期
export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};

// 优先级颜色映射
export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    low: 'default',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
  };
  return colorMap[priority] || 'default';
};

// 状态颜色映射
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'default',
    in_progress: 'processing',
    completed: 'success',
    accepted: 'success',
    rejected: 'error',
  };
  return colorMap[status] || 'default';
};
