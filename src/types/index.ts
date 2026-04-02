// User Types
export type UserRole = 'user' | 'seller' | 'admin' | 'super_admin' | 'delivery';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  address?: Address[];
  wallet?: number;
  referralCode?: string;
  referredBy?: string;
  isVerified?: boolean;
  businessName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Seller Types
export type SellerType = 'home_chef' | 'restaurant' | 'all';
export type KYCStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface SellerProfile {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  type: SellerType;
  logo?: string;
  coverImage?: string;
  address: Address;
  phone: string;
  email: string;
  kycStatus: KYCStatus;
  kycDocuments?: KYCDocument[];
  rating: number;
  totalOrders: number;
  isActive: boolean;
  commission: number;
  bankDetails?: BankDetails;
  operatingHours: OperatingHours[];
  cuisines: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KYCDocument {
  type: string;
  url: string;
  uploadedAt: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

// Menu Types
export interface MenuItem {
  _id: string;
  sellerId: string;
  name: string;
  description: string;
  sellingPrice: number;
  costPrice?: number;
  discountPrice?: number;
  category: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  isAdminApproved?: boolean;
  preparationTime: number;
  tags: string[];
  allergens?: string[];
  nutritionInfo?: NutritionInfo;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Order Types
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export type OrderType = 'one_time' | 'subscription';

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  sellerId: string;
  items: OrderItem[];
  type: OrderType;
  subscriptionId?: string;
  status: OrderStatus;
  deliveryAddress: Address;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  gstAmount: number;
  discount: number;
  total: number;
  paymentMethod: 'razorpay' | 'stripe' | 'wallet' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  specialInstructions?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  image: string;
}

// Subscription Types
export type SubscriptionFrequency = 'daily' | 'weekly' | 'monthly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';

export interface Subscription {
  _id: string;
  userId: string;
  sellerId: string;
  items: OrderItem[];
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  deliveryAddress: Address;
  deliveryTime: string;
  startDate: string;
  endDate?: string;
  nextDelivery: string;
  totalDeliveries: number;
  completedDeliveries: number;
  pricePerDelivery: number;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  sellerId: string;
  sellerName: string;
  sellerType: SellerType;
}

export interface Cart {
  items: CartItem[];
  sellerId: string | null;
  sellerName: string | null;
}

// Payment Types
export interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  gateway: 'razorpay' | 'stripe';
  gatewayPaymentId: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

// Wallet & Ledger Types
export interface WalletTransaction {
  _id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: 'order' | 'refund' | 'referral' | 'settlement';
  balance: number;
  createdAt: string;
}

export interface SellerLedger {
  _id: string;
  sellerId: string;
  orderId: string;
  orderAmount: number;
  commission: number;
  gst: number;
  netAmount: number;
  status: 'pending' | 'settled';
  settlementDate?: string;
  createdAt: string;
}

// Referral Types
export interface Referral {
  _id: string;
  referrerId: string;
  referredId: string;
  referredType: 'customer' | 'seller';
  status: 'pending' | 'completed';
  reward: number;
  rewardType: 'fixed' | 'percentage';
  createdAt: string;
}

// Review Types
export interface Review {
  _id: string;
  orderId: string;
  userId: string;
  sellerId: string;
  rating: number;
  comment: string;
  images?: string[];
  reply?: string;
  createdAt: string;
}

// Analytics Types
export interface SellerAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: { item: MenuItem; count: number }[];
  dailyRevenue: { date: string; revenue: number }[];
  peakHours: { hour: number; orders: number }[];
  repeatCustomers: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalSellers: number;
  totalOrders: number;
  totalRevenue: number;
  platformCommission: number;
  gstCollected: number;
  cityWiseRevenue: { city: string; revenue: number }[];
  categoryWiseSales: { category: string; sales: number }[];
  topSellers: { seller: SellerProfile; revenue: number }[];
  cartDropOffs: number;
}

// Config Types
export interface PlatformConfig {
  defaultCommission: number;
  gstPercentage: number;
  deliveryFee: number;
  platformFee: number;
  settlementDays: number;
  referralReward: number;
  referralRewardType: 'fixed' | 'percentage';
}
