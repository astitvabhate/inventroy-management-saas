-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CLEANUP: Drop existing tables to start fresh
DROP TABLE IF EXISTS item_images CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS usage CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS stock_entries CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- 1. Vendors Table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- 2. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id, vendor_id)
);

CREATE POLICY "Users can view their own vendor"
  ON vendors FOR SELECT
  USING (id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());

-- 3. Items Table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'piece',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_quantities CHECK (
    total_quantity >= 0 AND 
    available_quantity >= 0 AND 
    available_quantity <= total_quantity
  ),
  CONSTRAINT positive_prices CHECK (
    cost_price >= 0 AND 
    selling_price >= 0
  )
);

CREATE INDEX idx_items_vendor ON items(vendor_id);
CREATE INDEX idx_items_category ON items(vendor_id, category);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their vendor's items"
  ON items FOR SELECT
  USING (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert items for their vendor"
  ON items FOR INSERT
  WITH CHECK (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their vendor's items"
  ON items FOR UPDATE
  USING (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their vendor's items"
  ON items FOR DELETE
  USING (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

-- 4. Stock Entries Table
CREATE TABLE stock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity_added INTEGER NOT NULL CHECK (quantity_added > 0),
  cost_per_unit NUMERIC(10,2) NOT NULL CHECK (cost_per_unit >= 0),
  total_cost NUMERIC(10,2) GENERATED ALWAYS AS (quantity_added * cost_per_unit) STORED,
  supplier_name TEXT,
  notes TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_entries_vendor ON stock_entries(vendor_id);
CREATE INDEX idx_stock_entries_item ON stock_entries(item_id);
CREATE INDEX idx_stock_entries_date ON stock_entries(vendor_id, date DESC);

ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their vendor's stock entries"
  ON stock_entries FOR SELECT
  USING (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert stock entries for their vendor"
  ON stock_entries FOR INSERT
  WITH CHECK (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

-- 5. Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_vendor ON customers(vendor_id);
CREATE INDEX idx_customers_name ON customers(vendor_id, name);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their vendor's customers"
  ON customers FOR ALL
  USING (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

-- 6. Usage Table
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
  is_returned BOOLEAN NOT NULL DEFAULT FALSE,
  event_name TEXT,
  event_date DATE,
  expected_return_date DATE,  -- When customer should return the items
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_vendor ON usage(vendor_id);
CREATE INDEX idx_usage_item ON usage(item_id);
CREATE INDEX idx_usage_customer ON usage(customer_id);
CREATE INDEX idx_usage_date ON usage(vendor_id, date DESC);
CREATE INDEX idx_usage_returned ON usage(vendor_id, is_returned);

ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their vendor's usage records"
  ON usage FOR SELECT
  USING (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert usage records for their vendor"
  ON usage FOR INSERT
  WITH CHECK (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their vendor's usage records"
  ON usage FOR UPDATE
  USING (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

-- 7. Sales Table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_number TEXT,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  items_cost NUMERIC(10,2) NOT NULL CHECK (items_cost >= 0),
  profit NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - items_cost - discount) STORED,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_vendor ON sales(vendor_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(vendor_id, date DESC);
CREATE INDEX idx_sales_payment ON sales(vendor_id, payment_status);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their vendor's sales"
  ON sales FOR ALL
  USING (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

-- 8. Item Images Table
CREATE TABLE item_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  url TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_item_images_vendor ON item_images(vendor_id);
CREATE INDEX idx_item_images_item ON item_images(item_id);
CREATE INDEX idx_item_images_primary ON item_images(item_id, is_primary);

ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their vendor's item images"
  ON item_images FOR ALL
  USING (vendor_id = (SELECT vendor_id FROM users WHERE id = auth.uid()));

-- FUNCTIONS AND TRIGGERS

-- Update Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update Stock on Entry
CREATE OR REPLACE FUNCTION update_item_stock_on_entry()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE items
    SET 
        total_quantity = total_quantity + NEW.quantity_added,
        available_quantity = available_quantity + NEW.quantity_added,
        cost_price = (
            (cost_price * total_quantity + NEW.cost_per_unit * NEW.quantity_added) 
            / (total_quantity + NEW.quantity_added)
        )
    WHERE id = NEW.item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_item_stock
    AFTER INSERT ON stock_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_item_stock_on_entry();

-- Update Usage
CREATE OR REPLACE FUNCTION update_item_quantity_on_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Deduct from available quantity
        UPDATE items
        SET available_quantity = available_quantity - NEW.quantity_used
        WHERE id = NEW.item_id;
        
        -- Check if quantity is sufficient
        IF (SELECT available_quantity FROM items WHERE id = NEW.item_id) < 0 THEN
            RAISE EXCEPTION 'Insufficient quantity available for item %', NEW.item_id;
        END IF;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle return
        IF NEW.is_returned = TRUE AND OLD.is_returned = FALSE THEN
            UPDATE items
            SET available_quantity = available_quantity + NEW.quantity_used
            WHERE id = NEW.item_id;
            
            -- Record return date
            NEW.returned_at = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_item_quantity_usage
    AFTER INSERT OR UPDATE ON usage
    FOR EACH ROW
    EXECUTE FUNCTION update_item_quantity_on_usage();

-- Single Primary Image
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        UPDATE item_images
        SET is_primary = FALSE
        WHERE item_id = NEW.item_id 
        AND id != NEW.id 
        AND is_primary = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_primary
    BEFORE INSERT OR UPDATE ON item_images
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_image();

-- STORAGE POLICIES (Note: Requires storage bucket 'vendor-item-images' to be created first)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-item-images', 'vendor-item-images', true);
-- OR Create via Dashboard

-- 9. Auto-create vendor and user on signup (Onboarding)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_vendor_id UUID;
BEGIN
    -- Create a default vendor for the new user
    INSERT INTO public.vendors (name)
    VALUES ('My Workspace')
    RETURNING id INTO new_vendor_id;

    -- Create common user record
    INSERT INTO public.users (id, vendor_id, role)
    VALUES (NEW.id, new_vendor_id, 'owner');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA (Demo data for testing)
-- ============================================

-- Create a demo vendor
INSERT INTO vendors (id, name, email, phone, address) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sheuli Decorations', 'contact@sheuli.com', '+91 98765 43210', 'Mumbai, Maharashtra');

-- Sample Items (decoration inventory)
INSERT INTO items (id, vendor_id, name, description, category, cost_price, selling_price, total_quantity, available_quantity, unit) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Red Roses Bundle', 'Fresh artificial red roses, pack of 50', 'flowers', 500, 1200, 2000, 1800, 'bundle'),
  ('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'White Fairy Lights', '10m LED string lights, warm white', 'lights', 300, 800, 150, 120, 'piece'),
  ('aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Gold Satin Cloth', 'Premium gold satin fabric, 5m roll', 'fabrics', 800, 2000, 50, 45, 'roll'),
  ('aaaa4444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Crystal Chandelier', 'Hanging crystal chandelier, medium size', 'props', 5000, 15000, 20, 18, 'piece'),
  ('aaaa5555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Wooden Mandap Frame', 'Traditional wooden mandap structure', 'furniture', 25000, 75000, 5, 4, 'piece'),
  ('aaaa6666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Pink Carnations Bundle', 'Artificial pink carnations, pack of 30', 'flowers', 400, 1000, 500, 480, 'bundle'),
  ('aaaa7777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'LED Curtain Lights', '3m x 3m LED curtain, multicolor', 'lights', 600, 1500, 80, 70, 'piece'),
  ('aaaa8888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Velvet Red Carpet', '10m red velvet carpet', 'fabrics', 2000, 5000, 30, 28, 'roll');

-- Sample Customers
INSERT INTO customers (id, vendor_id, name, email, phone, address, notes) VALUES
  ('cccc1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Rahul Sharma', 'rahul@email.com', '+91 99887 76655', 'Andheri, Mumbai', 'Regular wedding decorator'),
  ('cccc2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Priya Mehta', 'priya@email.com', '+91 88776 65544', 'Bandra, Mumbai', 'Corporate events specialist'),
  ('cccc3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Amit Patel', 'amit@email.com', '+91 77665 54433', 'Thane, Mumbai', 'Birthday party organizer'),
  ('cccc4444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Sneha Desai', 'sneha@email.com', '+91 66554 43322', 'Powai, Mumbai', 'VIP client - premium events');

-- Sample Item Images (using placeholder image URLs)
INSERT INTO item_images (vendor_id, item_id, url, path, file_name, is_primary) VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400', 'items/roses.jpg', 'roses.jpg', true),
  ('11111111-1111-1111-1111-111111111111', 'aaaa2222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400', 'items/lights.jpg', 'lights.jpg', true),
  ('11111111-1111-1111-1111-111111111111', 'aaaa3333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', 'items/fabric.jpg', 'fabric.jpg', true),
  ('11111111-1111-1111-1111-111111111111', 'aaaa4444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'items/chandelier.jpg', 'chandelier.jpg', true),
  ('11111111-1111-1111-1111-111111111111', 'aaaa5555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', 'items/mandap.jpg', 'mandap.jpg', true),
  ('11111111-1111-1111-1111-111111111111', 'aaaa6666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', 'items/carnations.jpg', 'carnations.jpg', true),
  ('11111111-1111-1111-1111-111111111111', 'aaaa7777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=400', 'items/curtain-lights.jpg', 'curtain-lights.jpg', true),
  ('11111111-1111-1111-1111-111111111111', 'aaaa8888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400', 'items/carpet.jpg', 'carpet.jpg', true);

-- Note: Stock entries, usage, and sales cannot be seeded without a real user
-- because they require created_by to reference auth.users
-- These will be created when you sign up and use the app
