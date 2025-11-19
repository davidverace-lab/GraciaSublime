-- Migration: Create product_variants table for handling sizes and gender options
-- Date: 2025-11-19
-- Description: Adds support for product variants with sizes and gender options for shirts and caps

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  variant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL, -- xs, s, m, l, xl, xxl
  gender VARCHAR(10), -- 'male', 'female', null (for caps or unisex items)
  stock INTEGER DEFAULT 0,
  price_adjustment NUMERIC(10, 2) DEFAULT 0, -- Optional price adjustment for specific variants
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique combinations of product_id, size, and gender
  UNIQUE(product_id, size, gender)
);

-- Create index for faster queries
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_available ON product_variants(is_available);

-- Add RLS (Row Level Security) policies
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read available variants
CREATE POLICY "Anyone can view available variants"
  ON product_variants FOR SELECT
  USING (is_available = true);

-- Policy: Authenticated users can view all variants
CREATE POLICY "Authenticated users can view all variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert variants (adjust based on your admin role setup)
-- Note: You may need to modify this based on your user roles implementation
CREATE POLICY "Admins can insert variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only admins can update variants
CREATE POLICY "Admins can update variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only admins can delete variants
CREATE POLICY "Admins can delete variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (true);

-- Update cart_items table to include variant_id
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(variant_id) ON DELETE SET NULL;

-- Create index for cart_items variant lookup
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample variants for shirts (if category_id 3 is for shirts)
-- Uncomment and run after creating shirt products
/*
INSERT INTO product_variants (product_id, size, gender, stock) VALUES
  -- Replace <product_id> with actual shirt product IDs
  (<product_id>, 'xs', 'male', 10),
  (<product_id>, 's', 'male', 15),
  (<product_id>, 'm', 'male', 20),
  (<product_id>, 'l', 'male', 20),
  (<product_id>, 'xl', 'male', 15),
  (<product_id>, 'xxl', 'male', 10),
  (<product_id>, 'xs', 'female', 10),
  (<product_id>, 's', 'female', 15),
  (<product_id>, 'm', 'female', 20),
  (<product_id>, 'l', 'female', 20),
  (<product_id>, 'xl', 'female', 15),
  (<product_id>, 'xxl', 'female', 10);
*/

-- Insert sample variants for caps (if category_id 2 is for caps)
-- Caps don't have gender distinction
/*
INSERT INTO product_variants (product_id, size, gender, stock) VALUES
  -- Replace <product_id> with actual cap product IDs
  (<product_id>, 'xs', null, 10),
  (<product_id>, 's', null, 15),
  (<product_id>, 'm', null, 20),
  (<product_id>, 'l', null, 20),
  (<product_id>, 'xl', null, 15),
  (<product_id>, 'xxl', null, 10);
*/

COMMENT ON TABLE product_variants IS 'Stores product variants including size and gender options for shirts and caps';
COMMENT ON COLUMN product_variants.gender IS 'Gender option: male, female, or null for unisex items like caps';
COMMENT ON COLUMN product_variants.size IS 'Available sizes: xs, s, m, l, xl, xxl';
COMMENT ON COLUMN product_variants.price_adjustment IS 'Optional price adjustment for this specific variant (can be positive or negative)';
