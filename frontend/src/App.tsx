import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ProductList } from './components/ProductList';
import { MovementsList } from './components/MovementsList';

function App() {
  const [currentTab, setCurrentTab] = useState<string>('inventory');

  return (
    <div style={{ backgroundColor: '#f7fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main>
        {currentTab === 'inventory' && <ProductList />}
        {currentTab === 'movements' && <MovementsList />}
      </main>
    </div>
  );
}

export default App;