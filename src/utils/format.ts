/**
 * 格式化工具函数
 */
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化相对时间
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateString: string, formatStr = 'yyyy-MM-dd HH:mm:ss'): string {
  const date = new Date(dateString);
  return format(date, formatStr);
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'yyyy-MM-dd');
}

/**
 * 格式化时间
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'HH:mm:ss');
}

/**
 * 格式化负载百分比
 */
export function formatLoadRate(current: number, max: number): number {
  return Math.round((current / max) * 100);
}

/**
 * 格式化数字（添加千位分隔符）
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('zh-CN').format(num);
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
