// Mock Data Generators
// Test data for unit and E2E tests

import type {
  Merchant,
  BusinessProfile,
  Product,
  Order,
  Plugin,
  InstalledPlugin,
} from '@/types/database'

export const mockMerchant: Merchant = {
  id: 'merchant-1',
  email: 'merchant@example.com',
  phone: '+966501234567',
  password_hash: 'hashed_password',
  name: 'Test Merchant',
  role: 'merchant',
  is_active: true,
  email_verified: true,
  phone_verified: true,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
}

export const mockBusinessProfile: BusinessProfile = {
  id: 'profile-1',
  merchant_id: 'merchant-1',
  slug: 'test-business',
  name: 'Test Business',
  description: 'Test business description',
  logo_url: 'https://example.com/logo.png',
  cover_url: 'https://example.com/cover.png',
  category: 'Retail',
  address: 'Test Address',
  city: 'Riyadh',
  country: 'Saudi Arabia',
  latitude: 24.7136,
  longitude: 46.6753,
  working_hours: {},
  contact_links: {
    whatsapp: 'https://wa.me/966501234567',
    instagram: 'https://instagram.com/test',
  },
  primary_color: '#3b82f6',
  secondary_color: '#1e40af',
  is_published: true,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
}

export const mockProduct: Product = {
  id: 'product-1',
  profile_id: 'profile-1',
  name: 'Test Product',
  description: 'Test product description',
  price: 100,
  images: ['https://example.com/product.jpg'],
  category: 'Category 1',
  status: 'active',
  display_order: 1,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
}

export const mockOrder: Order = {
  id: 'order-1',
  profile_id: 'profile-1',
  client_name: 'Test Client',
  client_phone: '+966501234567',
  client_email: 'client@example.com',
  notes: 'Test notes',
  status: 'new',
  total: 100,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
}

export const mockPlugin: Plugin = {
  id: 'plugin-1',
  plugin_key: 'test-plugin',
  name: 'Test Plugin',
  description: 'Test plugin description',
  version: '1.0.0',
  author: 'Test Author',
  type: 'widget',
  manifest: {
    plugin_key: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    type: 'widget',
  },
  public_widget_path: 'plugins/test-plugin/publicWidget.tsx',
  dashboard_settings_path: null,
  config_schema_json: {},
  is_active: true,
  is_premium: false,
  price: 0,
  changelog: null,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
}

export const mockInstalledPlugin: InstalledPlugin = {
  id: 'installed-1',
  merchant_id: 'merchant-1',
  plugin_id: 'plugin-1',
  is_active: true,
  installed_version: '1.0.0',
  installed_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
}

// Helper functions
export function createMockProduct(overrides?: Partial<Product>): Product {
  return { ...mockProduct, ...overrides }
}

export function createMockOrder(overrides?: Partial<Order>): Order {
  return { ...mockOrder, ...overrides }
}

export function createMockBusinessProfile(
  overrides?: Partial<BusinessProfile>
): BusinessProfile {
  return { ...mockBusinessProfile, ...overrides }
}

