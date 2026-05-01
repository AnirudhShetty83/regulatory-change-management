import { useState } from 'react';
import ListView from './pages/ListView';
import FormPage from './pages/FormPage';

function App() {
  const [currentPage, setCurrentPage] = useState('list');

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-[#1B4F8A] text-white p-4 flex gap-4">
        <button onClick={() => setCurrentPage('list')} className="hover:underline">View Records</button>
        <button onClick={() => setCurrentPage('form')} className="hover:underline">+ Create New</button>
      </nav>
      <main className="py-8">
        {currentPage === 'list' ? <ListView /> : <FormPage />}
      </main>
    </div>
  );
}

export default App;