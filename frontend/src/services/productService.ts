import api from './api';

// Exportamos la interfaz para que App.tsx pueda importarla
export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category_id: number;
  current_stock: number;
  min_stock_alert: number;
  unit_price: number;
  supplier?: string;
}

// Obtener todos los productos
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/api/products');
  return response.data;
};

// Crear un producto nuevo
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const response = await api.post('/api/products', product);
  return response.data;
};