export interface Article {
  id: number;
  title: string;
  author: string;
  type: "book" | "journal" | "magazine" | "newspaper";
  description: string;
  price: number;
  currency: string;
  cover_image_url?: string;
  category?: string;
  isbn?: string;
  published_year?: number;
  page_count?: number;
  language?: string;
  publisher?: string;
  stock_quantity: number;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
}

export interface ArticleFormData {
  title: string;
  author: string;
  type: string;
  description: string;
  price: number;
  currency: string;
  category?: string;
  isbn?: string;
  published_year?: number;
  page_count?: number;
  language?: string;
  publisher?: string;
  stock_quantity: number;
  in_stock: boolean;
  featured: boolean;
}
