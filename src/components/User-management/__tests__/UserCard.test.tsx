/**
 * UserCard 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserCard } from '../UserCard'
import type { User } from '../types'

describe('UserCard', () => {
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    roles: [
      {
        id: '1',
        name: '管理员',
        description: '系统管理员',
        permissions: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
    status: 'active',
    lastLoginAt: '2024-03-21T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-21T10:00:00Z',
  }

  it('应该渲染用户信息', () => {
    render(<UserCard user={mockUser} />)

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('@testuser')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('活跃')).toBeInTheDocument()
  })

  it('应该显示用户角色', () => {
    render(<UserCard user={mockUser} />)

    expect(screen.getByText('管理员')).toBeInTheDocument()
  })

  it('应该调用编辑回调', async () => {
    const onEdit = vi.fn()
    render(<UserCard user={mockUser} onEdit={onEdit} />)

    // 点击更多操作按钮
    const moreButton = screen.getByLabelText('更多操作')
    fireEvent.click(moreButton)

    // 等待菜单出现
    await waitFor(() => {
      expect(screen.getByText('编辑用户')).toBeInTheDocument()
    })

    // 点击编辑
    fireEvent.click(screen.getByText('编辑用户'))

    expect(onEdit).toHaveBeenCalledWith(mockUser)
  })

  it('应该调用删除回调', async () => {
    const onDelete = vi.fn()
    window.confirm = vi.fn(() => true)

    render(<UserCard user={mockUser} onDelete={onDelete} />)

    // 点击更多操作按钮
    const moreButton = screen.getByLabelText('更多操作')
    fireEvent.click(moreButton)

    // 等待菜单出现
    await waitFor(() => {
      expect(screen.getByText('删除用户')).toBeInTheDocument()
    })

    // 点击删除
    fireEvent.click(screen.getByText('删除用户'))

    expect(window.confirm).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('应该调用状态变更回调', async () => {
    const onStatusChange = vi.fn()
    render(<UserCard user={mockUser} onStatusChange={onStatusChange} />)

    // 点击更多操作按钮
    const moreButton = screen.getByLabelText('更多操作')
    fireEvent.click(moreButton)

    // 等待菜单出现
    await waitFor(() => {
      expect(screen.getByText('未激活')).toBeInTheDocument()
    })

    // 点击状态变更
    fireEvent.click(screen.getByText('未激活'))

    expect(onStatusChange).toHaveBeenCalledWith('1', 'inactive')
  })

  it('应该正确显示不同的状态', () => {
    const inactiveUser = { ...mockUser, status: 'inactive' as const }
    const { rerender } = render(<UserCard user={inactiveUser} />)

    expect(screen.getByText('未激活')).toBeInTheDocument()

    const suspendedUser = { ...mockUser, status: 'suspended' as const }
    rerender(<UserCard user={suspendedUser} />)

    expect(screen.getByText('已停用')).toBeInTheDocument()
  })

  it('应该显示用户头像', () => {
    render(<UserCard user={mockUser} />)

    const avatar = document.querySelector('img')
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    expect(avatar).toHaveAttribute('alt', 'Test User')
  })

  it('没有头像时应该显示首字母', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined }
    render(<UserCard user={userWithoutAvatar} />)

    expect(screen.getByText('T')).toBeInTheDocument()
  })
})
