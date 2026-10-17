import React, { useState } from 'react';
import type { Product } from '../types';

interface StockModalProps {
  product: Product;
  onClose: () => void;
  onSubmit: (productId: number, type: 'IN' | 'OUT', quantity: number, notes: string) => Promise<void>;
}

export const StockModal: React.FC<StockModalProps> = ({ product, onClose, onSubmit }) => {
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setSubmitting(true);
    await onSubmit(product.id, movementType, quantity, notes);
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ marginTop: 0, color: '#2d3748' }}>
          Registrar Movimiento: {product.name}
        </h3>
        <p style={{ fontSize: '14px', color: '#718096', marginBottom: '20px' }}>
          Stock actual: <strong>{product.current_stock}</strong> unidades
        </p>

        <form onSubmit={handleSubmit}>
          {/* Tipo de movimiento */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#4a5568', marginBottom: '6px' }}>
              Tipo de Operación:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setMovementType('IN')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #38a169',
                  backgroundColor: movementType === 'IN' ? '#38a169' : 'white',
                  color: movementType === 'IN' ? 'white' : '#38a169',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📥 Entrada (+)
              </button>
              <button
                type="button"
                onClick={() => setMovementType('OUT')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e53e3e',
                  backgroundColor: movementType === 'OUT' ? '#e53e3e' : 'white',
                  color: movementType === 'OUT' ? 'white' : '#e53e3e',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📤 Salida (-)
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#4a5568', marginBottom: '6px' }}>
              Cantidad:
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e0',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Notas */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#4a5568', marginBottom: '6px' }}>
              Notas / Motivo (opcional):
            </label>
            <input
              type="text"
              placeholder="Ej. Reposición de inventario"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e0',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e0',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2b6cb0',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {submitting ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};