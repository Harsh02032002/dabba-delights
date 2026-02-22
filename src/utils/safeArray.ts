export const safeArray = (val: any): any[] => {
  if (!val) return [];

  // already array
  if (Array.isArray(val)) return val;

  // common API patterns
  if (Array.isArray(val.data)) return val.data;
  if (Array.isArray(val.products)) return val.products;
  if (Array.isArray(val.items)) return val.items;
  if (Array.isArray(val.results)) return val.results;
  if (Array.isArray(val.sellers)) return val.sellers;
  if (Array.isArray(val.orders)) return val.orders;
  if (Array.isArray(val.users)) return val.users;
  if (Array.isArray(val.logs)) return val.logs;
  if (Array.isArray(val.notifications)) return val.notifications;
  if (Array.isArray(val.settlements)) return val.settlements;
  if (Array.isArray(val.customers)) return val.customers;

  return [];
};