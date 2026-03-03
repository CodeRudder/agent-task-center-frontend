import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../auth.service'
import api from '../api'

vi.mock('../api')

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call API with correct credentials', async () => {
      const mockResponse = {
        accessToken: 'test-token',
        user: { id: 1, email: 'test@example.com', name: 'Test', role: 'admin' },
      }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('register', () => {
    it('should call API with correct registration data', async () => {
      const mockResponse = {
        accessToken: 'test-token',
        user: { id: 1, email: 'new@example.com', name: 'New User', role: 'user' },
      }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      })

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const mockResponse = { accessToken: 'new-token' }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await authService.refreshToken('refresh-token')

      expect(api.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'refresh-token',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch current user data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      }
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      const result = await authService.getCurrentUser()

      expect(api.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockUser)
    })
  })

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await authService.logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout')
    })
  })
})
