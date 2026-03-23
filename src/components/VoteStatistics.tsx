import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { VoteStats } from '../types/vote';

/**
 * 投票统计组件属性
 */
export interface VoteStatisticsProps {
  /** 投票统计数据 */
  stats: VoteStats | null;
  /** 弃权票数（前端统计） */
  abstainCount?: number;
  /** 总用户数（用于计算参与率） */
  totalUsers?: number;
  /** 是否显示图表 */
  showChart?: boolean;
  /** 图表高度 */
  chartHeight?: number;
  /** 是否显示参与率 */
  showParticipation?: boolean;
}

/**
 * 颜色配置
 */
const COLORS = {
  upvote: '#10B981',  // 绿色
  downvote: '#EF4444', // 红色
  abstain: '#6B7280',  // 灰色
};

/**
 * 自定义Tooltip组件
 * 必须定义在VoteStatistics外部，避免在渲染时创建组件
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = data.value + (payload[1]?.value || 0); // 简化计算
    const percentage = total > 0 ? Math.round((data.value / total) * 100) : 0;
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-gray-600">
          票数: <span className="font-medium">{data.value}</span>
        </p>
        <p className="text-sm text-gray-600">
          占比: <span className="font-medium">{percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * 投票统计组件
 * 
 * 显示投票统计数字和柱状图
 */
export const VoteStatistics: React.FC<VoteStatisticsProps> = ({
  stats,
  abstainCount = 0,
  totalUsers = 0,
  showChart = true,
  chartHeight = 200,
  showParticipation = true,
}) => {
  if (!stats) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
        暂无投票数据
      </div>
    );
  }

  // 计算百分比
  const calculatePercentage = (count: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // 准备图表数据
  const chartData = [
    { name: '支持', value: stats.upvotes, color: COLORS.upvote },
    { name: '反对', value: stats.downvotes, color: COLORS.downvote },
  ];

  // 如果有弃权，添加到图表
  if (abstainCount > 0) {
    chartData.push({ name: '弃权', value: abstainCount, color: COLORS.abstain });
  }

  // 计算参与率
  const totalVotes = stats.totalVotes + abstainCount;
  const participationRate = totalUsers > 0 
    ? Math.round((totalVotes / totalUsers) * 100) 
    : 0;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <span role="img" aria-label="统计">📊</span>
        <span>投票统计</span>
      </h3>

      {/* 数字统计 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* 支持 */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl" role="img" aria-label="支持">👍</span>
            <span className="text-sm font-medium text-green-700">支持</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-600">{stats.upvotes}</span>
            <span className="text-sm text-green-600">
              ({calculatePercentage(stats.upvotes, totalVotes)}%)
            </span>
          </div>
        </div>

        {/* 反对 */}
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl" role="img" aria-label="反对">👎</span>
            <span className="text-sm font-medium text-red-700">反对</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-600">{stats.downvotes}</span>
            <span className="text-sm text-red-600">
              ({calculatePercentage(stats.downvotes, totalVotes)}%)
            </span>
          </div>
        </div>

        {/* 弃权（如果有） */}
        {abstainCount > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" role="img" aria-label="弃权">😐</span>
              <span className="text-sm font-medium text-gray-700">弃权</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-600">{abstainCount}</span>
              <span className="text-sm text-gray-600">
                ({calculatePercentage(abstainCount, totalVotes)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 柱状图 */}
      {showChart && totalVotes > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">投票分布</h4>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 参与率 */}
      {showParticipation && totalUsers > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">参与率</span>
            <span className="text-sm font-semibold text-gray-900">
              {participationRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${participationRate}%` }}
              role="progressbar"
              aria-valuenow={participationRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="投票参与率"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {totalVotes} / {totalUsers} 人已投票
          </p>
        </div>
      )}

      {/* 总票数和得分 */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
        <div className="text-gray-600">
          总票数: <span className="font-semibold text-gray-900">{totalVotes}</span>
        </div>
        <div className="text-gray-600">
          得分: <span className="font-semibold text-gray-900">{stats.score}</span>
          <span className="text-xs text-gray-500 ml-1">(支持-反对)</span>
        </div>
      </div>
    </div>
  );
};

export default VoteStatistics;
