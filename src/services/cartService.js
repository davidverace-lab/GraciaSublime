import { supabase } from '../config/supabase';

/**
 * Servicio de Carrito
 * Maneja todas las operaciones relacionadas con el carrito de compras
 */

// Obtener items del carrito del usuario
export const getCartItems = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        cart_item_id,
        user_id,
        product_id,
        variant_id,
        quantity,
        custom_image,
        custom_design,
        design_name,
        created_at,
        products (
          product_id,
          name,
          description,
          price,
          image_url,
          category_id
        ),
        product_variants (
          variant_id,
          size,
          gender,
          stock,
          is_available,
          price_adjustment
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    console.log('📦 Items del carrito obtenidos:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo items del carrito:', error);
    return { data: null, error };
  }
};

// Agregar item al carrito
export const addToCart = async (userId, productId, quantity = 1, variantId = null, customization = null) => {
  try {
    // customization puede contener: { custom_image, custom_design, design_name }

    // Productos con diferentes personalizaciones deben ser items separados
    // Solo agrupamos si:
    // 1. Es el mismo producto
    // 2. Tiene la misma variante (o ambos sin variante)
    // 3. Tiene la misma personalización (misma imagen o diseño)

    let existingItem = null;

    // Si hay personalización, buscar un item con la misma personalización
    if (customization && (customization.custom_image || customization.custom_design)) {
      const { data: allItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (fetchError) throw fetchError;

      // Buscar manualmente un item que coincida con la misma personalización
      if (allItems && allItems.length > 0) {
        existingItem = allItems.find(item => {
          // Verificar variante
          const sameVariant = variantId
            ? item.variant_id === variantId
            : item.variant_id === null;

          if (!sameVariant) return false;

          // Verificar personalización
          const sameCustomImage = item.custom_image === customization.custom_image;
          const sameCustomDesign = JSON.stringify(item.custom_design) === JSON.stringify(customization.custom_design);

          return sameCustomImage && sameCustomDesign;
        });
      }
    } else {
      // Sin personalización, buscar producto sin personalización
      let checkQuery = supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .is('custom_image', null)
        .is('custom_design', null);

      if (variantId) {
        checkQuery = checkQuery.eq('variant_id', variantId);
      } else {
        checkQuery = checkQuery.is('variant_id', null);
      }

      const { data, error: checkError } = await checkQuery.maybeSingle();
      if (checkError) throw checkError;
      existingItem = data;
    }

    if (existingItem) {
      // Si existe, actualizar cantidad
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('cart_item_id', existingItem.cart_item_id)
        .select(`
          cart_item_id,
          user_id,
          product_id,
          variant_id,
          quantity,
          custom_image,
          custom_design,
          design_name,
          created_at,
          products (
            product_id,
            name,
            description,
            price,
            image_url,
            category_id
          ),
          product_variants (
            variant_id,
            size,
            gender,
            stock,
            is_available,
            price_adjustment
          )
        `)
        .single();

      if (error) throw error;
      console.log('✅ Item actualizado en carrito:', data);
      return { data, error: null };
    } else {
      // Si no existe, crear nuevo item
      const insertData = {
        user_id: userId,
        product_id: productId,
        quantity,
      };

      // Solo agregar variant_id si existe
      if (variantId) {
        insertData.variant_id = variantId;
      }

      // Agregar personalización si existe
      if (customization) {
        console.log('💾 Guardando personalización:', customization);
        if (customization.custom_image) {
          insertData.custom_image = customization.custom_image;
        }
        if (customization.custom_design) {
          insertData.custom_design = customization.custom_design;
        }
        if (customization.design_name) {
          insertData.design_name = customization.design_name;
        }
      }

      console.log('💾 Datos a insertar en cart_items:', insertData);

      const { data, error } = await supabase
        .from('cart_items')
        .insert([insertData])
        .select(`
          cart_item_id,
          user_id,
          product_id,
          variant_id,
          quantity,
          custom_image,
          custom_design,
          design_name,
          created_at,
          products (
            product_id,
            name,
            description,
            price,
            image_url,
            category_id
          ),
          product_variants (
            variant_id,
            size,
            gender,
            stock,
            is_available,
            price_adjustment
          )
        `)
        .single();

      if (error) {
        console.error('❌ Error insertando en cart_items:', error);
        throw error;
      }

      console.log('✅ Item insertado en carrito:', data);
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    return { data: null, error };
  }
};

// Actualizar cantidad de un item en el carrito
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    if (quantity <= 0) {
      // Si la cantidad es 0 o menor, eliminar el item
      return await removeFromCart(cartItemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('cart_item_id', cartItemId)
      .select(`
        cart_item_id,
        user_id,
        product_id,
        variant_id,
        quantity,
        custom_image,
        custom_design,
        design_name,
        created_at,
        products (
          product_id,
          name,
          description,
          price,
          image_url,
          category_id
        ),
        product_variants (
          variant_id,
          size,
          gender,
          stock,
          is_available,
          price_adjustment
        )
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    return { data: null, error };
  }
};

// Eliminar item del carrito
export const removeFromCart = async (cartItemId) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_item_id', cartItemId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    return { error };
  }
};

// Vaciar carrito del usuario
export const clearCart = async (userId) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error vaciando carrito:', error);
    return { error };
  }
};

// Obtener total del carrito
export const getCartTotal = async (userId) => {
  try {
    const { data, error } = await getCartItems(userId);
    if (error) throw error;

    const total = data.reduce((sum, item) => {
      return sum + (item.products.price * item.quantity);
    }, 0);

    return { total, error: null };
  } catch (error) {
    console.error('Error calculando total del carrito:', error);
    return { total: 0, error };
  }
};
