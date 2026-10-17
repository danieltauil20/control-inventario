import { useEffect, useState } from 'react';
import { getMovements } from '../services/api';
import type { StockMovement } from '../types';

export const MovementsList = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMovements()
      .then((data) => {
        setMovements(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('Error al cargar movimientos:', err);
        setError('No se pudo obtener el historial de movimientos.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando historial de movimientos... 📋</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Historial de Movimientos de Stock</h2>

      {movements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px', color: '#718096' }}>
          No hay movimientos registrados hasta el momento.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#edf2f7', borderBottom: '2px solid #e2e8f0', color: '#4a5568' }}>
                <th style={{ padding: '12px 16px' }}>Fecha</th>
                <th style={{ padding: '12px 16px' }}>Producto ID</th>
                <th style={{ padding: '12px 16px' }}>Tipo</th>
                <th style={{ padding: '12px 16px' }}>Cantidad</th>
                <th style={{ padding: '12px 16px' }}>Notas / Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => {
                const isEntry = mov.movement_type === 'IN';
                return (
                  <tr key={mov.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px 16px', color: '#718096' }}>
                      {mov.created_at ? new Date(mov.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#2d3748' }}>
                      Producto #{mov.product_id}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: isEntry ? '#c6f6d5' : '#fed7d7',
                        color: isEntry ? '#22543d' : '#9b2c2c'
                      }}>
                        {isEntry ? '📥 ENTRADA' : '📤 SALIDA'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: isEntry ? '#2f855a' : '#c53030' }}>
                      {isEntry ? `+${mov.quantity}` : `-${mov.quantity}`}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                      {mov.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};