import { supabase } from '../config/supabase';

/**
 * Product Variants Service
 * Handles all operations related to product variants (sizes, gender options)
 */

/**
 * Get all variants for a specific product
 * @param {number} productId - The product ID
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getProductVariants = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_available', true)
      .order('gender', { ascending: true })
      .order('size', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching product variants:', error);
    return { data: null, error };
  }
};

/**
 * Get variants grouped by gender for a product
 * Useful for displaying separate sections for male/female variants
 * @param {number} productId - The product ID
 * @returns {Promise<{data: Object, error: any}>}
 */
export const getVariantsByGender = async (productId) => {
  try {
    const { data, error } = await getProductVariants(productId);

    if (error) throw error;

    // Group variants by gender
    const grouped = {
      male: [],
      female: [],
      unisex: []
    };

    data?.forEach(variant => {
      if (variant.gender === 'male') {
        grouped.male.push(variant);
      } else if (variant.gender === 'female') {
        grouped.female.push(variant);
      } else {
        grouped.unisex.push(variant);
      }
    });

    return { data: grouped, error: null };
  } catch (error) {
    console.error('Error grouping variants by gender:', error);
    return { data: null, error };
  }
};

/**
 * Get a specific variant by ID
 * @param {string} variantId - The variant UUID
 * @returns {Promise<{data: Object, error: any}>}
 */
export const getVariantById = async (variantId) => {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('variant_id', variantId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching variant:', error);
    return { data: null, error };
  }
};

/**
 * Create a new product variant
 * @param {Object} variantData - Variant data
 * @param {number} variantData.product_id - Product ID
 * @param {string} variantData.size - Size (xs, s, m, l, xl, xxl)
 * @param {string|null} variantData.gender - Gender (male, female, null for unisex)
 * @param {number} variantData.stock - Stock quantity
 * @param {number} variantData.price_adjustment - Optional price adjustment
 * @returns {Promise<{data: Object, error: any}>}
 */
export const createVariant = async (variantData) => {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .insert([variantData])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating variant:', error);
    return { data: null, error };
  }
};

/**
 * Create multiple variants at once
 * Useful for creating all size variants for a product
 * @param {Array<Object>} variants - Array of variant objects
 * @returns {Promise<{data: Array, error: any}>}
 */
export const createBulkVariants = async (variants) => {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .insert(variants)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating bulk variants:', error);
    return { data: null, error };
  }
};

/**
 * Update a variant
 * @param {string} variantId - The variant UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object, error: any}>}
 */
export const updateVariant = async (variantId, updates) => {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('variant_id', variantId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating variant:', error);
    return { data: null, error };
  }
};

/**
 * Update variant stock
 * @param {string} variantId - The variant UUID
 * @param {number} quantity - New stock quantity
 * @returns {Promise<{data: Object, error: any}>}
 */
export const updateVariantStock = async (variantId, quantity) => {
  return updateVariant(variantId, { stock: quantity });
};

/**
 * Decrease variant stock (after purchase)
 * @param {string} variantId - The variant UUID
 * @param {number} quantity - Quantity to decrease
 * @returns {Promise<{data: Object, error: any}>}
 */
export const decreaseVariantStock = async (variantId, quantity) => {
  try {
    // First, get current stock
    const { data: variant, error: fetchError } = await getVariantById(variantId);

    if (fetchError) throw fetchError;

    const newStock = Math.max(0, variant.stock - quantity);

    return updateVariantStock(variantId, newStock);
  } catch (error) {
    console.error('Error decreasing variant stock:', error);
    return { data: null, error };
  }
};

/**
 * Delete a variant
 * @param {string} variantId - The variant UUID
 * @returns {Promise<{data: Object, error: any}>}
 */
export const deleteVariant = async (variantId) => {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .delete()
      .eq('variant_id', variantId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error deleting variant:', error);
    return { data: null, error };
  }
};

/**
 * Toggle variant availability
 * @param {string} variantId - The variant UUID
 * @param {boolean} isAvailable - Availability status
 * @returns {Promise<{data: Object, error: any}>}
 */
export const toggleVariantAvailability = async (variantId, isAvailable) => {
  return updateVariant(variantId, { is_available: isAvailable });
};

/**
 * Check if a variant is in stock
 * @param {string} variantId - The variant UUID
 * @param {number} requestedQuantity - Quantity to check
 * @returns {Promise<{inStock: boolean, availableQuantity: number, error: any}>}
 */
export const checkVariantStock = async (variantId, requestedQuantity = 1) => {
  try {
    const { data: variant, error } = await getVariantById(variantId);

    if (error) throw error;

    const inStock = variant.is_available && variant.stock >= requestedQuantity;

    return {
      inStock,
      availableQuantity: variant.stock,
      error: null
    };
  } catch (error) {
    console.error('Error checking variant stock:', error);
    return { inStock: false, availableQuantity: 0, error };
  }
};

/**
 * Get the final price for a variant (base price + adjustment)
 * @param {number} basePrice - Product base price
 * @param {Object} variant - Variant object
 * @returns {number} Final price
 */
export const getVariantPrice = (basePrice, variant) => {
  const adjustment = variant?.price_adjustment || 0;
  return basePrice + adjustment;
};

/**
 * Helper function to create standard size variants for a product
 * @param {number} productId - Product ID
 * @param {string|null} gender - Gender ('male', 'female', null for unisex)
 * @param {number} defaultStock - Default stock for each size
 * @returns {Array<Object>} Array of variant objects ready to insert
 */
export const generateStandardSizeVariants = (productId, gender = null, defaultStock = 10) => {
  const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'];

  return sizes.map(size => ({
    product_id: productId,
    size,
    gender,
    stock: defaultStock,
    price_adjustment: 0,
    is_available: true
  }));
};

/**
 * Helper function to create variants for shirts (both male and female)
 * @param {number} productId - Product ID
 * @param {number} defaultStock - Default stock for each size
 * @returns {Array<Object>} Array of variant objects for both genders
 */
export const generateShirtVariants = (productId, defaultStock = 10) => {
  const maleVariants = generateStandardSizeVariants(productId, 'male', defaultStock);
  const femaleVariants = generateStandardSizeVariants(productId, 'female', defaultStock);

  return [...maleVariants, ...femaleVariants];
};

/**
 * Helper function to create variants for caps (unisex, no gender)
 * @param {number} productId - Product ID
 * @param {number} defaultStock - Default stock for each size
 * @returns {Array<Object>} Array of variant objects
 */
export const generateCapVariants = (productId, defaultStock = 10) => {
  return generateStandardSizeVariants(productId, null, defaultStock);
};

/**
 * Get available sizes for a product (deduplicated)
 * @param {number} productId - Product ID
 * @returns {Promise<{data: Array<string>, error: any}>}
 */
export const getAvailableSizes = async (productId) => {
  try {
    const { data, error } = await getProductVariants(productId);

    if (error) throw error;

    // Get unique sizes
    const sizes = [...new Set(data.map(v => v.size))];

    return { data: sizes, error: null };
  } catch (error) {
    console.error('Error fetching available sizes:', error);
    return { data: [], error };
  }
};

/**
 * Get available genders for a product
 * @param {number} productId - Product ID
 * @returns {Promise<{data: Array<string>, error: any}>}
 */
export const getAvailableGenders = async (productId) => {
  try {
    const { data, error } = await getProductVariants(productId);

    if (error) throw error;

    // Get unique genders (filter out nulls)
    const genders = [...new Set(data.map(v => v.gender).filter(g => g !== null))];

    return { data: genders, error: null };
  } catch (error) {
    console.error('Error fetching available genders:', error);
    return { data: [], error };
  }
};

/**
 * Find a specific variant by product, size, and gender
 * @param {number} productId - Product ID
 * @param {string} size - Size
 * @param {string|null} gender - Gender (null for unisex)
 * @returns {Promise<{data: Object, error: any}>}
 */
export const findVariant = async (productId, size, gender = null) => {
  try {
    let query = supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('size', size);

    // Handle null gender for unisex items
    if (gender === null) {
      query = query.is('gender', null);
    } else {
      query = query.eq('gender', gender);
    }

    const { data, error } = await query.single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error finding variant:', error);
    return { data: null, error };
  }
};

export default {
  getProductVariants,
  getVariantsByGender,
  getVariantById,
  createVariant,
  createBulkVariants,
  updateVariant,
  updateVariantStock,
  decreaseVariantStock,
  deleteVariant,
  toggleVariantAvailability,
  checkVariantStock,
  getVariantPrice,
  generateStandardSizeVariants,
  generateShirtVariants,
  generateCapVariants,
  getAvailableSizes,
  getAvailableGenders,
  findVariant
};
