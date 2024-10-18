import React, { useState } from 'react';
import axios from 'axios';

const InvoiceLibrary = () => {
  const [invoices, setInvoices] = useState([]);
  const [noCliente, setNoCliente] = useState('');
  const [mesReferencia, setMesReferencia] = useState('');

  const handleSearch = () => {
    axios.get(`/api/invoices/${noCliente}/${mesReferencia}`).then(response => {
      setInvoices(response.data);
    });
  };

  return (
    <div>
      <h2>Biblioteca de Faturas</h2>
      <div>
        <input
          type="text"
          value={noCliente}
          onChange={(e) => setNoCliente(e.target.value)}
          placeholder="No Cliente"
        />
        <input
          type="text"
          value={mesReferencia}
          onChange={(e) => setMesReferencia(e.target.value)}
          placeholder="Mês Referência"
        />
        <button onClick={handleSearch}>Buscar Faturas</button>
      </div>
      <ul>
        {invoices.map((invoice: any) => (
          <li key={invoice.id}>
            {invoice.no_cliente} - {invoice.mes_referencia} - {invoice.valor_total}
            <button onClick={() => window.open(`/api/invoices/download/${invoice.id}`, '_blank')}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvoiceLibrary;
