/**
 * 任务详情页面 - V5.5
 * 集成投票功能和ID显示功能
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/stores/taskStore';
import { VoteButtons } from '@/components/TaskVote/VoteButtons';
import { VoteStats } from '@/components/TaskVote/VoteStats';
import { TaskIdDisplay } from '@/components/TaskId/TaskIdDisplay';
import { Button } from '@/components/Button';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { currentTask, loadTask, isLoading, error } = useTaskStore();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadTask(taskId);
    }
  }, [taskId, loadTask]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-8">
          <div className="animate-pulse text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">错误</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/tasks')}>返回任务列表</Button>
        </div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">任务不存在</h1>
          <p className="text-gray-600 mb-4">找不到该任务，可能已被删除</p>
          <Button onClick={() => navigate('/tasks')}>返回任务列表</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回任务列表</span>
        </button>
      </div>

      {/* 任务详情卡片 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* 任务标题和ID */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{currentTask.title}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditMode(true)}
                leftIcon={<Edit className="h-4 w-4" />}
              >
                编辑
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {/* 删除逻辑 */}}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                删除
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <TaskIdDisplay
              taskId={currentTask.id}
              taskTitle={currentTask.title}
              showDropdown={true}
              className="text-base"
            />
          </div>
        </div>

        {/* 任务基本信息 */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>创建者ID：{currentTask.createdBy || '未知'}</span>
          <span>|</span>
          <span>创建时间：{formatDate(currentTask.createdAt)}</span>
          <span>|</span>
          <span>状态：{currentTask.status}</span>
          <span>|</span>
          <span>优先级：{currentTask.priority}</span>
        </div>

        {/* 任务描述 */}
        <div className="prose max-w-none mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">任务描述</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {currentTask.description || '暂无描述'}
          </p>
        </div>

        {/* 投票区域 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 投票区域</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-3">对此任务的态度？</p>
            <VoteButtons
              taskId={currentTask.id}
              className="mb-4"
              onVoteSuccess={(voteType) => {
                console.log('投票成功:', voteType);
              }}
            />
            <div className="border-t border-gray-200 mt-4 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">投票统计：</h4>
              <VoteStats
                taskId={currentTask.id}
                showTotal={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 其他任务信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 任务详情 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">任务详情</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">负责人：</span>
              <span className="text-gray-900">{currentTask.assigneeName || '未分配'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">截止日期：</span>
              <span className="text-gray-900">{formatDate(currentTask.dueDate || '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">更新时间：</span>
              <span className="text-gray-900">{formatDate(currentTask.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* 标签 */}
        {currentTask.tags && currentTask.tags.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">标签</h3>
            <div className="flex flex-wrap gap-2">
              {currentTask.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
