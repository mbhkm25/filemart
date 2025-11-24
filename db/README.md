# Database Setup Guide

## Prerequisites

1. Create a Neon database account at https://neon.tech
2. Create a new project and database
3. Copy your connection string (DATABASE_URL)

## Setup

1. Add your DATABASE_URL to `.env.local`:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

2. Run the schema migration:
   ```bash
   # Using psql
   psql $DATABASE_URL -f db/schema.sql
   
   # Or using Neon console SQL editor
   # Copy and paste the contents of db/schema.sql
   ```

## Schema Overview

The database includes the following tables:

- **merchants** - User accounts (merchants and admins)
- **admins** - Admin-specific permissions
- **business_profiles** - Business profile information
- **products** - Product catalog
- **orders** - Customer orders
- **order_items** - Order line items
- **gallery_images** - Gallery images
- **plugins** - Available plugins
- **installed_plugins** - Merchant plugin installations
- **plugin_settings** - Plugin configuration per merchant
- **system_logs** - Audit logs

## Indexes

All tables have appropriate indexes for performance:
- Foreign key indexes
- Search indexes (slug, email, etc.)
- Status indexes for filtering

## Triggers

Automatic `updated_at` timestamp updates are handled by triggers on all relevant tables.

