// Define exactamente cómo es un producto según lo que devuelve tu backend
export interface Product {
  id: number;
  sku: string;
  name: string;
  brand?: string;
  image_url?: string;
  description?: string;
  category_id: number;
  category_name?: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  supplier?: string;
  expiration_date?: string; // Fecha en formato YYYY-MM-DD
}

// Define cómo es una categoría
export interface Category {
  id: number;
  name: string;
  description?: string;
}

// Define cómo es un movimiento de stock
export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  notes?: string;
  timestamp: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  brand?: string;
  image_url?: string;
  description?: string;
  category_id: number;
  category_name?: string;
  supplier_id?: number;
  supplier_name?: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  expiration_date?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  notes?: string;
  timestamp: string;
}