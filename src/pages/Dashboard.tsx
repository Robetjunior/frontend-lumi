import React, { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { fetchInvoices } from '../services/api'; // Importando a função para buscar faturas

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

interface GroupedData {
  name: string;
  totalKwh: number;
  totalCompensada: number;
  totalFinance: number;
  totalEconomia: number;
}

const Dashboard = () => {
  const [energyData, setEnergyData] = useState<GroupedData[]>([]);
  const [financialData, setFinancialData] = useState<GroupedData[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]); // Anos disponíveis
  const [selectedYear, setSelectedYear] = useState<string>('2024'); // Ano selecionado

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
          groupedData[key] = { name: key, totalKwh: 0, totalCompensada: 0, totalFinance: 0, totalEconomia: 0 };
        }
  
        // Adicionar valores e formatar com duas casas decimais
        groupedData[key].totalKwh += Number(invoice.energia_eletrica_kwh || 0) + Number(invoice.energia_sceee_kwh || 0);
        groupedData[key].totalCompensada += Number(invoice.energia_compensada_kwh || 0);
        groupedData[key].totalFinance += Number(invoice.energia_eletrica_valor || 0) + Number(invoice.energia_sceee_valor || 0) + Number(invoice.contrib_ilum_publica || 0);
        groupedData[key].totalEconomia += Number(invoice.energia_compensada_valor || 0);
  
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
      console.log(response.data);

      const invoices: Invoice[] = response.data;

      // Extrair os anos disponíveis para o seletor de ano
      const years = Array.from(new Set(invoices.map(invoice => invoice.mes_referencia.split('/')[1])));
      setAvailableYears(years);
      console.log(years)
      // Agrupar dados para o ano selecionado
      const groupedEnergyData = groupDataByYear(invoices, selectedYear);
      const groupedFinancialData = groupDataByYear(invoices, selectedYear);

      // Definir os dados nos estados
      setEnergyData(groupedEnergyData);
      setFinancialData(groupedFinancialData);
    });
  }, [selectedYear, groupDataByYear]);

  return (
    <div>
      <h2>Dashboard</h2>

      {/* Seletor de Ano */}
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
            <Tooltip />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="totalKwh" stroke="#8884d8" />
            <Line type="monotone" dataKey="totalCompensada" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Valor Total sem GD vs. Economia GD</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={financialData}>
            <XAxis dataKey="name" tickFormatter={(value) => value.split('-')[1]} />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="totalFinance" stroke="#8884d8" />
            <Line type="monotone" dataKey="totalEconomia" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
