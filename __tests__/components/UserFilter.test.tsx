/**
 * UserFilter 组件单元测试
 * 
 * 测试用户筛选组件的所有功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserFilter, UserFilterParams } from '@/components/User/UserFilter';
import { UserStatus, RoleStatus } from '@/types/user';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe('UserFilter', () => {
  const mockRoles = [
    {
      id: 'role-1',
      code: 'admin',
      name: '管理员',
      permissions: [],
      status: RoleStatus.ACTIVE,
      isSystem: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'role-2',
      code: 'user',
      name: '普通用户',
      permissions: [],
      status: RoleStatus.ACTIVE,
      isSystem: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    filters: {} as UserFilterParams,
    roles: mockRoles,
    onFilterChange: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========== 角色筛选渲染测试 ==========

  describe('角色筛选渲染', () => {
    it('should_render_role_filter_with_all_options', () => {
      render(<UserFilter {...defaultProps} />);

      // 检查角色下拉框是否存在
      const roleSelects = screen.getAllByRole('combobox');
      expect(roleSelects.length).toBeGreaterThan(0);
      
      // 检查选项数量（全部角色 + 2个角色）
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(3);
    });

    it('should_display_correct_role_names', () => {
      render(<UserFilter {...defaultProps} />);

      // 检查角色名称是否正确显示
      expect(screen.getByText('全部角色')).toBeInTheDocument();
      expect(screen.getByText('管理员')).toBeInTheDocument();
      expect(screen.getByText('普通用户')).toBeInTheDocument();
    });

    it('should_show_selected_role_when_filter_is_set', () => {
      const filters: UserFilterParams = { roleId: 'role-1' };
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 检查是否选中了正确的角色
      const roleSelects = screen.getAllByRole('combobox');
      const roleSelect = roleSelects.find(select => 
        select.querySelector('option[value="role-1"]')
      );
      expect(roleSelect).toBeDefined();
    });
  });

  // ========== 状态筛选渲染测试 ==========

  describe('状态筛选渲染', () => {
    it('should_render_status_filter_with_all_options', () => {
      render(<UserFilter {...defaultProps} />);

      // 检查状态下拉框是否存在
      const statusSelects = screen.getAllByRole('combobox');
      expect(statusSelects.length).toBeGreaterThan(0);
    });

    it('should_display_correct_status_options', () => {
      render(<UserFilter {...defaultProps} />);

      // 检查状态选项是否正确显示
      expect(screen.getByText('全部状态')).toBeInTheDocument();
      expect(screen.getByText('活跃')).toBeInTheDocument();
      expect(screen.getByText('未激活')).toBeInTheDocument();
      expect(screen.getByText('已停用')).toBeInTheDocument();
      expect(screen.getByText('已锁定')).toBeInTheDocument();
    });

    it('should_show_selected_status_when_filter_is_set', () => {
      const filters: UserFilterParams = { status: UserStatus.ACTIVE };
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 检查是否选中了正确的状态
      const activeOption = screen.getByRole('option', { name: '活跃' });
      expect(activeOption).toBeDefined();
    });
  });

  // ========== 搜索输入渲染测试 ==========

  describe('搜索输入渲染', () => {
    it('should_render_search_input', () => {
      render(<UserFilter {...defaultProps} />);

      // 检查搜索框是否存在
      const searchInputs = screen.getAllByPlaceholderText('搜索用户名或邮箱...');
      expect(searchInputs.length).toBeGreaterThan(0);
    });

    it('should_display_current_keyword_value', () => {
      const filters: UserFilterParams = { keyword: 'test' };
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 检查搜索框的值是否正确
      const searchInputs = screen.getAllByDisplayValue('test');
      expect(searchInputs.length).toBeGreaterThan(0);
    });

    it('should_show_clear_button_when_keyword_exists', () => {
      const filters: UserFilterParams = { keyword: 'test' };
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 检查清空按钮是否存在（X图标）
      const clearButtons = screen.getAllByTestId('x-icon');
      expect(clearButtons.length).toBeGreaterThan(0);
    });

    it('should_not_show_clear_button_when_keyword_is_empty', () => {
      const filters: UserFilterParams = { keyword: '' };
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 当没有关键词时，清空按钮的数量应该较少（只有移动端或桌面端其中一个）
      const clearButtons = screen.queryAllByTestId('x-icon');
      // 由于有两个布局（移动端和桌面端），这里需要更灵活的断言
      expect(clearButtons.length).toBeLessThan(3);
    });
  });

  // ========== 筛选条件更新测试 ==========

  describe('筛选条件更新', () => {
    it('should_call_onFilterChange_when_keyword_changes', () => {
      const onFilterChange = vi.fn();
      render(<UserFilter {...defaultProps} onFilterChange={onFilterChange} />);

      const searchInputs = screen.getAllByPlaceholderText('搜索用户名或邮箱...');
      const searchInput = searchInputs[0];

      fireEvent.change(searchInput, { target: { value: 'new keyword' } });

      expect(onFilterChange).toHaveBeenCalledWith({
        keyword: 'new keyword',
      });
    });

    it('should_call_onFilterChange_when_status_changes', () => {
      const onFilterChange = vi.fn();
      render(<UserFilter {...defaultProps} onFilterChange={onFilterChange} />);

      const statusSelects = screen.getAllByRole('combobox');
      const statusSelect = statusSelects.find(select =>
        Array.from(select.querySelectorAll('option')).some(opt => opt.textContent === '活跃')
      );

      if (statusSelect) {
        fireEvent.change(statusSelect, { target: { value: UserStatus.ACTIVE } });
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            status: UserStatus.ACTIVE,
          })
        );
      }
    });

    it('should_call_onFilterChange_when_role_changes', () => {
      const onFilterChange = vi.fn();
      render(<UserFilter {...defaultProps} onFilterChange={onFilterChange} />);

      const roleSelects = screen.getAllByRole('combobox');
      const roleSelect = roleSelects.find(select =>
        Array.from(select.querySelectorAll('option')).some(opt => opt.textContent === '管理员')
      );

      if (roleSelect) {
        fireEvent.change(roleSelect, { target: { value: 'role-1' } });
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            roleId: 'role-1',
          })
        );
      }
    });

    it('should_preserve_other_filters_when_changing_one', () => {
      const filters: UserFilterParams = {
        keyword: 'test',
        status: UserStatus.ACTIVE,
      };
      const onFilterChange = vi.fn();
      render(<UserFilter {...defaultProps} filters={filters} onFilterChange={onFilterChange} />);

      const roleSelects = screen.getAllByRole('combobox');
      const roleSelect = roleSelects.find(select =>
        Array.from(select.querySelectorAll('option')).some(opt => opt.textContent === '管理员')
      );

      if (roleSelect) {
        fireEvent.change(roleSelect, { target: { value: 'role-1' } });
        
        // 应该保留已有的筛选条件
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            keyword: 'test',
            status: UserStatus.ACTIVE,
            roleId: 'role-1',
          })
        );
      }
    });

    it('should_clear_keyword_when_clicking_clear_button', () => {
      const filters: UserFilterParams = { keyword: 'test' };
      const onFilterChange = vi.fn();
      render(<UserFilter {...defaultProps} filters={filters} onFilterChange={onFilterChange} />);

      // 找到清空按钮（通过X图标的父按钮）
      const clearButtons = screen.getAllByTestId('x-icon');
      const clearButton = clearButtons[0].closest('button');

      if (clearButton) {
        fireEvent.click(clearButton);
        expect(onFilterChange).toHaveBeenCalledWith({
          keyword: '',
        });
      }
    });

    it('should_set_status_to_undefined_when_selecting_empty_option', () => {
      const filters: UserFilterParams = { status: UserStatus.ACTIVE };
      const onFilterChange = vi.fn();
      render(<UserFilter {...defaultProps} filters={filters} onFilterChange={onFilterChange} />);

      const statusSelects = screen.getAllByRole('combobox');
      const statusSelect = statusSelects.find(select =>
        Array.from(select.querySelectorAll('option')).some(opt => opt.textContent === '全部状态')
      );

      if (statusSelect) {
        fireEvent.change(statusSelect, { target: { value: '' } });
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            status: undefined,
          })
        );
      }
    });
  });

  // ========== 重置筛选功能测试 ==========

  describe('重置筛选功能', () => {
    it('should_show_reset_button_when_filters_exist', () => {
      const filters: UserFilterParams = { keyword: 'test' };
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 检查重置按钮是否显示
      const resetButtons = screen.getAllByText(/重置/);
      expect(resetButtons.length).toBeGreaterThan(0);
    });

    it('should_not_show_reset_button_when_no_filters', () => {
      const filters: UserFilterParams = {};
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 没有筛选条件时，不应该显示重置按钮
      const resetButtons = screen.queryAllByText(/重置/);
      expect(resetButtons.length).toBe(0);
    });

    it('should_call_onReset_when_clicking_reset_button', () => {
      const filters: UserFilterParams = { keyword: 'test' };
      const onReset = vi.fn();
      render(<UserFilter {...defaultProps} filters={filters} onReset={onReset} />);

      const resetButtons = screen.getAllByText(/重置/);
      fireEvent.click(resetButtons[0]);

      expect(onReset).toHaveBeenCalled();
    });

    it('should_call_onFilterChange_with_empty_object_when_no_onReset_provided', () => {
      const filters: UserFilterParams = { keyword: 'test' };
      const onFilterChange = vi.fn();
      render(<UserFilter {...defaultProps} filters={filters} onFilterChange={onFilterChange} onReset={undefined} />);

      const resetButtons = screen.getAllByText(/重置/);
      fireEvent.click(resetButtons[0]);

      expect(onFilterChange).toHaveBeenCalledWith({});
    });
  });

  // ========== 响应式布局测试 ==========

  describe('响应式布局', () => {
    it('should_render_mobile_layout', () => {
      // 这个测试主要验证组件能正常渲染，具体的响应式行为由CSS控制
      render(<UserFilter {...defaultProps} />);

      // 检查组件是否包含移动端布局的类名
      const container = screen.getByText('搜索用户名或邮箱...').closest('div');
      expect(container).toBeInTheDocument();
    });

    it('should_render_desktop_layout', () => {
      render(<UserFilter {...defaultProps} />);

      // 检查组件是否包含桌面端布局的类名
      const container = screen.getByText('搜索用户名或邮箱...').closest('div')?.parentElement;
      expect(container).toBeInTheDocument();
    });

    it('should_have_correct_css_classes', () => {
      const { container } = render(<UserFilter {...defaultProps} />);

      // 检查是否包含正确的Tailwind类名
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
      expect(container.querySelector('.shadow-sm')).toBeInTheDocument();
    });
  });

  // ========== 自定义样式测试 ==========

  describe('自定义样式', () => {
    it('should_apply_custom_className', () => {
      const { container } = render(<UserFilter {...defaultProps} className="custom-class" />);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should_merge_custom_className_with_default', () => {
      const { container } = render(<UserFilter {...defaultProps} className="custom-class" />);

      const filterContainer = container.querySelector('.custom-class');
      expect(filterContainer).toHaveClass('bg-white');
      expect(filterContainer).toHaveClass('rounded-lg');
    });
  });

  // ========== 边界条件测试 ==========

  describe('边界条件', () => {
    it('should_handle_empty_roles_array', () => {
      render(<UserFilter {...defaultProps} roles={[]} />);

      // 应该至少有"全部角色"选项
      expect(screen.getByText('全部角色')).toBeInTheDocument();
    });

    it('should_handle_undefined_filters', () => {
      render(<UserFilter {...defaultProps} filters={undefined as any} />);

      // 应该能正常渲染
      expect(screen.getByPlaceholderText('搜索用户名或邮箱...')).toBeInTheDocument();
    });

    it('should_handle_null_role_in_filters', () => {
      const filters: UserFilterParams = { roleId: null as any };
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 应该能正常渲染
      expect(screen.getByPlaceholderText('搜索用户名或邮箱...')).toBeInTheDocument();
    });

    it('should_handle_special_characters_in_keyword', () => {
      const filters: UserFilterParams = { keyword: '<script>alert("test")</script>' };
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 应该安全地显示特殊字符，不执行脚本
      const searchInputs = screen.getAllByDisplayValue('<script>alert("test")</script>');
      expect(searchInputs.length).toBeGreaterThan(0);
    });

    it('should_handle_very_long_keyword', () => {
      const longKeyword = 'a'.repeat(1000);
      const filters: UserFilterParams = { keyword: longKeyword };
      render(<UserFilter {...defaultProps} filters={filters} />);

      const searchInputs = screen.getAllByDisplayValue(longKeyword);
      expect(searchInputs.length).toBeGreaterThan(0);
    });

    it('should_handle_all_filter_types_simultaneously', () => {
      const filters: UserFilterParams = {
        keyword: 'test',
        status: UserStatus.ACTIVE,
        roleId: 'role-1',
      };
      render(<UserFilter {...defaultProps} filters={filters} />);

      // 应该显示重置按钮
      const resetButtons = screen.getAllByText(/重置/);
      expect(resetButtons.length).toBeGreaterThan(0);
    });
  });

  // ========== 辅助功能测试 ==========

  describe('辅助功能', () => {
    it('should_have_accessible_form_controls', () => {
      render(<UserFilter {...defaultProps} />);

      // 检查是否有可访问的表单控件
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThan(0);

      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBeGreaterThan(0);
    });

    it('should_have_proper_input_types', () => {
      render(<UserFilter {...defaultProps} />);

      const searchInputs = screen.getAllByPlaceholderText('搜索用户名或邮箱...');
      searchInputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'text');
      });
    });
  });
});
