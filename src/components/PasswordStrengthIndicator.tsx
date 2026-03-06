/**
 * 密码强度指示器组件
 */
import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PasswordValidation } from '@/types';

export interface PasswordStrengthIndicatorProps {
  validation: PasswordValidation;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  validation,
}) => {
  const strengthConfig = {
    weak: { color: 'bg-red-500', text: '弱', textColor: 'text-red-600' },
    medium: { color: 'bg-yellow-500', text: '中', textColor: 'text-yellow-600' },
    strong: { color: 'bg-green-500', text: '强', textColor: 'text-green-600' },
  };

  const strength = validation.strength;
  const config = strengthConfig[strength];

  const metCount = Object.values(validation.requirements).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* 强度条 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-700">密码强度</span>
          <span className={cn('font-medium', config.textColor)}>{config.text}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', config.color)}
            style={{ width: `${(metCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* 要求列表 */}
      <div className="space-y-2">
        <RequirementItem
          met={validation.requirements.minLength}
          text="至少8个字符"
        />
        <RequirementItem
          met={validation.requirements.uppercase}
          text="包含大写字母"
        />
        <RequirementItem
          met={validation.requirements.lowercase}
          text="包含小写字母"
        />
        <RequirementItem
          met={validation.requirements.number}
          text="包含数字"
        />
        <RequirementItem
          met={validation.requirements.specialChar}
          text="包含特殊字符"
        />
      </div>
    </div>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => {
  return (
    <div className={cn('flex items-center gap-2 text-sm', met ? 'text-green-600' : 'text-gray-400')}>
      {met ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span>{text}</span>
    </div>
  );
};

export default PasswordStrengthIndicator;
