import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InvoiceLibrary from './pages/InvoiceLibrary';
import Sidebar from './components/Sidebar'; // Importando a Sidebar
import './styles/global.css'; // Certifique-se de que este CSS seja aplicado

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />  {/* Sidebar fica fixa à esquerda */}
        <div className="content">  {/* Container para as páginas */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<InvoiceLibrary />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
