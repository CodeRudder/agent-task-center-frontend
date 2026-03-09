#!/bin/bash

# 1. 删除Select相关的子组件导入（暂时）
sed -i 's/, SelectContent, SelectItem, SelectTrigger, SelectValue//g' src/pages/TaskDetailPage.tsx
sed -i 's/SelectContent,//g; s/SelectItem,//g; s/SelectTrigger,//g; s/SelectValue,//g' src/pages/TaskDetailPage.tsx

# 2. 删除未使用的导入
sed -i "/import { StatusBadge } from '@/components\/StatusBadge';/d" src/pages/TaskDetailPage.tsx
sed -i "s/, 'MessageSquare'//g; s/'MessageSquare', //g" src/pages/TaskDetailPage.tsx

# 3. 修复setCommentToDelete(null) -> undefined
sed -i 's/setCommentToDelete(null)/setCommentToDelete(undefined)/g' src/pages/TaskDetailPage.tsx
sed -i "s/useState<string | null>(null)/useState<string | undefined>(undefined)/g" src/pages/TaskDetailPage.tsx

echo "快速修复完成"
