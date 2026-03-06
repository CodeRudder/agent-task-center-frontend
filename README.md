# V5.0 前端开发项目

## 项目概述

这是 V5.0 Agent 任务管理系统的前端实现，基于 React 18 + TypeScript + Tailwind CSS + Zustand 构建。

### 核心功能

1. **Token 管理页面**
   - Agent 列表展示（搜索、筛选、排序）
   - Token 生成/撤销/重新生成
   - Token 安全展示（仅显示一次）
   - Agent 详情抽屉
   - 操作日志查看
   - 批量操作支持

2. **用户认证页面**
   - 登录界面（用户名/密码）
   - 密码找回和重置
   - 密码强度实时检测
   - 防暴力破解（5次失败锁定15分钟）
   - 会话管理
   - JWT Token 认证

### 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **图标库**: Lucide React
- **构建工具**: Vite

## 项目结构

```
v5-frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Button.tsx       # 按钮组件
│   │   ├── Input.tsx        # 输入框组件
│   │   ├── PasswordInput.tsx # 密码输入框
│   │   ├── Modal.tsx        # 模态框
│   │   ├── Drawer.tsx       # 侧边抽屉
│   │   ├── Toast.tsx        # Toast 通知
│   │   ├── StatusBadge.tsx  # 状态徽章
│   │   ├── Tag.tsx          # 标签
│   │   ├── Skeleton.tsx     # 骨架屏
│   │   ├── TokenDisplay.tsx # Token 显示对话框
│   │   ├── AgentListItem.tsx # Agent 列表项
│   │   ├── PasswordStrengthIndicator.tsx # 密码强度指示器
│   │   └── LoginError.tsx   # 登录错误提示
│   │
│   ├── pages/               # 页面组件
│   │   ├── LoginPage.tsx    # 登录页面
│   │   └── TokenManagementPage.tsx # Token 管理页面
│   │
│   ├── stores/              # Zustand 状态管理
│   │   ├── authStore.ts     # 认证状态
│   │   └── agentStore.ts    # Agent 状态
│   │
│   ├── services/            # API 服务
│   │   ├── api.ts           # Axios 客户端配置
│   │   ├── authService.ts   # 认证 API
│   │   └── agentService.ts  # Agent API
│   │
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useToast.ts      # Toast Hook
│   │   ├── useDebounce.ts   # 防抖 Hook
│   │   └── useModal.ts      # 模态框 Hook
│   │
│   ├── types/               # TypeScript 类型定义
│   │   ├── agent.ts         # Agent 类型
│   │   ├── auth.ts          # 认证类型
│   │   └── api.ts           # API 类型
│   │
│   ├── utils/               # 工具函数
│   │   ├── cn.ts            # 类名合并
│   │   ├── format.ts        # 格式化函数
│   │   └── validation.ts    # 验证函数
│   │
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
│
├── public/                  # 静态资源
├── index.html               # HTML 模板
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
└── postcss.config.js        # PostCSS 配置
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 组件使用指南

### 基础组件

#### Button

```tsx
import Button from '@/components/Button';

<Button variant="primary" size="md" loading={false}>
  点击按钮
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `leftIcon`: React.ReactNode
- `rightIcon`: React.ReactNode
- `fullWidth`: boolean

#### Input

```tsx
import Input from '@/components/Input';

<Input
  label="用户名"
  placeholder="输入用户名"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error="错误信息"
  helperText="帮助文本"
/>
```

#### PasswordInput

```tsx
import PasswordInput from '@/components/PasswordInput';

<PasswordInput
  label="密码"
  placeholder="输入密码"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  showToggle
/>
```

#### Modal

```tsx
import Modal from '@/components/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="标题"
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        取消
      </Button>
      <Button onClick={handleConfirm}>
        确认
      </Button>
    </>
  }
>
  内容
</Modal>
```

### 状态管理

#### 使用 AuthStore

```tsx
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async () => {
    await login('username', 'password', true);
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>欢迎, {user?.username}</div>
      ) : (
        <button onClick={handleLogin}>登录</button>
      )}
    </div>
  );
}
```

#### 使用 AgentStore

```tsx
import { useAgentStore } from '@/stores/agentStore';

function AgentList() {
  const { agents, isLoading, loadAgents } = useAgentStore();

  useEffect(() => {
    loadAgents({ page: 1, pageSize: 20 });
  }, []);

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      {agents.map(agent => (
        <div key={agent.id}>{agent.name}</div>
      ))}
    </div>
  );
}
```

### API 调用

#### 使用 AgentService

```tsx
import AgentService from '@/services/agentService';

// 获取 Agent 列表
const agents = await AgentService.getAgents({ page: 1, pageSize: 20 });

// 生成 Token
const { token } = await AgentService.generateToken(agentId);

// 撤销 Token
await AgentService.revokeToken(agentId);
```

#### 使用 AuthService

```tsx
import AuthService from '@/services/authService';

// 登录
const response = await AuthService.login({
  username: 'admin@example.com',
  password: 'password',
  rememberMe: true,
});

// 登出
await AuthService.logout();

// 获取当前用户
const user = await AuthService.getCurrentUser();
```

### 工具函数

#### 格式化函数

```tsx
import { formatRelativeTime, formatDateTime, formatLoadRate } from '@/utils/format';

// 相对时间
formatRelativeTime('2026-03-06T10:00:00Z'); // "2小时前"

// 格式化日期时间
formatDateTime('2026-03-06T10:00:00Z'); // "2026-03-06 10:00:00"

// 格式化负载率
formatLoadRate(3, 5); // 60
```

#### 验证函数

```tsx
import { validatePassword, validateEmail } from '@/utils/validation';

// 验证密码强度
const validation = validatePassword('Password123!');
console.log(validation.strength); // 'strong'
console.log(validation.isValid); // true

// 验证邮箱
validateEmail('admin@example.com'); // true
```

### 自定义 Hooks

#### useToast

```tsx
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { showToast } = useToast();

  const handleClick = () => {
    showToast('操作成功', 'success');
    showToast('操作失败', 'error');
    showToast('警告信息', 'warning');
  };

  return <button onClick={handleClick}>显示 Toast</button>;
}
```

#### useDebounce

```tsx
import { useDebounce } from '@/hooks/useDebounce';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // 使用防抖后的搜索词
    search(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

## 样式规范

### Tailwind CSS

项目使用 Tailwind CSS 作为样式框架，遵循以下规范：

- 使用 `@/utils/cn` 函数合并类名
- 优先使用 Tailwind 的工具类
- 避免在组件中写内联样式
- 使用语义化的颜色和间距

### 颜色规范

```tsx
// 主色
bg-blue-500 text-white hover:bg-blue-600

// 状态色
bg-green-500 text-white  // 成功
bg-red-500 text-white    // 错误
bg-yellow-500 text-white // 警告
bg-gray-500 text-white   // 信息
```

### 间距规范

```tsx
// 基于四像素网格
p-1 (4px)
p-2 (8px)
p-3 (12px)
p-4 (16px)
p-6 (24px)
p-8 (32px)
```

## 开发规范

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 规则
- 组件命名使用 PascalCase
- 函数命名使用 camelCase
- 常量命名使用 UPPER_SNAKE_CASE

### Git 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

### 组件开发规范

1. 组件应该是纯函数或使用 React Hooks
2. 使用 TypeScript 定义 Props 类型
3. 组件应该是可复用的
4. 避免过度嵌套
5. 使用 memo 和 useMemo 优化性能

## 测试

### 运行测试

```bash
npm run test
```

### 测试覆盖率

```bash
npm run test:coverage
```

## 部署

### 构建

```bash
npm run build
```

构建产物在 `dist` 目录中。

### 部署到生产环境

将 `dist` 目录部署到静态文件服务器或 CDN。

## 相关文档

- [V5.0 UI设计文档](../../workspace-ui/design/v5/)
- [V5.0 PRD](../../workspace-main/team-docs/requirements/v5/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)

## 许可证

MIT
