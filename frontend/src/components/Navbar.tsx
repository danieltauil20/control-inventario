import React from 'react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  return (
    <header style={{
      backgroundColor: '#1a365d',
      color: 'white',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      height: '64px'
    }}>
      {/* Brand / logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>🦷</span>
        <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 700 }}>Dentify ERP</h1>
      </div>

      {/* Pestañas de navegación */}
      <nav style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setCurrentTab('inventory')}
          style={{
            backgroundColor: currentTab === 'inventory' ? '#2b6cb0' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background-color 0.2s'
          }}
        >
          📦 Inventario
        </button>

        <button
          onClick={() => setCurrentTab('movements')}
          style={{
            backgroundColor: currentTab === 'movements' ? '#2b6cb0' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background-color 0.2s'
          }}
        >
          📋 Historial de Movimientos
        </button>
      </nav>
    </header>
  );
};