/**
 * 选择框组件
 */
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = '请选择',
      label,
      error,
      helperText,
      disabled = false,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // 点击外部关闭下拉菜单
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleSelect = (optionValue: string) => {
      const option = options.find((opt) => opt.value === optionValue);
      if (option && !option.disabled) {
        onChange?.(optionValue);
        setIsOpen(false);
      }
    };

    return (
      <div className="w-full" ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div ref={selectRef} className="relative">
          {/* 触发器 */}
          <button
            type="button"
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm text-left transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'flex items-center justify-between',
              disabled
                ? 'bg-gray-100 cursor-not-allowed border-gray-300'
                : 'bg-white border-gray-300 hover:border-gray-400',
              error ? 'border-red-500 focus:ring-red-500' : '',
              className
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className={cn(!value && 'text-gray-400')}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {/* 下拉菜单 */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">无选项</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'w-full px-3 py-2 text-sm text-left transition-colors',
                      'hover:bg-gray-50',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      value === option.value && 'bg-blue-50 text-blue-600 font-medium'
                    )}
                    onClick={() => handleSelect(option.value)}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
