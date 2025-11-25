// Utils Tests
// Test utility functions

import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  test('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  test('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
  })

  test('should filter out falsy values', () => {
    expect(cn('class1', null, undefined, false, 'class2')).toBe('class1 class2')
  })

  test('should handle empty input', () => {
    expect(cn()).toBe('')
  })
})

