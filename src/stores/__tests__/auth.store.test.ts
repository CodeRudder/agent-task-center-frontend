import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ user: null, token: null })
  })

  it('should have initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
  })

  it('should login user', () => {
    const user = { id: 1, email: 'test@example.com', name: 'Test', role: 'admin' }
    const token = 'test-token'

    useAuthStore.getState().login(user, token)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(user)
    expect(state.token).toBe(token)
    expect(localStorage.getItem('accessToken')).toBe(token)
  })

  it('should logout user', () => {
    const user = { id: 1, email: 'test@example.com', name: 'Test', role: 'admin' }
    const token = 'test-token'

    useAuthStore.getState().login(user, token)
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('should update user', () => {
    const user = { id: 1, email: 'test@example.com', name: 'Test', role: 'admin' }
    useAuthStore.getState().login(user, 'test-token')

    useAuthStore.getState().updateUser({ name: 'Updated Name' })

    const state = useAuthStore.getState()
    expect(state.user?.name).toBe('Updated Name')
  })
})
