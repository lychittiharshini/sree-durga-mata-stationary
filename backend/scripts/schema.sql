-- ============================================================
-- Sree Durga Mata Stationery - PostgreSQL Database Schema
-- Book Stall & Fancy Items
-- ============================================================

-- 1. Shop Settings Table (Stores the configurable WhatsApp number and store info)
CREATE TABLE IF NOT EXISTS shop_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin Users Table (Stores secure hashed credentials)
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 3. Stationery Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2), -- Can be NULL if price is unlisted/negotiable/size-dependent
    category VARCHAR(100) DEFAULT 'General',
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Offers Table (Managed exclusively by admin)
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    applicable_item VARCHAR(255),
    offer_price DECIMAL(10, 2),
    discount_percentage INT,
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Shop Images Table (Managed exclusively by admin)
CREATE TABLE IF NOT EXISTS shop_images (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Additional Services Table (Managed exclusively by admin)
CREATE TABLE IF NOT EXISTS additional_services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    details TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_services_active ON additional_services(is_active);

-- Initial Default Settings
INSERT INTO shop_settings (setting_key, setting_value)
VALUES 
    ('whatsapp_number', '919876543210'),
    ('shop_name', 'Sree Durga Mata Stationery'),
    ('shop_subtitle', 'BOOK STALL & FANCY ITEMS')
ON CONFLICT (setting_key) DO NOTHING;

-- Initial Admin Account
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$wT5a0gD2/gZfE5Z6G69s9.WvH8Yw1cM4Y/fWjJ0bM1JvQyJbM1JvQ')
ON CONFLICT (username) DO NOTHING;
