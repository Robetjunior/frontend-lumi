import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { fetchInvoices } from '../services/api'; // Importando a função para buscar faturas

const Dashboard = () => {
  const [energyData, setEnergyData] = useState([]);
  const [financialData, setFinancialData] = useState([]);

  useEffect(() => {
    // Usar a função fetchInvoices para buscar dados da API
    fetchInvoices().then(response => {
      const invoices = response.data;

      // Preprocessar dados para os gráficos
      const energyData = invoices.map((invoice: any) => ({
        name: invoice.mes_referencia,
        consumo: invoice.energia_eletrica_kwh + invoice.energia_sceee_kwh,
        compensada: invoice.energia_compensada_kwh,
      }));

      const financialData = invoices.map((invoice: any) => ({
        name: invoice.mes_referencia,
        totalSemGD: invoice.energia_eletrica_valor + invoice.energia_sceee_valor + invoice.contrib_ilum_publica,
        economiaGD: invoice.energia_compensada_valor,
      }));

      setEnergyData(energyData);
      setFinancialData(financialData);
    });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="chart-container">
        <h3>Consumo de Energia Elétrica vs. Energia Compensada</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={energyData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="consumo" stroke="#8884d8" />
            <Line type="monotone" dataKey="compensada" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Valor Total sem GD vs. Economia GD</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={financialData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="totalSemGD" stroke="#8884d8" />
            <Line type="monotone" dataKey="economiaGD" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
