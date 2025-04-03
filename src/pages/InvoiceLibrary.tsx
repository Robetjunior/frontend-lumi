import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchInvoicesSearch } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Invoice {
  id: number;
  mes_referencia: string;
  nome_uc: string;
  no_cliente: string;
  distribuidora: string;
  pdf_url: string;
  months?: { [key: string]: string };
}

type TabType = 'consumidores' | 'distribuidoras';

interface Filter {
  selectedItems: string[];
}

const ALL_YEARS = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];

// Mapeamento fixo para abreviação dos meses
const monthsMap: { [key: string]: string } = {
  JAN: 'Jan',
  FEV: 'Fev',
  MAR: 'Mar',
  ABR: 'Abr',
  MAI: 'Mai',
  JUN: 'Jun',
  JUL: 'Jul',
  AGO: 'Ago',
  SET: 'Set',
  OUT: 'Out',
  NOV: 'Nov',
  DEZ: 'Dez',
};

const groupByNomeUc = (invoices: Invoice[]): Invoice[] => {
  return invoices.reduce((acc: Invoice[], invoice: Invoice) => {
    const [mes] = invoice.mes_referencia.split('/');
    const monthAbbr = monthsMap[mes.toUpperCase()] || mes;
    invoice.months = invoice.months || {};

    const existing = acc.find(item => item.nome_uc === invoice.nome_uc);
    if (existing) {
      existing.months = existing.months || {};
      existing.months[monthAbbr] = invoice.pdf_url;
    } else {
      acc.push({
        ...invoice,
        months: { [monthAbbr]: invoice.pdf_url },
      });
    }
    return acc;
  }, []);
};

const InvoicesTable = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [groupedInvoices, setGroupedInvoices] = useState<Invoice[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [activeTab, setActiveTab] = useState<TabType>('consumidores');
  const [filter, setFilter] = useState<Filter>({ selectedItems: [] });
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [loadingFile, setLoadingFile] = useState<{ [key: string]: boolean }>({});
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filterParams: any = { year: selectedYear };

    if (activeTab === 'consumidores' && filter.selectedItems.length > 0) {
      filterParams.nome_uc = filter.selectedItems.join(',');
    }
    if (activeTab === 'distribuidoras' && filter.selectedItems.length > 0) {
      filterParams.distribuidora = filter.selectedItems.join(',');
    }

    fetchInvoicesSearch(filterParams)
      .then(fetchedInvoices => {
        setInvoices(fetchedInvoices);
      })
      .catch(err => console.error('Erro ao buscar faturas:', err));
  }, [filter, selectedYear, activeTab]);

  const groupedData = useMemo(() => groupByNomeUc(invoices), [invoices]);
  useEffect(() => {
    setGroupedInvoices(groupedData);
  }, [groupedData]);

  // Lista única de itens disponíveis (consumidores ou distribuidoras)
  const availableItems = useMemo(() => {
    const itemsSet = new Set<string>();
    invoices.forEach(inv => {
      const value = activeTab === 'consumidores' ? inv.nome_uc : inv.distribuidora;
      if (value) itemsSet.add(value);
    });
    return Array.from(itemsSet);
  }, [invoices, activeTab]);

  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    invoices.forEach(inv => {
      const parts = inv.mes_referencia.split('/');
      if (parts.length >= 2) {
        yearsSet.add(parts[1]);
      }
    });
    return ALL_YEARS.filter(ano => yearsSet.has(ano));
  }, [invoices]);

  const finalGroupedInvoices = useMemo(() => {
    if (filter.selectedItems.length === 0) return groupedInvoices;
    return groupedInvoices.filter(invoice => {
      return activeTab === 'consumidores'
        ? filter.selectedItems.includes(invoice.nome_uc)
        : filter.selectedItems.includes(invoice.distribuidora);
    });
  }, [groupedInvoices, filter.selectedItems, activeTab]);

  const handleSelectToggle = () => {
    setDropdownOpen(prev => !prev);
  };

  // Função para adicionar/remover item do filtro
  const toggleSelectedItem = (item: string) => {
    setFilter(prev => {
      const alreadySelected = prev.selectedItems.includes(item);
      if (alreadySelected) {
        return { selectedItems: prev.selectedItems.filter(i => i !== item) };
      } else {
        return { selectedItems: [...prev.selectedItems, item] };
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const downloadFile = async (filePath: string, filename: string) => {
    try {
      setLoadingFile(prev => ({ ...prev, [filename]: true }));
      setIsDownloading(true);
      if (!filePath || !filePath.startsWith("https://")) {
        throw new Error('URL do arquivo está inválida');
      }
      let formattedFilePath = filePath;
      if (!filePath.includes("/faturas/")) {
        formattedFilePath = filePath.replace("/faturas/", "/faturas/faturas/");
      }
      const response = await fetch(formattedFilePath);
      if (!response.ok) {
        throw new Error(`Erro no download: ${response.statusText}`);
      }
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao baixar o arquivo:', err);
    } finally {
      setLoadingFile(prev => ({ ...prev, [filename]: false }));
      setIsDownloading(false);
    }
  };

  return (
    <div className="invoices-page-container" style={{ padding: '20px', color: '#fff' }}>
      <div
        className="header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div className="tabs" style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setActiveTab('consumidores');
              setDropdownOpen(true);
            }}
            className={activeTab === 'consumidores' ? 'active' : ''}
            style={{
              backgroundColor: activeTab === 'consumidores' ? '#1b5e20' : '#2e7d32',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Consumidores
          </button>
          <button
            onClick={() => {
              setActiveTab('distribuidoras');
              setDropdownOpen(true);
            }}
            className={activeTab === 'distribuidoras' ? 'active' : ''}
            style={{
              backgroundColor: activeTab === 'distribuidoras' ? '#1b5e20' : '#2e7d32',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Distribuidoras
          </button>
        </div>

        {/* Botões de anos no canto direito */}
        <div className="years" style={{ display: 'flex', gap: '10px' }}>
          {availableYears.map(ano => (
            <button
              key={ano}
              onClick={() => handleYearChange(ano)}
              className={selectedYear === ano ? 'active' : ''}
              style={{
                backgroundColor: selectedYear === ano ? '#1b5e20' : '#2e7d32',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              {ano}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown overlay para seleção */}
      {dropdownOpen && (
        <div
          className="dropdown"
          ref={dropdownRef}
          style={{
            position: 'absolute',
            zIndex: 100,
            background: '#fff',
            color: '#000',
            border: '1px solid #ccc',
            padding: '10px',
            marginTop: '5px',
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {availableItems.map(item => {
              const checked = filter.selectedItems.includes(item);
              return (
                <li
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 0',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleSelectedItem(item)}
                >
                  <span>{item}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onClick={(e) => e.stopPropagation()} // Evita duplo toggle
                    onChange={() => toggleSelectedItem(item)}
                    style={{ cursor: 'pointer' }}
                  />
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => setDropdownOpen(false)}
            style={{
              marginTop: '5px',
              backgroundColor: '#2e7d32',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      )}

      <table
        className="invoices-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      >
        <thead>
          <tr>
            <th style={{ padding: '10px', borderBottom: '1px solid #4caf50', textAlign: 'left' }}>NOME DA UC</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #4caf50', textAlign: 'left' }}>NÚMERO DA UC</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #4caf50', textAlign: 'left' }}>DISTRIBUIDORA</th>
            {Object.values(monthsMap).map((month, index) => (
              <th key={index} style={{ padding: '10px', borderBottom: '1px solid #4caf50', textAlign: 'center' }}>{month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {finalGroupedInvoices.length > 0 ? (
            finalGroupedInvoices.map(invoice => (
              <tr key={invoice.id} style={{ borderBottom: '1px solid #4caf50' }}>
                <td style={{ padding: '8px' }}>{invoice.nome_uc}</td>
                <td style={{ padding: '8px' }}>{invoice.no_cliente}</td>
                <td style={{ padding: '8px' }}>{invoice.distribuidora}</td>
                {Object.values(monthsMap).map((month, index) => (
                  <td
                    key={index}
                    style={{
                      padding: '8px',
                      textAlign: 'center',
                    }}
                  >
                    {invoice.months?.[month] ? (
                      <button
                        onClick={() => downloadFile(invoice.months![month], `${invoice.nome_uc}-${month}.pdf`)}
                        disabled={isDownloading}
                        style={{
                          backgroundColor: '#388e3c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        <FontAwesomeIcon icon={faFilePdf} />
                      </button>
                    ) : (
                      <span> - </span>
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={15} style={{ padding: '8px', textAlign: 'center' }}>Nenhum item encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesTable;
