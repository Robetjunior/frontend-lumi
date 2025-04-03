import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InvoiceLibrary from './pages/InvoiceLibrary';
import Sidebar from './components/Sidebar';
import { FaBars } from 'react-icons/fa';
import './styles/global.css';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="app-container">
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
          <Sidebar />
        </div>
        
        <button 
          className={`sidebar-toggle ${window.innerWidth <= 768 ? 'visible' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
        
        <main className={`content ${!isSidebarOpen ? 'full-width' : ''}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<InvoiceLibrary />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;