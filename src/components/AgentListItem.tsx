/**
 * Agent 列表项组件
 */
import React from 'react';
import { Bot, MoreVertical } from 'lucide-react';
import { Agent, TokenStatus, AgentStatus } from '@/types';
import { cn } from '@/utils/cn';
import { formatRelativeTime, formatLoadRate } from '@/utils/format';
import StatusBadge from './StatusBadge';
import Tag from './Tag';

export interface AgentListItemProps {
  agent: Agent;
  selected: boolean;
  onSelect: (agentId: string) => void;
  onViewDetails: (agent: Agent) => void;
  onGenerateToken: (agentId: string) => void;
  onRegenerateToken: (agentId: string) => void;
  onRevokeToken: (agentId: string) => void;
  onViewLogs: (agentId: string) => void;
}

export const AgentListItem: React.FC<AgentListItemProps> = ({
  agent,
  selected,
  onSelect,
  onViewDetails,
  onGenerateToken,
  onRegenerateToken,
  onRevokeToken,
  onViewLogs,
}) => {
  const loadRate = formatLoadRate(agent.currentTasks, agent.maxTasks);

  const tokenStatusConfig = {
    [TokenStatus.GENERATED]: { text: '已生成', color: 'success' },
    [TokenStatus.REVOKED]: { text: '已撤销', color: 'danger' },
    [TokenStatus.NONE]: { text: '未生成', color: 'warning' },
  };

  const statusConfig = {
    [AgentStatus.ONLINE]: 'online',
    [AgentStatus.OFFLINE]: 'offline',
    [AgentStatus.BUSY]: 'busy',
  } as const;

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 border-b border-gray-200',
        'hover:bg-gray-50 transition-colors',
        selected && 'bg-blue-50'
      )}
    >
      {/* 选择框 */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(agent.id)}
        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />

      {/* Agent信息 */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Bot className="h-5 w-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">{agent.name}</h3>
            <Tag size="sm">{agent.type}</Tag>
          </div>
          <p className="text-xs text-gray-500 truncate">{agent.description}</p>
        </div>
      </div>

      {/* 状态 */}
      <div className="w-24 flex-shrink-0">
        <StatusBadge status={statusConfig[agent.status]} size="sm" />
      </div>

      {/* Token状态 */}
      <div className="w-24 flex-shrink-0">
        <StatusBadge
          status={tokenStatusConfig[agent.tokenStatus].color as any}
          text={tokenStatusConfig[agent.tokenStatus].text}
          size="sm"
        />
      </div>

      {/* 当前任务 */}
      <div className="w-28 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900">
            {agent.currentTasks}/{agent.maxTasks}
          </span>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                loadRate >= 80 ? 'bg-red-500' : loadRate >= 60 ? 'bg-yellow-500' : 'bg-green-500'
              )}
              style={{ width: `${loadRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 最后活跃 */}
      <div className="w-32 flex-shrink-0">
        <span className="text-sm text-gray-500">
          {formatRelativeTime(agent.lastActiveAt)}
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="flex-shrink-0">
        <AgentActionMenu
          agent={agent}
          onViewDetails={() => onViewDetails(agent)}
          onGenerateToken={() => onGenerateToken(agent.id)}
          onRegenerateToken={() => onRegenerateToken(agent.id)}
          onRevokeToken={() => onRevokeToken(agent.id)}
          onViewLogs={() => onViewLogs(agent.id)}
        />
      </div>
    </div>
  );
};

interface AgentActionMenuProps {
  agent: Agent;
  onViewDetails: () => void;
  onGenerateToken: () => void;
  onRegenerateToken: () => void;
  onRevokeToken: () => void;
  onViewLogs: () => void;
}

const AgentActionMenu: React.FC<AgentActionMenuProps> = ({
  agent,
  onViewDetails,
  onGenerateToken,
  onRegenerateToken,
  onRevokeToken,
  onViewLogs,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <button
              onClick={() => {
                onViewDetails();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              查看详情
            </button>

            {agent.tokenStatus === TokenStatus.NONE && (
              <button
                onClick={() => {
                  onGenerateToken();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                生成Token
              </button>
            )}

            {agent.tokenStatus === TokenStatus.GENERATED && (
              <>
                <button
                  onClick={() => {
                    onRegenerateToken();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  重新生成
                </button>
                <button
                  onClick={() => {
                    onRevokeToken();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  撤销Token
                </button>
              </>
            )}

            <button
              onClick={() => {
                onViewLogs();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              查看日志
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AgentListItem;
