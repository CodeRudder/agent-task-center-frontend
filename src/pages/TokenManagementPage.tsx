/**
 * Token 管理页面
 */
import { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { Agent, AgentStatus, AgentType } from '@/types';
import { cn } from '@/utils/cn';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/Button';
import Input from '@/components/Input';
import TokenDisplay from '@/components/TokenDisplay';
import AgentListItem from '@/components/AgentListItem';
import Modal from '@/components/Modal';

export default function TokenManagementPage() {
  const {
    agents,
    selectedAgents,
    isLoading,
    error,
    pagination,
    filters,
    loadAgents,
    toggleAgentSelection,
    toggleAllAgents,
    clearSelection,
    generateToken,
    regenerateToken,
    revokeToken,
    batchRevokeTokens,
    clearError,
  } = useAgentStore();

  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showTokenDisplay, setShowTokenDisplay] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [currentAgentName, setCurrentAgentName] = useState('');
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [agentToRevoke, setAgentToRevoke] = useState<Agent | null>(null);
  const [confirmAgentName, setConfirmAgentName] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 加载Agent列表
  useEffect(() => {
    loadAgents({
      search: debouncedSearchTerm,
      status: statusFilter === 'all' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
      sortBy,
    });
  }, [debouncedSearchTerm, statusFilter, typeFilter, sortBy]);

  // 清除错误
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [error]);

  const allSelected = agents.length > 0 && selectedAgents.length === agents.length;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleGenerateToken = async (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;

      const token = await generateToken(agentId);
      setGeneratedToken(token);
      setCurrentAgentName(agent.name);
      setShowTokenDisplay(true);
      showToast('Token生成成功', 'success');
    } catch (error: any) {
      showToast(error.message || '生成Token失败', 'error');
    }
  };

  const handleRegenerateToken = async (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;

      const token = await regenerateToken(agentId);
      setGeneratedToken(token);
      setCurrentAgentName(agent.name);
      setShowTokenDisplay(true);
      showToast('Token重新生成成功', 'success');
    } catch (error: any) {
      showToast(error.message || '重新生成Token失败', 'error');
    }
  };

  const handleRevokeTokenClick = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    setAgentToRevoke(agent);
    setConfirmAgentName('');
    setShowRevokeConfirm(true);
  };

  const handleConfirmRevoke = async () => {
    if (!agentToRevoke || confirmAgentName !== agentToRevoke.name) {
      showToast('请输入正确的Agent名称确认', 'error');
      return;
    }

    try {
      await revokeToken(agentToRevoke.id);
      showToast('Token已撤销', 'success');
      setShowRevokeConfirm(false);
      setAgentToRevoke(null);
      setConfirmAgentName('');
    } catch (error: any) {
      showToast(error.message || '撤销Token失败', 'error');
    }
  };

  const handleBatchRevoke = async () => {
    if (selectedAgents.length === 0) {
      showToast('请先选择要操作的Agent', 'warning');
      return;
    }

    try {
      const result = await batchRevokeTokens(selectedAgents);
      showToast(`成功撤销 ${result.success} 个Token`, 'success');
      clearSelection();
    } catch (error: any) {
      showToast(error.message || '批量撤销失败', 'error');
    }
  };

  const handleRefresh = () => {
    loadAgents({
      search: debouncedSearchTerm,
      status: statusFilter === 'all' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
      sortBy,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Token管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理Agent的API访问凭证</p>
        </div>

        {/* 筛选和搜索区 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <Input
                leftIcon={<Search className="h-4 w-4" />}
                placeholder="搜索Agent名称..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* 筛选器 */}
            <div className="flex gap-2">
              <select
                className={cn(
                  'px-3 py-2 border border-gray-300 rounded-lg text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                )}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">全部状态</option>
                <option value={AgentStatus.ONLINE}>在线</option>
                <option value={AgentStatus.OFFLINE}>离线</option>
                <option value={AgentStatus.BUSY}>忙碌</option>
              </select>

              <select
                className={cn(
                  'px-3 py-2 border border-gray-300 rounded-lg text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                )}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
              >
                <option value="all">全部类型</option>
                <option value={AgentType.DEVELOPMENT}>开发</option>
                <option value={AgentType.TESTING}>测试</option>
                <option value={AgentType.DESIGN}>设计</option>
                <option value={AgentType.OPERATIONS}>运维</option>
              </select>

              <select
                className={cn(
                  'px-3 py-2 border border-gray-300 rounded-lg text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                )}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">创建时间</option>
                <option value="name">名称</option>
                <option value="lastActiveAt">活跃时间</option>
              </select>

              <Button
                variant="secondary"
                onClick={handleRefresh}
                loading={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </div>

        {/* Agent列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 表头 */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAllAgents}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div className="flex-1 font-medium text-sm text-gray-700">
              Agent名称
            </div>
            <div className="w-24 font-medium text-sm text-gray-700">状态</div>
            <div className="w-24 font-medium text-sm text-gray-700">Token状态</div>
            <div className="w-28 font-medium text-sm text-gray-700">当前任务</div>
            <div className="w-32 font-medium text-sm text-gray-700">最后活跃</div>
            <div className="w-16"></div>
          </div>

          {/* 列表项 */}
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                加载中...
              </div>
            ) : agents.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <div className="text-gray-400 text-5xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  还没有Agent
                </h3>
                <p className="text-sm text-gray-500">创建第一个Agent开始使用</p>
              </div>
            ) : (
              agents.map((agent) => (
                <AgentListItem
                  key={agent.id}
                  agent={agent}
                  selected={selectedAgents.includes(agent.id)}
                  onSelect={toggleAgentSelection}
                  onViewDetails={(agent) => console.log('View details:', agent)}
                  onGenerateToken={handleGenerateToken}
                  onRegenerateToken={handleRegenerateToken}
                  onRevokeToken={handleRevokeTokenClick}
                  onViewLogs={(agentId) => console.log('View logs:', agentId)}
                />
              ))
            )}
          </div>

          {/* 底部操作区 */}
          {selectedAgents.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-700">
                已选择 {selectedAgents.length} 个Agent
              </span>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBatchRevoke}
                >
                  批量撤销Token
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearSelection}
                >
                  取消选择
                </Button>
              </div>
            </div>
          )}

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                共 {pagination.total} 条，第 {pagination.page}/{pagination.totalPages} 页
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => loadAgents({ ...filters, page: pagination.page - 1 })}
                >
                  上一页
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => loadAgents({ ...filters, page: pagination.page + 1 })}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Token显示对话框 */}
      <TokenDisplay
        isOpen={showTokenDisplay}
        onClose={() => setShowTokenDisplay(false)}
        token={generatedToken}
        agentName={currentAgentName}
      />

      {/* 撤销确认对话框 */}
      <Modal
        isOpen={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        title="⚠️ 确认撤销Token"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRevokeConfirm(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleConfirmRevoke}>
              确认撤销
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {agentToRevoke && (
            <>
              <p className="text-gray-700">
                您确定要撤销以下Agent的Token吗？
              </p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{agentToRevoke.name}</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">⚠️ 警告</h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• 撤销后，当前Token将立即失效</li>
                  <li>• Agent将无法访问API</li>
                  <li>• 正在执行的任务可能中断</li>
                  <li>• 需要重新生成Token并配置</li>
                </ul>
                {agentToRevoke.currentTasks > 0 && (
                  <p className="mt-2 font-medium text-amber-900">
                    当前有 {agentToRevoke.currentTasks} 个任务正在执行中
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  请输入Agent名称确认
                </label>
                <Input
                  value={confirmAgentName}
                  onChange={(e) => setConfirmAgentName(e.target.value)}
                  placeholder={agentToRevoke.name}
                  error={
                    confirmAgentName && confirmAgentName !== agentToRevoke.name
                      ? '名称不匹配'
                      : undefined
                  }
                />
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
