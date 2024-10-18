import React, { useState, useEffect } from 'react';
import { fetchInvoicesSearch } from '../services/api';

interface Invoice {
  id: number;
  mes_referencia: any;
  nome_uc: string;
  no_cliente: string;
  distribuidora: string;
  consumer: string;
  months: string[];  // Uma lista de meses com faturas disponíveis
  download_url: string;  // URL para baixar a fatura
}

const InvoicesTable = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [filter, setFilter] = useState({ consumer: '', distribuidora: '' });

  useEffect(() => {
    const filterParams = {
      distribuidora: filter.distribuidora,
      consumer: filter.consumer,
      year: selectedYear
    };
    console.log('teste')
    fetchInvoicesSearch(filterParams).then(fetchedInvoices => {
      console.log(fetchedInvoices)
      setInvoices(fetchedInvoices);
      setFilteredInvoices(fetchedInvoices);
    });
  }, [filter, selectedYear]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  useEffect(() => {
    const filtered = invoices.filter(invoice => {
      return (
        (filter.consumer ? invoice.consumer.includes(filter.consumer) : true) &&
        (filter.distribuidora ? invoice.distribuidora.includes(filter.distribuidora) : true)
      );
    });
    setFilteredInvoices(filtered);
  }, [filter, invoices]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const filteredByYear = invoices.filter(invoice => invoice.mes_referencia.includes(year));
    setFilteredInvoices(filteredByYear);
  };

  return (
    <div className="invoices-page-container">
      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          name="consumer"
          placeholder="Filtrar por Consumidor"
          value={filter.consumer}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="distribuidora"
          placeholder="Filtrar por Distribuidora"
          value={filter.distribuidora}
          onChange={handleInputChange}
        />
        <div className="years">
          <button onClick={() => handleYearChange('2020')}>2020</button>
          <button onClick={() => handleYearChange('2021')}>2021</button>
          <button onClick={() => handleYearChange('2022')}>2022</button>
          <button onClick={() => handleYearChange('2023')}>2023</button>
          <button onClick={() => handleYearChange('2024')}>2024</button>
        </div>
      </div>

      {/* Tabela de Faturas */}
      <table className="invoices-table">
        <thead>
          <tr>
            <th>Nome da UC</th>
            <th>Número da UC</th>
            <th>Distribuidora</th>
            <th>Consumidor</th>
            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, index) => (
              <th key={index}>{month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map(invoice => (
            <tr key={invoice.id}>
              <td>{invoice.nome_uc}</td>
              <td>{invoice.no_cliente}</td>
              <td>{invoice.distribuidora}</td>
              <td>{invoice.consumer}</td>
              {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, index) => (
                <td key={index}>
                  {invoice.months && invoice.months.includes(month) ? (
                    <a href={invoice.download_url}>Baixar Fatura</a>
                  ) : (
                    <span> - </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesTable;