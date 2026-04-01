// GST Calculation Service for Dabba Nation
// Food Items: 5% GST (2.5% CGST + 2.5% SGST)
// Platform Commission: 18% GST

export interface GSTCalculation {
  itemPrice: number;
  cgst: number;
  sgst: number;
  totalGST: number;
  totalPrice: number;
}

export interface OrderGSTBreakup {
  subtotal: number;
  totalCGST: number;
  totalSGST: number;
  totalGST: number;
  platformCommission: number;
  platformCommissionGST: number;
  totalCommissionWithGST: number;
  deliveryCGST: number;
  deliverySGST: number;
  deliveryGST: number;
  grandTotal: number;
}

export interface MenuItemWithGST {
  id: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  gst: GSTCalculation;
  total: number;
}

// GST Rates - Now configurable by admin (defaults to 0)
export const GST_RATES = {
  FOOD: {
    CGST: 0,      // Default 0% until admin sets
    SGST: 0,      // Default 0% until admin sets
    TOTAL: 0      // Default 0% until admin sets
  },
  PLATFORM: {
    COMMISSION: 0,     // Default 0% until admin sets
    GST: 0            // Default 0% until admin sets
  },
  DELIVERY: {
    CGST: 0,      // Default 0% until admin sets
    SGST: 0,      // Default 0% until admin sets
    TOTAL: 0      // Default 0% until admin sets
  }
};

// Admin GST Settings interface
export interface AdminGSTSettings {
  foodGSTEnabled: boolean;
  foodCGSTRate: number;
  foodSGSTRate: number;
  platformGSTEnabled: boolean;
  platformCommissionRate: number;
  platformGSTRate: number;
  deliveryGSTEnabled: boolean;
  deliveryCGSTRate: number;
  deliverySGSTRate: number;
  gstApplicable: boolean;
  defaultGSTIN: string;
  invoicePrefix: string;
}

// Current GST Settings (will be updated from admin settings)
let currentGSTSettings: AdminGSTSettings = {
  foodGSTEnabled: false,
  foodCGSTRate: 0,
  foodSGSTRate: 0,
  platformGSTEnabled: false,
  platformCommissionRate: 0,
  platformGSTRate: 0,
  deliveryGSTEnabled: false,
  deliveryCGSTRate: 0,
  deliverySGSTRate: 0,
  gstApplicable: false,
  defaultGSTIN: "",
  invoicePrefix: "DN"
};

// Function to update GST rates from admin settings
export const updateGSTSettings = (settings: AdminGSTSettings) => {
  currentGSTSettings = settings;
  
  // Update GST_RATES based on admin settings
  GST_RATES.FOOD.CGST = settings.gstApplicable && settings.foodGSTEnabled ? settings.foodCGSTRate : 0;
  GST_RATES.FOOD.SGST = settings.gstApplicable && settings.foodGSTEnabled ? settings.foodSGSTRate : 0;
  GST_RATES.FOOD.TOTAL = GST_RATES.FOOD.CGST + GST_RATES.FOOD.SGST;
  
  GST_RATES.PLATFORM.COMMISSION = settings.gstApplicable && settings.platformGSTEnabled ? settings.platformCommissionRate : 0;
  GST_RATES.PLATFORM.GST = settings.gstApplicable && settings.platformGSTEnabled ? settings.platformGSTRate : 0;
  
  GST_RATES.DELIVERY.CGST = settings.gstApplicable && settings.deliveryGSTEnabled ? settings.deliveryCGSTRate : 0;
  GST_RATES.DELIVERY.SGST = settings.gstApplicable && settings.deliveryGSTEnabled ? settings.deliverySGSTRate : 0;
  GST_RATES.DELIVERY.TOTAL = GST_RATES.DELIVERY.CGST + GST_RATES.DELIVERY.SGST;
};

// Function to get current GST settings
export const getCurrentGSTSettings = (): AdminGSTSettings => {
  return { ...currentGSTSettings };
};

/**
 * Calculate GST for a single food item
 */
export function calculateItemGST(itemPrice: number): GSTCalculation {
  const cgst = itemPrice * GST_RATES.FOOD.CGST;
  const sgst = itemPrice * GST_RATES.FOOD.SGST;
  const totalGST = cgst + sgst;
  const totalPrice = itemPrice + totalGST;

  return {
    itemPrice,
    cgst,
    sgst,
    totalGST,
    totalPrice
  };
}

/**
 * Calculate GST for menu items with quantities
 */
export function calculateMenuGST(items: Array<{ sellingPrice: number; quantity: number }>): MenuItemWithGST[] {
  return items.map((item, index) => {
    const gst = calculateItemGST(item.sellingPrice);
    return {
      id: `item-${index}`,
      name: '', // Will be filled by caller
      sellingPrice: item.sellingPrice,
      quantity: item.quantity,
      gst,
      total: gst.totalPrice * item.quantity
    };
  });
}

/**
 * Calculate complete order GST breakup
 */
export function calculateOrderGST(
  items: Array<{ sellingPrice: number; quantity: number }>,
  platformCommissionRate: number = 0.07, // 7% default
  deliveryFee: number = 0
): OrderGSTBreakup {
  // Get current GST settings
  const currentSettings = getCurrentGSTSettings();
  
  // Calculate item subtotal (without GST)
  const subtotal = items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

  // Calculate GST on food items using admin settings
  const foodCGSTRate = currentSettings?.gstApplicable && currentSettings?.foodGSTEnabled ? 
    (currentSettings.foodCGSTRate / 100) : 0;
  const foodSGSTRate = currentSettings?.gstApplicable && currentSettings?.foodGSTEnabled ? 
    (currentSettings.foodSGSTRate / 100) : 0;
  
  const totalCGST = subtotal * foodCGSTRate;
  const totalSGST = subtotal * foodSGSTRate;
  const totalGST = totalCGST + totalSGST;

  // Calculate platform commission using admin settings OR passed rate
  const platformRate = currentSettings?.gstApplicable && currentSettings?.platformGSTEnabled ? 
    (currentSettings.platformCommissionRate / 100) : platformCommissionRate;
  const platformCommission = subtotal * platformRate;

  // Calculate GST on platform commission using admin settings
  const platformGSTRate = currentSettings?.gstApplicable && currentSettings?.platformGSTEnabled ? 
    (currentSettings.platformGSTRate / 100) : 0;
  const platformCommissionGST = platformCommission * platformGSTRate;

  // Total commission with GST
  const totalCommissionWithGST = platformCommission + platformCommissionGST;

  // Calculate delivery GST using admin settings
  const deliveryCGSTRate = currentSettings?.gstApplicable && currentSettings?.deliveryGSTEnabled ? 
    (currentSettings.deliveryCGSTRate / 100) : 0;
  const deliverySGSTRate = currentSettings?.gstApplicable && currentSettings?.deliveryGSTEnabled ? 
    (currentSettings.deliverySGSTRate / 100) : 0;
  
  const deliveryCGST = deliveryFee * deliveryCGSTRate;
  const deliverySGST = deliveryFee * deliverySGSTRate;
  const deliveryGST = deliveryCGST + deliverySGST;

  // Grand total (including everything)
  const grandTotal = subtotal + totalGST + platformCommission + platformCommissionGST + deliveryFee + deliveryGST;

  console.log('🔥 GST Calculation Debug:', {
    subtotal,
    platformCommission,
    platformCommissionGST,
    platformRate,
    platformGSTRate,
    currentSettings: currentSettings?.platformGSTEnabled,
    grandTotal
  });

  return {
    subtotal,
    totalCGST,
    totalSGST,
    totalGST,
    platformCommission,
    platformCommissionGST,
    totalCommissionWithGST,
    deliveryCGST,
    deliverySGST,
    deliveryGST,
    grandTotal
  };
}

/**
 * Format GST amount for display
 */
export function formatGSTAmount(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Format GST percentage for display
 */
export function formatGSTPercentage(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Generate GST invoice line items
 */
export function generateGSTInvoiceItems(
  items: Array<{ name: string; sellingPrice: number; quantity: number }>
): Array<{
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  cgst: number;
  sgst: number;
  total: number;
}> {
  return items.map(item => {
    const gst = calculateItemGST(item.sellingPrice);
    const itemTotal = item.sellingPrice * item.quantity;
    const totalCGST = gst.cgst * item.quantity;
    const totalSGST = gst.sgst * item.quantity;
    const totalWithGST = gst.totalPrice * item.quantity;

    return {
      description: item.name,
      quantity: item.quantity,
      rate: item.sellingPrice,
      amount: itemTotal,
      cgst: totalCGST,
      sgst: totalSGST,
      total: totalWithGST
    };
  });
}

/**
 * Validate GSTIN format
 */
export function validateGSTIN(gstin: string): boolean {
  // GSTIN format: 12ABCDE1234F1ZV (15 characters)
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

/**
 * Validate PAN format
 */
export function validatePAN(pan: string): boolean {
  // PAN format: ABCDE1234F (10 characters)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

/**
 * Get GST type display label
 */
export function getGSTTypeLabel(gstType: string): string {
  switch (gstType.toLowerCase()) {
    case 'regular':
      return 'Regular';
    case 'composition':
      return 'Composition';
    default:
      return 'Unknown';
  }
}

/**
 * Calculate seller payout after commission and GST
 */
export function calculateSellerPayout(
  orderTotal: number,
  platformCommissionRate: number = 0.07
): {
  orderTotal: number;
  platformCommission: number;
  platformCommissionGST: number;
  totalDeduction: number;
  sellerPayout: number;
} {
  const platformCommission = orderTotal * platformCommissionRate;
  const platformCommissionGST = platformCommission * GST_RATES.PLATFORM.GST;
  const totalDeduction = platformCommission + platformCommissionGST;
  const sellerPayout = orderTotal - totalDeduction;

  return {
    orderTotal,
    platformCommission,
    platformCommissionGST,
    totalDeduction,
    sellerPayout
  };
}
