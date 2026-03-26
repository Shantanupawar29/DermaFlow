// Skincare ingredient conflicts and compatibility checker

/**
 * Check for conflicts between products in cart
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of warning objects
 */
export const getConflicts = (products) => {
  if (!products || products.length === 0) {
    return [];
  }

  const warnings = [];
  
  // Detect active ingredients in products
  const productsWithIngredients = products.map(product => ({
    ...product,
    detectedIngredients: detectIngredients(product)
  }));
  
  // Check for retinol with other actives
  const retinolProducts = productsWithIngredients.filter(p => 
    p.detectedIngredients.includes('retinol')
  );
  
  const ahaProducts = productsWithIngredients.filter(p => 
    p.detectedIngredients.includes('aha')
  );
  
  const bhaProducts = productsWithIngredients.filter(p => 
    p.detectedIngredients.includes('bha')
  );
  
  const vitaminCProducts = productsWithIngredients.filter(p => 
    p.detectedIngredients.includes('vitamin c')
  );
  
  // Retinol + AHA/BHA conflicts
  if (retinolProducts.length > 0 && (ahaProducts.length > 0 || bhaProducts.length > 0)) {
    warnings.push({
      type: 'conflict',
      severity: 'high',
      message: '⚠️ Retinol should not be used with AHAs or BHAs in the same routine. This can cause severe irritation, redness, and peeling. Use them on alternate days.'
    });
  }
  
  // Retinol + Vitamin C conflicts
  if (retinolProducts.length > 0 && vitaminCProducts.length > 0) {
    warnings.push({
      type: 'conflict',
      severity: 'medium',
      message: '⚠️ Retinol and Vitamin C can cause irritation when used together. For best results, use Vitamin C in the morning and Retinol at night.'
    });
  }
  
  // Multiple exfoliants
  if (ahaProducts.length > 0 && bhaProducts.length > 0) {
    warnings.push({
      type: 'conflict',
      severity: 'medium',
      message: '⚠️ You have both AHA and BHA exfoliants. Using multiple exfoliants can over-exfoliate your skin. Alternate their use or use them on different days.'
    });
  }
  
  // Multiple active ingredients
  const activeIngredients = [];
  if (retinolProducts.length > 0) activeIngredients.push('Retinol');
  if (ahaProducts.length > 0) activeIngredients.push('AHA');
  if (bhaProducts.length > 0) activeIngredients.push('BHA');
  if (vitaminCProducts.length > 0) activeIngredients.push('Vitamin C');
  
  if (activeIngredients.length > 2) {
    warnings.push({
      type: 'overload',
      severity: 'medium',
      message: `⚠️ Your routine has ${activeIngredients.length} active ingredients (${activeIngredients.join(', ')}). Consider using them on different days to prevent skin barrier damage.`
    });
  }
  
  // Check for duplicate products (potential overuse)
  const productCounts = {};
  products.forEach(product => {
    productCounts[product.name] = (productCounts[product.name] || 0) + 1;
  });
  
  Object.entries(productCounts).forEach(([name, count]) => {
    if (count > 1) {
      warnings.push({
        type: 'duplicate',
        severity: 'low',
        message: `⚠️ You have ${count} x ${name} in your cart. Make sure you're not overusing active ingredients.`
      });
    }
  });
  
  return warnings;
};

/**
 * Detect active ingredients in a product
 * @param {Object} product - Product object
 * @returns {Array} - Array of detected ingredients
 */
const detectIngredients = (product) => {
  const detected = [];
  
  // Combine product name and ingredients for searching
  const productText = (
    (product.name || '') + ' ' + 
    ((product.ingredients && product.ingredients.join(' ')) || '')
  ).toLowerCase();
  
  // Check for retinol
  if (productText.includes('retinol') || 
      productText.includes('retinoid') ||
      productText.includes('tretinoin')) {
    detected.push('retinol');
  }
  
  // Check for AHAs (Glycolic, Lactic, Mandelic)
  if (productText.includes('glycolic') || 
      productText.includes('lactic') ||
      productText.includes('mandelic')) {
    detected.push('aha');
  }
  
  // Check for BHAs (Salicylic)
  if (productText.includes('salicylic') || 
      productText.includes('bha')) {
    detected.push('bha');
  }
  
  // Check for Vitamin C
  if (productText.includes('vitamin c') || 
      productText.includes('ascorbic') ||
      productText.includes('ascorbyl')) {
    detected.push('vitamin c');
  }
  
  // Check for Niacinamide
  if (productText.includes('niacinamide')) {
    detected.push('niacinamide');
  }
  
  // Check for Benzoyl Peroxide
  if (productText.includes('benzoyl')) {
    detected.push('benzoyl peroxide');
  }
  
  return detected;
};

/**
 * Get warnings for a product based on routine time
 * @param {Object} product - Product object
 * @param {string} routineTime - 'AM', 'PM', or 'both'
 * @returns {Array} - Array of warning messages
 */
export const getRoutineWarnings = (product, routineTime) => {
  const warnings = [];
  const ingredients = detectIngredients(product);
  
  if (routineTime === 'AM') {
    if (ingredients.includes('retinol')) {
      warnings.push("Retinol is not recommended for morning use as it can cause photosensitivity. Apply at night instead.");
    }
    if (ingredients.includes('aha') || ingredients.includes('bha')) {
      warnings.push("Exfoliating acids can increase sun sensitivity. Always wear SPF if using in the morning.");
    }
  }
  
  if (routineTime === 'PM') {
    if (ingredients.includes('vitamin c')) {
      warnings.push("Vitamin C can be used at night, but it's most effective in the morning for antioxidant protection.");
    }
  }
  
  return warnings;
};

/**
 * Check product compatibility with skin concerns
 * @param {Object} product - Product object
 * @param {Array} skinConcerns - Array of skin concerns
 * @returns {Array} - Array of compatibility matches
 */
export const getProductCompatibility = (product, skinConcerns) => {
  if (!skinConcerns || skinConcerns.length === 0) {
    return [];
  }
  
  const ingredients = detectIngredients(product);
  const matches = [];
  
  // Map ingredients to concerns they address
  const ingredientBenefits = {
    'retinol': ['aging', 'wrinkles', 'acne', 'hyperpigmentation'],
    'aha': ['dull skin', 'rough texture', 'acne marks', 'hyperpigmentation'],
    'bha': ['acne', 'oily skin', 'blackheads', 'enlarged pores'],
    'vitamin c': ['dark spots', 'dullness', 'uneven tone', 'hyperpigmentation'],
    'niacinamide': ['enlarged pores', 'oily skin', 'redness', 'acne'],
    'benzoyl peroxide': ['acne']
  };
  
  ingredients.forEach(ingredient => {
    const benefits = ingredientBenefits[ingredient] || [];
    benefits.forEach(benefit => {
      if (skinConcerns.includes(benefit)) {
        matches.push({
          ingredient,
          concern: benefit,
          message: `✅ Contains ${ingredient} which helps with ${benefit}`
        });
      }
    });
  });
  
  return matches;
};

// Export all functions
export default {
  getConflicts,
  getRoutineWarnings,
  getProductCompatibility
};