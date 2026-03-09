/**
 * 评论表单组件（发布评论）
 */
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/Textarea';
import { Button } from '@/components/Button';

export interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  className?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  loading = false,
  placeholder = '写下你的评论...',
  autoFocus = false,
  onCancel,
  className,
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!content.trim()) {
      setError('评论内容不能为空');
      return;
    }

    if (content.length > 500) {
      setError('评论内容不能超过500个字符');
      return;
    }

    setError('');

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch {
      // 错误已经在上层处理
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 或 Cmd+Enter 提交
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const remainingChars = 500 - content.length;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          error={error}
          rows={3}
          autoFocus={autoFocus}
          className="border-0 focus:ring-0 p-0 resize-none"
          helperText={`剩余 ${remainingChars} 字符`}
        />

        <div className="flex items-center justify-between mt-3">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500 hidden sm:inline-block">
              提示: Ctrl+Enter 快速发布
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              disabled={!content.trim() || loading}
              leftIcon={<Send className="w-4 h-4" />}
            >
              发布评论
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
