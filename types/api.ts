// API Request/Response Types

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

// Business Profile Types
export interface BusinessProfilePublic {
  id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  category: string | null
  address: string | null
  city: string | null
  country: string
  working_hours: Record<string, any>
  contact_links: Record<string, any>
  primary_color: string | null
  secondary_color: string | null
}

export interface BusinessProfileUpdate {
  name?: string
  description?: string
  logo_url?: string
  cover_url?: string
  category?: string
  address?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  working_hours?: Record<string, any>
  contact_links?: Record<string, any>
  primary_color?: string
  secondary_color?: string
}

// Product Types
export interface ProductPublic {
  id: string
  name: string
  description: string | null
  price: number
  images: string[]
  category: string | null
}

export interface ProductCreate {
  name: string
  description?: string
  price: number
  images?: string[]
  category?: string
  status?: 'active' | 'inactive'
}

export interface ProductUpdate extends Partial<ProductCreate> {}

// Order Types
export interface OrderCreate {
  profile_id: string
  items: {
    product_id: string
    quantity: number
  }[]
  client: {
    name: string
    phone: string
    email?: string
  }
  notes?: string
}

export interface OrderResponse {
  id: string
  profile_id: string
  client_name: string
  client_phone: string
  client_email: string | null
  items: {
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
    subtotal: number
  }[]
  notes: string | null
  total_amount: number
  status: string
  created_at: string
}

// Plugin Types
export interface PluginInstallRequest {
  plugin_key: string
}

export interface PluginConfiguration {
  [key: string]: any
}

