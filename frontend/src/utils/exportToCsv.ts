import type { Product } from '../types';

export const exportProductsToCSV = (products: Product[]) => {
  if (!products || products.length === 0) {
    alert('No hay productos para exportar.');
    return;
  }

  // Encabezados del CSV
  const headers = ['SKU', 'Nombre', 'Marca', 'Categoría', 'Proveedor', 'Stock Actual', 'Stock Mínimo', 'Precio Unitario (€)', 'Fecha Caducidad'];

  // Convertir productos a filas
  const rows = products.map((p) => [
    `"${p.sku}"`,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${(p.brand || '').replace(/"/g, '""')}"`,
    `"${(p.category_name || 'Sin categoría').replace(/"/g, '""')}"`,
    `"${(p.supplier_name || 'Sin proveedor').replace(/"/g, '""')}"`,
    p.current_stock,
    p.min_stock_alert,
    p.unit_price.toFixed(2),
    `"${p.expiration_date || 'N/A'}"`
  ]);

  // Construir el contenido CSV con BOM UTF-8 para que Excel lo abra con acentos correctamente
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  // Crear Blob y enlace de descarga
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const today = new Date().toISOString().split('T')[0];
  link.href = url;
  link.setAttribute('download', `inventario_dentify_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};