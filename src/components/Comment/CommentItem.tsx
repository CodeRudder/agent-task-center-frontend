/**
 * 单个评论项组件
 */
import React from 'react';
import { Comment as CommentType } from '@/types/comment';
import { cn } from '@/utils/cn';
import {
  MoreVertical,
  Edit,
  Trash2,
  User,
  Bot,
} from 'lucide-react';

export interface CommentItemProps {
  comment: CommentType;
  currentUserId?: string;
  onEdit?: (comment: CommentType) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  className,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const canEdit = currentUserId && comment.authorId === currentUserId;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow', className)}>
      <div className="flex items-start justify-between gap-3">
        {/* 头像和作者信息 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              comment.authorType === 'agent'
                ? 'bg-purple-100 text-purple-600'
                : 'bg-blue-100 text-blue-600'
            )}
          >
            {comment.authorType === 'agent' ? (
              <Bot className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {comment.authorName}
              </span>
              {comment.authorType === 'agent' && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  AI助手
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>
        </div>

        {/* 操作菜单 */}
        {canEdit && (onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="更多操作"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(comment);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      编辑
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(comment.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 评论内容 */}
      <div className="mt-3">
        <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
          {comment.content}
        </p>
      </div>

      {/* 编辑时间 */}
      {comment.updatedAt !== comment.createdAt && (
        <p className="mt-2 text-xs text-gray-400">
          已于 {formatDate(comment.updatedAt)} 编辑
        </p>
      )}
    </div>
  );
};

export default CommentItem;
