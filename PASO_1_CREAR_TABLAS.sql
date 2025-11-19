-- ============================================
-- PASO 1: CREAR TABLAS DE VARIANTES
-- Ejecuta esto primero en Supabase SQL Editor
-- ============================================

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  variant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  gender VARCHAR(10),
  stock INTEGER DEFAULT 0,
  price_adjustment NUMERIC(10, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size, gender)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_available ON product_variants(is_available);

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

-- Policy: Admins can insert variants
CREATE POLICY "Admins can insert variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Admins can update variants
CREATE POLICY "Admins can update variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Admins can delete variants
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

-- ✅ Si ves "Success" aquí, continúa con el PASO 2
