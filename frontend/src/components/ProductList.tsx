import { CategoryModal } from './CategoryModal';
import { exportProductsToCSV } from '../utils/export';
import { useEffect, useState } from 'react';
import { getProducts, getCategories, createMovement, createProduct, updateProduct, deleteProduct } from '../services/api';
import type { Product, Category } from '../types';
import { StockModal } from './StockModal';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';

export const ProductList = () => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');

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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando inventario... 🦷</div>;
  if (error) return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* DASHBOARD DE MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '13px', color: '#718096', fontWeight: 'bold' }}>📦 Total Productos</span>
          <h3 style={{ fontSize: '24px', margin: '8px 0 0 0', color: '#2d3748' }}>{totalProducts}</h3>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '13px', color: '#e53e3e', fontWeight: 'bold' }}>⚠️ Stock Crítico / Bajo</span>
          <h3 style={{ fontSize: '24px', margin: '8px 0 0 0', color: '#e53e3e' }}>{lowStockCount}</h3>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '13px', color: '#319795', fontWeight: 'bold' }}>💰 Valor del Inventario</span>
          <h3 style={{ fontSize: '24px', margin: '8px 0 0 0', color: '#319795' }}>${totalInventoryValue.toFixed(2)}</h3>
        </div>
      </div>

      {/* BARRA DE ACCIONES Y FILTROS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0, color: '#2d3748' }}>Catálogo de Insumos</h2>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '750px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '180px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none' }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}
          >
            <option value="ALL">Todas las categorías</option>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>

          {/* Botón para abrir el modal de Gestión de Categorías */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            title="Gestionar Categorías"
            style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#ffffff', color: '#2d3748', cursor: 'pointer' }}
          >
            🏷️
          </button>

          <button
            onClick={() => exportProductsToCSV(filteredProducts)}
            style={{
              padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e0',
              backgroundColor: '#ffffff', color: '#2d3748', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            📄 Exportar CSV
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#319795', color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            ➕ Nuevo Producto
          </button>
        </div>
      </div>

      {/* CUADRÍCULA DE PRODUCTOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredProducts.map((product) => (
          <div key={product.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#fff', position: 'relative' }}>

            {/* Botones de Editar y Eliminar flotantes en la esquina */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setSelectedProductForEdit(product)}
                title="Editar producto"
                style={{ background: '#edf2f7', border: '1px solid #cbd5e0', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px' }}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteProduct(product.id, product.name)}
                title="Eliminar producto"
                style={{ background: '#fed7d7', border: '1px solid #feb2b2', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px' }}
              >
                🗑️
              </button>
            </div>

            <span style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', fontWeight: 'bold' }}>{product.brand || 'Genérico'}</span>
            <h3 style={{ fontSize: '16px', margin: '4px 0 6px 0', color: '#2d3748', paddingRight: '50px' }}>{product.name}</h3>
            <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 12px 0' }}>SKU: {product.sku}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf2f7', paddingTop: '10px', marginBottom: '12px' }}>
              <span style={{ fontWeight: 'bold', color: '#2b6cb0', fontSize: '16px' }}>${product.unit_price.toFixed(2)}</span>
              <span style={{
                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                backgroundColor: product.current_stock <= product.min_stock_alert ? '#fed7d7' : '#c6f6d5',
                color: product.current_stock <= product.min_stock_alert ? '#9b2c2c' : '#22543d'
              }}>
                Stock: {product.current_stock}
              </span>
            </div>

            <button
              onClick={() => setSelectedProductForStock(product)}
              style={{
                width: '100%', padding: '8px', backgroundColor: '#edf2f7', color: '#2d3748',
                border: '1px solid #cbd5e0', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
              }}
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
    </div>
  );
};