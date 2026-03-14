/**
 * V5.3 P2-4: Tags & Classification API 服务
 */
import apiClient from './api';
import {
  Tag,
  Category,
  CreateTagRequest,
  UpdateTagRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  TagFilters,
} from '@/types/tag';
import { PaginatedResponse } from '@/types/api';

/**
 * 标签服务
 */
export class TagService {
  // ============ 标签相关 API ============

  /**
   * 获取标签列表
   */
  static async getTags(
    filters?: TagFilters,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<Tag>> {
    const params = {
      ...filters,
      page,
      pageSize,
    };
    const response = await apiClient.get('/api/v1/tags', { params });
    return response.data;
  }

  /**
   * 获取标签详情
   */
  static async getTag(id: string): Promise<Tag> {
    const response = await apiClient.get(`/api/v1/tags/${id}`);
    return response.data;
  }

  /**
   * 创建标签
   */
  static async createTag(data: CreateTagRequest): Promise<Tag> {
    const response = await apiClient.post('/api/v1/tags', data);
    return response.data;
  }

  /**
   * 更新标签
   */
  static async updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
    const response = await apiClient.patch(`/api/v1/tags/${id}`, data);
    return response.data;
  }

  /**
   * 删除标签
   */
  static async deleteTag(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/tags/${id}`);
  }

  /**
   * 批量删除标签
   */
  static async batchDeleteTags(ids: string[]): Promise<{ success: number; failed: number }> {
    const response = await apiClient.post('/api/v1/tags/batch-delete', { ids });
    return response.data;
  }

  // ============ 分类相关 API ============

  /**
   * 获取分类列表
   */
  static async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/api/v1/categories');
    return response.data;
  }

  /**
   * 获取分类详情
   */
  static async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get(`/api/v1/categories/${id}`);
    return response.data;
  }

  /**
   * 创建分类
   */
  static async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post('/api/v1/categories', data);
    return response.data;
  }

  /**
   * 更新分类
   */
  static async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await apiClient.patch(`/api/v1/categories/${id}`, data);
    return response.data;
  }

  /**
   * 删除分类
   */
  static async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/categories/${id}`);
  }
}

export default TagService;
