import type { Product, Category, StockMovement, Supplier } from '../types';

const API_URL = 'http://localhost:5000/api';

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) throw new Error('Error al obtener los productos');
  return response.json();
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Error al obtener las categorías');
  return response.json();
};

export const createCategory = async (categoryData: { name: string; description?: string }) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) throw new Error('Error al crear la categoría');
  return response.json();
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Error al crear el producto');
  return response.json();
};

export const updateProduct = async (productId: number, productData: Partial<Product>): Promise<Product> => {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Error al actualizar el producto');
  return response.json();
};

export const deleteProduct = async (productId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar el producto');
};

export const createMovement = async (movementData: {
  product_id: number;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  notes: string;
}) => {
  const response = await fetch(`${API_URL}/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movementData),
  });
  if (!response.ok) throw new Error('Error al registrar el movimiento');
  return response.json();
};

export const getMovements = async (): Promise<StockMovement[]> => {
  const response = await fetch(`${API_URL}/movements`);
  if (!response.ok) throw new Error('Error al obtener los movimientos');
  return response.json();
};

// Obtener lista de proveedores
export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await fetch(`${API_URL}/suppliers`);
  if (!response.ok) {
    throw new Error('Error al obtener proveedores');
  }
  return response.json();
};

// Crear un nuevo proveedor
export const createSupplier = async (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
  const response = await fetch(`${API_URL}/suppliers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supplierData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al crear el proveedor');
  }

  const result = await response.json();
  return result.supplier;
};