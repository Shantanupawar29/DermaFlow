// utils/price.js - CORRECTED VERSION
export const formatPrice = (price) => {
  if (!price && price !== 0) return '₹0.00';
  
  // DON'T divide by 100 - price is already in rupees
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Simple version if you prefer
export const simpleFormatPrice = (price) => {
  if (!price && price !== 0) return '₹0.00';
  return `₹${price.toFixed(2)}`;
};