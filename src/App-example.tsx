import { VotingArea } from './components/VotingArea';
import { VotingSummary } from './components/VotingSummary';
import './index.css';

/**
 * 示例页面：展示投票组件的使用
 */
function App() {
  const handleVoteSummaryClick = (taskId: string) => {
    console.log(`Clicked voting summary for task ${taskId}`);
    // 在实际应用中，这里会跳转到任务详情页
    alert(`跳转到任务 ${taskId} 的详情页`);
  };

  const mockTasks = [
    {
      id: 'task-001',
      title: '实现用户登录功能',
      status: '进行中',
      assignee: '张三',
    },
    {
      id: 'task-002',
      title: '优化数据库查询性能',
      status: '待处理',
      assignee: '李四',
    },
    {
      id: 'task-003',
      title: '修复移动端显示问题',
      status: '已完成',
      assignee: '王五',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          V5.5 任务投票功能 - 示例页面
        </h1>

        {/* 任务列表示例 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📋 任务列表（投票摘要示例）
          </h2>
          <div className="space-y-3">
            {mockTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">#{task.id}</span>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    创建者：{task.assignee} | 状态：{task.status}
                  </div>
                </div>
                <div className="ml-4">
                  <VotingSummary
                    taskId={task.id}
                    onClick={() => handleVoteSummaryClick(task.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 任务详情示例 */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📄 任务详情（投票区域示例）
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                #task-001 实现用户登录功能
              </h3>
              <div className="text-sm text-gray-600">
                创建者：张三 | 状态：进行中 | 截止日期：2024-03-25
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">任务描述：</h4>
              <p className="text-gray-700 leading-relaxed">
                实现基于JWT的用户登录功能，支持邮箱和手机号登录。
                需要实现登录页面、API接口、Token刷新机制。
              </p>
            </div>

            {/* 投票区域组件 */}
            <VotingArea taskId="task-001" totalUsers={25} />
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">📖 使用说明</h2>
          <div className="text-blue-800 space-y-2">
            <p><strong>1. 投票区域组件 (VotingArea)</strong>：</p>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>用于任务详情页，显示完整的投票按钮和统计信息</li>
              <li>属性：<code className="bg-blue-100 px-1 rounded">taskId</code> (必需), <code className="bg-blue-100 px-1 rounded">totalUsers</code> (可选)</li>
            </ul>
            
            <p className="mt-3"><strong>2. 投票摘要组件 (VotingSummary)</strong>：</p>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>用于任务列表页，显示简洁的投票摘要</li>
              <li>属性：<code className="bg-blue-100 px-1 rounded">taskId</code> (必需), <code className="bg-blue-100 px-1 rounded">onClick</code> (可选)</li>
            </ul>

            <p className="mt-3"><strong>3. 后端API配置</strong>：</p>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>在 <code className="bg-blue-100 px-1 rounded">.env</code> 文件中配置 <code className="bg-blue-100 px-1 rounded">VITE_API_BASE_URL</code></li>
              <li>默认地址：<code className="bg-blue-100 px-1 rounded">http://localhost:3000</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
