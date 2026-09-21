export interface Order {
  id: number;
  article_id: number;
  article_title: string;
  article_author?: string;
  quantity: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  total_amount: number;
  currency: string;
  notes?: string;
  created_at: string;
}
