import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  FaBolt, 
  FaBurn, 
  FaLeaf, 
  FaWallet, 
  FaMoneyBillWave, 
  FaSolarPanel, 
  FaPercent,
  FaArrowUp,
  FaArrowDown,
  FaArrowRight,
  FaDownload,
  FaFilter
} from 'react-icons/fa';
import { fetchDashboardData } from '../services/api';

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
  const [selectedYear, _] = useState<string>('2024');
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
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard de Energia</h1>
      </div>

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

      <div className="charts-container">
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Consumo vs Energia Compensada (kWh)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="name" stroke="#004d40" />
              <YAxis stroke="#004d40" />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Bar dataKey="totalKwh" name="Consumo (kWh)" fill="#00ad75" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalCompensada" name="Compensada (kWh)" fill="#00c382" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Resultado Financeiro (R$)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={groupedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="name" stroke="#004d40" />
              <YAxis stroke="#004d40" />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalFinance" 
                name="Valor sem GD (R$)" 
                stroke="#00ad75" 
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalEconomia" 
                name="Economia GD (R$)" 
                stroke="#00c382" 
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
