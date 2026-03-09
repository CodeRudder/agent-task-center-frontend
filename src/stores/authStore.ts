/**
 * 认证状态管理
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, Session, LoginAttempt } from '@/types';
import AuthService from '@/services/authService';

interface AuthState {
  // 状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessions: Session[];
  loginAttempts: LoginAttempt | null;

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkLoginAttempts: (email: string) => Promise<LoginAttempt>;
  clearError: () => void;
  loadSessions: () => Promise<void>;
  logoutSession: (sessionId: string) => Promise<void>;
  logoutOtherSessions: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessions: [],
      loginAttempts: null,

      // 登录
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.login({ email, password });

          // 保存Token
          localStorage.setItem('accessToken', response.accessToken);
          if (rememberMe) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || '登录失败';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // 登出
      logout: async () => {
        set({ isLoading: true });
        try {
          await AuthService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            sessions: [],
          });
        }
      },

      // 获取当前用户
      getCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const user = await AuthService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      // 刷新Token
      refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await AuthService.refreshToken(refreshToken);
          localStorage.setItem('accessToken', response.accessToken);
        } catch (error) {
          // Token刷新失败，需要重新登录
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // 检查登录尝试次数
      checkLoginAttempts: async (email: string) => {
        try {
          const attempts = await AuthService.checkLoginAttempts(email);
          set({ loginAttempts: attempts });
          return attempts;
        } catch (error) {
          console.error('Error checking login attempts:', error);
          return {
            failedAttempts: 0,
            remainingAttempts: 5,
            isLocked: false,
          };
        }
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 加载会话列表
      loadSessions: async () => {
        try {
          const sessions = await AuthService.getSessions();
          set({ sessions });
        } catch (error) {
          console.error('Error loading sessions:', error);
        }
      },

      // 登出指定会话
      logoutSession: async (sessionId: string) => {
        try {
          await AuthService.logoutSession(sessionId);
          const { sessions } = get();
          set({ sessions: sessions.filter(s => s.id !== sessionId) });
        } catch (error) {
          console.error('Error logging out session:', error);
          throw error;
        }
      },

      // 登出所有其他会话
      logoutOtherSessions: async () => {
        try {
          await AuthService.logoutOtherSessions();
          await get().loadSessions();
        } catch (error) {
          console.error('Error logging out other sessions:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 辅助函数
export const isAdmin = () => {
  const { user } = useAuthStore.getState();
  return user?.role === UserRole.ADMIN;
};

export const isManager = () => {
  const { user } = useAuthStore.getState();
  return user?.role === UserRole.MANAGER;
};

export default useAuthStore;
