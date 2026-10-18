import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../types';
import { getProducts, getCategories } from '../services/api';
import { exportProductsToCSV } from '../utils/exportToCsv';
import './ProductList.css';

interface ProductListProps {
  onAddProduct: () => void;
  onNewCategory: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onAddProduct, onNewCategory }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Filtro y Búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        if (isMounted) {
          setProducts(productsData);
          setCategories(categoriesData);
          setError(null);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtrado dinámico por texto y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.supplier_name && product.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || product.category_id === Number(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="loading">Cargando inventario...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="product-list-container">
      <div className="header-actions">
        <h2>Inventario de Productos</h2>
        <div className="button-group">
          <button className="btn btn-secondary" onClick={() => exportProductsToCSV(filteredProducts)}>
            📥 Exportar a CSV
          </button>
          <button className="btn btn-secondary" onClick={onNewCategory}>
            + Nueva Categoría
          </button>
          <button className="btn btn-primary" onClick={onAddProduct}>
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Control de Búsqueda y Filtros */}
      <div className="filters-bar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar por SKU, nombre, marca o proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Todas las Categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de Productos */}
      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Proveedor</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Caducidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isLowStock = p.current_stock <= p.min_stock_alert;
                return (
                  <tr key={p.id} className={isLowStock ? 'row-warning' : ''}>
                    <td><code>{p.sku}</code></td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.brand || '-'}</td>
                    <td>{p.category_name || 'Sin categoría'}</td>
                    <td>{p.supplier_name || 'Sin proveedor'}</td>
                    <td>
                      <span className={`stock-badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
                        {p.current_stock}
                      </span>
                    </td>
                    <td>{p.unit_price.toFixed(2)} €</td>
                    <td>{p.expiration_date || 'N/A'}</td>
                    <td>
                      {isLowStock ? (
                        <span className="alert-text">⚠️ Stock Bajo</span>
                      ) : (
                        <span className="ok-text">✅ OK</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};