import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Ajuste a URL para a API correta

// Função para buscar todas as faturas
export const fetchInvoices = () => {
  return axios.get(`${API_URL}/invoices`);
};

// Função para buscar faturas por no_cliente e mes_referencia
export const fetchInvoiceByClient = (no_cliente: string, mes_referencia: string) => {
  return axios.get(`${API_URL}/invoices/${no_cliente}/${mes_referencia}`);
};
