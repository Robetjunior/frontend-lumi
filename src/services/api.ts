import axios from 'axios';

const API_URL = 'https://young-journey-58853-4deb73cbc284.herokuapp.com/api'; // Ajuste a URL para a API correta

// Função para buscar todas as faturas
export const fetchInvoices = () => {
  return axios.get(`${API_URL}/invoices`);
};

export const fetchInvoicesSearch = async (filterParams: any) => {
  const queryParams = new URLSearchParams(filterParams).toString(); // Converte o objeto de filtros em string de query
  console.log(queryParams);
  const response = await fetch(`${API_URL}/invoices/search?${queryParams}`);
  
  // Verifique se o status da resposta é OK, antes de tentar parsear o JSON
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return await response.json();
};

// Função para buscar faturas por no_cliente e mes_referencia
export const fetchInvoiceByClient = (no_cliente: string, mes_referencia: string) => {
  return axios.get(`${API_URL}/invoices/${no_cliente}/${mes_referencia}`);
};
