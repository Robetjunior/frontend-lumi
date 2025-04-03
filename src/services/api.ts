import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchInvoices = async () => {
  try {
    const response = await axios.get(`${API_URL}/invoices`);
    if (!Array.isArray(response.data)) {
      throw new Error('A resposta da API não é um array.');
    }
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar as faturas:', error);
    throw error;
  }
};

export const fetchDashboardData = async (year: string) => {
  try {
    const response = await axios.get(`${API_URL}/invoices/dashboard?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }
};

export const fetchInvoicesSearch = async (filterParams: any) => {
  try {
    const queryParams = new URLSearchParams(filterParams).toString();
    const response = await fetch(`${API_URL}/invoices/search?${queryParams}`);
    if (!response.ok) {
      console.error(`Erro na requisição: ${response.status} - ${response.statusText}`);
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar faturas com filtro:', error);
    throw error;
  }
};

export const fetchInvoiceByClient = async (no_cliente: string, mes_referencia: string) => {
  try {
    const response = await axios.get(`${API_URL}/invoices/${no_cliente}/${mes_referencia}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar fatura por cliente:', error);
    throw error;
  }
};
