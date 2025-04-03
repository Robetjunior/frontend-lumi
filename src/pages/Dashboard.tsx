import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { fetchDashboardData } from '../services/api';
import { FaBolt, FaBurn, FaLeaf, FaWallet, FaArrowUp, FaArrowDown, FaArrowRight } from 'react-icons/fa';

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

interface DashboardData {
  cardData: CardData;
  groupedData: GroupedData[];
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData(selectedYear)
      .then((data) => {
        setDashboardData(data);
      })
      .catch((err) => {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Erro ao buscar dados consolidados do dashboard');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedYear]);

  const tooltipFormatter = (value: number, name: string) => {
    switch (name) {
      case 'totalKwh':
        return `${value} kWh`;
      case 'totalCompensada':
        return `${value} kWh`;
      case 'totalFinance':
        return `R$ ${value.toFixed(2)}`;
      case 'totalEconomia':
        return `R$ ${value.toFixed(2)}`;
      default:
        return value;
    }
  };

  const getComparison = (current: number, previous: number) => {
    if (current === previous) {
      return {
        text: "Sem alteração",
        className: 'no-change',
        icon: <FaArrowRight className="comparison-icon" />,
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
    return <p>Carregando dados...</p>;
  }

  if (error || !dashboardData) {
    return <p>{error || 'Nenhum dado disponível.'}</p>;
  }

  const { cardData, groupedData } = dashboardData;

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

      <div className="chart-container">
        <h3>Consumo de Energia Elétrica vs. Energia Compensada</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={groupedData}>
            <XAxis dataKey="name" tickFormatter={(value) => value.split('-')[1]} />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} />
            <CartesianGrid stroke="#00362b" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="totalKwh" stroke="#00ad75" strokeWidth={2} />
            <Line type="monotone" dataKey="totalCompensada" stroke="#FF6347" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Valor Total sem GD vs. Economia GD</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={groupedData}>
            <XAxis dataKey="name" tickFormatter={(value) => value.split('-')[1]} />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} />
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
