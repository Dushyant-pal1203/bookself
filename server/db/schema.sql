-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY NOT NULL,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Create users table (for regular customers)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  cover_image_url TEXT,
  category TEXT,
  isbn TEXT,
  published_year INTEGER,
  page_count INTEGER,
  language TEXT,
  publisher TEXT,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY NOT NULL,
  article_id INTEGER NOT NULL,
  article_title TEXT NOT NULL,
  article_author TEXT,
  quantity INTEGER DEFAULT 1 NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY NOT NULL,
  publisher_name TEXT DEFAULT 'My Publishing House' NOT NULL,
  tagline TEXT,
  about TEXT,
  whatsapp_number TEXT DEFAULT '' NOT NULL,
  contact_email TEXT,
  contact_address TEXT,
  currency TEXT DEFAULT 'INR' NOT NULL,
  upi_id TEXT,
  payment_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  password VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ
);

-- Create otp_verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes (using IF NOT EXISTS)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_session_expire') THEN
        CREATE INDEX idx_session_expire ON sessions(expire);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_users_email') THEN
        CREATE INDEX idx_admin_users_email ON admin_users(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_users_phone') THEN
        CREATE INDEX idx_admin_users_phone ON admin_users(phone_number);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_otp_phone') THEN
        CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_otp_expires') THEN
        CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_articles_type') THEN
        CREATE INDEX idx_articles_type ON articles(type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_status') THEN
        CREATE INDEX idx_orders_status ON orders(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_created_at') THEN
        CREATE INDEX idx_orders_created_at ON orders(created_at);
    END IF;
END $$;

-- Create function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add new payment columns to settings table if not exists
ALTER TABLE settings ADD COLUMN IF NOT EXISTS account_holder_name TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS ifsc_code TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Add password column to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add phone_number column if not exists (might already exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create triggers (dropping existing ones first)
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();