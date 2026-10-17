import { CategoryModal } from './CategoryModal';
import { exportProductsToCSV } from '../utils/export';
import { useEffect, useState } from 'react';
import { getProducts, getCategories, createMovement, createProduct, updateProduct, deleteProduct } from '../services/api';
import type { Product, Category } from '../types';
import { StockModal } from './StockModal';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { MovementHistory } from './MovementHistory';
import './ProductList.css';

export const ProductList = () => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('name-asc');

  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const fetchData = () => {
    Promise.all([getProducts(), getCategories()])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('Error al cargar datos:', err);
        setError('No se pudo conectar con el servidor de Flask.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStockSubmit = async (productId: number, type: 'IN' | 'OUT', quantity: number, notes: string) => {
    try {
      await createMovement({ product_id: productId, movement_type: type, quantity, notes });
      setSelectedProductForStock(null);
      fetchData();
    } catch (err) {
      console.error('Error al registrar movimiento:', err);
      alert('Ocurrió un error al guardar el movimiento.');
    }
  };

  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      await createProduct(productData);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error al crear producto:', err);
      alert('Ocurrió un error al crear el producto.');
    }
  };

  const handleEditProduct = async (productId: number, productData: Partial<Product>) => {
    try {
      await updateProduct(productId, productData);
      setSelectedProductForEdit(null);
      fetchData();
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      alert('Ocurrió un error al actualizar el producto.');
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${productName}"?`)) return;
    try {
      await deleteProduct(productId);
      fetchData();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Ocurrió un error al eliminar el producto.');
    }
  };

  // Métricas del Dashboard
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.current_stock <= p.min_stock_alert).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.current_stock * p.unit_price), 0);

  // Filtrado y Ordenamiento
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || product.category_id === selectedCategory;
    const matchesLowStock = !onlyLowStock || (product.current_stock <= product.min_stock_alert);
    return matchesSearch && matchesCategory && matchesLowStock;
  }).sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'price-asc') return a.unit_price - b.unit_price;
    if (sortBy === 'price-desc') return b.unit_price - a.unit_price;
    if (sortBy === 'stock-asc') return a.current_stock - b.current_stock;
    if (sortBy === 'stock-desc') return b.current_stock - a.current_stock;
    return 0;
  });

  if (loading) return <div className="loading-state">Cargando inventario... 📦</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="inventory-container">

      {/* DASHBOARD DE MÉTRICAS INTERACTIVO */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span className="card-label" style={{ color: '#718096' }}>📦 Total Productos</span>
          <h3 className="card-value" style={{ color: '#2d3748' }}>{totalProducts}</h3>
        </div>

        {/* Tarjeta de Stock Crítico clicable */}
        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          title="Haz clic para filtrar productos con stock bajo o crítico"
          className={`dashboard-card-clickable ${onlyLowStock ? 'active' : ''}`}
        >
          <span className="card-label" style={{ color: '#e53e3e' }}>
            ⚠️ Stock Crítico / Bajo {onlyLowStock && '(Filtrando 🔍)'}
          </span>
          <h3 className="card-value" style={{ color: '#e53e3e' }}>{lowStockCount}</h3>
        </div>

        <div className="dashboard-card">
          <span className="card-label" style={{ color: '#319795' }}>💰 Valor del Inventario</span>
          <h3 className="card-value" style={{ color: '#319795' }}>${totalInventoryValue.toFixed(2)}</h3>
        </div>
      </div>

      {/* BARRA DE ACCIONES Y FILTROS */}
      <div className="actions-bar">
        <h2 className="actions-title">Catálogo de Insumos</h2>

        <div className="filters-group">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="filter-select"
          >
            <option value="ALL">Todas las categorías</option>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>

          {/* Selector de Ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name-asc">Nombre (A - Z)</option>
            <option value="name-desc">Nombre (Z - A)</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="stock-asc">Stock: Menor a Mayor</option>
            <option value="stock-desc">Stock: Mayor a Menor</option>
          </select>

          {/* Botón de Historial de Movimientos */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="btn-secondary"
            title="Ver Historial de Movimientos"
          >
            📜 Historial
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            title="Gestionar Categorías"
            className="btn-icon"
          >
            🏷️
          </button>

          <button
            onClick={() => exportProductsToCSV(filteredProducts)}
            className="btn-secondary"
          >
            📄 Exportar CSV
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            ➕ Nuevo Producto
          </button>
        </div>
      </div>

      {/* CUADRÍCULA DE PRODUCTOS */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">

            {/* Botones de Editar y Eliminar flotantes */}
            <div className="product-actions">
              <button
                onClick={() => setSelectedProductForEdit(product)}
                title="Editar producto"
                className="btn-edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteProduct(product.id, product.name)}
                title="Eliminar producto"
                className="btn-delete"
              >
                🗑️
              </button>
            </div>

            <span className="product-brand">{product.brand || 'Genérico'}</span>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-sku">SKU: {product.sku}</p>

            <div className="product-footer">
              <span className="product-price">${product.unit_price.toFixed(2)}</span>
              <span className={`stock-badge ${product.current_stock <= product.min_stock_alert ? 'critical' : 'normal'}`}>
                Stock: {product.current_stock}
              </span>
            </div>

            <button
              onClick={() => setSelectedProductForStock(product)}
              className="btn-stock"
            >
              ⚡ Ajustar Stock
            </button>
          </div>
        ))}
      </div>

      {/* MODALES */}
      {selectedProductForStock && (
        <StockModal product={selectedProductForStock} onClose={() => setSelectedProductForStock(null)} onSubmit={handleStockSubmit} />
      )}

      {selectedProductForEdit && (
        <EditProductModal product={selectedProductForEdit} categories={categories} onClose={() => setSelectedProductForEdit(null)} onSubmit={handleEditProduct} />
      )}

      {isAddModalOpen && (
        <AddProductModal categories={categories} onClose={() => setIsAddModalOpen(false)} onSubmit={handleCreateProduct} />
      )}

      {isCategoryModalOpen && (
        <CategoryModal categories={categories} onClose={() => setIsCategoryModalOpen(false)} onCategoryAdded={fetchData} />
      )}

      {isHistoryOpen && (
        <MovementHistory onClose={() => setIsHistoryOpen(false)} />
      )}
    </div>
  );
};