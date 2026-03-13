/**
 * 工具函数 - cn (className合并)
 * 用于合并Tailwind CSS类名
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
