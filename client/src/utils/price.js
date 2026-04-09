// Convert price from paise to rupees for display
export const formatPrice = (priceInPaise) => {
  if (!priceInPaise && priceInPaise !== 0) return '₹0';
  return `₹${(priceInPaise / 100).toFixed(2)}`;
};

// Get raw rupees value (not formatted)
export const getRupees = (priceInPaise) => {
  return priceInPaise / 100;
};

// Convert rupees to paise for backend
export const toPaise = (rupees) => {
  return Math.round(rupees * 100);
};