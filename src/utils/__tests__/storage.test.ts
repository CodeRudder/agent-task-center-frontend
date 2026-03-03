import { describe, it, expect, beforeEach } from 'vitest'
import { storage, formatDate, isOverdue, getPriorityColor, getStatusColor } from '../storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('storage.get/set', () => {
    it('should set and get data from localStorage', () => {
      const data = { name: 'test', value: 123 }
      storage.set('test-key', data)
      const result = storage.get('test-key')
      expect(result).toEqual(data)
    })

    it('should return null for non-existent key', () => {
      const result = storage.get('non-existent')
      expect(result).toBeNull()
    })

    it('should remove data from localStorage', () => {
      storage.set('test-key', { data: 'test' })
      storage.remove('test-key')
      const result = storage.get('test-key')
      expect(result).toBeNull()
    })

    it('should clear all data', () => {
      storage.set('key1', 'value1')
      storage.set('key2', 'value2')
      storage.clear()
      expect(storage.get('key1')).toBeNull()
      expect(storage.get('key2')).toBeNull()
    })
  })

  describe('ETag operations', () => {
    it('should set and get ETag', () => {
      const url = '/api/tasks'
      const etag = 'v1'
      storage.setEtag(url, etag)
      expect(storage.getEtag(url)).toBe(etag)
    })

    it('should clear all ETags', () => {
      storage.setEtag('/api/tasks', 'v1')
      storage.setEtag('/api/agents', 'v2')
      storage.clearEtags()
      expect(storage.getEtag('/api/tasks')).toBeNull()
      expect(storage.getEtag('/api/agents')).toBeNull()
    })
  })
})

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = '2026-03-03T10:00:00.000Z'
    const result = formatDate(date)
    expect(result).toContain('2026')
    expect(result).toContain('03')
  })
})

describe('isOverdue', () => {
  it('should return true for past dates', () => {
    const pastDate = '2020-01-01T00:00:00.000Z'
    expect(isOverdue(pastDate)).toBe(true)
  })

  it('should return false for future dates', () => {
    const futureDate = '2030-01-01T00:00:00.000Z'
    expect(isOverdue(futureDate)).toBe(false)
  })
})

describe('getPriorityColor', () => {
  it('should return correct color for each priority', () => {
    expect(getPriorityColor('low')).toBe('default')
    expect(getPriorityColor('medium')).toBe('blue')
    expect(getPriorityColor('high')).toBe('orange')
    expect(getPriorityColor('urgent')).toBe('red')
  })

  it('should return default for unknown priority', () => {
    expect(getPriorityColor('unknown')).toBe('default')
  })
})

describe('getStatusColor', () => {
  it('should return correct color for each status', () => {
    expect(getStatusColor('pending')).toBe('default')
    expect(getStatusColor('in_progress')).toBe('processing')
    expect(getStatusColor('completed')).toBe('success')
    expect(getStatusColor('accepted')).toBe('success')
    expect(getStatusColor('rejected')).toBe('error')
  })
})
