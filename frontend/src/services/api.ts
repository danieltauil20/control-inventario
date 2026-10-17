import axios from 'axios';
// 👇 Añade "type" aquí para que TypeScript esté contento con la regla
import type { Product, Category, StockMovement } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/api/products');
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/api/categories');
  return response.data;
};

export const getMovements = async (): Promise<StockMovement[]> => {
  const response = await api.get('/api/movement'); // O /api/movements según tu ruta en Flask
  return response.data;
};


// Registra una entrada o salida de stock en Flask
export const createMovement = async (movementData: {
  product_id: number;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  notes?: string;
}): Promise<StockMovement> => {
  const response = await api.post('/api/movements', movementData);
  return response.data;
};


export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const response = await api.post('/api/products', productData);
  return response.data;
};

// Actualizar un producto existente
export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/api/products/${id}`, productData);
  return response.data;
};

// Eliminar un producto
export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/api/products/${id}`);
};

// Crear una nueva categoría
export const createCategory = async (categoryData: { name: string; description?: string }): Promise<Category> => {
  const response = await api.post('/api/categories', categoryData);
  return response.data;
};

export default api;