import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { getCurrentUser, fetchUserProfile, User } from '../services/authService';
import { Mail, Shield, Calendar, Clock, User as UserIcon } from 'lucide-react';

/**
 * 用户个人信息页面
 * 
 * 显示当前登录用户的基本信息，包括：
 * - 用户头像和姓名
 * - 邮箱地址
 * - 角色信息
 * - 账户创建时间
 * - 最后登录时间
 */
export const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // 首先从本地存储获取用户信息
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }

      // 尝试从API获取最新用户信息
      try {
        const freshUserData = await fetchUserProfile();
        setUser(freshUserData);
      } catch (error) {
        // 如果API失败，继续使用本地存储的用户信息
        console.log('无法从服务器获取用户信息，使用本地缓存:', error);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    switch (role.toLowerCase()) {
      case 'admin':
      case '管理员':
        return 'default';
      case 'project_manager':
      case '项目经理':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '管理员';
      case 'project_manager':
        return '项目经理';
      case 'user':
        return '普通用户';
      default:
        return role;
    }
  };

  const getAvatarFallback = (name: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '未记录';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '未记录';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">无法获取用户信息，请重新登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">个人信息</h1>
          <p className="text-gray-600 mt-2">查看和管理您的个人资料</p>
        </div>

        {/* 用户信息卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-blue-600 text-white">
                  {getAvatarFallback(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 邮箱 */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">邮箱地址</p>
                  <p className="text-base font-medium text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* 用户ID */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">用户ID</p>
                  <p className="text-base font-medium text-gray-900">{user.id}</p>
                </div>
              </div>

              {/* 角色信息 */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">用户角色</p>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 账户状态卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">账户状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 状态指示器 */}
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">在线</span>
              </div>

              <div className="text-sm text-gray-500">
                <p>您的账户状态正常，可以使用所有已授权的功能。</p>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  刷新信息
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
