/**
 * 评论列表组件（主组件）
 */
import React, { useEffect, useState } from 'react';
import { Comment as CommentType } from '@/types/comment';
import { useCommentStore } from '@/stores/commentStore';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import CommentEditModal from './CommentEditModal';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { Skeleton } from '@/components/Skeleton';
import { MessageCircle } from 'lucide-react';

export interface CommentListProps {
  taskId: string;
  currentUserId?: string;
  className?: string;
}

export const CommentList: React.FC<CommentListProps> = ({
  taskId,
  currentUserId,
  className,
}) => {
  const {
    comments,
    isLoading,
    error,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    clearError,
  } = useCommentStore();

  const [editingComment, setEditingComment] = useState<CommentType | undefined>(undefined);
  const [deletingCommentId, setDeletingCommentId] = useState<string | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 加载评论列表
  useEffect(() => {
    if (taskId) {
      loadComments(taskId);
    }
  }, [taskId, loadComments]);

  // 清除错误
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleCreateComment = async (content: string) => {
    setIsSubmitting(true);
    try {
      await createComment(taskId, { content });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: CommentType) => {
    setEditingComment(comment);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (commentId: string, content: string) => {
    setIsSubmitting(true);
    try {
      await updateComment(commentId, { content });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setDeletingCommentId(commentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCommentId) {
      setIsSubmitting(true);
      try {
        await deleteComment(deletingCommentId);
        setIsDeleteDialogOpen(false);
        setDeletingCommentId(undefined);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading && comments.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 评论标题 */}
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">
          评论 ({comments.length})
        </h3>
      </div>

      {/* 评论表单 */}
      <div className="mb-6">
        <CommentForm
          onSubmit={handleCreateComment}
          loading={isSubmitting}
          placeholder="写下你的评论..."
        />
      </div>

      {/* 评论列表 */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">还没有评论，快来抢沙发吧！</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onEdit={handleEditComment}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>

      {/* 编辑弹窗 */}
      <CommentEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingComment(undefined);
        }}
        comment={editingComment}
        onSave={handleSaveEdit}
        loading={isSubmitting}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingCommentId(undefined);
        }}
        onConfirm={handleDeleteConfirm}
        title="删除评论"
        message="确定要删除这条评论吗？此操作不可恢复。"
      />
    </div>
  );
};

export default CommentList;
