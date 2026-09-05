export type Category = 'Grocery' | 'Dairy' | 'Snacks' | 'Personal Care' | 'Beverages' | 'Household';

export type StockStatus = 'out_of_stock' | 'critical' | 'low' | 'normal' | 'overstocked';

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export type ActiveSection =
  | 'dashboard'
  | 'overview'
  | 'sales'
  | 'inventory'
  | 'products'
  | 'restock_requests'
  | 'copilot'
  | 'settings';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number; // in INR (₹)
  currentStock: number;
  reorderLevel: number;
  unitsSold: number;
  revenue: number;
  salesVelocityPerDay: number; // average daily units
  restockPending?: boolean;
  supplier: string;
  lastRestockedDate: string;
}

export interface ProductAnalysis {
  product: Product;
  stockHealth: 'CRITICAL' | 'LOW' | 'HEALTHY' | 'OVERSTOCK' | 'OUT OF STOCK';
  salesPerformance: 'HIGH DEMAND' | 'STEADY' | 'MODERATE' | 'SLOW MOVING';
  restockPriority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'MONITOR' | 'LOW';
  recommendation: string;
  daysOfInventoryLeft: number;
  recommendedOrderQty: number;
}

export interface RecommendationCard {
  id: string;
  type: 'RESTOCK NOW' | 'RESTOCK SOON' | 'MONITOR' | 'HEALTHY';
  badgeColor: 'red' | 'orange' | 'yellow' | 'green';
  product: Product;
  headline: string;
  reason: string;
  actionText: string;
  suggestedQty: number;
}

export interface RestockRequest {
  id: string;
  productId: string;
  productName: string;
  category: Category;
  currentStock: number;
  quantity: number;
  priority: PriorityLevel;
  supplier: string;
  createdAt: string;
  status: 'Pending' | 'Approved' | 'Completed';
  estimatedCost: number;
}

export interface AlertNotification {
  id: string;
  productId: string;
  title: string;
  message: string;
  priority: 'urgent' | 'high' | 'warning' | 'info';
  timestamp: string;
  acknowledged: boolean;
}

export interface DailySalesRecord {
  day: string; // 'Monday', 'Tuesday', etc.
  revenue: number;
  units: number;
  orders: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  actionProduct?: Product;
  suggestedAction?: {
    type: 'restock';
    productId: string;
    productName: string;
    recommendedQty: number;
    priority: PriorityLevel;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  role: string;
}

export interface StoreLocationProfile {
  rawLocation: string;
  storeName: string;
  branchName: string;
  fullBranchDisplayName: string;
  storeId: string;
  posTerminal: string;
}

