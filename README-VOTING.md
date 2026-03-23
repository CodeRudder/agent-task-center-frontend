# V5.5 任务投票功能 - 前端实现

## 📋 功能概述

实现了任务管理系统的投票功能，让团队成员能够对任务进行投票（支持/反对/弃权），表达对任务优先级和重要性的看法。

## 🎯 核心功能（P0优先级）

### 1. 投票功能 ✅
- ✅ 支持对任务投票（👍支持/👎反对/😐弃权）
- ✅ 每个用户对每个任务只能投一次票
- ✅ 支持修改投票
- ✅ 投票后实时更新统计

### 2. 投票统计与展示 ✅
- ✅ 任务详情页显示投票统计（票数和百分比）
- ✅ 任务列表显示投票摘要
- ✅ 格式：👍12 👎3 😐1

## 🎨 UI实现

### 任务详情页投票区域
- **位置**：任务描述下方
- **投票按钮**：3个按钮（👍支持/👎反对/😐弃权）
- **按钮样式**：
  - 未选中：灰色边框，白色背景
  - 已选中：彩色边框，浅色背景
    - 支持：绿色 (#10B981)
    - 反对：红色 (#EF4444)
    - 弃权：灰色 (#6B7280)
- **投票统计**：显示票数和百分比
- **参与度**：显示已投票人数/总人数

### 任务列表页投票摘要
- **位置**：任务标题右侧
- **格式**：`👍{支持数} 👎{反对数} 😐{弃权数}`
- **颜色**：支持绿色、反对红色、弃权灰色
- **无投票时不显示**

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **样式方案**: Tailwind CSS
- **HTTP请求**: Axios
- **测试框架**: Vitest + React Testing Library
- **构建工具**: Vite

## 📁 项目结构

```
src/
├── components/              # 组件目录
│   ├── VotingArea.tsx      # 任务详情页投票区域组件
│   ├── VotingSummary.tsx   # 任务列表投票摘要组件
│   └── __tests__/          # 单元测试
│       ├── VotingArea.test.tsx
│       └── VotingSummary.test.tsx
├── stores/                 # 状态管理
│   └── voteStore.ts        # Zustand投票状态管理
├── services/               # API服务
│   ├── api.ts             # Axios配置
│   └── voteService.ts     # 投票API调用
├── types/                  # 类型定义
│   └── vote.ts            # 投票相关类型
└── App-example.tsx        # 示例页面
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，配置后端API地址：

```bash
cp .env.example .env
```

### 3. 运行开发服务器

```bash
npm run dev
```

### 4. 运行测试

```bash
npm run test
```

## 📖 使用示例

### 任务详情页 - 投票区域

```tsx
import { VotingArea } from './components';

function TaskDetail({ taskId }: { taskId: string }) {
  return (
    <div>
      {/* 任务信息 */}
      <h1>任务标题</h1>
      <p>任务描述</p>
      
      {/* 投票区域 */}
      <VotingArea taskId={taskId} totalUsers={25} />
    </div>
  );
}
```

### 任务列表页 - 投票摘要

```tsx
import { VotingSummary } from './components';

function TaskList() {
  const tasks = [
    { id: 'task-001', title: '实现用户登录' },
    { id: 'task-002', title: '优化性能' },
  ];

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <span>{task.title}</span>
          <VotingSummary 
            taskId={task.id} 
            onClick={() => navigate(`/tasks/${task.id}`)}
          />
        </div>
      ))}
    </div>
  );
}
```

## 🔌 API集成

### 后端API接口

1. **投票**: `POST /tasks/:id/votes`
   - 参数：`taskId`, `voteType` (upvote/downvote)
   - 返回：VoteResponse

2. **获取投票统计**: `GET /tasks/:id/votes`
   - 返回：VoteStats

3. **获取用户投票**: `GET /tasks/:id/votes/me`
   - 返回：VoteResponse | null

### 认证

使用JWT Token认证，Token存储在localStorage：

```typescript
// 在请求拦截器中自动添加Token
config.headers.Authorization = `Bearer ${token}`;
```

## ⚠️ 重要说明

### 后端API限制

**当前后端只支持2种投票类型**：
- ✅ UPVOTE (支持)
- ✅ DOWNVOTE (反对)
- ❌ ABSTAIN (弃权) - **后端暂不支持**

**弃权处理方案**：
- 前端UI提供弃权按钮
- 弃权状态仅在前端存储
- 如果用户之前已投票，选择弃权时会取消后端投票（待实现）
- 建议：后续后端扩展支持ABSTAIN类型

## ✅ 验收标准

- [x] AC1：任务详情页显示投票按钮（支持/反对/弃权）
- [x] AC2：点击投票按钮后，更新按钮状态和统计
- [x] AC3：用户可以修改自己的投票
- [x] AC4：任务列表显示投票摘要
- [x] AC5：投票按钮状态清晰显示当前投票状态
- [x] AC6：投票统计实时更新

## 🧪 测试覆盖

- **VotingArea组件测试**：
  - 渲染投票按钮
  - 点击投票功能
  - 显示投票统计
  - 按钮选中状态
  - 错误处理
  - 加载状态
  - 参与度计算

- **VotingSummary组件测试**：
  - 无投票时不显示
  - 显示投票摘要
  - 点击事件
  - 键盘操作
  - 可访问性

## 📝 待办事项

### 后续优化
1. **后端扩展**：建议后端支持ABSTAIN（弃权）类型
2. **取消投票**：后端实现取消投票API
3. **投票详情**：查看投票者名单（需要后端API）
4. **投票权限**：权限控制（需要后端支持）
5. **投票通知**：投票相关通知（需要后端支持）

## 🤝 协作

### 需要后端支持
- 扩展VoteType枚举，添加ABSTAIN类型
- 实现取消投票API
- 提供投票详情查询API
- 实现投票权限控制
- 投票相关通知推送

## 📄 License

MIT

---

**创建时间**：2026-03-21
**版本**：v1.0
**作者**：前端开发 (Frontend Developer Agent)
