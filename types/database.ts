// Database Type Definitions
// Generated from PostgreSQL schema

export type UserRole = 'merchant' | 'admin'
export type ProductStatus = 'active' | 'inactive'
export type OrderStatus = 'new' | 'processing' | 'completed' | 'cancelled'
export type PluginType = 'widget' | 'dashboard_module' | 'backend_handler' | 'mixed'

export interface Merchant {
  id: string
  email: string
  phone: string | null
  password_hash: string
  name: string
  role: UserRole
  is_active: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface Admin {
  id: string
  merchant_id: string
  permissions: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface BusinessProfile {
  id: string
  merchant_id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  category: string | null
  address: string | null
  city: string | null
  country: string
  latitude: number | null
  longitude: number | null
  working_hours: Record<string, any>
  contact_links: Record<string, any>
  primary_color: string | null
  secondary_color: string | null
  is_published: boolean
  completion_percentage: number
  created_at: Date
  updated_at: Date
}

export interface Product {
  id: string
  profile_id: string
  name: string
  description: string | null
  price: number
  images: string[]
  category: string | null
  status: ProductStatus
  display_order: number
  created_at: Date
  updated_at: Date
}

export interface Order {
  id: string
  profile_id: string
  client_name: string
  client_phone: string
  client_email: string | null
  notes: string | null
  total_amount: number
  status: OrderStatus
  created_at: Date
  updated_at: Date
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  product_name?: string
  created_at: Date
}

export interface GalleryImage {
  id: string
  profile_id: string
  image_url: string
  thumbnail_url: string | null
  alt_text: string | null
  display_order: number
  created_at: Date
}

export interface Plugin {
  id: string
  plugin_key: string
  name: string
  description: string | null
  version: string
  author: string | null
  type: PluginType
  manifest: Record<string, any>
  public_widget_path: string | null
  dashboard_settings_path: string | null
  config_schema_json: Record<string, any>
  is_active: boolean
  is_premium: boolean
  price: number
  changelog: string | null
  created_at: Date
  updated_at: Date
}

export interface InstalledPlugin {
  id: string
  merchant_id: string
  plugin_id: string
  is_active: boolean
  installed_version: string
  installed_at: Date
  updated_at: Date
}

export interface PluginSettings {
  id: string
  installed_plugin_id: string
  settings_json: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface SystemLog {
  id: string
  log_type: string
  user_id: string | null
  user_role: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: Date
}

