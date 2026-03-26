import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TaskService from '@/services/taskService';
import { Task } from '@/types/task';
import type { InputRef } from 'antd';

interface GlobalSearchBoxProps {
  visible: boolean;
  onClose: () => void;
}

const GlobalSearchBox: React.FC<GlobalSearchBoxProps> = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<InputRef>(null);
  const navigate = useNavigate();

  // 监控visible属性变化
  useEffect(() => {
    console.log('🔍 [GlobalSearchBox] visible属性:', visible);
  }, [visible]);

  // 搜索任务
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await TaskService.getTasks({ search: query });
      setSearchResults(response.items || []);
      setSelectedIndex(0);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 键盘导航
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const resultsLength = searchResults.length;
    if (!resultsLength) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % resultsLength);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + resultsLength) % resultsLength);
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      event.preventDefault();
      const task = searchResults[selectedIndex];
      if (task) {
        onClose();
        navigate(`/tasks/${task.id}`);
      }
    }
  };

  // 选中搜索结果
  const handleSelectTask = (task: Task) => {
    onClose();
    navigate(`/tasks/${task.id}`);
  };

  // 打开时自动聚焦输入框
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // 添加Esc键监听，关闭Drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        console.log('🔍 [GlobalSearchBox] Esc键触发，关闭Drawer');
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  return (
    <Drawer
      title="全局搜索"
      placement="top"
      open={visible}
      onClose={onClose}
      height={400}
      style={{ padding: '24px' }}
    >
      <Input
        ref={inputRef}
        placeholder="搜索任务（ID或关键词）..."
        prefix={<SearchOutlined />}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          handleSearch(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        allowClear
        size="large"
        style={{ marginBottom: '16px' }}
      />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>搜索中...</div>
      ) : searchResults.length > 0 ? (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {searchResults.map((task, index) => (
            <div
              key={task.id}
              onClick={() => handleSelectTask(task)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: index === selectedIndex ? '#f0f9ff' : 'transparent',
                borderRadius: '4px',
              }}
            >
              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                ID: {task.id}
              </div>
              <div style={{ fontWeight: 500 }}>{task.title}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {task.status}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
          {searchQuery ? '未找到相关任务' : '请输入搜索关键词'}
        </div>
      )}
    </Drawer>
  );
};

export default GlobalSearchBox;