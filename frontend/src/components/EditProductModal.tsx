import { useState } from 'react';
import type { Category, Product } from '../types';

interface EditProductModalProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSubmit: (productId: number, productData: Partial<Product>) => Promise<void>;
}

export const EditProductModal = ({ product, categories, onClose, onSubmit }: EditProductModalProps) => {
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [brand, setBrand] = useState(product.brand || '');
  const [unitPrice, setUnitPrice] = useState<number>(product.unit_price);
  const [minStockAlert, setMinStockAlert] = useState<number>(product.min_stock_alert);
  const [categoryId, setCategoryId] = useState<number>(product.category_id);
  const imageUrl = product.image_url || '';
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    setSubmitting(true);
    await onSubmit(product.id, {
      name,
      sku,
      brand,
      unit_price: unitPrice,
      min_stock_alert: minStockAlert,
      category_id: categoryId,
      image_url: imageUrl || undefined
    });
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '500px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ marginTop: 0, color: '#2d3748' }}>✏️ Editar Producto: {product.name}</h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '4px' }}>Nombre *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '4px' }}>SKU *</label>
              <input type="text" required value={sku} onChange={(e) => setSku(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '4px' }}>Marca</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '4px' }}>Precio ($)</label>
              <input type="number" step="0.01" min="0" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '4px' }}>Categoría</label>
              <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: 'white', boxSizing: 'border-box' }}>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '4px' }}>Alerta Stock Mínimo</label>
            <input type="number" min="1" value={minStockAlert} onChange={(e) => setMinStockAlert(Number(e.target.value))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} disabled={submitting} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: 'white', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={submitting} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#2b6cb0', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{submitting ? 'Guardando...' : 'Guardar Cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};