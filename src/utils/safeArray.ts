export const safeArray = (val: any): any[] => {
  if (!val) return [];

  // already array
  if (Array.isArray(val)) return val;

  // common API patterns
  if (Array.isArray(val.data)) return val.data;
  if (Array.isArray(val.products)) return val.products;
  if (Array.isArray(val.items)) return val.items;
  if (Array.isArray(val.results)) return val.results;

  return [];
};