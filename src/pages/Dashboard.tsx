import React, { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { fetchInvoices } from '../services/api';
import { FaBolt, FaBurn, FaLeaf, FaWallet, FaArrowUp, FaArrowDown, FaArrowRight } from 'react-icons/fa'; // Ícones adicionados

// Definir os tipos de dados
interface Invoice {
  mes_referencia: string;
  energia_eletrica_kwh: string | number;
  energia_sceee_kwh: string | number;
  energia_compensada_kwh: string | number;
  energia_eletrica_valor: string | number;
  energia_sceee_valor: string | number;
  energia_compensada_valor: string | number;
  contrib_ilum_publica: string | number;
}

interface CardData {
  energiaGerada: number;
  energiaConsumida: number;
  energiaCompensada: number;
  saldoCreditos: number;
  previousValues: {
    energiaGerada: number;
    energiaConsumida: number;
    energiaCompensada: number;
    saldoCreditos: number;
  };
}

interface GroupedData {
  name: string;
  totalKwh: number;
  totalCompensada: number;
  totalFinance: number;
  totalEconomia: number;
  gastoMaiorQueEconomia?: boolean;
}

const Dashboard = () => {
  const [energyData, setEnergyData] = useState<GroupedData[]>([]);
  const [financialData, setFinancialData] = useState<GroupedData[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [cardData, setCardData] = useState<CardData>({
    energiaGerada: 0,
    energiaConsumida: 0,
    energiaCompensada: 0,
    saldoCreditos: 0,
    previousValues: {
      energiaGerada: 0,
      energiaConsumida: 0,
      energiaCompensada: 0,
      saldoCreditos: 0,
    },
  });
  const [loading, setLoading] = useState<boolean>(true); // Estado para carregar a API
  const [error, setError] = useState<string | null>(null); // Estado para tratar erros

  // Função para converter o nome do mês para número
  const monthToNumber = useCallback((month: string): number => {
    const months: { [key: string]: number } = {
      JAN: 1, FEV: 2, MAR: 3, ABR: 4, MAI: 5, JUN: 6,
      JUL: 7, AGO: 8, SET: 9, OUT: 10, NOV: 11, DEZ: 12,
    };
    return months[month.toUpperCase()] || 0;
  }, []);

  // Função para agrupar os dados por ano e mês
  const groupDataByYear = useCallback((invoices: Invoice[], year: string): GroupedData[] => {
    const groupedData: { [key: string]: GroupedData } = {};

    invoices.forEach(invoice => {
      const [month, invoiceYear] = invoice.mes_referencia.split('/');

      // Filtrar apenas o ano selecionado
      if (invoiceYear === year) {
        const key = `${invoiceYear}-${month}`;

        if (!groupedData[key]) {
          groupedData[key] = { name: key, totalKwh: 0, totalCompensada: 0, totalFinance: 0, totalEconomia: 0, gastoMaiorQueEconomia: false };
        }

        // Consumo de Energia Elétrica = energia_eletrica_kwh + energia_sceee_kwh
        groupedData[key].totalKwh += Number(invoice.energia_eletrica_kwh || 0) + Number(invoice.energia_sceee_kwh || 0);

        // Energia Compensada = energia_compensada_kwh
        groupedData[key].totalCompensada += Number(invoice.energia_compensada_kwh || 0);

        // Valor Total sem GD = energia_eletrica_valor + energia_sceee_valor + contrib_ilum_publica
        groupedData[key].totalFinance += Number(invoice.energia_eletrica_valor || 0) + Number(invoice.energia_sceee_valor || 0) + Number(invoice.contrib_ilum_publica || 0);

        // Economia GD = valor absoluto da energia_compensada_valor
        const economiaGD = Number(invoice.energia_compensada_valor || 0);
        groupedData[key].totalEconomia += Math.abs(economiaGD);

        // Verificar se o gasto total é maior do que a economia gerada
        if (economiaGD < 0) {
          groupedData[key].gastoMaiorQueEconomia = true;
        }

        groupedData[key].totalKwh = parseFloat(groupedData[key].totalKwh.toFixed(2));
        groupedData[key].totalCompensada = parseFloat(groupedData[key].totalCompensada.toFixed(2));
        groupedData[key].totalFinance = parseFloat(groupedData[key].totalFinance.toFixed(2));
        groupedData[key].totalEconomia = parseFloat(groupedData[key].totalEconomia.toFixed(2));
      }
    });

    return Object.values(groupedData).sort((a, b) => monthToNumber(a.name.split('-')[1]) - monthToNumber(b.name.split('-')[1]));
  }, [monthToNumber]);


  // UseEffect para buscar os dados da API
  useEffect(() => {
    setLoading(true);
    fetchInvoices()
      .then((response: any) => {
        const invoices = response;

        if (invoices && Array.isArray(invoices)) {

          // Ordena as faturas pela data de referência (mes_referencia)
          const sortedInvoices = invoices.sort((a: Invoice, b: Invoice) => {
            const [monthA, yearA] = a.mes_referencia.split('/');
            const [monthB, yearB] = b.mes_referencia.split('/');
            const dateA = new Date(Number(yearA), Number(monthA) - 1);
            const dateB = new Date(Number(yearB), Number(monthB) - 1);
            return dateA.getTime() - dateB.getTime();
          });

          if (sortedInvoices.length >= 2) {
            const currentInvoice = sortedInvoices[sortedInvoices.length - 1]; // Mês atual
            const previousInvoice = sortedInvoices[sortedInvoices.length - 2]; // Mês anterior

            setCardData({
              energiaGerada: Number(currentInvoice.energia_eletrica_kwh || 0),
              energiaConsumida: Number(currentInvoice.energia_sceee_kwh || 0),
              energiaCompensada: Number(currentInvoice.energia_compensada_kwh || 0),
              saldoCreditos: Math.abs(Number(currentInvoice.energia_compensada_valor || 0)),
              previousValues: {
                energiaGerada: Number(previousInvoice.energia_eletrica_kwh || 0),
                energiaConsumida: Number(previousInvoice.energia_sceee_kwh || 0),
                energiaCompensada: Number(previousInvoice.energia_compensada_kwh || 0),
                saldoCreditos: Math.abs(Number(previousInvoice.energia_compensada_valor || 0)),
              },
            });

            // Agrupar dados para o gráfico
            const groupedEnergyData = groupDataByYear(sortedInvoices, selectedYear);
            const groupedFinancialData = groupDataByYear(sortedInvoices, selectedYear);

            setEnergyData(groupedEnergyData);
            setFinancialData(groupedFinancialData);
          } else {
            setError('Não há dados suficientes para comparação de meses.');
          }
        } else {
          setError('A resposta da API não é um array');
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar ou processar as faturas:', err);
        setError('Erro ao buscar os dados da API');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedYear, groupDataByYear]);

  // Função para formatar os valores no Tooltip
  const tooltipFormatter = (value: number, name: string) => {
    switch (name) {
      case 'totalKwh':
        return `${value} kWh`;  // Adicionar unidade de medida kWh
      case 'totalCompensada':
        return `${value} kWh`;  // Adicionar unidade de medida kWh
      case 'totalFinance':
        return `R$ ${value.toFixed(2)}`;  // Adicionar unidade monetária R$
      case 'totalEconomia':
        return `R$ ${value.toFixed(2)}`;  // Adicionar unidade monetária R$
      default:
        return value;
    }
  };

  const getComparison = (current: number, previous: number) => {
    if (current === previous) {
      return {
        text: "Sem alteração", // Ou outra mensagem que faça sentido para o usuário
        className: 'no-change', // Classe CSS para estilizar caso não haja mudança
        icon: <FaArrowRight className="comparison-icon" />, // Ícone para indicar que não houve mudança
      };
    }
    
    const difference = current - previous;
    const percentage = ((difference / Math.abs(previous)) * 100).toFixed(2);
  
    return {
      text: difference > 0 ? `+${percentage}%` : `${percentage}%`,
      className: difference > 0 ? 'increase' : 'decrease',
      icon: difference > 0 ? <FaArrowUp className="comparison-icon" /> : <FaArrowDown className="comparison-icon" />,
    };
  };
  
  if (loading) {
    return <p>Carregando dados...</p>; // Mostrar uma mensagem de carregamento
  }

  if (error) {
    return <p>{error}</p>; // Mostrar mensagem de erro
  }


  return (
    <div className="dashboard-container">
      <h2>Dashboard Gerador</h2>

      <div className="cards-grid">
        <div className="card">
          <div className="card-content">
            <div className="card-icon">
              <FaBolt />
            </div>
            <div>
              <h3>Energia Gerada</h3>
              <p>{cardData.energiaGerada} kWh</p>
            </div>
          </div>
          <hr className="divider" />
          <div className={`card-comparison ${getComparison(cardData.energiaGerada, cardData.previousValues.energiaGerada).className}`}>
            {getComparison(cardData.energiaGerada, cardData.previousValues.energiaGerada).text} em relação ao mês anterior
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="card-icon">
              <FaBurn />
            </div>
            <div>
              <h3>Energia Consumida</h3>
              <p>{cardData.energiaConsumida} kWh</p>
            </div>
          </div>
          <hr className="divider" />
          <div className={`card-comparison ${getComparison(cardData.energiaConsumida, cardData.previousValues.energiaConsumida).className}`}>
            {getComparison(cardData.energiaConsumida, cardData.previousValues.energiaConsumida).text} em relação ao mês anterior
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="card-icon">
              <FaLeaf />
            </div>
            <div>
              <h3>Energia Compensada</h3>
              <p>{cardData.energiaCompensada} kWh</p>
            </div>
          </div>
          <hr className="divider" />
          <div className={`card-comparison ${getComparison(cardData.energiaCompensada, cardData.previousValues.energiaCompensada).className}`}>
            {getComparison(cardData.energiaCompensada, cardData.previousValues.energiaCompensada).text} em relação ao mês anterior
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="card-icon">
              <FaWallet />
            </div>
            <div>
              <h3>Saldo de Créditos</h3>
              <p>R$ {cardData.saldoCreditos.toFixed(2)}</p>
            </div>
          </div>
          <hr className="divider" />
          <div className={`card-comparison ${getComparison(cardData.saldoCreditos, cardData.previousValues.saldoCreditos).className}`}>
            {getComparison(cardData.saldoCreditos, cardData.previousValues.saldoCreditos).text} em relação ao mês anterior
          </div>
        </div>
      </div>

      {/* Gráfico de Consumo de Energia Elétrica vs Energia Compensada */}
      <div className="chart-container">
        <h3>Consumo de Energia Elétrica vs. Energia Compensada</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={energyData.length > 0 ? energyData : []}>
            <XAxis dataKey="name" tickFormatter={(value) => value.split('-')[1]} />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', color: '#000' }}
              labelStyle={{ color: '#000' }}
              itemStyle={{ color: '#007BFF' }}
              formatter={tooltipFormatter}
            />
            <CartesianGrid stroke="#00362b" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="totalKwh" stroke="#00ad75" strokeWidth={2} />
            <Line type="monotone" dataKey="totalCompensada" stroke="#FF6347" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Valor Total sem GD vs Economia GD */}
      <div className="chart-container">
        <h3>Valor Total sem GD vs. Economia GD</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={financialData.length > 0 ? financialData : []}>
            <XAxis dataKey="name" tickFormatter={(value) => value.split('-')[1]} />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', color: '#000' }}
              labelStyle={{ color: '#000' }}
              itemStyle={{ color: '#007BFF' }}
              formatter={tooltipFormatter}
            />
            <CartesianGrid stroke="#00362b" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="totalFinance" stroke="#00ad75" strokeWidth={2} />
            <Line type="monotone" dataKey="totalEconomia" stroke="#FF6347" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
