/**
 * 任务详情页面
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/stores/taskStore';
import { Button } from '@/components/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Select';
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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteTaskInfo, setDeleteTaskInfo] = useState<{ title: string; id: number; type: 'task' | 'comment'; commentId?: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTask(id);

  const handleStartEdit = () => {
    if (!currentTask) return;
    
    setEditFormData({
      title: currentTask.title,
      description: currentTask.description || '',
      status: currentTask.status,
      priority: currentTask.priority,
      dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!id || !currentTask) return;

    setIsSaving(true);
    try {
      await useTaskStore.getState().updateTask(id, {
        title: editFormData.title,
        description: editFormData.description,
        status: editFormData.status,
        priority: editFormData.priority,
        dueDate: editFormData.dueDate ? new Date(editFormData.dueDate).toISOString() : null,
      });
      
      // 重新加载任务数据
      await loadTask(id);
      setIsEditing(false);
    } catch (error) {
      console.error('保存任务失败:', error);
      alert('保存任务失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

      loadComments(id);
      loadHistory(id);
    }
  }, [id]);

  const handleEditTask = () => {
    navigate(`/tasks/${id}/edit`);
  };

  const handleDeleteTask = async () => {
    if (!currentTask) return;
    
    setDeleteTaskInfo({
      title: currentTask.title,
      id: parseInt(id!),
      type: 'task'
    });
    setDeleteDialogVisible(true);
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
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    setDeleteTaskInfo({
      title: comment.content,
      id: parseInt(id!),
      type: 'comment',
      commentId
    });
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTaskInfo) return;
    
    setDeleteLoading(true);
    try {
      if (deleteTaskInfo.type === 'task') {
        await useTaskStore.getState().deleteTask(deleteTaskInfo.id.toString());
        navigate('/tasks');
      } else if (deleteTaskInfo.type === 'comment' && deleteTaskInfo.commentId) {
        await deleteComment(deleteTaskInfo.id.toString(), deleteTaskInfo.commentId);
        loadComments(deleteTaskInfo.id.toString());
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogVisible(false);
      setDeleteTaskInfo(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogVisible(false);
    setDeleteTaskInfo(null);
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
              onClick={isEditing ? undefined : handleStartEdit}
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

          {/* 任务编辑表单 */}
          {isEditing && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">编辑任务</h2>
              
              <div className="space-y-4">
                {/* 任务标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务标题 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    placeholder="请输入任务标题"
                  />
                </div>

                {/* 任务描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务描述
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    placeholder="请输入任务描述"
                  />
                </div>

                {/* 状态和优先级 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      状态
                    </label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) => setEditFormData({...editFormData, status: value as TaskStatus})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">待办</SelectItem>
                        <SelectItem value="in_progress">进行中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="cancelled">已取消</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      优先级
                    </label>
                    <Select
                      value={editFormData.priority}
                      onValueChange={(value) => setEditFormData({...editFormData, priority: value as TaskPriority})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="urgent">紧急</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 截止日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    截止日期
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={editFormData.dueDate}
                      onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    取消
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="min-w-[100px]"
                  >
                    {isSaving ? '保存中...' : '保存'}
                  </Button>
                </div>
              </div>
            </div>
          )}

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
      {deleteTaskInfo && (
        <DeleteConfirmationDialog
          visible={deleteDialogVisible}
          taskTitle={deleteTaskInfo.type === 'task' ? deleteTaskInfo.title : `评论: ${deleteTaskInfo.title.slice(0, 30)}...`}
          taskId={deleteTaskInfo.id}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default TaskDetailPage;
