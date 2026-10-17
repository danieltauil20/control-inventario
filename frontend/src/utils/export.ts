import type { Product } from '../types';

export const exportProductsToCSV = (products: Product[]) => {
  if (products.length === 0) return;

  const headers = ['ID', 'Nombre', 'SKU', 'Marca', 'Precio Unitario', 'Stock Actual', 'Stock Mínimo', 'ID Categoría'];
  
  const rows = products.map((p) => [
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.sku}"`,
    `"${p.brand || ''}"`,
    p.unit_price,
    p.current_stock,
    p.min_stock_alert,
    p.category_id
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `inventario_dentify_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};