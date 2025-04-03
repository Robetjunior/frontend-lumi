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

interface Comparison {
  text: string;
  className: string;
  icon: React.ReactNode;
}

// Função para calcular comparação entre valores atuais e anteriores
const getComparison = (current: number, previous: number): Comparison => {
  if (current === previous) {
    return {
      text: 'Sem alteração',
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

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  unit: string;
  previousValue: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, unit, previousValue }) => {
  const comparison = getComparison(value, previousValue);
  return (
    <div className="card">
      <div className="card-content">
        <div className="card-icon">{icon}</div>
        <div>
          <h3>{title}</h3>
          <p>
            {value} {unit}
          </p>
        </div>
      </div>
      <hr className="divider" />
      <div className={`card-comparison ${comparison.className}`}>
        {comparison.text} em relação ao mês anterior
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData(selectedYear)
      .then((data) => setDashboardData(data))
      .catch((err) => {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Erro ao buscar dados consolidados do dashboard');
      })
      .finally(() => setLoading(false));
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
        <DashboardCard 
          icon={<FaBolt />} 
          title="Energia Gerada" 
          value={cardData.energiaGerada} 
          unit="kWh" 
          previousValue={cardData.previousValues.energiaGerada} 
        />
        <DashboardCard 
          icon={<FaBurn />} 
          title="Energia Consumida" 
          value={cardData.energiaConsumida} 
          unit="kWh" 
          previousValue={cardData.previousValues.energiaConsumida} 
        />
        <DashboardCard 
          icon={<FaLeaf />} 
          title="Energia Compensada" 
          value={cardData.energiaCompensada} 
          unit="kWh" 
          previousValue={cardData.previousValues.energiaCompensada} 
        />
        <DashboardCard 
          icon={<FaWallet />} 
          title="Saldo de Créditos" 
          value={cardData.saldoCreditos} 
          unit="" 
          previousValue={cardData.previousValues.saldoCreditos} 
        />
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
