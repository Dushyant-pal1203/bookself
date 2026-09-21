import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { orderAPI } from "@/lib/api";
import { Order } from "@/types/order";

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data.orders);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, status: Order["status"]) => {
    try {
      const response = await orderAPI.updateStatus(id, status);
      toast.success("Order status updated");
      await fetchOrders();
      return response.data;
    } catch (error) {
      toast.error("Failed to update order status");
      throw error;
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      await orderAPI.delete(id);
      toast.success("Order deleted successfully");
      await fetchOrders();
    } catch (error) {
      toast.error("Failed to delete order");
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
  };
};
