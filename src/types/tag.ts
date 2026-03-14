/**
 * V5.3 P2-4: Tags & Classification 类型定义
 */

/**
 * 标签分类
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 标签
 */
export interface Tag {
  id: string;
  name: string;
  description?: string;
  color: string;
  categoryId?: string;
  categoryName?: string;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建标签请求
 */
export interface CreateTagRequest {
  name: string;
  description?: string;
  color: string;
  categoryId?: string;
}

/**
 * 更新标签请求
 */
export interface UpdateTagRequest {
  name?: string;
  description?: string;
  color?: string;
  categoryId?: string;
}

/**
 * 创建分类请求
 */
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color: string;
}

/**
 * 更新分类请求
 */
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
}

/**
 * 标签过滤器
 */
export interface TagFilters {
  categoryId?: string;
  search?: string;
}

/**
 * 12种标准标签颜色
 */
export const TAG_COLORS = [
  { name: '红色', value: '#f5222d' },
  { name: '橙色', value: '#fa8c16' },
  { name: '黄色', value: '#fadb14' },
  { name: '绿色', value: '#52c41a' },
  { name: '青色', value: '#13c2c2' },
  { name: '蓝色', value: '#1890ff' },
  { name: '紫色', value: '#722ed1' },
  { name: '粉色', value: '#eb2f96' },
  { name: '灰红', value: '#ff4d4f' },
  { name: '灰橙', value: '#ff7a45' },
  { name: '灰绿', value: '#73d13d' },
  { name: '灰蓝', value: '#40a9ff' },
] as const;

/**
 * 标签颜色类型
 */
export type TagColor = typeof TAG_COLORS[number]['value'];
