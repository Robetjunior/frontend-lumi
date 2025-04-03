import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  // Campo opcional para armazenamento dos PDFs agrupados por mês
  months?: { [key: string]: string };
}

interface Filter {
  nome_uc: string;
  distribuidora: string;
}

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

// Função para agrupar as faturas por "nome_uc" e armazenar os PDFs por mês
const groupByNomeUc = (invoices: Invoice[]): Invoice[] => {
  return invoices.reduce((acc: Invoice[], invoice: Invoice) => {
    const [mes] = invoice.mes_referencia.split('/');
    const monthAbbr = monthsMap[mes.toUpperCase()] || mes;

    // Garante que invoice.months seja um objeto vazio se não estiver definido
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
  const [selectedYear, setSelectedYear] = useState('2024');
  const [filter, setFilter] = useState<Filter>({ nome_uc: '', distribuidora: '' });
  const [loadingFile, setLoadingFile] = useState<{ [key: string]: boolean }>({});
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Busca as faturas com base nos filtros e ano selecionado
  useEffect(() => {
    const filterParams = {
      distribuidora: filter.distribuidora,
      nome_uc: filter.nome_uc,
      year: selectedYear,
    };

    fetchInvoicesSearch(filterParams)
      .then(fetchedInvoices => {
        setInvoices(fetchedInvoices);
      })
      .catch(err => console.error('Erro ao buscar faturas:', err));
  }, [filter, selectedYear]);

  // Filtra localmente caso necessário
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesNomeUC = filter.nome_uc
        ? invoice.nome_uc.toLowerCase().includes(filter.nome_uc.toLowerCase())
        : true;
      const matchesDistribuidora = filter.distribuidora
        ? invoice.distribuidora.toLowerCase().includes(filter.distribuidora.toLowerCase())
        : true;
      return matchesNomeUC && matchesDistribuidora;
    });
  }, [invoices, filter]);

  // Agrupa as faturas por Nome UC utilizando useMemo
  const groupedInvoices = useMemo(() => groupByNomeUc(filteredInvoices), [filteredInvoices]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFilter(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const downloadFile = async (filePath: string, filename: string) => {
    try {
      setLoadingFile(prev => ({ ...prev, [filename]: true }));
      setIsDownloading(true);
      console.log(`Iniciando o download do arquivo: ${filePath}`);

      if (!filePath || !filePath.startsWith("https://")) {
        throw new Error('URL do arquivo está inválida');
      }

      // Caso precise ajustar o caminho (ajuste conforme necessário)
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

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  return (
    <div className="invoices-page-container">
      <div className="filters">
        <div className="filters-left">
          <input
            type="text"
            name="nome_uc"
            placeholder="Filtrar por Nome da UC"
            value={filter.nome_uc}
            onChange={handleInputChange}
            style={{ marginRight: '20px' }}
          />
          <input
            type="text"
            name="distribuidora"
            placeholder="Filtrar por Distribuidora"
            value={filter.distribuidora}
            onChange={handleInputChange}
          />
        </div>
        <div className="filters-right">
          <div className="years">
            <button onClick={() => handleYearChange('2024')}>2024</button>
          </div>
        </div>
      </div>

      <table className="invoices-table">
        <thead>
          <tr>
            <th>Nome da UC</th>
            <th>Número da UC</th>
            <th>Distribuidora</th>
            {Object.values(monthsMap).map((month, index) => (
              <th key={index}>{month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groupedInvoices.length > 0 ? (
            groupedInvoices.map(invoice => (
              <tr key={invoice.id}>
                <td>{invoice.nome_uc}</td>
                <td>{invoice.no_cliente}</td>
                <td>{invoice.distribuidora}</td>
                {Object.values(monthsMap).map((month, index) => (
                  <td key={index}>
                    {invoice.months?.[month] ? (
                      <button
                        onClick={() => downloadFile(invoice.months![month], `${invoice.nome_uc}-${month}.pdf`)}
                        disabled={isDownloading}
                      >
                        {loadingFile[`${invoice.nome_uc}-${month}.pdf`] ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <FontAwesomeIcon icon={faFilePdf} />
                        )}
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
              <td colSpan={15}>Nenhum item encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesTable;
