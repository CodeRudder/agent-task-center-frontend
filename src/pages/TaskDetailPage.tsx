/**
 * 任务详情页面
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/stores/taskStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { StatusBadge } from '@/components/StatusBadge';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  Paperclip,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { TaskStatus, TaskPriority } from '@/types/task';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentTask,
    comments,
    history,
    isLoading,
    loadTask,
    loadComments,
    loadHistory,
    createComment,
    deleteComment,
  } = useTaskStore();

  const [commentInput, setCommentInput] = useState('');
  
  // 删除确认弹窗状态
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTask(id);
      loadComments(id);
      loadHistory(id);
    }
  }, [id]);

  const handleEditTask = () => {
    navigate(`/tasks/${id}/edit`);
  };

  const handleDeleteTask = async () => {
    if (!currentTask) return;
    setDeleteTaskDialogOpen(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentInput.trim()) return;
    if (!id) return;

    try {
      await createComment(id, commentInput);
      setCommentInput('');
      loadComments(id);
    } catch (error) {
      console.error('添加评论失败:', error);
      alert('添加评论失败，请重试');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteCommentDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!id) return;
    
    try {
      await useTaskStore.getState().deleteTask(id);
      setDeleteTaskDialogOpen(false);
      navigate('/tasks');
    } catch (error) {
      console.error('删除任务失败:', error);
      alert('删除任务失败，请重试');
    }
  };

  const confirmDeleteComment = async () => {
    if (!id || !commentToDelete) return;
    
    try {
      await deleteComment(id, commentToDelete);
      setDeleteCommentDialogOpen(false);
      setCommentToDelete(null);
      loadComments(id);
    } catch (error) {
      console.error('删除评论失败:', error);
      alert('删除评论失败，请重试');
    }
  };

  const getStatusText = (status: TaskStatus) => {
    const statusMap: Record<TaskStatus, string> = {
      todo: '待办',
      in_progress: '进行中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return statusMap[status];
  };

  const getStatusColor = (status: TaskStatus) => {
    const colorMap: Record<TaskStatus, string> = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colorMap[status];
  };

  const getPriorityText = (priority: TaskPriority) => {
    const priorityMap: Record<TaskPriority, string> = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return priorityMap[priority];
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colorMap: Record<TaskPriority, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colorMap[priority];
  };

  if (isLoading || !currentTask) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tasks')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="mb-4"
        >
          返回列表
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentTask.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  currentTask.status
                )}`}
              >
                {getStatusText(currentTask.status)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                  currentTask.priority
                )}`}
              >
                {getPriorityText(currentTask.priority)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEditTask}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              编辑
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteTask}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              删除
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 任务描述 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">任务描述</h2>
            <div className="text-gray-700 whitespace-pre-wrap">{currentTask.description}</div>
          </div>

          {/* 评论 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              评论 ({comments.length})
            </h2>

            {/* 添加评论 */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <Input
                type="text"
                placeholder="添加评论..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!commentInput.trim()}
                >
                  发布评论
                </Button>
              </div>
            </form>

            {/* 评论列表 */}
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无评论</div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                          {comment.userName.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.userName}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm', {
                              locale: zhCN,
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧侧边栏 */}
        <div className="space-y-6">
          {/* 任务信息 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">任务信息</h2>

            <div className="space-y-4">
              {/* 创建时间 */}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">创建时间</div>
                  <div className="text-sm text-gray-900">
                    {format(new Date(currentTask.createdAt), 'yyyy-MM-dd HH:mm', {
                      locale: zhCN,
                    })}
                  </div>
                </div>
              </div>

              {/* 截止日期 */}
              {currentTask.dueDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">截止日期</div>
                    <div className="text-sm text-gray-900">
                      {format(new Date(currentTask.dueDate), 'yyyy-MM-dd HH:mm', {
                        locale: zhCN,
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 负责人 */}
              {currentTask.assigneeName && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">负责人</div>
                    <div className="text-sm text-gray-900">{currentTask.assigneeName}</div>
                  </div>
                </div>
              )}

              {/* 完成时间 */}
              {currentTask.completedAt && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">完成时间</div>
                    <div className="text-sm text-gray-900">
                      {format(new Date(currentTask.completedAt), 'yyyy-MM-dd HH:mm', {
                        locale: zhCN,
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 标签 */}
          {currentTask.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                标签
              </h2>
              <div className="flex flex-wrap gap-2">
                {currentTask.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 附件 */}
          {currentTask.attachments && currentTask.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                附件 ({currentTask.attachments.length})
              </h2>
              <div className="space-y-2">
                {currentTask.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                  >
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 truncate">
                        {attachment.fileName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(attachment.fileSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                历史记录
              </h2>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="border-l-2 border-blue-200 pl-3">
                    <div className="text-sm text-gray-700">{item.action}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.userName} · {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm', {
                        locale: zhCN,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <DeleteConfirmationDialog
        isOpen={deleteTaskDialogOpen}
        onClose={() => setDeleteTaskDialogOpen(false)}
        onConfirm={confirmDeleteTask}
        title="确认删除任务"
        message="确定要删除此任务吗？"
        itemInfo={currentTask ? [
          { label: '任务标题', value: currentTask.title },
          { label: '任务ID', value: currentTask.id }
        ] : undefined}
      />

      <DeleteConfirmationDialog
        isOpen={deleteCommentDialogOpen}
        onClose={() => {
          setDeleteCommentDialogOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={confirmDeleteComment}
        title="确认删除评论"
        message="确定要删除此评论吗？"
        itemInfo={commentToDelete ? [
          { label: '评论ID', value: commentToDelete }
        ] : undefined}
      />
    </div>
  );
};

export default TaskDetailPage;
