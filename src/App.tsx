import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InvoiceLibrary from './pages/InvoiceLibrary';
import Sidebar from './components/Sidebar'; 
import './styles/global.css'; 

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />  
        <div className="content"> 
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
