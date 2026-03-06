/**
 * Token 显示对话框组件
 */
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { cn } from '@/utils/cn';
import { copyToClipboard } from '@/utils/format';

export interface TokenDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  agentName: string;
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({
  isOpen,
  onClose,
  token,
  agentName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(token);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="space-y-6">
        {/* 警告提示 */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900">⚠️ 重要提示</h3>
            <p className="text-sm text-amber-700 mt-1">
              Token已成功生成！此Token仅显示一次，请立即复制并妥善保存。
              关闭后将无法再次查看。
            </p>
          </div>
        </div>

        {/* Token显示区 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            API Token
          </label>
          <div className="relative">
            <code className={cn(
              'block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg',
              'font-mono text-sm text-gray-900 break-all',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}>
              {token}
            </code>
            <button
              onClick={handleCopy}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'px-3 py-1.5 bg-blue-500 text-white rounded-md',
                'hover:bg-blue-600 transition-colors',
                'flex items-center gap-2 text-sm font-medium'
              )}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制
                </>
              )}
            </button>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">使用说明</h4>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span>复制上方的Token</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span>配置到您的Agent应用中</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>
                <code className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  Authorization: Bearer {'{token}'}
                </code>
              </span>
            </li>
          </ol>
        </div>

        {/* 安全建议 */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">💡 安全建议</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>不要将Token提交到代码仓库</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>使用环境变量存储Token</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>定期重新生成Token</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>发现泄露立即撤销</span>
            </li>
          </ul>
        </div>

        {/* 关闭按钮 */}
        <div className="flex justify-end">
          <Button onClick={onClose} size="lg">
            我已保存，关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TokenDisplay;
