import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartBar, FaFileInvoice } from 'react-icons/fa';
import './sidebar.css'; // Certifique-se de que o arquivo CSS existe

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <img src="/logo_lumi.svg" alt="Logo Lumi" className="logo" />
      <nav>
        <ul>
          <li>
            <Link to="/">
              <FaChartBar />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/invoices">
              <FaFileInvoice />
              Faturas
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
