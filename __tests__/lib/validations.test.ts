// Validation Tests
// Test Zod schemas: valid/invalid inputs, error messages (Arabic), edge cases

import {
  businessProfileUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  orderCreateSchema,
  pluginInstallSchema,
  loginSchema,
} from '@/lib/validations'

describe('Business Profile Validation', () => {
  test('should validate valid profile update', () => {
    const valid = {
      name: 'Test Business',
      description: 'Test description',
      logo_url: 'https://example.com/logo.png',
      primary_color: '#3b82f6',
    }

    const result = businessProfileUpdateSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('should reject invalid URL', () => {
    const invalid = {
      logo_url: 'not-a-url',
    }

    const result = businessProfileUpdateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('رابط')
    }
  })

  test('should reject invalid hex color', () => {
    const invalid = {
      primary_color: 'red',
    }

    const result = businessProfileUpdateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('hex')
    }
  })

  test('should reject name shorter than 2 characters', () => {
    const invalid = {
      name: 'A',
    }

    const result = businessProfileUpdateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('حرفين')
    }
  })
})

describe('Product Validation', () => {
  test('should validate valid product', () => {
    const valid = {
      name: 'Test Product',
      description: 'Test description',
      price: 100,
      images: ['https://example.com/image.jpg'],
      category: 'Category 1',
      status: 'active' as const,
    }

    const result = productCreateSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('should reject missing name', () => {
    const invalid = {
      price: 100,
    }

    const result = productCreateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('مطلوب')
    }
  })

  test('should reject negative price', () => {
    const invalid = {
      name: 'Test Product',
      price: -10,
    }

    const result = productCreateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('صفر')
    }
  })

  test('should reject more than 10 images', () => {
    const invalid = {
      name: 'Test Product',
      price: 100,
      images: Array(11).fill('https://example.com/image.jpg'),
    }

    const result = productCreateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('10')
    }
  })
})

describe('Order Validation', () => {
  test('should validate valid order', () => {
    const valid = {
      profile_id: '123e4567-e89b-12d3-a456-426614174000',
      items: [
        {
          product_id: '123e4567-e89b-12d3-a456-426614174001',
          quantity: 2,
        },
      ],
      client: {
        name: 'Test Client',
        phone: '+966501234567',
        email: 'client@example.com',
      },
      notes: 'Test notes',
    }

    const result = orderCreateSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('should reject empty items array', () => {
    const invalid = {
      profile_id: '123e4567-e89b-12d3-a456-426614174000',
      items: [],
      client: {
        name: 'Test Client',
        phone: '+966501234567',
      },
    }

    const result = orderCreateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('واحد')
    }
  })

  test('should reject invalid UUID', () => {
    const invalid = {
      profile_id: 'invalid-uuid',
      items: [
        {
          product_id: '123e4567-e89b-12d3-a456-426614174001',
          quantity: 1,
        },
      ],
      client: {
        name: 'Test Client',
        phone: '+966501234567',
      },
    }

    const result = orderCreateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('غير صحيح')
    }
  })

  test('should reject quantity less than 1', () => {
    const invalid = {
      profile_id: '123e4567-e89b-12d3-a456-426614174000',
      items: [
        {
          product_id: '123e4567-e89b-12d3-a456-426614174001',
          quantity: 0,
        },
      ],
      client: {
        name: 'Test Client',
        phone: '+966501234567',
      },
    }

    const result = orderCreateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('1')
    }
  })
})

describe('Login Validation', () => {
  test('should validate valid login', () => {
    const valid = {
      email: 'test@example.com',
      password: 'password123',
    }

    const result = loginSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('should reject invalid email', () => {
    const invalid = {
      email: 'not-an-email',
      password: 'password123',
    }

    const result = loginSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('البريد')
    }
  })

  test('should reject password shorter than 6 characters', () => {
    const invalid = {
      email: 'test@example.com',
      password: '12345',
    }

    const result = loginSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('6')
    }
  })
})

describe('Plugin Install Validation', () => {
  test('should validate valid plugin key', () => {
    const valid = {
      plugin_key: 'test-plugin',
    }

    const result = pluginInstallSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('should reject empty plugin key', () => {
    const invalid = {
      plugin_key: '',
    }

    const result = pluginInstallSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('مطلوب')
    }
  })
})

