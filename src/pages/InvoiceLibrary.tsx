import React, { useState, useEffect } from 'react';
import { fetchInvoicesSearch } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

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

  useEffect(() => {
    const filterParams = {
      distribuidora: filter.distribuidora,
      nome_uc: filter.nome_uc,
      year: selectedYear,
    };

    fetchInvoicesSearch(filterParams).then(fetchedInvoices => {
      console.log("Itens retornados:", fetchedInvoices); // Valida os itens retornados
      const grouped = groupByNomeUc(fetchedInvoices);
      setInvoices(fetchedInvoices);
      setGroupedInvoices(grouped);
    });
  }, [filter, selectedYear]);

  // Função atualizada para aplicar o agrupamento corretamente após o filtro
  useEffect(() => {
    if (invoices.length > 0) {
      const filtered = invoices.filter(invoice => {
        const matchesNomeUC = filter.nome_uc ? invoice.nome_uc.toLowerCase().includes(filter.nome_uc.toLowerCase()) : true;
        const matchesDistribuidora = filter.distribuidora ? invoice.distribuidora.toLowerCase().includes(filter.distribuidora.toLowerCase()) : true;
        
        return matchesNomeUC && matchesDistribuidora;
      });

      // Checar o que está sendo filtrado
      console.log("Itens filtrados:", filtered);

      // Aplicar o agrupamento nos itens filtrados
      const groupedFiltered = groupByNomeUc(filtered);
      console.log("Itens agrupados após filtro:", groupedFiltered); // Adicionado para ver o que está sendo agrupado
      setGroupedInvoices(groupedFiltered);
    }
  }, [filter, invoices]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value);
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
      
      // Verifica se a UC já foi adicionada
      const existing = acc.find(item => item.nome_uc === invoice.nome_uc);

      if (existing) {
        // Se já existe, adiciona o mês ao objeto existente
        existing.months[monthAbbr] = invoice.pdf_url;
      } else {
        // Caso contrário, adiciona um novo objeto para essa UC
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
      // Validação do caminho
      console.log(`Iniciando o download do arquivo: ${filePath}`);
  
      // Verificar se o caminho está correto e se segue o padrão esperado
      if (!filePath || !filePath.startsWith("https://")) {
        throw new Error('URL do arquivo está inválida');
      }
  
      // Certifique-se de que o caminho tenha o prefixo correto para o bucket e subpasta
      // Exemplo de como formatar se necessário
      let formattedFilePath = filePath;
      if (!filePath.includes("/faturas/faturas/")) {
        formattedFilePath = filePath.replace("/faturas/", "/faturas/faturas/");
      }
  
      console.log(`URL formatada: ${formattedFilePath}`);
  
      // Faz a requisição do PDF diretamente usando a URL pública
      const response = await fetch(`${formattedFilePath}.pdf`);
  
      if (!response.ok) {
        throw new Error(`Erro no download: ${response.statusText}`);
      }
  
      const blob = await response.blob();
  
      // Criar um link temporário para iniciar o download do arquivo
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      console.log('Download concluído.');
    } catch (err) {
      console.error('Erro ao baixar o arquivo:', err);
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
            <button onClick={() => handleYearChange('2020')}>2020</button>
            <button onClick={() => handleYearChange('2021')}>2021</button>
            <button onClick={() => handleYearChange('2022')}>2022</button>
            <button onClick={() => handleYearChange('2023')}>2023</button>
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
          <td colSpan={15}>Nenhum item encontrado.</td>
        </tr>
      )}
    </tbody>
  </table>
    </div>
  );
};

export default InvoicesTable;
