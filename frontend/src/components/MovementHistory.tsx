import { useEffect, useState } from 'react';
import { getMovements } from '../services/api';
import './MovementHistory.css';

interface Movement {
  id: number;
  product_name: string;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  notes: string;
  timestamp: string;
}

interface MovementHistoryProps {
  onClose: () => void;
}

export const MovementHistory = ({ onClose }: MovementHistoryProps) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getMovements()
      .then((data) => {
        setMovements(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar movimientos:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>📋 Historial de Movimientos (Auditoría)</h2>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Cargando historial...</p>
        ) : movements.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>No hay movimientos registrados todavía.</p>
        ) : (
          <div className="table-container">
            <table className="movements-table">
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{m.timestamp}</td>
                    <td style={{ fontWeight: '600' }}>{m.product_name}</td>
                    <td>
                      <span className={`badge-type ${m.movement_type.toLowerCase()}`}>
                        {m.movement_type === 'IN' ? '📥 ENTRADA' : '📤 SALIDA'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{m.quantity}</td>
                    <td>{m.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-footer" style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
};