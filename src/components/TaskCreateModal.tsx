/**
 * 任务创建模态框组件
 */
import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useAgentStore } from '@/stores/agentStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select } from '@/components/Select';
import { TaskStatus, TaskPriority } from '@/types/task';
import { Upload, X } from 'lucide-react';

interface TaskCreateModalProps {
  onClose: () => void;
}

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({ onClose }) => {
  const { createTask, isLoading } = useTaskStore();
  const { agents } = useAgentStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assigneeId: '',
    dueDate: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('请输入任务标题');
      return;
    }

    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId || undefined,
        dueDate: formData.dueDate || undefined,
        tags: formData.tags,
        attachments: [], // 附件上传会在后续实现
      });

      onClose();
    } catch (error) {
      console.error('创建任务失败:', error);
      alert('创建任务失败，请重试');
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_: any, i: number) => i !== index));
  };

  const agentOptions = agents.map((agent) => ({
    value: agent.id,
    label: agent.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 标题 */}
      <Input
        label="任务标题"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="请输入任务标题"
        required
      />

      {/* 描述 */}
      <Textarea
        label="任务描述"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="请输入任务描述"
        rows={4}
      />

      {/* 状态和优先级 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="状态"
          options={[
            { value: 'todo', label: '待办' },
            { value: 'in_progress', label: '进行中' },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' },
          ]}
          value={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
        />

        <Select
          label="优先级"
          options={[
            { value: 'low', label: '低' },
            { value: 'medium', label: '中' },
            { value: 'high', label: '高' },
            { value: 'urgent', label: '紧急' },
          ]}
          value={formData.priority}
          onChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
        />
      </div>

      {/* 负责人和截止日期 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="负责人"
          options={agentOptions}
          value={formData.assigneeId}
          onChange={(value) => setFormData({ ...formData, assigneeId: value })}
          placeholder="请选择负责人"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            截止日期
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标签
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="输入标签后按回车或点击添加"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" variant="secondary" onClick={handleAddTag}>
            添加
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 附件 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          附件
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">点击上传文件</span>
              </div>
            </label>
          </div>
        </div>
        {files && files.length > 0 && (
          <div className="mt-2 space-y-2">
            {files.map((file: File, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm text-gray-700">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  leftIcon={<X className="h-4 w-4" />}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          创建任务
        </Button>
      </div>
    </form>
  );
};

export default TaskCreateModal;
