import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartBar, FaFileInvoice } from 'react-icons/fa';
import './sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar" aria-label="Sidebar de navegação">
      <img src="/logo_lumi.svg" alt="Logo Lumi" className="logo" />
      <nav>
        <ul>
          <li>
            <Link to="/" className="sidebar-link">
              <FaChartBar className="sidebar-icon" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/invoices" className="sidebar-link">
              <FaFileInvoice className="sidebar-icon" />
              Faturas
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
