/**
 * Unit price the backend charges for a menu item (mirrors getUnitPrice in
 * Dabba_Delight_Backend/utils/productRules.js). Display and cart totals use this so the
 * subtotal the customer sees is exactly what checkout accepts.
 */
type PricedItem = {
  sellingPrice?: number;
  discountPrice?: number;
  halfPlatePrice?: number;
  fullPlatePrice?: number;
};

export const getItemUnitPrice = (item: PricedItem | null | undefined, selectedSize?: string | null): number => {
  if (!item) return 0;
  const selling = Number(item.sellingPrice) || 0;
  if (selectedSize === "half" && Number(item.halfPlatePrice) > 0) return Number(item.halfPlatePrice);
  if (selectedSize === "full" && Number(item.fullPlatePrice) > 0) return Number(item.fullPlatePrice);
  const discount = Number(item.discountPrice) || 0;
  return discount > 0 && discount < selling ? discount : selling;
};
