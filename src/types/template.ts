// 任务模板类型定义

export interface TaskFieldConfig {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  categoryId?: number;
  dueDate?: string;
  assignments?: Array<{
    agentId: number;
    role: string;
  }>;
}

export interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  fields: TaskFieldConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDTO {
  name: string;
  description: string;
  fields: TaskFieldConfig;
}

export interface UpdateTemplateDTO {
  name?: string;
  description?: string;
  fields?: TaskFieldConfig;
}

export interface TemplateListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}
