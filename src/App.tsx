import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InvoiceLibrary from './pages/InvoiceLibrary';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoices" element={<InvoiceLibrary />} />
      </Routes>
    </Router>
  );
};

export default App;
