import { useState } from 'react';
import type { Category } from '../types';
import { createCategory } from '../services/api';

interface CategoryModalProps {
  categories: Category[];
  onClose: () => void;
  onCategoryAdded: () => void;
}

export const CategoryModal = ({ categories, onClose, onCategoryAdded }: CategoryModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await createCategory({ name, description });
      setName('');
      setDescription('');
      onCategoryAdded(); // Recarga las categorías en el componente principal
    } catch (err) {
      console.error('Error al crear categoría:', err);
      alert('Ocurrió un error al crear la categoría.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '450px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ marginTop: 0, color: '#2d3748' }}>🏷️ Gestión de Categorías</h3>

        {/* Formulario para nueva categoría */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '4px' }}>Nombre de la Categoría *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Instrumental Quirúrgico"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '4px' }}>Descripción (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Herramientas y pinzas de uso clínico"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '9px', borderRadius: '6px', border: 'none', backgroundColor: '#319795', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {submitting ? 'Guardando...' : '➕ Añadir Categoría'}
          </button>
        </form>

        <hr style={{ border: '0', borderTop: '1px solid #edf2f7', margin: '16px 0' }} />

        <h4 style={{ fontSize: '14px', color: '#4a5568', marginBottom: '10px' }}>Categorías Actuales</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto' }}>
          {categories.map((cat) => (
            <li key={cat.id} style={{ padding: '8px 10px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', color: '#2d3748' }}>{cat.name}</span>
              <span style={{ color: '#718096', fontSize: '12px' }}>ID: {cat.id}</span>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};