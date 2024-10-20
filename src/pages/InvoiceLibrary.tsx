import React, { useState, useEffect } from 'react';
import { fetchInvoicesSearch } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Invoice {
  id: number;
  mes_referencia: string;
  nome_uc: string;
  no_cliente: string;
  distribuidora: string;
  download_url: string;
  months: { [key: string]: string };
  pdf_url: string;
}

const InvoicesTable = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [groupedInvoices, setGroupedInvoices] = useState<Invoice[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [filter, setFilter] = useState({ nome_uc: '', distribuidora: '' });
  const [loadingFile, setLoadingFile] = useState<{ [key: string]: boolean }>({}); // Estado de loading para cada arquivo
  const [isDownloading, setIsDownloading] = useState<boolean>(false); // Estado geral de download ativo

  useEffect(() => {
    const filterParams = {
      distribuidora: filter.distribuidora,
      nome_uc: filter.nome_uc,
      year: selectedYear,
    };

    fetchInvoicesSearch(filterParams).then(fetchedInvoices => {
      const grouped = groupByNomeUc(fetchedInvoices);
      setInvoices(fetchedInvoices);
      setGroupedInvoices(grouped);
    });
  }, [filter, selectedYear]);

  useEffect(() => {
    if (invoices.length > 0) {
      const filtered = invoices.filter(invoice => {
        const matchesNomeUC = filter.nome_uc ? invoice.nome_uc.toLowerCase().includes(filter.nome_uc.toLowerCase()) : true;
        const matchesDistribuidora = filter.distribuidora ? invoice.distribuidora.toLowerCase().includes(filter.distribuidora.toLowerCase()) : true;
        return matchesNomeUC && matchesDistribuidora;
      });

      const groupedFiltered = groupByNomeUc(filtered);
      setGroupedInvoices(groupedFiltered);
    }
  }, [filter, invoices]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const groupByNomeUc = (invoices: Invoice[]): Invoice[] => {
    return invoices.reduce((acc: Invoice[], invoice: Invoice) => {
      const [mes] = invoice.mes_referencia.split('/');
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
      const monthAbbr = monthsMap[mes.toUpperCase()];
      
      const existing = acc.find(item => item.nome_uc === invoice.nome_uc);

      if (existing) {
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

  const downloadFile = async (filePath: string, filename: string) => {
    try {
      setLoadingFile(prev => ({ ...prev, [filename]: true })); // Definir estado de loading para o arquivo atual
      setIsDownloading(true); // Desabilitar todos os outros botões durante o download
      console.log(`Iniciando o download do arquivo: ${filePath}`);
  
      if (!filePath || !filePath.startsWith("https://")) {
        throw new Error('URL do arquivo está inválida');
      }
  
      let formattedFilePath = filePath;
      if (!filePath.includes("/faturas/faturas/")) {
        formattedFilePath = filePath.replace("/faturas/", "/faturas/faturas/");
      }
  
      const response = await fetch(`${formattedFilePath}.pdf`);
  
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
      setLoadingFile(prev => ({ ...prev, [filename]: false })); // Remover estado de loading após o download
      setIsDownloading(false); // Liberar os downloads após a conclusão
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
            style={{ marginRight: '20px'}}
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
            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, index) => (
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
                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, index) => (
                  <td key={index}>
                    {invoice.months[month] ? (
                      <button
                        onClick={() => downloadFile(invoice.months[month], `${invoice.nome_uc}-${month}.pdf`)}
                        disabled={isDownloading} // Desabilitar todos os botões durante o download de qualquer arquivo
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
