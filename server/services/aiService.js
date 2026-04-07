// E:\DermaFlow\server\services\aiService.js
const Product = require('../models/Product'); // Ensure you have a Product model

const CONFLICT_MAP = {
    "Retinol Renewal Serum": ["Salicylic Acid BHA Cleanser", "AHA Glycolic Acid Exfoliator", "Vitamin C Brightening Drops"],
    "Vitamin C Brightening Drops": ["Retinol Renewal Serum", "AHA Glycolic Acid Exfoliator"]
};

exports.generateRoutine = async (skinType, concerns) => {
    const allProducts = await Product.find({ isActive: true });
    
    let am = [];
    let pm = [];

    // Basic Logic: Cleanser
    const cleanser = skinType === 'Oily' 
        ? allProducts.find(p => p.sku === "SKIN-SAL-004") 
        : allProducts.find(p => p.sku === "SKIN-HYA-003");
    
    if(cleanser) { am.push(cleanser._id); pm.push(cleanser._id); }

    // Treatment Logic
    if (concerns.includes('Aging')) pm.push(allProducts.find(p => p.sku === "SKIN-RET-001")?._id);
    if (concerns.includes('Dullness')) am.push(allProducts.find(p => p.sku === "SKIN-VITC-002")?._id);
    
    // Protection
    am.push(allProducts.find(p => p.sku === "SKIN-SPF-006")?._id);

    return { am: am.filter(Boolean), pm: pm.filter(Boolean) };
};

exports.checkConflicts = (productNames) => {
    let warnings = [];
    productNames.forEach(name => {
        const restricted = CONFLICT_MAP[name] || [];
        const found = productNames.filter(n => restricted.includes(n));
        if (found.length > 0) {
            warnings.push(`${name} should not be used with ${found.join(', ')} in the same session.`);
        }
    });
    return warnings;
};