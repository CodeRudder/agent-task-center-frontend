import api from './api';
import { TaskTemplate, CreateTemplateDTO, UpdateTemplateDTO, TemplateListParams } from '../types/template';

export const templateService = {
  // 获取模板列表
  getTemplates: async (params?: TemplateListParams): Promise<{ templates: TaskTemplate[]; total: number }> => {
    const response = await api.get('/templates', { params });
    return response.data;
  },

  // 获取模板详情
  getTemplate: async (id: number): Promise<TaskTemplate> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // 创建模板
  createTemplate: async (data: CreateTemplateDTO): Promise<TaskTemplate> => {
    const response = await api.post('/templates', data);
    return response.data;
  },

  // 更新模板
  updateTemplate: async (id: number, data: UpdateTemplateDTO): Promise<TaskTemplate> => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
  },

  // 删除模板
  deleteTemplate: async (id: number): Promise<void> => {
    await api.delete(`/templates/${id}`);
  },

  // 从模板创建任务
  createTaskFromTemplate: async (templateId: number, overrides?: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const response = await api.post(`/templates/${templateId}/create-task`, overrides);
    return response.data;
  },
};
