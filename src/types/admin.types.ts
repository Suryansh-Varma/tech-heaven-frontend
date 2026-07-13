export interface LowStockProduct {
  productId: number;
  name: string;
  stock: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  lowStockProducts: LowStockProduct[];
  pendingOrders: number;
}
