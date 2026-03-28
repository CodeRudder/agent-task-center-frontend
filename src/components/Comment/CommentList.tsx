import React, { useState, useEffect } from 'react';
import { List, Avatar, Input, Button, message, Spin, Empty, Popconfirm } from 'antd';
import { UserOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useCommentStore } from '../../stores/comment.store';
import { Comment } from '../../services/comment.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface CommentListProps {
  taskId: string;
}

const CommentList: React.FC<CommentListProps> = ({ taskId }) => {
  const {
    comments,
    loading,
    error,
    total,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  } = useCommentStore();

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments(taskId);
  }, [taskId, fetchComments]);

  const handleCreate = async () => {
    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    try {
      await createComment(taskId, { content: newComment });
      setNewComment('');
      message.success('评论成功');
    } catch (err) {
      message.error('评论失败');
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    try {
      await updateComment(commentId, { content: editContent });
      setEditingId(null);
      setEditContent('');
      message.success('更新成功');
    } catch (err) {
      message.error('更新失败');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      message.success('删除成功');
    } catch (err) {
      message.error('删除失败');
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#ff4d4f' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>评论 ({total})</h3>
      
      {/* 新评论输入框 */}
      <div style={{ marginBottom: 16 }}>
        <Input.TextArea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          autoSize={{ minRows: 3, maxRows: 6 }}
          style={{ marginBottom: 8 }}
        />
        <Button type="primary" onClick={handleCreate} loading={loading}>
          发表评论
        </Button>
      </div>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <Empty description="暂无评论" />
      ) : (
        <List
          dataSource={comments}
          renderItem={(comment: Comment) => (
            <List.Item
              key={comment.id}
              actions={[
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                >
                  编辑
                </Button>,
                <Popconfirm
                  title="确定删除这条评论吗？"
                  onConfirm={() => handleDelete(comment.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={comment.user?.avatar}
                    icon={<UserOutlined />}
                  />
                }
                title={
                  <div>
                    <span style={{ fontWeight: 'bold' }}>
                      {comment.user?.name || '未知用户'}
                    </span>
                    <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
                      {dayjs(comment.createdAt).fromNow()}
                    </span>
                  </div>
                }
                description={
                  editingId === comment.id ? (
                    <div>
                      <Input.TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        style={{ marginBottom: 8 }}
                      />
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => handleUpdate(comment.id)}
                        style={{ marginRight: 8 }}
                      >
                        保存
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent('');
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</div>
                  )
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default CommentList;
