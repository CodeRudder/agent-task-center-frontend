/**
 * 评论编辑弹窗组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { Comment as CommentType } from '@/types/comment';
import { Modal } from '@/components/Modal';
import { Textarea } from '@/components/Textarea';
import { Button } from '@/components/Button';

export interface CommentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment?: CommentType;
  onSave: (commentId: string, content: string) => Promise<void>;
  loading?: boolean;
}

export const CommentEditModal: React.FC<CommentEditModalProps> = ({
  isOpen,
  onClose,
  comment,
  onSave,
  loading = false,
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const isInitializedRef = useRef(false);

  // Initialize form when modal opens with comment data
  useEffect(() => {
    if (isOpen && comment && !isInitializedRef.current) {
      setContent(comment.content);
      setError('');
      isInitializedRef.current = true;
    }
    if (!isOpen) {
      isInitializedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, comment?.content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('评论内容不能为空');
      return;
    }

    if (content.length > 500) {
      setError('评论内容不能超过500个字符');
      return;
    }

    setError('');

    if (comment) {
      try {
        await onSave(comment.id, content.trim());
        onClose();
      } catch {
        // Error handled by parent component
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const remainingChars = 500 - content.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="编辑评论"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="编辑你的评论..."
            error={error}
            rows={4}
            autoFocus
            helperText={`剩余 ${remainingChars} 字符`}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!content.trim() || loading}
            >
              保存
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CommentEditModal;
