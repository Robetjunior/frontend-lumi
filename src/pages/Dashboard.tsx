import React, { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { fetchInvoices } from '../services/api';
import { FaBolt, FaBurn, FaLeaf, FaWallet, FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Adicionado FaArrowUp e FaArrowDown

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

        // Aplicar toFixed(2) para garantir que as casas decimais sejam sempre mostradas
        groupedData[key].totalKwh = parseFloat(groupedData[key].totalKwh.toFixed(2));
        groupedData[key].totalCompensada = parseFloat(groupedData[key].totalCompensada.toFixed(2));
        groupedData[key].totalFinance = parseFloat(groupedData[key].totalFinance.toFixed(2));
        groupedData[key].totalEconomia = parseFloat(groupedData[key].totalEconomia.toFixed(2));
      }
    });

    return Object.values(groupedData).sort((a, b) => monthToNumber(a.name.split('-')[1]) - monthToNumber(b.name.split('-')[1]));
  }, [monthToNumber]);

  useEffect(() => {
    fetchInvoices().then(response => {
      const invoices: Invoice[] = response.data;

      // Extrair os anos disponíveis para o seletor de ano
      const years = Array.from(new Set(invoices.map(invoice => invoice.mes_referencia.split('/')[1])));
      setAvailableYears(years);

      // Agrupar dados para o ano selecionado
      const groupedEnergyData = groupDataByYear(invoices, selectedYear);
      const groupedFinancialData = groupDataByYear(invoices, selectedYear);

      // Definir os dados nos estados
      setEnergyData(groupedEnergyData);
      setFinancialData(groupedFinancialData);
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

  useEffect(() => {
    fetchInvoices().then((response) => {
      const invoices = response.data;

      const sortedInvoices = invoices.sort((a: Invoice, b: Invoice) => {
        const dateA = new Date(a.mes_referencia);
        const dateB = new Date(b.mes_referencia);
        return dateA.getTime() - dateB.getTime();
      });

      // Obter os dados do mês atual e do mês anterior
      const currentInvoice = sortedInvoices[sortedInvoices.length - 1];
      const previousInvoice = sortedInvoices[sortedInvoices.length - 2];

      setCardData({
        energiaGerada: Number(currentInvoice.energia_eletrica_kwh),
        energiaConsumida: Number(currentInvoice.energia_sceee_kwh),
        energiaCompensada: Number(currentInvoice.energia_compensada_kwh),
        saldoCreditos: Math.abs(Number(currentInvoice.energia_compensada_valor)),
        previousValues: {
          energiaGerada: Number(previousInvoice.energia_eletrica_kwh),
          energiaConsumida: Number(previousInvoice.energia_sceee_kwh),
          energiaCompensada: Number(previousInvoice.energia_compensada_kwh),
          saldoCreditos: Math.abs(Number(previousInvoice.energia_compensada_valor)),
        },
      });
    });
  }, []);

  const getComparison = (current: number, previous: number) => {
    const difference = current - previous;
    const percentage = ((difference / Math.abs(previous)) * 100).toFixed(2); // Usar Math.abs para evitar divisão por zero

    return {
        text: difference > 0 ? `+${percentage}%` : `${percentage}%`,
        className: difference > 0 ? 'increase' : 'decrease',
        icon: difference > 0 ? <FaArrowUp className="comparison-icon" /> : <FaArrowDown className="comparison-icon" />,
    };
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard Gerador</h2>

      {/* Cards */}
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
      <div>
        <label>Selecionar Ano:</label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="chart-container">
        <h3>Consumo de Energia Elétrica vs. Energia Compensada</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={energyData}>
            <XAxis dataKey="name" tickFormatter={(value) => value.split('-')[1]} />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', color: '#000' }}
              labelStyle={{ color: '#000' }}
              itemStyle={{ color: '#007BFF' }}
              formatter={tooltipFormatter}  // Usar a função de formatação do Tooltip
            />
            <CartesianGrid stroke="#00362b" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="totalKwh" stroke="#00ad75" strokeWidth={2} />
            <Line type="monotone" dataKey="totalCompensada" stroke="#FF6347" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Valor Total sem GD vs. Economia GD</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={financialData}>
            <XAxis dataKey="name" tickFormatter={(value) => value.split('-')[1]} />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', color: '#000' }}
              labelStyle={{ color: '#000' }}
              itemStyle={{ color: '#007BFF' }}
              formatter={tooltipFormatter}  // Usar a função de formatação do Tooltip
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
