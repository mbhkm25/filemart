-- Add System Settings Table
-- Migration to add system_settings table for storing application settings

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES merchants(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Add trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
    ('smtp', '{
        "host": "",
        "port": 587,
        "username": "",
        "password": "",
        "from_email": "",
        "from_name": "FileMart"
    }', 'SMTP configuration for email sending'),
    ('api_keys', '{
        "cloudinary_cloud_name": "",
        "cloudinary_upload_preset": ""
    }', 'API keys for external services'),
    ('storage_limits', '{
        "max_images_per_merchant": 50,
        "max_file_size_mb": 5
    }', 'Storage limits configuration'),
    ('maintenance_mode', '{
        "enabled": false,
        "message": "المنصة قيد الصيانة. نعتذر عن الإزعاج."
    }', 'Maintenance mode settings'),
    ('registration', '{
        "enabled": true,
        "approval_required": false
    }', 'Registration settings')
ON CONFLICT (key) DO NOTHING;

