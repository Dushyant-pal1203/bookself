// client/src/hooks/useDashboard.ts
import { useState, useEffect } from "react";
import { dashboardAPI } from "@/lib/api";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  catalogueSize: number;
  recentOrders: any[];
  catalogueBreakdown: any[];
  monthlyRevenue: any[];
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, fetchStats };
};
